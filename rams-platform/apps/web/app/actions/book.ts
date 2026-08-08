"use server";

import { auth } from "@/auth";
import { can } from "@/lib/rbac";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function reserveBook(bookId: string) {
    const session = await auth();

    if (!can(session?.user, "reserve", "Book")) {
        throw new Error("Unauthorized: You do not have permission to reserve books.");
    }

    const userId = session!.user.id;

    // Check if book is available
    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) throw new Error("Book not found.");

    if (book.availableCopies > 0) {
        throw new Error("Book is currently available. Please visit the library to issue it.");
    }

    // Create reservation
    const reservation = await prisma.reservation.create({
        data: {
            bookId,
            userId,
            status: "PENDING",
        },
    });

    // Audit log
    await prisma.auditLog.create({
        data: {
            actorId: userId,
            action: "RESERVE_BOOK",
            entityType: "Reservation",
            entityId: reservation.id,
        },
    });

    return { success: true, reservationId: reservation.id };
}
