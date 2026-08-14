#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { prisma } from "@rams/database";

const server = new McpServer({
  name: "rams-library-catalog",
  version: "1.0.0",
});

// --- Tool: search_books ---
// The core catalog lookup: filter by free-text query, department code,
// and/or semester number. All parameters are optional so a client can
// search broadly or narrow down as needed.
server.registerTool(
  "search_books",
  {
    title: "Search Library Catalog",
    description:
      "Search the MSRIT library catalog by title, author, department code (e.g. CSE, ISE, ECE), " +
      "and/or semester number. Returns matching books with availability.",
    inputSchema: {
      query: z.string().optional().describe("Free-text search across title and author"),
      departmentCode: z.string().optional().describe("Department code, e.g. 'CSE', 'ISE', 'ECE'"),
      semesterNumber: z.number().int().min(1).max(8).optional().describe("Semester number, 1-8"),
      limit: z.number().int().min(1).max(50).default(10),
    },
  },
  async ({ query, departmentCode, semesterNumber, limit }) => {
    const books = await prisma.book.findMany({
      where: {
        AND: [
          query
            ? {
                OR: [
                  { title: { contains: query, mode: "insensitive" } },
                  { author: { contains: query, mode: "insensitive" } },
                ],
              }
            : {},
          departmentCode ? { department: { code: departmentCode.toUpperCase() } } : {},
          semesterNumber ? { semester: { number: semesterNumber } } : {},
        ],
      },
      include: { department: true, semester: true },
      take: limit,
      orderBy: { title: "asc" },
    });

    if (books.length === 0) {
      return {
        content: [{ type: "text", text: "No books found matching that search." }],
      };
    }

    const summary = books
      .map(
        (b) =>
          `- "${b.title}" by ${b.author} (ID: ${b.id}) - ${b.department?.code ?? "Unknown dept"}, ` +
          `Sem ${b.semester?.number ?? "?"} - ${b.availableCopies}/${b.totalCopies} copies available`
      )
      .join("\n");

    return {
      content: [{ type: "text", text: `Found ${books.length} book(s):\n\n${summary}` }],
    };
  }
);

// --- Tool: get_book_details ---
server.registerTool(
  "get_book_details",
  {
    title: "Get Book Details",
    description: "Get full details for a specific book by its ID (from search_books results).",
    inputSchema: {
      bookId: z.string().describe("The book's ID, from a search_books result"),
    },
  },
  async ({ bookId }) => {
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: { department: true, semester: true, subject: true },
    });

    if (!book) {
      return { content: [{ type: "text", text: `No book found with ID ${bookId}.` }] };
    }

    const details = [
      `Title: ${book.title}`,
      `Author: ${book.author}`,
      book.isbn ? `ISBN: ${book.isbn}` : null,
      book.publisher ? `Publisher: ${book.publisher}` : null,
      `Department: ${book.department?.code ?? "Unknown"}`,
      `Semester: ${book.semester?.number ?? "Unknown"}`,
      book.subject ? `Subject: ${book.subject.name}` : null,
      `Availability: ${book.availableCopies}/${book.totalCopies} copies`,
      book.shelfLocation ? `Shelf: ${book.shelfLocation}` : null,
      book.digitalCopyUrl ? "Digital copy: available" : "Digital copy: not available",
    ]
      .filter(Boolean)
      .join("\n");

    return { content: [{ type: "text", text: details }] };
  }
);

// --- Tool: check_availability ---
server.registerTool(
  "check_availability",
  {
    title: "Check Book Availability",
    description: "Quickly check how many copies of a specific book are currently available.",
    inputSchema: {
      bookId: z.string().describe("The book's ID"),
    },
  },
  async ({ bookId }) => {
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      select: { title: true, availableCopies: true, totalCopies: true },
    });

    if (!book) {
      return { content: [{ type: "text", text: `No book found with ID ${bookId}.` }] };
    }

    const status =
      book.availableCopies > 0
        ? `${book.availableCopies} of ${book.totalCopies} copies available now.`
        : `All ${book.totalCopies} copies are currently checked out.`;

    return { content: [{ type: "text", text: `"${book.title}": ${status}` }] };
  }
);

// --- Tool: list_departments ---
server.registerTool(
  "list_departments",
  {
    title: "List Departments",
    description: "List all academic departments in the catalog, for reference when searching.",
    inputSchema: {},
  },
  async () => {
    const departments = await prisma.department.findMany({ orderBy: { code: "asc" } });
    const text = departments.map((d) => `- ${d.code}: ${d.name}`).join("\n");
    return { content: [{ type: "text", text: text || "No departments found." }] };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Deliberately not logging to stdout here - stdio transport uses stdout
  // for the MCP protocol itself, so any console.log would corrupt the
  // message stream. Use stderr if you need to debug.
  console.error("RAMS library catalog MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error starting MCP server:", error);
  process.exit(1);
});
