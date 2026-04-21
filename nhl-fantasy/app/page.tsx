import { LeagueLeaderboard } from "@/app/components/league-leaderboard";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-950 sm:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="overflow-hidden rounded-[2rem] bg-linear-to-br from-slate-950 via-slate-900 to-cyan-950 px-8 py-10 text-white shadow-2xl shadow-slate-950/15 sm:px-10">
          <p className="text-sm font-medium uppercase tracking-[0.35em] text-cyan-200">
            League Leaderboard
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Fantasy standings for the whole league.
          </h1>
        </section>

        <LeagueLeaderboard />
      </div>
    </main>
  );
}
