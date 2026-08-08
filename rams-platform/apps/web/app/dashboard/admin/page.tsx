"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { BarChart3, TrendingUp, BookOpen, Users, AlertTriangle, DollarSign } from "lucide-react";

// Mock analytics data
const departmentStats = [
    { dept: "CSE", issued: 340, returned: 310, overdue: 18 },
    { dept: "ISE", issued: 220, returned: 200, overdue: 12 },
    { dept: "ECE", issued: 190, returned: 178, overdue: 8 },
    { dept: "ME", issued: 150, returned: 140, overdue: 6 },
    { dept: "AIML", issued: 130, returned: 126, overdue: 3 },
    { dept: "EEE", issued: 100, returned: 95, overdue: 4 },
    { dept: "CE", issued: 85, returned: 80, overdue: 2 },
    { dept: "BT", issued: 60, returned: 58, overdue: 1 },
];

const topBooksIssued = [
    { title: "Introduction to Algorithms", issueCount: 78 },
    { title: "Engineering Mathematics", issueCount: 65 },
    { title: "Operating System Concepts", issueCount: 52 },
    { title: "Computer Networks", issueCount: 48 },
    { title: "Digital Logic Design", issueCount: 41 },
];

export default function AdminDashboard() {
    const totalBooks = 45320;
    const totalStudents = 3240;
    const activeIssues = 1275;
    const totalFinesMonth = 12450;

    return (
        <DashboardLayout role="ADMIN">
            <div className="max-w-6xl">
                <h1 className="text-2xl font-serif font-bold text-slate-800 mb-1">Admin Analytics</h1>
                <p className="text-slate-500 mb-8">System-wide library performance and insights.</p>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                    <KPICard icon={<BookOpen className="h-5 w-5 text-blue-600" />} label="Total Books" value={totalBooks.toLocaleString()} change="+120 this month" bg="bg-blue-50" />
                    <KPICard icon={<Users className="h-5 w-5 text-emerald-600" />} label="Active Students" value={totalStudents.toLocaleString()} change="+45 this week" bg="bg-emerald-50" />
                    <KPICard icon={<AlertTriangle className="h-5 w-5 text-amber-600" />} label="Active Issues" value={activeIssues.toLocaleString()} change="54 overdue" bg="bg-amber-50" />
                    <KPICard icon={<DollarSign className="h-5 w-5 text-red-600" />} label="Fines (This Month)" value={`₹${totalFinesMonth.toLocaleString()}`} change="+₹2,300 vs last" bg="bg-red-50" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Department-wise breakdown */}
                    <section className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-primary" /> Department Utilization
                        </h2>
                        <div className="space-y-3">
                            {departmentStats.map((d) => (
                                <div key={d.dept} className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-slate-600 w-12">{d.dept}</span>
                                    <div className="flex-1 bg-slate-100 rounded-full h-6 overflow-hidden relative">
                                        <div
                                            className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all"
                                            style={{ width: `${(d.issued / 350) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-sm text-slate-500 w-16 text-right">{d.issued} issued</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Top Books */}
                    <section className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-secondary" /> Most Borrowed Books
                        </h2>
                        <div className="space-y-4">
                            {topBooksIssued.map((book, idx) => (
                                <div key={book.title} className="flex items-center gap-4">
                                    <span className={`text-lg font-bold w-8 ${idx === 0 ? "text-secondary" : "text-slate-400"}`}>#{idx + 1}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-serif text-slate-800 truncate">{book.title}</p>
                                    </div>
                                    <span className="text-sm font-medium text-slate-500">{book.issueCount} issues</span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </DashboardLayout>
    );
}

function KPICard({ icon, label, value, change, bg }: { icon: React.ReactNode; label: string; value: string; change: string; bg: string }) {
    return (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-lg ${bg}`}>{icon}</div>
            </div>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
            <p className="text-sm text-slate-500">{label}</p>
            <p className="text-xs text-slate-400 mt-1">{change}</p>
        </div>
    );
}
