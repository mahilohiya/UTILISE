import DashboardLayout from "@/components/DashboardLayout";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { computeDemandAlerts } from "@/lib/automation/fines";
import { BookOpen, Users, AlertTriangle, DollarSign, BarChart3, TrendingUp } from "lucide-react";
import { runFineCalculationJob } from "@/app/actions/book";

export default async function AdminDashboard() {
  const session = await auth();
  if (!session) redirect("/login");

  const [
    totalBooks,
    totalStudents,
    activeIssues,
    finesAgg,
    deptStats,
    topBooks,
    demandData,
    unread,
  ] = await Promise.all([
    prisma.book.aggregate({ _sum: { totalCopies: true }, _count: true }),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.issueRecord.count({ where: { status: { in: ["ACTIVE", "OVERDUE"] } } }),
    prisma.issueRecord.aggregate({ where: { fineStatus: "UNPAID" }, _sum: { fineAmount: true } }),
    prisma.department.findMany({
      include: {
        _count: { select: { books: true, users: true } },
      },
    }),
    prisma.issueRecord.groupBy({
      by: ["bookCopyId"],
      _count: true,
      orderBy: { _count: { bookCopyId: "desc" } },
      take: 5,
    }),
    prisma.book.findMany({
      include: {
        _count: { select: { reservations: true } },
      },
      take: 20,
    }),
    prisma.notification.count({ where: { userId: session.user.id, read: false } }),
  ]);

  const topBookDetails = await Promise.all(
    topBooks.map(async (t) => {
      const copy = await prisma.bookCopy.findUnique({
        where: { id: t.bookCopyId },
        include: { book: true },
      });
      return { title: copy?.book.title ?? "Unknown", count: t._count };
    })
  );

  const demandAlerts = computeDemandAlerts(
    demandData.map((b) => ({
      bookId: b.id,
      title: b.title,
      reservations: b._count.reservations,
      requests: 0,
      availableCopies: b.availableCopies,
    }))
  );

  return (
    <DashboardLayout role="ADMIN" userName={session.user.name} unreadCount={unread}>
      <div className="max-w-6xl">
        <h1 className="text-2xl font-serif font-bold text-slate-800 mb-1">Admin Analytics</h1>
        <p className="text-slate-500 mb-8">System-wide library performance and insights.</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <KPICard icon={<BookOpen className="h-5 w-5 text-blue-600" />} label="Total Copies" value={(totalBooks._sum.totalCopies ?? 0).toLocaleString()} bg="bg-blue-50" />
          <KPICard icon={<Users className="h-5 w-5 text-emerald-600" />} label="Students" value={totalStudents.toLocaleString()} bg="bg-emerald-50" />
          <KPICard icon={<AlertTriangle className="h-5 w-5 text-amber-600" />} label="Active Issues" value={activeIssues.toLocaleString()} bg="bg-amber-50" />
          <KPICard icon={<DollarSign className="h-5 w-5 text-red-600" />} label="Unpaid Fines" value={`₹${(finesAgg._sum.fineAmount ?? 0).toFixed(0)}`} bg="bg-red-50" />
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-10">
          <section className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" /> Department Utilization
            </h2>
            <div className="space-y-3">
              {deptStats.map((d) => (
                <div key={d.id} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-12">{d.code}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-6 overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, d._count.books * 3)}%` }} />
                  </div>
                  <span className="text-sm text-slate-500 w-20 text-right">{d._count.books} titles</span>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-xl border p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-secondary" /> Most Issued Copies
            </h2>
            <div className="space-y-4">
              {topBookDetails.map((book, idx) => (
                <div key={book.title} className="flex items-center gap-4">
                  <span className={`text-lg font-bold w-8 ${idx === 0 ? "text-secondary" : "text-slate-400"}`}>#{idx + 1}</span>
                  <p className="flex-1 font-serif truncate">{book.title}</p>
                  <span className="text-sm text-slate-500">{book.count} issues</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {demandAlerts.length > 0 && (
          <section className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-10">
            <h2 className="font-semibold text-amber-900 mb-3">High Demand, Low Stock Alerts</h2>
            <ul className="space-y-2">
              {demandAlerts.slice(0, 5).map((a) => (
                <li key={a.bookId} className="text-sm text-amber-800">
                  {a.title} — {a.reservations} reservations, {a.availableCopies} copies left
                </li>
              ))}
            </ul>
          </section>
        )}

        <form action={runFineCalculationJobForForm} className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold mb-2">Automation Jobs</h2>
          <p className="text-sm text-slate-500 mb-4">Run nightly fine calculation manually for demo.</p>
          <button type="submit" className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-medium">
            Run Fine Calculation
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}

// <form action={...}> requires a function returning void | Promise<void>.
// runFineCalculationJob itself returns { success, updated } for callers that
// want that info (e.g. a client component using useActionState), so we wrap
// it here rather than changing its signature.
async function runFineCalculationJobForForm() {
  "use server";
  await runFineCalculationJob();
}

function KPICard({ icon, label, value, bg }: { icon: React.ReactNode; label: string; value: string; bg: string }) {
  return (
    <div className="bg-white rounded-xl border p-5">
      <div className={`p-2.5 rounded-lg ${bg} inline-block mb-3`}>{icon}</div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}
