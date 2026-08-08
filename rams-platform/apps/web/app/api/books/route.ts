import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q") ?? "";
  const department = searchParams.get("department");
  const semester = searchParams.get("semester");
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = parseInt(searchParams.get("limit") ?? "12", 10);
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { author: { contains: q, mode: "insensitive" } },
      { isbn: { contains: q } },
    ];
  }

  if (department && department !== "All") {
    where.department = { code: department };
  }

  if (semester && semester !== "All") {
    where.semester = { number: parseInt(semester, 10) };
  }

  const [books, total, stats] = await Promise.all([
    prisma.book.findMany({
      where,
      include: {
        department: { select: { code: true, name: true } },
        semester: { select: { number: true } },
        subject: { select: { name: true } },
      },
      orderBy: { title: "asc" },
      skip,
      take: limit,
    }),
    prisma.book.count({ where }),
    prisma.book.aggregate({
      _sum: { availableCopies: true },
      _count: true,
    }),
  ]);

  return NextResponse.json({
    books,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    stats: {
      totalBooks: stats._count,
      availableCopies: stats._sum.availableCopies ?? 0,
    },
  });
}
