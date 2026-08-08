import { NextResponse } from "next/server";
import { auth } from "@/auth";

const ROLE_DASHBOARD: Record<string, string> = {
  STUDENT: "/dashboard/student",
  FACULTY: "/dashboard/faculty",
  LIBRARIAN: "/dashboard/librarian",
  ADMIN: "/dashboard/admin",
  SUPERADMIN: "/dashboard/admin",
};

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isPublicRoute =
    nextUrl.pathname === "/" ||
    nextUrl.pathname.startsWith("/catalog") ||
    nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/api/health") ||
    nextUrl.pathname.startsWith("/api/books") ||
    nextUrl.pathname.startsWith("/api/search");

  if (isApiAuthRoute) return NextResponse.next();

  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  if (nextUrl.pathname === "/dashboard" && isLoggedIn && role) {
    const dest = ROLE_DASHBOARD[role] ?? "/dashboard/student";
    return NextResponse.redirect(new URL(dest, nextUrl));
  }

  if (nextUrl.pathname.startsWith("/dashboard/student") && role !== "STUDENT") {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }
  if (nextUrl.pathname.startsWith("/dashboard/faculty") && role !== "FACULTY") {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }
  if (
    nextUrl.pathname.startsWith("/dashboard/librarian") &&
    role !== "LIBRARIAN" &&
    role !== "ADMIN" &&
    role !== "SUPERADMIN"
  ) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }
  if (
    nextUrl.pathname.startsWith("/dashboard/admin") &&
    role !== "ADMIN" &&
    role !== "SUPERADMIN"
  ) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
