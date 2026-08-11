"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { extractPdfText } from "@/lib/ai/pdf-text";
import { generateNotesFromText } from "@/lib/ai/notes-generator";
import { revalidatePath } from "next/cache";

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024; // 20MB

/**
 * Generates study notes from a directly uploaded PDF file.
 * Returns the created GeneratedNote's id so the caller can navigate to it.
 */
export async function generateNotesFromUpload(formData: FormData): Promise<{ noteId: string }> {
  const session = await auth();
  if (!session) throw new Error("You must be signed in to generate notes.");

  const file = formData.get("file");
  if (!(file instanceof File)) {
    throw new Error("No file was uploaded.");
  }
  if (file.type !== "application/pdf") {
    throw new Error("Only PDF files are supported.");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("File is too large (max 20MB).");
  }

  const note = await prisma.generatedNote.create({
    data: {
      userId: session.user.id,
      sourceName: file.name,
      status: "PENDING",
    },
  });

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const text = await extractPdfText(buffer);
    const generated = await generateNotesFromText(text);

    await prisma.generatedNote.update({
      where: { id: note.id },
      data: {
        status: "COMPLETED",
        summaryMarkdown: generated.summaryMarkdown,
        formulas: generated.formulas,
        vivaQuestions: generated.vivaQuestions,
      },
    });
  } catch (error) {
    await prisma.generatedNote.update({
      where: { id: note.id },
      data: {
        status: "FAILED",
        errorMessage: error instanceof Error ? error.message : "Unknown error during generation.",
      },
    });
  }

  revalidatePath("/dashboard/notes");
  return { noteId: note.id };
}

/**
 * Generates study notes from a book already in the catalog, using its
 * digitalCopyUrl. Only works for books that actually have a reachable
 * digital copy - most seed data does not, since real textbook PDFs aren't
 * bundled with this demo. Throws a clear error rather than failing silently
 * if the book has no digital copy or it can't be fetched.
 */
export async function generateNotesFromBook(bookId: string): Promise<{ noteId: string }> {
  const session = await auth();
  if (!session) throw new Error("You must be signed in to generate notes.");

  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book) throw new Error("Book not found.");
  if (!book.digitalCopyUrl) {
    throw new Error("This book doesn't have a digital copy available for note generation.");
  }

  const note = await prisma.generatedNote.create({
    data: {
      userId: session.user.id,
      bookId: book.id,
      sourceName: book.title,
      status: "PENDING",
    },
  });

  try {
    const pdfResponse = await fetch(book.digitalCopyUrl);
    if (!pdfResponse.ok) {
      throw new Error(
        `Could not download the digital copy (HTTP ${pdfResponse.status}). ` +
        "It may not be hosted yet."
      );
    }
    const arrayBuffer = await pdfResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const text = await extractPdfText(buffer);
    const generated = await generateNotesFromText(text);

    await prisma.generatedNote.update({
      where: { id: note.id },
      data: {
        status: "COMPLETED",
        summaryMarkdown: generated.summaryMarkdown,
        formulas: generated.formulas,
        vivaQuestions: generated.vivaQuestions,
      },
    });
  } catch (error) {
    await prisma.generatedNote.update({
      where: { id: note.id },
      data: {
        status: "FAILED",
        errorMessage: error instanceof Error ? error.message : "Unknown error during generation.",
      },
    });
  }

  revalidatePath("/dashboard/notes");
  return { noteId: note.id };
}

export async function deleteNote(noteId: string): Promise<void> {
  const session = await auth();
  if (!session) throw new Error("You must be signed in.");

  const note = await prisma.generatedNote.findUnique({ where: { id: noteId } });
  if (!note || note.userId !== session.user.id) {
    throw new Error("Note not found.");
  }

  await prisma.generatedNote.delete({ where: { id: noteId } });
  revalidatePath("/dashboard/notes");
}
