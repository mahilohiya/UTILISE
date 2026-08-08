import Link from "next/link";
import { Search, BookOpen, Users, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/db";

async function getStats() {
  const [bookStats, studentCount, deptCount] = await Promise.all([
    prisma.book.aggregate({ _sum: { availableCopies: true }, _count: true }),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.department.count(),
  ]);
  return {
    availableBooks: bookStats._sum.availableCopies ?? 0,
    totalTitles: bookStats._count,
    students: studentCount,
    departments: deptCount,
  };
}

export default async function LandingPage() {
  const stats = await getStats();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-primary text-primary-foreground py-4 px-6 md:px-12 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-secondary" />
          <h1 className="text-2xl font-serif font-bold tracking-tight">RAMS</h1>
        </div>
        <nav className="hidden md:flex gap-6">
          <Link href="/catalog" className="hover:text-secondary transition-colors">
            Catalog
          </Link>
          <Link href="/login" className="hover:text-secondary transition-colors">
            Dashboard
          </Link>
        </nav>
        <Link
          href="/login"
          className="bg-secondary text-secondary-foreground px-5 py-2 rounded-md font-medium hover:bg-secondary/90 transition-colors"
        >
          Sign In
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 bg-gradient-to-b from-primary/5 to-transparent">
        <h2 className="text-4xl md:text-6xl font-serif font-bold text-slate-900 mb-6 max-w-4xl leading-tight">
          Ramaiah Automated <br />
          <span className="text-primary">Management System</span>
        </h2>
        <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl">
          Smart campus portal for MSRIT — semester-wise library management, automated fines,
          reservations, and AI-assisted search.
        </p>

        <form action="/catalog" className="w-full max-w-2xl relative mb-16 shadow-lg rounded-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-slate-400" />
          </div>
          <input
            name="q"
            type="text"
            className="block w-full pl-12 pr-32 py-4 rounded-full border-0 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-primary text-lg"
            placeholder="Search for books by title, author, or ISBN..."
          />
          <button
            type="submit"
            className="absolute inset-y-2 right-2 bg-primary text-white px-6 rounded-full font-medium hover:bg-primary/90 transition-colors"
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl">
          <StatCard
            icon={<BookOpen className="h-6 w-6 text-primary" />}
            count={`${stats.availableBooks.toLocaleString()}+`}
            label="Copies Available"
          />
          <StatCard
            icon={<Users className="h-6 w-6 text-primary" />}
            count={`${stats.students}+`}
            label="Registered Students"
          />
          <StatCard
            icon={<ArrowRight className="h-6 w-6 text-primary" />}
            count={String(stats.departments)}
            label="Engineering Departments"
          />
        </div>

        <div className="mt-12 flex flex-wrap gap-3 justify-center">
          {["CSE", "ISE", "ECE", "ME", "CE", "EEE", "AIML", "BT"].map((dept) => (
            <Link
              key={dept}
              href={`/catalog?department=${dept}`}
              className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-700 hover:border-primary hover:text-primary transition-colors"
            >
              {dept}
            </Link>
          ))}
        </div>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-8 text-center text-sm">
        <p>© {new Date().getFullYear()} M.S. Ramaiah Institute of Technology. All rights reserved.</p>
      </footer>
    </div>
  );
}

function StatCard({
  icon,
  count,
  label,
}: {
  icon: React.ReactNode;
  count: string;
  label: string;
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center gap-3">
      <div className="p-3 bg-primary/10 rounded-full">{icon}</div>
      <h3 className="text-3xl font-bold text-slate-800">{count}</h3>
      <p className="text-slate-500 font-medium">{label}</p>
    </div>
  );
}
