"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { generateNotesFromUpload } from "@/app/actions/notes";

export default function NotesUploadForm() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please choose a PDF file first.");
      return;
    }

    setIsGenerating(true);
    try {
      const formData = new FormData();
      formData.set("file", selectedFile);
      const { noteId } = await generateNotesFromUpload(formData);
      toast.success("Notes generated!");
      router.push(`/dashboard/notes/${noteId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate notes.");
    } finally {
      setIsGenerating(false);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-5 w-5 text-secondary" />
        <h2 className="font-semibold text-lg">Generate Smart Notes</h2>
      </div>
      <p className="text-sm text-slate-500 mb-4">
        Upload a chapter or textbook PDF. Claude will generate a one-page summary,
        extract key formulas, and suggest likely viva questions.
      </p>

      <label
        htmlFor="pdf-upload"
        className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-lg py-8 cursor-pointer hover:border-secondary transition-colors"
      >
        <Upload className="h-8 w-8 text-slate-400" />
        <span className="text-sm text-slate-600">
          {selectedFile ? selectedFile.name : "Click to choose a PDF file (max 20MB)"}
        </span>
        <input
          id="pdf-upload"
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
        />
      </label>

      <button
        type="submit"
        disabled={isGenerating || !selectedFile}
        className="mt-4 w-full bg-primary text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating notes... this can take up to a minute
          </>
        ) : (
          "Generate Notes"
        )}
      </button>
    </form>
  );
}
