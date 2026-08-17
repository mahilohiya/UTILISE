"use client";

import { useState } from "react";
import { toast } from "sonner";
import { updateFineRule } from "@/app/actions/settings";
import { Loader2 } from "lucide-react";

interface FineRule {
  id: string;
  perDayAmount: number;
  gracePeriodDays: number;
  maxFineCap: number;
}

export default function FineRuleForm({ fineRule }: { fineRule: FineRule }) {
  const [perDayAmount, setPerDayAmount] = useState(fineRule.perDayAmount);
  const [gracePeriodDays, setGracePeriodDays] = useState(fineRule.gracePeriodDays);
  const [maxFineCap, setMaxFineCap] = useState(fineRule.maxFineCap);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateFineRule({ id: fineRule.id, perDayAmount, gracePeriodDays, maxFineCap });
      toast.success("Fine rule updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update settings.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Fine per day overdue (₹)
        </label>
        <input
          type="number"
          min={0}
          step={0.5}
          value={perDayAmount}
          onChange={(e) => setPerDayAmount(Number(e.target.value))}
          className="w-full border rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Grace period (days before fines start)
        </label>
        <input
          type="number"
          min={0}
          value={gracePeriodDays}
          onChange={(e) => setGracePeriodDays(Number(e.target.value))}
          className="w-full border rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Maximum fine cap per book (₹)
        </label>
        <input
          type="number"
          min={0}
          step={1}
          value={maxFineCap}
          onChange={(e) => setMaxFineCap(Number(e.target.value))}
          className="w-full border rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
      >
        {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
        Save Changes
      </button>
    </form>
  );
}
