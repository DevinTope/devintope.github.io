import { AdminTeamCreator } from "@/app/components/admin-team-creator";
import { AdminLogoutButton } from "@/app/components/admin-logout-button";
import { requireAdminPage } from "@/lib/auth/admin-server";

export default async function AdminPage() {
  await requireAdminPage("/admin");

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-950 sm:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="overflow-hidden rounded-[2rem] bg-linear-to-br from-slate-950 via-slate-900 to-cyan-950 px-8 py-10 text-white shadow-2xl shadow-slate-950/15 sm:px-10">
          <p className="text-sm font-medium uppercase tracking-[0.35em] text-cyan-200">
            Admin
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            League setup and team management.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
            Create fantasy teams here, then jump into each team page to draft and manage
            players.
          </p>
          <div className="mt-6">
            <AdminLogoutButton />
          </div>
        </section>

        <AdminTeamCreator />
      </div>
    </main>
  );
}
