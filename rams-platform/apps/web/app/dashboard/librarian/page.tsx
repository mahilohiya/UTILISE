import DashboardLayout from "@/components/DashboardLayout";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { BookOpen, ScanBarcode, Send } from "lucide-react";
import Link from "next/link";
import { remindAction } from "./actions";

export default async function LibrarianDashboard() {
  const session = await auth();

  const overdueBooks = await prisma.issueRecord.findMany({
    where: { status: "OVERDUE" },
    include: {
      user: true,
      bookCopy: { include: { book: true } },
    },
    orderBy: { dueDate: "asc" },
    take: 20,
  });

  const unread = await prisma.notification.count({
    where: { userId: session!.user.id, read: false },
  });

  return (
    <DashboardLayout role="LIBRARIAN" userName={session!.user.name} unreadCount={unread}>
      <div className="max-w-6xl">
        <h1 className="text-2xl font-serif font-bold text-slate-800 mb-1">Librarian Console</h1>
        <p className="text-slate-500 mb-8">Manage issuance, returns, and overdue tracking.</p>

        <div className="grid sm:grid-cols-3 gap-5 mb-10">
          <Link href="/dashboard/librarian/issue" className="bg-white rounded-xl border p-6 flex flex-col items-center gap-3 hover:shadow-md hover:border-primary/30">
            <div className="p-4 bg-primary/10 rounded-full">
              <ScanBarcode className="h-8 w-8 text-primary" />
            </div>
            <span className="font-semibold">Scan to Issue / Return</span>
          </Link>
          <div className="bg-white rounded-xl border p-6 flex flex-col items-center gap-3">
            <div className="p-4 bg-amber-50 rounded-full">
              <BookOpen className="h-8 w-8 text-amber-600" />
            </div>
            <span className="font-semibold">{overdueBooks.length} Overdue Books</span>
          </div>
        </div>

        <section>
          <h2 className="text-lg font-semibold mb-4">Overdue Books</h2>
          {overdueBooks.length === 0 ? (
            <p className="text-slate-500 bg-white rounded-xl border p-8 text-center">No overdue books. Great job!</p>
          ) : (
            <div className="bg-white rounded-xl border overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-3">Book</th>
                    <th className="px-6 py-3">Student</th>
                    <th className="px-6 py-3">Due Date</th>
                    <th className="px-6 py-3">Fine</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {overdueBooks.map((b) => (
                    <tr key={b.id}>
                      <td className="px-6 py-4 font-serif">{b.bookCopy.book.title}</td>
                      <td className="px-6 py-4 text-sm">{b.user.name} ({b.user.usn})</td>
                      <td className="px-6 py-4 text-sm">{b.dueDate.toLocaleDateString()}</td>
                      <td className="px-6 py-4">₹{b.fineAmount.toFixed(0)}</td>
                      <td className="px-6 py-4 text-right">
                        <form action={remindAction}>
                          <input type="hidden" name="id" value={b.id} />
                          <button type="submit" className="inline-flex items-center gap-1 text-sm text-primary font-medium">
                            <Send className="h-3.5 w-3.5" /> Remind
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
