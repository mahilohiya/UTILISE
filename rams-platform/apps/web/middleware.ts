import { NextResponse } from "next-server";
import { auth } from "./auth";

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;
    const role = req.auth?.user?.role;

    const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
    const isPublicRoute = nextUrl.pathname === "/" || nextUrl.pathname.startsWith("/catalog");
    const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");

    if (isApiAuthRoute) return NextResponse.next();

    if (!isLoggedIn && !isPublicRoute) {
        return NextResponse.redirect(new URL("/api/auth/signin", nextUrl));
    }

    if (isDashboardRoute) {
        // Role-based route protection
        if (nextUrl.pathname.startsWith("/dashboard/student") && role !== "STUDENT") {
            return NextResponse.redirect(new URL("/dashboard", nextUrl));
        }
        if (nextUrl.pathname.startsWith("/dashboard/faculty") && role !== "FACULTY") {
            return NextResponse.redirect(new URL("/dashboard", nextUrl));
        }
        if (nextUrl.pathname.startsWith("/dashboard/librarian") && role !== "LIBRARIAN" && role !== "ADMIN") {
            return NextResponse.redirect(new URL("/dashboard", nextUrl));
        }
        if (nextUrl.pathname.startsWith("/dashboard/admin") && role !== "ADMIN" && role !== "SUPERADMIN") {
            return NextResponse.redirect(new URL("/dashboard", nextUrl));
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
