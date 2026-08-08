"use client";

import { useState } from "react";
import { Search, Filter, Grid3x3, List, BookOpen, ChevronDown } from "lucide-react";

// Mock data for the catalog — in production this comes from tRPC/API
const MOCK_BOOKS = [
    { id: "1", title: "Introduction to Algorithms", author: "Thomas H. Cormen", isbn: "9780262033848", department: "CSE", semester: 3, subject: "Data Structures", available: 3, total: 5, cover: null },
    { id: "2", title: "Operating System Concepts", author: "Abraham Silberschatz", isbn: "9781118063330", department: "CSE", semester: 4, subject: "Operating Systems", available: 0, total: 5, cover: null },
    { id: "3", title: "Computer Networks", author: "Andrew S. Tanenbaum", isbn: "9780132126953", department: "CSE", semester: 5, subject: "Computer Networks", available: 2, total: 5, cover: null },
    { id: "4", title: "Database System Concepts", author: "Abraham Silberschatz", isbn: "9780073523323", department: "ISE", semester: 4, subject: "DBMS", available: 5, total: 5, cover: null },
    { id: "5", title: "Artificial Intelligence: A Modern Approach", author: "Stuart Russell", isbn: "9780136042594", department: "AIML", semester: 6, subject: "AI", available: 1, total: 5, cover: null },
    { id: "6", title: "Engineering Mathematics", author: "B.S. Grewal", isbn: "9788174091246", department: "CSE", semester: 1, subject: "Mathematics I", available: 10, total: 10, cover: null },
    { id: "7", title: "Digital Logic Design", author: "Morris Mano", isbn: "9780132774208", department: "ECE", semester: 3, subject: "DLD", available: 0, total: 4, cover: null },
    { id: "8", title: "Signals and Systems", author: "Alan V. Oppenheim", isbn: "9780138147570", department: "ECE", semester: 4, subject: "Signals", available: 3, total: 6, cover: null },
];

const DEPARTMENTS = ["All", "CSE", "ISE", "ECE", "ME", "CE", "EEE", "AIML", "BT"];
const SEMESTERS = ["All", "1", "2", "3", "4", "5", "6", "7", "8"];

export default function CatalogPage() {
    const [search, setSearch] = useState("");
    const [dept, setDept] = useState("All");
    const [sem, setSem] = useState("All");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    const filtered = MOCK_BOOKS.filter((b) => {
        const matchSearch = b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase());
        const matchDept = dept === "All" || b.department === dept;
        const matchSem = sem === "All" || b.semester === parseInt(sem);
        return matchSearch && matchDept && matchSem;
    });

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Top bar */}
            <header className="bg-primary text-white py-4 px-6 md:px-12 flex justify-between items-center shadow-md">
                <a href="/" className="flex items-center gap-3">
                    <BookOpen className="h-7 w-7 text-secondary" />
                    <span className="text-xl font-serif font-bold">RAMS</span>
                </a>
                <a href="/api/auth/signin" className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-secondary/90">Sign In</a>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Page heading */}
                <h1 className="text-3xl font-serif font-bold text-slate-800 mb-2">Book Catalog</h1>
                <p className="text-slate-500 mb-8">Browse the entire MSRIT library collection. Filter by department, semester, or search directly.</p>

                {/* Search + Filters bar */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none"
                            placeholder="Search by title or author..."
                        />
                    </div>
                    <div className="flex gap-3">
                        <SelectFilter label="Department" value={dept} onChange={setDept} options={DEPARTMENTS} />
                        <SelectFilter label="Semester" value={sem} onChange={setSem} options={SEMESTERS} />
                        <div className="flex border border-slate-200 rounded-lg overflow-hidden">
                            <button onClick={() => setViewMode("grid")} className={`p-3 ${viewMode === "grid" ? "bg-primary text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}>
                                <Grid3x3 className="h-5 w-5" />
                            </button>
                            <button onClick={() => setViewMode("list")} className={`p-3 ${viewMode === "list" ? "bg-primary text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}>
                                <List className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Results count */}
                <p className="text-sm text-slate-500 mb-4">{filtered.length} book{filtered.length !== 1 ? "s" : ""} found</p>

                {/* Book grid / list */}
                {filtered.length === 0 ? (
                    <EmptyState />
                ) : viewMode === "grid" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filtered.map((book) => <BookCard key={book.id} book={book} />)}
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {filtered.map((book) => <BookRow key={book.id} book={book} />)}
                    </div>
                )}
            </div>
        </div>
    );
}

function SelectFilter({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
    return (
        <div className="relative">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="appearance-none bg-white border border-slate-200 rounded-lg pl-4 pr-10 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none cursor-pointer"
            >
                {options.map((opt) => <option key={opt} value={opt}>{opt === "All" ? `${label}: All` : opt}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>
    );
}

function AvailabilityBadge({ available, total }: { available: number; total: number }) {
    const ratio = available / total;
    const color = available === 0 ? "bg-red-100 text-red-700" : ratio < 0.5 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700";
    const label = available === 0 ? "Unavailable" : `${available}/${total} available`;
    return <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${color}`}>{label}</span>;
}

function BookCard({ book }: { book: typeof MOCK_BOOKS[0] }) {
    return (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
            {/* Cover placeholder */}
            <div className="h-48 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                <BookOpen className="h-16 w-16 text-primary/30 group-hover:scale-110 transition-transform" />
            </div>
            <div className="p-5">
                <h3 className="font-serif font-semibold text-slate-800 text-lg leading-tight mb-1 line-clamp-2">{book.title}</h3>
                <p className="text-sm text-slate-500 mb-3">{book.author}</p>
                <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-slate-400">{book.department} · Sem {book.semester}</span>
                    <AvailabilityBadge available={book.available} total={book.total} />
                </div>
                <button
                    disabled={book.available === 0}
                    className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${book.available > 0
                            ? "bg-primary text-white hover:bg-primary/90"
                            : "bg-secondary/20 text-secondary-foreground cursor-not-allowed"
                        }`}
                >
                    {book.available > 0 ? "Reserve" : "Join Waitlist"}
                </button>
            </div>
        </div>
    );
}

function BookRow({ book }: { book: typeof MOCK_BOOKS[0] }) {
    return (
        <div className="bg-white rounded-lg border border-slate-100 shadow-sm p-4 flex items-center gap-6 hover:shadow-md transition-shadow">
            <div className="h-16 w-16 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpen className="h-8 w-8 text-primary/30" />
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="font-serif font-semibold text-slate-800 truncate">{book.title}</h3>
                <p className="text-sm text-slate-500">{book.author} · {book.department} · Sem {book.semester}</p>
            </div>
            <AvailabilityBadge available={book.available} total={book.total} />
            <button
                disabled={book.available === 0}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors flex-shrink-0 ${book.available > 0 ? "bg-primary text-white hover:bg-primary/90" : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    }`}
            >
                {book.available > 0 ? "Reserve" : "Waitlist"}
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
