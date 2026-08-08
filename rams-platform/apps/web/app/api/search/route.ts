import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!q) {
    return NextResponse.json({ results: [] });
  }

  const results = await prisma.book.findMany({
    where: {
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { author: { contains: q, mode: "insensitive" } },
        { isbn: { contains: q } },
        { tags: { has: q } },
      ],
    },
    include: {
      department: { select: { code: true } },
      semester: { select: { number: true } },
    },
    take: 10,
  });

  return NextResponse.json({ results, query: q });
}
