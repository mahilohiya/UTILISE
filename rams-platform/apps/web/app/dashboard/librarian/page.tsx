import DashboardLayout from "@/components/DashboardLayout";
import { BookOpen, AlertTriangle, ScanBarcode, Send } from "lucide-react";

const overdueBooks = [
    { id: 1, title: "Introduction to Algorithms", student: "Mahi L (1MS22CS001)", dueDate: "2026-08-01", daysOverdue: 7, fine: 35.0 },
    { id: 2, title: "Digital Logic Design", student: "Rahul K (1MS22EC015)", dueDate: "2026-07-28", daysOverdue: 11, fine: 55.0 },
    { id: 3, title: "Engineering Mathematics", student: "Priya S (1MS22ME042)", dueDate: "2026-08-05", daysOverdue: 3, fine: 15.0 },
];

export default function LibrarianDashboard() {
    return (
        <DashboardLayout role="LIBRARIAN">
            <div className="max-w-6xl">
                <h1 className="text-2xl font-serif font-bold text-slate-800 mb-1">Librarian Console</h1>
                <p className="text-slate-500 mb-8">Manage book issuance, returns, and track overdue items.</p>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
                    <button className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col items-center gap-3 hover:shadow-md hover:border-primary/30 transition-all group">
                        <div className="p-4 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                            <ScanBarcode className="h-8 w-8 text-primary" />
                        </div>
                        <span className="font-semibold text-slate-800">Scan to Issue</span>
                        <span className="text-sm text-slate-400">Use camera to scan book barcode/QR</span>
                    </button>
                    <button className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col items-center gap-3 hover:shadow-md hover:border-emerald-300 transition-all group">
                        <div className="p-4 bg-emerald-50 rounded-full group-hover:bg-emerald-100 transition-colors">
                            <BookOpen className="h-8 w-8 text-emerald-600" />
                        </div>
                        <span className="font-semibold text-slate-800">Process Return</span>
                        <span className="text-sm text-slate-400">Scan barcode to accept a returned book</span>
                    </button>
                    <button className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col items-center gap-3 hover:shadow-md hover:border-amber-300 transition-all group">
                        <div className="p-4 bg-amber-50 rounded-full group-hover:bg-amber-100 transition-colors">
                            <AlertTriangle className="h-8 w-8 text-amber-600" />
                        </div>
                        <span className="font-semibold text-slate-800">View Overdue</span>
                        <span className="text-sm text-slate-400">{overdueBooks.length} books currently overdue</span>
                    </button>
                </div>

                {/* Overdue Books Table */}
                <section>
                    <h2 className="text-lg font-semibold text-slate-700 mb-4">Overdue Books</h2>
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-xs uppercase text-slate-500 tracking-wider">
                                <tr>
                                    <th className="px-6 py-3">Book</th>
                                    <th className="px-6 py-3">Student</th>
                                    <th className="px-6 py-3">Due Date</th>
                                    <th className="px-6 py-3">Days Overdue</th>
                                    <th className="px-6 py-3">Fine (₹)</th>
                                    <th className="px-6 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {overdueBooks.map((b) => (
                                    <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-serif font-medium text-slate-800">{b.title}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{b.student}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500">{b.dueDate}</td>
                                        <td className="px-6 py-4"><span className="bg-red-100 text-red-700 text-xs font-medium px-2.5 py-1 rounded-full">{b.daysOverdue} days</span></td>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-800">₹{b.fine.toFixed(0)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline">
                                                <Send className="h-3.5 w-3.5" /> Send Reminder
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </DashboardLayout>
    );
}
