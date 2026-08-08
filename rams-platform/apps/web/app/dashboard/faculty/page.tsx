import DashboardLayout from "@/components/DashboardLayout";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { BookOpen } from "lucide-react";

export default async function FacultyDashboard() {
  const session = await auth();
  const dept = await prisma.user.findUnique({
    where: { id: session!.user.id },
    include: { department: true },
  });

  const deptBooks = dept?.departmentId
    ? await prisma.book.findMany({
        where: { departmentId: dept.departmentId },
        take: 6,
        orderBy: { title: "asc" },
      })
    : [];

  return (
    <DashboardLayout role="FACULTY" userName={session!.user.name}>
      <div className="max-w-6xl">
        <h1 className="text-2xl font-serif font-bold mb-2">Faculty Portal</h1>
        <p className="text-slate-500 mb-8">
          {dept?.department?.name ?? "Department"} — recommended reading list
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {deptBooks.map((book) => (
            <Link key={book.id} href={`/catalog/${book.id}`} className="bg-white rounded-xl border p-5 hover:shadow-md">
              <BookOpen className="h-8 w-8 text-primary/30 mb-3" />
              <h3 className="font-serif font-semibold">{book.title}</h3>
              <p className="text-sm text-slate-500">{book.author}</p>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
