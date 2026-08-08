"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, LayoutDashboard, Library, BarChart3, Bell, Settings, Users, ClipboardList, Search, LogOut } from "lucide-react";
import { useState } from "react";

const NAV_ITEMS: Record<string, { label: string; icon: React.ReactNode; href: string }[]> = {
    STUDENT: [
        { label: "Overview", icon: <LayoutDashboard className="h-5 w-5" />, href: "/dashboard/student" },
        { label: "My Books", icon: <BookOpen className="h-5 w-5" />, href: "/dashboard/student/books" },
        { label: "Catalog", icon: <Library className="h-5 w-5" />, href: "/catalog" },
        { label: "Notifications", icon: <Bell className="h-5 w-5" />, href: "/dashboard/student/notifications" },
    ],
    LIBRARIAN: [
        { label: "Overview", icon: <LayoutDashboard className="h-5 w-5" />, href: "/dashboard/librarian" },
        { label: "Issue / Return", icon: <ClipboardList className="h-5 w-5" />, href: "/dashboard/librarian/issue" },
        { label: "Inventory", icon: <Library className="h-5 w-5" />, href: "/dashboard/librarian/inventory" },
        { label: "Overdue", icon: <Bell className="h-5 w-5" />, href: "/dashboard/librarian/overdue" },
        { label: "Analytics", icon: <BarChart3 className="h-5 w-5" />, href: "/dashboard/librarian/analytics" },
    ],
    ADMIN: [
        { label: "Overview", icon: <LayoutDashboard className="h-5 w-5" />, href: "/dashboard/admin" },
        { label: "Users", icon: <Users className="h-5 w-5" />, href: "/dashboard/admin/users" },
        { label: "Analytics", icon: <BarChart3 className="h-5 w-5" />, href: "/dashboard/admin/analytics" },
        { label: "Audit Logs", icon: <ClipboardList className="h-5 w-5" />, href: "/dashboard/admin/audit" },
        { label: "Settings", icon: <Settings className="h-5 w-5" />, href: "/dashboard/admin/settings" },
    ],
};

export default function DashboardLayout({ children, role = "STUDENT" }: { children: React.ReactNode; role?: string }) {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const navItems = NAV_ITEMS[role] || NAV_ITEMS.STUDENT;

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className={`${collapsed ? "w-20" : "w-64"} bg-white border-r border-slate-200 flex flex-col transition-all duration-300`}>
                {/* Logo */}
                <div className="h-16 flex items-center justify-center border-b border-slate-100 px-4">
                    <button onClick={() => setCollapsed(!collapsed)} className="flex items-center gap-2">
                        <BookOpen className="h-7 w-7 text-primary flex-shrink-0" />
                        {!collapsed && <span className="text-xl font-serif font-bold text-primary">RAMS</span>}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-4 px-3 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                    }`}
                            >
                                {item.icon}
                                {!collapsed && <span>{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom section */}
                <div className="p-3 border-t border-slate-100">
                    <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 w-full transition-colors">
                        <LogOut className="h-5 w-5" />
                        {!collapsed && <span>Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top bar */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
                    {/* Global search (Cmd+K) */}
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-400 hover:border-slate-300 transition-colors w-80">
                        <Search className="h-4 w-4" />
                        <span>Search everything...</span>
                        <kbd className="ml-auto px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-500">⌘K</kbd>
                    </button>

                    <div className="flex items-center gap-4">
                        {/* Notification bell */}
                        <button className="relative p-2 rounded-lg hover:bg-slate-50 transition-colors">
                            <Bell className="h-5 w-5 text-slate-500" />
                            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">3</span>
                        </button>
                        {/* Avatar */}
                        <div className="h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">M</div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-6">{children}</main>
            </div>
        </div>
    );
}
