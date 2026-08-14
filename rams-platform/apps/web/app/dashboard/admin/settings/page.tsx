import DashboardLayout from "@/components/DashboardLayout";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { can } from "@/lib/rbac";
import { getOrCreateFineRule } from "@/app/actions/settings";
import FineRuleForm from "./FineRuleForm";

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (!can(session.user, "update", "Fine")) redirect("/dashboard");

  const fineRule = await getOrCreateFineRule();

  return (
    <DashboardLayout role={session.user.role} userName={session.user.name}>
      <div className="max-w-xl">
        <h1 className="text-2xl font-serif font-bold text-slate-800 mb-1">Settings</h1>
        <p className="text-slate-500 mb-6">Configure library-wide policies.</p>

        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold text-lg mb-1">Fine Rules</h2>
          <p className="text-sm text-slate-500 mb-4">
            Controls how overdue fines are calculated automatically across the library.
          </p>
          <FineRuleForm fineRule={fineRule} />
        </div>
      </div>
    </DashboardLayout>
  );
}
