"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { updateBookRequestStatus } from "@/app/actions/requests";
import type { RequestStatus } from "@prisma/client";

const ACTIONS: { label: string; status: RequestStatus; className: string }[] = [
  { label: "Approve", status: "APPROVED", className: "text-emerald-600 hover:bg-emerald-50" },
  { label: "Order", status: "ORDERED", className: "text-blue-600 hover:bg-blue-50" },
  { label: "Reject", status: "REJECTED", className: "text-red-600 hover:bg-red-50" },
];

export default function RequestActions({ requestId }: { requestId: string }) {
  const [pending, startTransition] = useTransition();

  function handleUpdate(status: RequestStatus) {
    startTransition(async () => {
      try {
        await updateBookRequestStatus(requestId, status);
        toast.success(`Request marked as ${status.toLowerCase()}.`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Update failed.");
      }
    });
  }

  return (
    <div className="flex gap-2 justify-end">
      {ACTIONS.map((action) => (
        <button
          key={action.status}
          type="button"
          disabled={pending}
          onClick={() => handleUpdate(action.status)}
          className={`px-2 py-1 rounded text-xs font-medium ${action.className} disabled:opacity-50`}
        >
          {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : action.label}
        </button>
      ))}
    </div>
  );
}
