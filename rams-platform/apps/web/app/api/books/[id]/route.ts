import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const book = await prisma.book.findUnique({
    where: { id },
    include: {
      department: true,
      semester: true,
      subject: true,
      copies: {
        include: {
          issueRecords: {
            where: { status: { in: ["ACTIVE", "OVERDUE"] } },
            include: { user: { select: { name: true, usn: true } } },
            take: 1,
          },
        },
      },
      reservations: {
        where: { status: "PENDING" },
        orderBy: { requestedAt: "asc" },
        take: 5,
      },
    },
  });

  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  const related = await prisma.book.findMany({
    where: {
      departmentId: book.departmentId,
      semesterId: book.semesterId,
      id: { not: book.id },
    },
    take: 4,
  });

  return NextResponse.json({ book, related });
}
