import DashboardLayout from "@/components/DashboardLayout";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { FileText, CheckCircle2, XCircle, Clock } from "lucide-react";
import NotesUploadForm from "./NotesUploadForm";

const STATUS_CONFIG = {
  COMPLETED: { icon: CheckCircle2, color: "text-green-600", label: "Ready" },
  FAILED: { icon: XCircle, color: "text-red-600", label: "Failed" },
  PENDING: { icon: Clock, color: "text-amber-600", label: "Generating..." },
} as const;

export default async function NotesPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const notes = await prisma.generatedNote.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return (
    <DashboardLayout role={session.user.role} userName={session.user.name}>
      <div className="max-w-4xl">
        <h1 className="text-2xl font-serif font-bold text-slate-800 mb-1">Smart Notes Generator</h1>
        <p className="text-slate-500 mb-6">
          AI-generated one-page summaries, formulas, and viva questions from your PDFs.
        </p>

        <div className="mb-8">
          <NotesUploadForm />
        </div>

        <h2 className="font-semibold text-slate-700 mb-3">Your Notes</h2>
        {notes.length === 0 ? (
          <div className="bg-white rounded-xl border p-8 text-center text-slate-400">
            <FileText className="h-10 w-10 mx-auto mb-2 opacity-40" />
            No notes generated yet. Upload a PDF above to get started.
          </div>
        ) : (
          <div className="space-y-2">
            {notes.map((note) => {
              const config = STATUS_CONFIG[note.status];
              const StatusIcon = config.icon;
              return (
                <Link
                  key={note.id}
                  href={`/dashboard/notes/${note.id}`}
                  className="flex items-center justify-between bg-white rounded-lg border p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="h-5 w-5 text-slate-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800 truncate">{note.sourceName}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1.5 text-sm font-medium flex-shrink-0 ${config.color}`}>
                    <StatusIcon className="h-4 w-4" />
                    {config.label}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
