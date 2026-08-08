"use server";

import { auth } from "@/auth";
import { can } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getNextReservationHoldExpiry } from "@/lib/automation/fines";

export async function reserveBook(bookId: string) {
  const session = await auth();
  if (!can(session?.user, "reserve", "Book")) {
    throw new Error("Unauthorized: You do not have permission to reserve books.");
  }

  const userId = session!.user.id;
  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book) throw new Error("Book not found.");

  const existing = await prisma.reservation.findFirst({
    where: { bookId, userId, status: "PENDING" },
  });
  if (existing) throw new Error("You already have a pending reservation for this book.");

  if (book.availableCopies > 0) {
    throw new Error("Book is currently available. Visit the library to issue it.");
  }

  const reservation = await prisma.reservation.create({
    data: { bookId, userId, status: "PENDING" },
  });

  await prisma.auditLog.create({
    data: {
      actorId: userId,
      action: "RESERVE_BOOK",
      entityType: "Reservation",
      entityId: reservation.id,
    },
  });

  revalidatePath("/catalog");
  revalidatePath("/dashboard/student");
  return { success: true, reservationId: reservation.id };
}

export async function cancelReservation(reservationId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
  });
  if (!reservation || reservation.userId !== session.user.id) {
    throw new Error("Reservation not found.");
  }

  await prisma.reservation.update({
    where: { id: reservationId },
    data: { status: "CANCELLED" },
  });

  revalidatePath("/dashboard/student");
  return { success: true };
}

export async function issueBookByBarcode(barcode: string, userUsn: string) {
  const session = await auth();
  if (!can(session?.user, "issue", "Book")) {
    throw new Error("Unauthorized");
  }

  const copy = await prisma.bookCopy.findUnique({
    where: { barcode },
    include: { book: true },
  });
  if (!copy) throw new Error("Book copy not found.");
  if (copy.status !== "AVAILABLE") throw new Error("Copy is not available.");

  const user = await prisma.user.findFirst({
    where: { OR: [{ usn: userUsn }, { email: userUsn }] },
  });
  if (!user) throw new Error("User not found.");

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14);

  await prisma.$transaction([
    prisma.issueRecord.create({
      data: {
        bookCopyId: copy.id,
        userId: user.id,
        dueDate,
        status: "ACTIVE",
      },
    }),
    prisma.bookCopy.update({
      where: { id: copy.id },
      data: { status: "ISSUED" },
    }),
    prisma.book.update({
      where: { id: copy.bookId },
      data: { availableCopies: { decrement: 1 } },
    }),
    prisma.auditLog.create({
      data: {
        actorId: session!.user.id,
        action: "ISSUE_BOOK",
        entityType: "BookCopy",
        entityId: copy.id,
      },
    }),
  ]);

  revalidatePath("/dashboard/librarian");
  return { success: true, dueDate: dueDate.toISOString() };
}

export async function returnBookByBarcode(barcode: string) {
  const session = await auth();
  if (!can(session?.user, "issue", "Book")) {
    throw new Error("Unauthorized");
  }

  const copy = await prisma.bookCopy.findUnique({
    where: { barcode },
    include: {
      issueRecords: {
        where: { status: { in: ["ACTIVE", "OVERDUE"] } },
        take: 1,
      },
      book: true,
    },
  });
  if (!copy) throw new Error("Book copy not found.");

  const activeIssue = copy.issueRecords[0];
  if (!activeIssue) throw new Error("No active issue for this copy.");

  await prisma.$transaction([
    prisma.issueRecord.update({
      where: { id: activeIssue.id },
      data: { status: "RETURNED", returnDate: new Date() },
    }),
    prisma.bookCopy.update({
      where: { id: copy.id },
      data: { status: "AVAILABLE" },
    }),
    prisma.book.update({
      where: { id: copy.bookId },
      data: { availableCopies: { increment: 1 } },
    }),
  ]);

  const nextReservation = await prisma.reservation.findFirst({
    where: { bookId: copy.bookId, status: "PENDING" },
    orderBy: { requestedAt: "asc" },
  });

  if (nextReservation) {
    const holdUntil = getNextReservationHoldExpiry(24);
    await prisma.$transaction([
      prisma.reservation.update({
        where: { id: nextReservation.id },
        data: { status: "FULFILLED", notifiedAt: new Date(), holdUntil },
      }),
      prisma.notification.create({
        data: {
          userId: nextReservation.userId,
          type: "RESERVATION_AVAILABLE",
          message: `"${copy.book.title}" is available! Pick up within 24 hours.`,
        },
      }),
    ]);
  }

  revalidatePath("/dashboard/librarian");
  revalidatePath("/dashboard/student");
  return { success: true, notifiedUser: nextReservation?.userId ?? null };
}

export async function sendOverdueReminder(issueRecordId: string) {
  const session = await auth();
  if (!can(session?.user, "update", "Reservation")) {
    throw new Error("Unauthorized");
  }

  const issue = await prisma.issueRecord.findUnique({
    where: { id: issueRecordId },
    include: { bookCopy: { include: { book: true } }, user: true },
  });
  if (!issue) throw new Error("Issue record not found.");

  await prisma.notification.create({
    data: {
      userId: issue.userId,
      type: "OVERDUE_REMINDER",
      message: `Reminder: "${issue.bookCopy.book.title}" is overdue. Please return or renew.`,
    },
  });

  return { success: true };
}

export async function logDigitalAccess(bookId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await prisma.digitalAccessLog.create({
    data: { userId: session.user.id, bookId },
  });

  return { success: true };
}

export async function markNotificationsRead() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await prisma.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true },
  });

  revalidatePath("/dashboard/student/notifications");
  return { success: true };
}

export async function runFineCalculationJob() {
  const session = await auth();
  if (!can(session?.user, "read", "AuditLog")) {
    throw new Error("Unauthorized");
  }

  const rule = await prisma.fineRule.findFirst();
  if (!rule) throw new Error("Fine rule not configured.");

  const overdue = await prisma.issueRecord.findMany({
    where: { status: { in: ["ACTIVE", "OVERDUE"] }, returnDate: null, dueDate: { lt: new Date() } },
    include: { bookCopy: { include: { book: true } } },
  });

  let updated = 0;
  for (const issue of overdue) {
    const fine = Math.min(
      Math.max(0, Math.floor((Date.now() - issue.dueDate.getTime()) / 86400000) - rule.gracePeriodDays) *
        rule.perDayAmount,
      rule.maxFineCap
    );

    await prisma.issueRecord.update({
      where: { id: issue.id },
      data: { fineAmount: fine, fineStatus: "UNPAID", status: "OVERDUE" },
    });

    await prisma.notification.create({
      data: {
        userId: issue.userId,
        type: "FINE_CALCULATED",
        message: `Fine updated for "${issue.bookCopy.book.title}": ₹${fine}`,
      },
    });
    updated++;
  }

  return { success: true, updated };
}
