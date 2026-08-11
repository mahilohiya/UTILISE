"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { deleteNote } from "@/app/actions/notes";

export default function DeleteNoteButton({ noteId }: { noteId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Delete this note? This can't be undone.")) return;
    setIsDeleting(true);
    try {
      await deleteNote(noteId);
      toast.success("Note deleted.");
      router.push("/dashboard/notes");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete note.");
      setIsDeleting(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
    >
      {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      Delete
    </button>
  );
}
