// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Admin protection
    if (pathname.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/auth/login?error=unauthorized", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        if (pathname.startsWith("/account") || pathname.startsWith("/admin")) {
          return !!token;
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
};
