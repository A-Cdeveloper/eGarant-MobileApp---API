import { NextRequest, NextResponse } from "next/server";

import { requireUser } from "./lib/auth/requireUser";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get("origin");

  const response = NextResponse.next();

  // ✅ CORS setup for API routes
  if (pathname.startsWith("/api")) {
    if (origin) {
      response.headers.set("Access-Control-Allow-Origin", origin);
    }

    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With"
    );
    response.headers.set("Access-Control-Allow-Credentials", "true");

    if (request.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": origin ? origin : "",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers":
            "Content-Type, Authorization, X-Requested-With",
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    // ✅ Security headers
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("Permissions-Policy", "microphone=(), camera=()");
    response.headers.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'self'; font-src 'self'; object-src 'none';"
    );
  }

  // ✅ Protect specific routes
  const protectedRoutes = ["/api/invoices", "/api/profile"];

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtected) {
    const userId = await requireUser(request);
    if (userId instanceof NextResponse) return userId;

    if (!userId) {
      return NextResponse.json(
        { error: "Nemate prava pristupa. Molimo vas prijavite se." },
        { status: 401 }
      );
    }

    // Optional: forward userId to API route
    request.headers.set("x-user-id", userId);
  }

  return response;
}

export const config = {
  matcher: "/api/:path*", // Run this middleware only for API routes
};
