"use client";

import { useState, useTransition } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { issueBookByBarcode, returnBookByBarcode } from "@/app/actions/book";
import { toast } from "sonner";
import { ScanBarcode, Loader2 } from "lucide-react";

export default function LibrarianIssuePage() {
  const [barcode, setBarcode] = useState("");
  const [userUsn, setUserUsn] = useState("1MS22CS001");
  const [mode, setMode] = useState<"issue" | "return">("issue");
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        if (mode === "issue") {
          const result = await issueBookByBarcode(barcode, userUsn);
          toast.success(`Book issued! Due: ${new Date(result.dueDate).toLocaleDateString()}`);
        } else {
          const result = await returnBookByBarcode(barcode);
          toast.success(
            result.notifiedUser
              ? "Book returned. Next reservation notified!"
              : "Book returned successfully."
          );
        }
        setBarcode("");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Operation failed");
      }
    });
  }

  return (
    <DashboardLayout role="LIBRARIAN">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-serif font-bold mb-2">Issue / Return</h1>
        <p className="text-slate-500 mb-8">Enter barcode manually or scan with a USB scanner.</p>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMode("issue")}
            className={`flex-1 py-2 rounded-lg font-medium ${mode === "issue" ? "bg-primary text-white" : "bg-slate-100"}`}
          >
            Issue
          </button>
          <button
            onClick={() => setMode("return")}
            className={`flex-1 py-2 rounded-lg font-medium ${mode === "return" ? "bg-primary text-white" : "bg-slate-100"}`}
          >
            Return
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 space-y-4">
          <div className="flex justify-center mb-4">
            <ScanBarcode className="h-16 w-16 text-primary/30" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Barcode</label>
            <input
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg font-mono"
              placeholder="9780262033848-1"
              required
              autoFocus
            />
          </div>
          {mode === "issue" && (
            <div>
              <label className="block text-sm font-medium mb-1">Student USN or Email</label>
              <input
                value={userUsn}
                onChange={(e) => setUserUsn(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg"
                placeholder="1MS22CS001"
                required
              />
            </div>
          )}
          <button
            type="submit"
            disabled={pending}
            className="w-full bg-primary text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2"
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "issue" ? "Issue Book" : "Process Return"}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
