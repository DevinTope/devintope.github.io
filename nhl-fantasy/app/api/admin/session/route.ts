import { cookies } from "next/headers";

import {
  ADMIN_SESSION_COOKIE,
  getAdminSessionToken,
  isAdminConfigured,
  isValidAdminPassword,
} from "@/lib/auth/admin";

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<{
    password: string;
  }>;

  if (!isAdminConfigured()) {
    return Response.json(
      {
        error: {
          code: "internal_error",
          message: "Admin authentication is not configured.",
        },
      },
      { status: 500 },
    );
  }

  if (!body.password) {
    return Response.json(
      {
        error: {
          code: "invalid_request",
          message: "Password is required.",
        },
      },
      { status: 400 },
    );
  }

  if (!isValidAdminPassword(body.password)) {
    return Response.json(
      {
        error: {
          code: "invalid_request",
          message: "Invalid admin password.",
        },
      },
      { status: 401 },
    );
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, getAdminSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return Response.json({ success: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);

  return Response.json({ success: true });
}
