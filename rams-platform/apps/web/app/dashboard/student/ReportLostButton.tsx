"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { AlertTriangle, Loader2 } from "lucide-react";
import { reportLostBook } from "@/app/actions/requests";

export default function ReportLostButton({ issueId }: { issueId: string }) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("Report this book as lost? A replacement fee will be applied.")) return;
    startTransition(async () => {
      try {
        const result = await reportLostBook(issueId);
        toast.success(`Lost book reported. Replacement fee: ₹${result.replacementFee}`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to report lost book.");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
    >
      {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <AlertTriangle className="h-3 w-3" />}
      Report lost
    </button>
  );
}
