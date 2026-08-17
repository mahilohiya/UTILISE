"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createBookRequest } from "@/app/actions/requests";

export default function BookRequestForm() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [reason, setReason] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      try {
        await createBookRequest({ title, author, reason });
        toast.success("Book request submitted.");
        setTitle("");
        setAuthor("");
        setReason("");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to submit request.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Book title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm"
          placeholder="e.g. Computer Networks"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Author (optional)</label>
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm"
          placeholder="Author name"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Reason (optional)</label>
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm"
          placeholder="For which course or project?"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        Submit Request
      </button>
    </form>
  );
}
