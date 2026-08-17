import DashboardLayout from "@/components/DashboardLayout";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { can } from "@/lib/rbac";
import RequestActions from "./RequestActions";

export default async function LibrarianRequestsPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (!can(session.user, "update", "Reservation")) redirect("/dashboard");

  const requests = await prisma.bookRequest.findMany({
    include: { user: { select: { name: true, usn: true, email: true } } },
    orderBy: { requestedAt: "desc" },
    take: 50,
  });

  const unread = await prisma.notification.count({
    where: { userId: session.user.id, read: false },
  });

  const pendingCount = requests.filter((r) => r.status === "PENDING").length;

  return (
    <DashboardLayout role="LIBRARIAN" userName={session.user.name} unreadCount={unread}>
      <div className="max-w-5xl">
        <h1 className="text-2xl font-serif font-bold text-slate-800 mb-1">Book Requests</h1>
        <p className="text-slate-500 mb-8">
          {pendingCount} pending — titles students and faculty want added to the library.
        </p>

        {requests.length === 0 ? (
          <p className="text-slate-500 bg-white rounded-xl border p-8 text-center">No requests yet.</p>
        ) : (
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-3">Title</th>
                  <th className="px-6 py-3">Requested by</th>
                  <th className="px-6 py-3">Reason</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {requests.map((req) => (
                  <tr key={req.id}>
                    <td className="px-6 py-4">
                      <p className="font-medium">{req.title}</p>
                      {req.author && <p className="text-slate-500 text-xs">{req.author}</p>}
                    </td>
                    <td className="px-6 py-4">
                      {req.user.name}
                      <span className="block text-xs text-slate-400">{req.user.usn}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 max-w-xs truncate">{req.reason ?? "—"}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-6 py-4">
                      {req.status === "PENDING" || req.status === "APPROVED" ? (
                        <RequestActions requestId={req.id} />
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700",
    APPROVED: "bg-emerald-100 text-emerald-700",
    ORDERED: "bg-blue-100 text-blue-700",
    FULFILLED: "bg-slate-100 text-slate-600",
    REJECTED: "bg-red-100 text-red-700",
  };
  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full ${colors[status] ?? "bg-slate-100"}`}>
      {status}
    </span>
  );
}
