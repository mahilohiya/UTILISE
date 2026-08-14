"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  BookOpen,
  LayoutDashboard,
  Library,
  BarChart3,
  Bell,
  Settings,
  Users,
  ClipboardList,
  Search,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

const NAV_ITEMS: Record<string, { label: string; icon: React.ReactNode; href: string }[]> = {
  STUDENT: [
    { label: "Overview", icon: <LayoutDashboard className="h-5 w-5" />, href: "/dashboard/student" },
    { label: "Catalog", icon: <Library className="h-5 w-5" />, href: "/catalog" },
    { label: "Smart Notes", icon: <Sparkles className="h-5 w-5" />, href: "/dashboard/notes" },
    { label: "Notifications", icon: <Bell className="h-5 w-5" />, href: "/dashboard/notifications" },
  ],
  FACULTY: [
    { label: "Overview", icon: <LayoutDashboard className="h-5 w-5" />, href: "/dashboard/faculty" },
    { label: "Catalog", icon: <Library className="h-5 w-5" />, href: "/catalog" },
    { label: "Smart Notes", icon: <Sparkles className="h-5 w-5" />, href: "/dashboard/notes" },
    { label: "Notifications", icon: <Bell className="h-5 w-5" />, href: "/dashboard/notifications" },
  ],
  LIBRARIAN: [
    { label: "Overview", icon: <LayoutDashboard className="h-5 w-5" />, href: "/dashboard/librarian" },
    { label: "Issue / Return", icon: <ClipboardList className="h-5 w-5" />, href: "/dashboard/librarian/issue" },
    { label: "Catalog", icon: <Library className="h-5 w-5" />, href: "/catalog" },
    { label: "Notifications", icon: <Bell className="h-5 w-5" />, href: "/dashboard/notifications" },
  ],
  ADMIN: [
    { label: "Analytics", icon: <BarChart3 className="h-5 w-5" />, href: "/dashboard/admin" },
    { label: "Catalog", icon: <Library className="h-5 w-5" />, href: "/catalog" },
    { label: "Settings", icon: <Settings className="h-5 w-5" />, href: "/dashboard/admin/settings" },
    { label: "Notifications", icon: <Bell className="h-5 w-5" />, href: "/dashboard/notifications" },
  ],
};

export default function DashboardLayout({
  children,
  role = "STUDENT",
  userName = "User",
  unreadCount = 0,
}: {
  children: React.ReactNode;
  role?: string;
  userName?: string;
  unreadCount?: number;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const navItems = NAV_ITEMS[role] || NAV_ITEMS.STUDENT;
  const initial = userName.charAt(0).toUpperCase();

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className={`${collapsed ? "w-20" : "w-64"} bg-white border-r flex flex-col transition-all`}>
        <div className="h-16 flex items-center justify-center border-b px-4">
          <button onClick={() => setCollapsed(!collapsed)} className="flex items-center gap-2">
            <BookOpen className="h-7 w-7 text-primary flex-shrink-0" />
            {!collapsed && <span className="text-xl font-serif font-bold text-primary">RAMS</span>}
          </button>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive ? "bg-primary/10 text-primary" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {item.icon}
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:bg-red-50 hover:text-red-600 w-full"
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center justify-between px-6">
          <Link
            href="/catalog"
            className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm text-slate-400 hover:border-slate-300 w-80"
          >
            <Search className="h-4 w-4" />
            <span>Search catalog...</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard/notifications" className="relative p-2 rounded-lg hover:bg-slate-50">
              <Bell className="h-5 w-5 text-slate-500" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>
            <div className="h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
              {initial}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
