import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ADMIN_SESSION_COOKIE, isValidAdminSessionToken } from "@/lib/auth/admin";

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return isValidAdminSessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}

export async function requireAdminPage(redirectTo?: string) {
  const isAuthenticated = await isAdminAuthenticated();

  if (!isAuthenticated) {
    const destination = redirectTo
      ? `/admin/login?next=${encodeURIComponent(redirectTo)}`
      : "/admin/login";

    redirect(destination);
  }
}

export async function requireAdminRoute() {
  return isAdminAuthenticated();
}
