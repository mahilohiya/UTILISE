import DashboardLayout from "@/components/DashboardLayout";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { markNotificationsRead } from "@/app/actions/book";

export default async function NotificationsPage() {
  const session = await auth();
  const userId = session!.user.id;
  const role = session!.user.role;

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  await markNotificationsRead();

  return (
    <DashboardLayout role={role} userName={session!.user.name} unreadCount={0}>
      <div className="max-w-2xl">
        <h1 className="text-2xl font-serif font-bold mb-6">Notifications</h1>
        {notifications.length === 0 ? (
          <p className="text-slate-500 bg-white rounded-xl border p-8 text-center">No notifications yet.</p>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`bg-white rounded-xl border p-4 ${!n.read ? "border-primary/30 bg-primary/5" : ""}`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-xs font-medium text-primary uppercase">{n.type}</span>
                    <p className="text-slate-700 mt-1">{n.message}</p>
                  </div>
                  <time className="text-xs text-slate-400 flex-shrink-0">
                    {n.createdAt.toLocaleDateString()}
                  </time>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
