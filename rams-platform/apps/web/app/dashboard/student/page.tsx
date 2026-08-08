import DashboardLayout from "@/components/DashboardLayout";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { daysUntil, formatCurrency } from "@/lib/utils";
import { BookOpen, Clock, AlertTriangle, DollarSign } from "lucide-react";
import Link from "next/link";

export default async function StudentDashboard() {
  const session = await auth();
  const userId = session!.user.id;

  const [user, issues, reservations, notifications] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: { semester: true },
    }),
    prisma.issueRecord.findMany({
      where: { userId, status: { in: ["ACTIVE", "OVERDUE"] } },
      include: { bookCopy: { include: { book: true } } },
      orderBy: { dueDate: "asc" },
    }),
    prisma.reservation.findMany({
      where: { userId, status: "PENDING" },
      include: { book: true },
    }),
    prisma.notification.count({ where: { userId, read: false } }),
  ]);

  const totalFines = issues.reduce((sum, i) => sum + i.fineAmount, 0);
  const dueSoon = issues.filter((i) => daysUntil(i.dueDate) <= 5).length;

  const recommended = user?.semesterId
    ? await prisma.book.findMany({
        where: { semesterId: user.semesterId },
        take: 3,
        orderBy: { availableCopies: "desc" },
      })
    : [];

  return (
    <DashboardLayout role="STUDENT" userName={session!.user.name} unreadCount={notifications}>
      <div className="max-w-6xl">
        <h1 className="text-2xl font-serif font-bold text-slate-800 mb-1">
          Welcome back, {session!.user.name.split(" ")[0]}
        </h1>
        <p className="text-slate-500 mb-8">Your library activity for this semester.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <SummaryCard icon={<BookOpen className="h-5 w-5 text-blue-600" />} label="Books Issued" value={String(issues.length)} bg="bg-blue-50" />
          <SummaryCard icon={<Clock className="h-5 w-5 text-amber-600" />} label="Due Soon" value={String(dueSoon)} bg="bg-amber-50" />
          <SummaryCard icon={<DollarSign className="h-5 w-5 text-red-600" />} label="Pending Fines" value={formatCurrency(totalFines)} bg="bg-red-50" />
          <SummaryCard icon={<AlertTriangle className="h-5 w-5 text-emerald-600" />} label="Reservations" value={String(reservations.length)} bg="bg-emerald-50" />
        </div>

        <section className="mb-10">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">My Issued Books</h2>
          {issues.length === 0 ? (
            <div className="bg-white rounded-xl border p-10 text-center">
              <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 mb-4">No books issued yet.</p>
              <Link href="/catalog" className="text-primary font-medium hover:underline">
                Browse the catalog
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-xl border overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-3">Title</th>
                    <th className="px-6 py-3">Due Date</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Fine</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {issues.map((issue) => {
                    const days = daysUntil(issue.dueDate);
                    return (
                      <tr key={issue.id}>
                        <td className="px-6 py-4 font-serif font-medium">{issue.bookCopy.book.title}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{issue.dueDate.toLocaleDateString()}</td>
                        <td className="px-6 py-4"><DueBadge daysLeft={days} /></td>
                        <td className="px-6 py-4">{issue.fineAmount > 0 ? formatCurrency(issue.fineAmount) : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {recommended.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-slate-700 mb-4">
              Recommended for Semester {user?.semester?.number ?? "—"}
            </h2>
            <div className="grid sm:grid-cols-3 gap-5">
              {recommended.map((book) => (
                <Link key={book.id} href={`/catalog/${book.id}`} className="bg-white rounded-xl border p-5 hover:shadow-md">
                  <h3 className="font-serif font-semibold">{book.title}</h3>
                  <p className="text-sm text-slate-400">{book.author}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}

function SummaryCard({ icon, label, value, bg }: { icon: React.ReactNode; label: string; value: string; bg: string }) {
  return (
    <div className="bg-white rounded-xl border p-5 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${bg}`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
}

function DueBadge({ daysLeft }: { daysLeft: number }) {
  const color = daysLeft <= 2 ? "bg-red-100 text-red-700" : daysLeft <= 5 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700";
  const text = daysLeft <= 0 ? "Overdue" : `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`;
  return <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${color}`}>{text}</span>;
}
