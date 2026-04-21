"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { ApiClientError, apiFetch } from "@/lib/api/http";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await apiFetch<{ success: boolean }>("/api/admin/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      router.push(searchParams.get("next") ?? "/admin");
      router.refresh();
    } catch (cause) {
      if (cause instanceof ApiClientError) {
        setError(cause.message);
      } else {
        setError("Unable to sign in as admin.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/60">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
        Admin Access
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
        Sign in to continue
      </h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        Enter the admin password configured for this environment to manage teams and rosters.
      </p>
      <label className="mt-6 block">
        <span className="mb-2 block text-sm font-medium text-slate-700">Admin password</span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:bg-white"
        />
      </label>
      {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
