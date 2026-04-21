import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/app/components/admin-login-form";
import { isAdminAuthenticated } from "@/lib/auth/admin-server";

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-950 sm:px-10">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <section className="overflow-hidden rounded-[2rem] bg-linear-to-br from-slate-950 via-slate-900 to-cyan-950 px-8 py-10 text-white shadow-2xl shadow-slate-950/15 sm:px-10">
          <p className="text-sm font-medium uppercase tracking-[0.35em] text-cyan-200">
            Admin
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Protected league controls
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            Admin tools are locked behind a private sign-in so only authorized users can manage teams and rosters.
          </p>
        </section>

        <AdminLoginForm />
      </div>
    </main>
  );
}
