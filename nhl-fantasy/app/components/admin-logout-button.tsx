"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { apiFetch } from "@/lib/api/http";

export function AdminLogoutButton() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogout() {
    setIsSubmitting(true);

    try {
      await apiFetch<{ success: boolean }>("/api/admin/session", {
        method: "DELETE",
      });
      router.push("/admin/login");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleLogout()}
      disabled={isSubmitting}
      className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isSubmitting ? "Signing out..." : "Sign Out"}
    </button>
  );
}
