import DashboardLayout from "@/components/DashboardLayout";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, Calculator, HelpCircle, AlertTriangle, Clock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import DeleteNoteButton from "./DeleteNoteButton";

export default async function NoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session) redirect("/login");

  const note = await prisma.generatedNote.findUnique({ where: { id } });
  if (!note || note.userId !== session.user.id) notFound();

  return (
    <DashboardLayout role={session.user.role} userName={session.user.name}>
      <div className="max-w-3xl">
        <Link
          href="/dashboard/notes"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Notes
        </Link>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-serif font-bold text-slate-800">{note.sourceName}</h1>
            <p className="text-sm text-slate-400 mt-1">
              Generated {new Date(note.createdAt).toLocaleString()}
            </p>
          </div>
          <DeleteNoteButton noteId={note.id} />
        </div>

        {note.status === "PENDING" && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex items-center gap-3 text-amber-800">
            <Clock className="h-5 w-5" />
            Still generating - refresh this page in a moment.
          </div>
        )}

        {note.status === "FAILED" && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-3 text-red-800">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Generation failed</p>
              <p className="text-sm mt-1">{note.errorMessage}</p>
            </div>
          </div>
        )}

        {note.status === "COMPLETED" && (
          <div className="space-y-6">
            <section className="bg-white rounded-xl border p-6">
              <h2 className="font-semibold text-lg mb-3">Summary</h2>
              <div className="prose prose-sm max-w-none prose-headings:font-serif prose-headings:text-slate-800">
                <ReactMarkdown>{note.summaryMarkdown ?? ""}</ReactMarkdown>
              </div>
            </section>

            {note.formulas.length > 0 && (
              <section className="bg-white rounded-xl border p-6">
                <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-secondary" /> Key Formulas
                </h2>
                <ul className="space-y-2">
                  {note.formulas.map((formula, i) => (
                    <li key={i} className="text-sm bg-slate-50 rounded-md px-3 py-2 font-mono">
                      {formula}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {note.vivaQuestions.length > 0 && (
              <section className="bg-white rounded-xl border p-6">
                <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-secondary" /> Likely Viva Questions
                </h2>
                <ol className="space-y-2 list-decimal list-inside">
                  {note.vivaQuestions.map((q, i) => (
                    <li key={i} className="text-sm text-slate-700">
                      {q}
                    </li>
                  ))}
                </ol>
              </section>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
