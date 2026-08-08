import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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
    },
  });

  if (!book) notFound();

  const related = await prisma.book.findMany({
    where: {
      departmentId: book.departmentId,
      semesterId: book.semesterId,
      id: { not: book.id },
    },
    take: 4,
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-primary text-white py-4 px-6 md:px-12 flex justify-between items-center">
        <Link href="/catalog" className="flex items-center gap-2 text-sm hover:text-secondary">
          <ArrowLeft className="h-4 w-4" /> Back to Catalog
        </Link>
        <Link href="/login" className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md text-sm">
          Sign In
        </Link>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-3 gap-10">
          <div className="h-80 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl flex items-center justify-center">
            <BookOpen className="h-24 w-24 text-primary/30" />
          </div>
          <div className="md:col-span-2">
            <h1 className="text-3xl font-serif font-bold text-slate-900 mb-2">{book.title}</h1>
            <p className="text-lg text-slate-600 mb-4">{book.author}</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {book.department && (
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  {book.department.code}
                </span>
              )}
              {book.semester && (
                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm">
                  Semester {book.semester.number}
                </span>
              )}
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  book.availableCopies > 0
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {book.availableCopies}/{book.totalCopies} available
              </span>
            </div>
            <dl className="grid grid-cols-2 gap-4 text-sm mb-8">
              <div><dt className="text-slate-400">ISBN</dt><dd>{book.isbn ?? "—"}</dd></div>
              <div><dt className="text-slate-400">Publisher</dt><dd>{book.publisher ?? "—"}</dd></div>
              <div><dt className="text-slate-400">Shelf</dt><dd>{book.shelfLocation ?? "—"}</dd></div>
              <div><dt className="text-slate-400">Subject</dt><dd>{book.subject?.name ?? "—"}</dd></div>
            </dl>
          </div>
        </div>

        <section className="mt-12">
          <h2 className="text-xl font-semibold mb-4">Copy Availability</h2>
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3">Barcode</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Issued To</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {book.copies.map((copy) => {
                  const issue = copy.issueRecords[0];
                  return (
                    <tr key={copy.id}>
                      <td className="px-6 py-4 font-mono">{copy.barcode}</td>
                      <td className="px-6 py-4">{copy.status}</td>
                      <td className="px-6 py-4">
                        {issue
                          ? `${issue.user.name} (${issue.user.usn}) — due ${issue.dueDate.toLocaleDateString()}`
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-semibold mb-4">Related Books</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/catalog/${r.id}`}
                  className="bg-white p-4 rounded-xl border hover:shadow-md transition-shadow"
                >
                  <h3 className="font-serif font-medium line-clamp-2">{r.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">{r.author}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
