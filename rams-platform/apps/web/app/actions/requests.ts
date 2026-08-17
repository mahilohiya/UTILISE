"use server";

import { auth } from "@/auth";
import { can } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { RequestStatus } from "@prisma/client";

export async function createBookRequest(data: {
  title: string;
  author?: string;
  reason?: string;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  if (!["STUDENT", "FACULTY"].includes(session.user.role)) {
    throw new Error("Only students and faculty can request books.");
  }

  const title = data.title.trim();
  if (!title) throw new Error("Title is required.");

  const request = await prisma.bookRequest.create({
    data: {
      userId: session.user.id,
      title,
      author: data.author?.trim() || null,
      reason: data.reason?.trim() || null,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "BOOK_REQUEST",
      entityType: "BookRequest",
      entityId: request.id,
    },
  });

  revalidatePath("/dashboard/student");
  revalidatePath("/dashboard/librarian/requests");
  return { success: true, requestId: request.id };
}

export async function updateBookRequestStatus(requestId: string, status: RequestStatus) {
  const session = await auth();
  if (!can(session?.user, "update", "Reservation")) {
    throw new Error("Unauthorized");
  }

  const request = await prisma.bookRequest.findUnique({
    where: { id: requestId },
    include: { user: true },
  });
  if (!request) throw new Error("Request not found.");

  await prisma.bookRequest.update({
    where: { id: requestId },
    data: { status },
  });

  if (status === "APPROVED" || status === "REJECTED" || status === "ORDERED") {
    await prisma.notification.create({
      data: {
        userId: request.userId,
        type: "BOOK_REQUEST_UPDATE",
        message:
          status === "REJECTED"
            ? `Your request for "${request.title}" was declined.`
            : status === "ORDERED"
              ? `Your request for "${request.title}" has been ordered.`
              : `Your request for "${request.title}" was approved.`,
      },
    });
  }

  revalidatePath("/dashboard/librarian/requests");
  revalidatePath("/dashboard/student");
  return { success: true };
}

export async function reportLostBook(issueRecordId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const issue = await prisma.issueRecord.findUnique({
    where: { id: issueRecordId },
    include: {
      bookCopy: { include: { book: true } },
      lostClaims: { where: { status: { not: "RESOLVED" } } },
    },
  });

  if (!issue || issue.userId !== session.user.id) {
    throw new Error("Issue record not found.");
  }
  if (issue.status === "RETURNED") {
    throw new Error("This book has already been returned.");
  }
  if (issue.lostClaims.length > 0) {
    throw new Error("A lost book claim is already open for this issue.");
  }

  const replacementFee = issue.bookCopy.book.price ?? 500;

  await prisma.$transaction([
    prisma.lostBookClaim.create({
      data: {
        issueRecordId: issue.id,
        replacementFee,
        status: "REPORTED",
      },
    }),
    prisma.bookCopy.update({
      where: { id: issue.bookCopyId },
      data: { status: "LOST" },
    }),
    prisma.issueRecord.update({
      where: { id: issue.id },
      data: { status: "OVERDUE", fineStatus: "UNPAID" },
    }),
    prisma.notification.create({
      data: {
        userId: issue.userId,
        type: "LOST_BOOK",
        message: `Lost book reported: "${issue.bookCopy.book.title}". Replacement fee: ₹${replacementFee}.`,
      },
    }),
  ]);

  revalidatePath("/dashboard/student");
  revalidatePath("/dashboard/librarian");
  return { success: true, replacementFee };
}
