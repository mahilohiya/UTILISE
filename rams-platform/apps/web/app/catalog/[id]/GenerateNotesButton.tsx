"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { generateNotesFromBook } from "@/app/actions/notes";

export default function GenerateNotesButton({ bookId }: { bookId: string }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  async function handleClick() {
    setIsGenerating(true);
    try {
      const { noteId } = await generateNotesFromBook(bookId);
      router.push(`/dashboard/notes/${noteId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate notes.");
      setIsGenerating(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={isGenerating}
      className="flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
    >
      {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
      {isGenerating ? "Generating..." : "Generate Smart Notes"}
    </button>
  );
}
