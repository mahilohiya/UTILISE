import { GoogleGenAI } from "@google/genai";

// Lazily constructed so a missing API key doesn't crash the whole app at
// import time - it only throws when someone actually tries to generate notes.
function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set. Get a free key (no credit card required) at " +
      "https://aistudio.google.com/app/apikey and add it to apps/web/.env.local " +
      "to use the Smart Notes Generator."
    );
  }
  return new GoogleGenAI({ apiKey });
}

export interface GeneratedNoteContent {
  summaryMarkdown: string;
  formulas: string[];
  vivaQuestions: string[];
}

// Gemini 2.5 Flash has a large context window, but we still cap what we
// send both to stay comfortably within the free tier's per-request token
// limits and because a one-page-notes summary doesn't need an entire
// 400-page textbook - the first ~40k characters (roughly the first several
// chapters) is enough signal for a representative summary.
const MAX_INPUT_CHARS = 40_000;

const SYSTEM_PROMPT = `You are an academic study-notes assistant for engineering students.
Given raw text extracted from a textbook or lecture PDF, produce three things:
1. A one-page (roughly 400-600 word) markdown summary covering the key concepts, organized with headers and bullet points.
2. A list of important formulas found in the text (as plain text, one per line, with a short label - e.g. "Newton's Second Law: F = ma").
3. A list of 8-12 likely viva/interview questions a professor might ask about this material, ordered roughly easy to hard.

Respond ONLY with valid JSON in exactly this shape, no markdown code fences, no preamble:
{
  "summaryMarkdown": "...",
  "formulas": ["...", "..."],
  "vivaQuestions": ["...", "..."]
}
If the text contains no formulas (e.g. a humanities or non-technical subject), return an empty array for "formulas" rather than inventing any.`;

export async function generateNotesFromText(rawText: string): Promise<GeneratedNoteContent> {
  const client = getClient();
  const trimmedText = rawText.slice(0, MAX_INPUT_CHARS);

  if (trimmedText.trim().length < 200) {
    throw new Error(
      "Not enough readable text was extracted from this PDF to generate notes " +
      "(it may be a scanned/image-only PDF, which isn't supported yet)."
    );
  }

  const response = await client.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `${SYSTEM_PROMPT}\n\nHere is the extracted text:\n\n${trimmedText}`,
    config: {
      // Forces Gemini to return valid JSON rather than prose, so we don't
      // need to strip markdown code fences or guess at formatting.
      responseMimeType: "application/json",
    },
  });

  const responseText = response.text;
  if (!responseText) {
    throw new Error("The AI response did not contain any text content.");
  }

  let parsed: GeneratedNoteContent;
  try {
    parsed = JSON.parse(responseText);
  } catch {
    throw new Error("The AI response was not valid JSON. Please try again.");
  }

  if (
    typeof parsed.summaryMarkdown !== "string" ||
    !Array.isArray(parsed.formulas) ||
    !Array.isArray(parsed.vivaQuestions)
  ) {
    throw new Error("The AI response was missing expected fields.");
  }

  return parsed;
}
