// pdf-parse has no proper ESM types and does some file-existence checks at
// import time in certain environments, so we use a plain require() inside
// the function rather than a top-level import - this keeps it from being
// evaluated (and potentially failing) during Next.js's build-time analysis
// of files that merely import this module without calling extractPdfText.
export async function extractPdfText(buffer: Buffer): Promise<string> {
  const pdfParse = (await import("pdf-parse")).default;
  const result = await pdfParse(buffer);
  return result.text;
}
