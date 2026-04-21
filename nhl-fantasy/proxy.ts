import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { ADMIN_SESSION_COOKIE, isValidAdminSessionToken } from "@/lib/auth/admin";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminLoginPage = pathname === "/admin/login";
  const isAdminPage = pathname.startsWith("/admin") && !isAdminLoginPage;
  const isProtectedFantasyApi =
    pathname.startsWith("/api/fantasy/teams") && request.method !== "GET";

  if (!isAdminPage && !isProtectedFantasyApi) {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

  if (isValidAdminSessionToken(sessionToken)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return Response.json(
      {
        error: {
          code: "invalid_request",
          message: "Admin authentication required.",
        },
      },
      { status: 401 },
    );
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("next", pathname);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/fantasy/teams/:path*"],
};
