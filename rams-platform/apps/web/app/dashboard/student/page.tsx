import DashboardLayout from "@/components/DashboardLayout";
import { BookOpen, Clock, AlertTriangle, DollarSign } from "lucide-react";

// Mock data for student dashboard
const issuedBooks = [
    { id: 1, title: "Introduction to Algorithms", dueDate: "2026-08-20", daysLeft: 12 },
    { id: 2, title: "Operating System Concepts", dueDate: "2026-08-12", daysLeft: 4 },
    { id: 3, title: "Computer Networks", dueDate: "2026-08-09", daysLeft: 1 },
];

const recommendedBooks = [
    { id: 4, title: "Design and Analysis of Algorithms", author: "Aho, Hopcroft, Ullman", available: true },
    { id: 5, title: "Compiler Design", author: "Alfred V. Aho", available: true },
    { id: 6, title: "Theory of Computation", author: "Michael Sipser", available: false },
];

export default function StudentDashboard() {
    const totalFines = 45.0;
    const pendingReservations = 1;

    return (
        <DashboardLayout role="STUDENT">
            <div className="max-w-6xl">
                <h1 className="text-2xl font-serif font-bold text-slate-800 mb-1">Welcome back, Mahi 👋</h1>
                <p className="text-slate-500 mb-8">Here&apos;s your library activity for this semester.</p>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                    <SummaryCard icon={<BookOpen className="h-5 w-5 text-blue-600" />} label="Books Issued" value={String(issuedBooks.length)} bg="bg-blue-50" />
                    <SummaryCard icon={<Clock className="h-5 w-5 text-amber-600" />} label="Due Soon (< 5 days)" value={String(issuedBooks.filter(b => b.daysLeft <= 5).length)} bg="bg-amber-50" />
                    <SummaryCard icon={<DollarSign className="h-5 w-5 text-red-600" />} label="Pending Fines" value={`₹${totalFines.toFixed(0)}`} bg="bg-red-50" />
                    <SummaryCard icon={<AlertTriangle className="h-5 w-5 text-emerald-600" />} label="Reservations" value={String(pendingReservations)} bg="bg-emerald-50" />
                </div>

                {/* My Books Table */}
                <section className="mb-10">
                    <h2 className="text-lg font-semibold text-slate-700 mb-4">My Issued Books</h2>
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-xs uppercase text-slate-500 tracking-wider">
                                <tr>
                                    <th className="px-6 py-3">Title</th>
                                    <th className="px-6 py-3">Due Date</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {issuedBooks.map((book) => (
                                    <tr key={book.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-serif font-medium text-slate-800">{book.title}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{book.dueDate}</td>
                                        <td className="px-6 py-4">
                                            <DueBadge daysLeft={book.daysLeft} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-sm text-primary font-medium hover:underline">Renew</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Recommended Books */}
                <section>
                    <h2 className="text-lg font-semibold text-slate-700 mb-4">Recommended for Semester 5</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        {recommendedBooks.map((book) => (
                            <div key={book.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                                <div className="h-32 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg flex items-center justify-center mb-4">
                                    <BookOpen className="h-10 w-10 text-primary/20" />
                                </div>
                                <h3 className="font-serif text-slate-800 font-semibold mb-1">{book.title}</h3>
                                <p className="text-sm text-slate-400 mb-3">{book.author}</p>
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${book.available ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                                    {book.available ? "Available" : "Unavailable"}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </DashboardLayout>
    );
}

function SummaryCard({ icon, label, value, bg }: { icon: React.ReactNode; label: string; value: string; bg: string }) {
    return (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`p-3 rounded-lg ${bg}`}>{icon}</div>
            <div>
                <p className="text-2xl font-bold text-slate-800">{value}</p>
                <p className="text-sm text-slate-500">{label}</p>
            </div>
        </div>
    );
}

function DueBadge({ daysLeft }: { daysLeft: number }) {
    const color = daysLeft <= 2 ? "bg-red-100 text-red-700" : daysLeft <= 5 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700";
    const text = daysLeft <= 0 ? "Overdue" : `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`;
    return <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${color}`}>{text}</span>;
}
