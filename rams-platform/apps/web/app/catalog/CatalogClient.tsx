"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, Grid3x3, List, BookOpen, ChevronDown, Loader2 } from "lucide-react";
import { reserveBook } from "@/app/actions/book";
import { toast } from "sonner";

interface BookItem {
  id: string;
  title: string;
  author: string;
  isbn: string | null;
  availableCopies: number;
  totalCopies: number;
  department: { code: string } | null;
  semester: { number: number } | null;
}

const DEPARTMENTS = ["All", "CSE", "ISE", "ECE", "ME", "CE", "EEE", "AIML", "BT"];
const SEMESTERS = ["All", "1", "2", "3", "4", "5", "6", "7", "8"];

export default function CatalogClient() {
  const searchParams = useSearchParams();
  const [books, setBooks] = useState<BookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [dept, setDept] = useState(searchParams.get("department") ?? "All");
  const [sem, setSem] = useState(searchParams.get("semester") ?? "All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [pending, startTransition] = useTransition();

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (dept !== "All") params.set("department", dept);
    if (sem !== "All") params.set("semester", sem);
    const res = await fetch(`/api/books?${params}`);
    const data = await res.json();
    setBooks(data.books ?? []);
    setLoading(false);
  }, [search, dept, sem]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  function handleReserve(bookId: string) {
    startTransition(async () => {
      try {
        await reserveBook(bookId);
        toast.success("Added to reservation queue!");
        fetchBooks();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to reserve");
      }
    });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-primary text-white py-4 px-6 md:px-12 flex justify-between items-center shadow-md">
        <Link href="/" className="flex items-center gap-3">
          <BookOpen className="h-7 w-7 text-secondary" />
          <span className="text-xl font-serif font-bold">RAMS</span>
        </Link>
        <Link
          href="/login"
          className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-secondary/90"
        >
          Sign In
        </Link>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-serif font-bold text-slate-800 mb-2">Book Catalog</h1>
        <p className="text-slate-500 mb-8">
          Browse the MSRIT library collection. Filter by department, semester, or search directly.
        </p>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
              placeholder="Search by title or author..."
            />
          </div>
          <div className="flex gap-3">
            <SelectFilter label="Department" value={dept} onChange={setDept} options={DEPARTMENTS} />
            <SelectFilter label="Semester" value={sem} onChange={setSem} options={SEMESTERS} />
            <div className="flex border border-slate-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-3 ${viewMode === "grid" ? "bg-primary text-white" : "bg-white text-slate-500"}`}
              >
                <Grid3x3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-3 ${viewMode === "list" ? "bg-primary text-white" : "bg-white text-slate-500"}`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-72 animate-pulse" />
            ))}
          </div>
        ) : books.length === 0 ? (
          <EmptyState />
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book) => (
              <BookCard key={book.id} book={book} onReserve={handleReserve} pending={pending} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {books.map((book) => (
              <BookRow key={book.id} book={book} onReserve={handleReserve} pending={pending} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SelectFilter({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-white border border-slate-200 rounded-lg pl-4 pr-10 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt === "All" ? `${label}: All` : opt}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
    </div>
  );
}

function AvailabilityBadge({ available, total }: { available: number; total: number }) {
  const color =
    available === 0
      ? "bg-red-100 text-red-700"
      : available / total < 0.5
        ? "bg-amber-100 text-amber-700"
        : "bg-emerald-100 text-emerald-700";
  const label = available === 0 ? "Unavailable" : `${available}/${total} available`;
  return (
    <span className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full ${color}`}>
      {label}
    </span>
  );
}

function BookCard({
  book,
  onReserve,
  pending,
}: {
  book: BookItem;
  onReserve: (id: string) => void;
  pending: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
      <Link href={`/catalog/${book.id}`}>
        <div className="h-48 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
          <BookOpen className="h-16 w-16 text-primary/30 group-hover:scale-110 transition-transform" />
        </div>
      </Link>
      <div className="p-5">
        <Link href={`/catalog/${book.id}`}>
          <h3 className="font-serif font-semibold text-slate-800 text-lg leading-tight mb-1 line-clamp-2 hover:text-primary">
            {book.title}
          </h3>
        </Link>
        <p className="text-sm text-slate-500 mb-3">{book.author}</p>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-slate-400">
            {book.department?.code ?? "—"} · Sem {book.semester?.number ?? "—"}
          </span>
          <AvailabilityBadge available={book.availableCopies} total={book.totalCopies} />
        </div>
        <button
          disabled={pending}
          onClick={() =>
            book.availableCopies > 0
              ? toast.info("Sign in to issue this book at the library.")
              : onReserve(book.id)
          }
          className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
            book.availableCopies > 0
              ? "bg-primary text-white hover:bg-primary/90"
              : "bg-secondary/20 text-secondary-foreground"
          }`}
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {book.availableCopies > 0 ? "View Details" : "Join Waitlist"}
        </button>
      </div>
    </div>
  );
}

function BookRow({
  book,
  onReserve,
  pending,
}: {
  book: BookItem;
  onReserve: (id: string) => void;
  pending: boolean;
}) {
  return (
    <div className="bg-white rounded-lg border p-4 flex items-center gap-6 hover:shadow-md transition-shadow">
      <div className="h-16 w-16 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
        <BookOpen className="h-8 w-8 text-primary/30" />
      </div>
      <div className="flex-1 min-w-0">
        <Link href={`/catalog/${book.id}`} className="font-serif font-semibold text-slate-800 hover:text-primary">
          {book.title}
        </Link>
        <p className="text-sm text-slate-500">
          {book.author} · {book.department?.code} · Sem {book.semester?.number}
        </p>
      </div>
      <AvailabilityBadge available={book.availableCopies} total={book.totalCopies} />
      <button
        disabled={pending}
        onClick={() => (book.availableCopies === 0 ? onReserve(book.id) : undefined)}
        className="px-5 py-2 rounded-lg text-sm font-medium bg-primary text-white flex-shrink-0"
      >
        {book.availableCopies > 0 ? "Available" : "Waitlist"}
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20">
      <BookOpen className="h-16 w-16 text-slate-300 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-slate-600 mb-2">No books found</h3>
      <p className="text-slate-400">Try adjusting your filters or search term.</p>
    </div>
  );
}
