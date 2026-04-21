"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type {
  FantasyLeagueTeam,
  FantasyTeamDetails,
  FantasyTeamDetailsResponse,
  FantasyTeamsResponse,
} from "@/lib/api/contracts";
import { ApiClientError, apiFetch } from "@/lib/api/http";
import { apiRoutes } from "@/lib/api/routes";

export function LeagueLeaderboard() {
  const [teams, setTeams] = useState<FantasyLeagueTeam[]>([]);
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);
  const [teamDetails, setTeamDetails] = useState<Record<string, FantasyTeamDetails>>({});
  const [loadingTeamId, setLoadingTeamId] = useState<string | null>(null);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadTeams() {
      try {
        const response = await apiFetch<FantasyTeamsResponse>(apiRoutes.fantasyTeams);

        if (!isCancelled) {
          setTeams(response.teams);
        }
      } catch (cause) {
        if (isCancelled) {
          return;
        }

        if (cause instanceof ApiClientError) {
          setError(cause.message);
        } else {
          setError("Unable to load the league leaderboard.");
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadTeams();

    return () => {
      isCancelled = true;
    };
  }, []);

  async function toggleTeam(teamId: string) {
    if (expandedTeamId === teamId) {
      setExpandedTeamId(null);
      return;
    }

    setExpandedTeamId(teamId);
    setDetailsError(null);

    if (teamDetails[teamId]) {
      return;
    }

    setLoadingTeamId(teamId);

    try {
      const response = await apiFetch<FantasyTeamDetailsResponse>(
        apiRoutes.fantasyTeamPlayers(teamId),
      );

      setTeamDetails((current) => ({
        ...current,
        [teamId]: response.team,
      }));
    } catch (cause) {
      if (cause instanceof ApiClientError) {
        setDetailsError(cause.message);
      } else {
        setDetailsError("Unable to load player stats for that team.");
      }
    } finally {
      setLoadingTeamId(null);
    }
  }

  if (isLoading) {
    return <p className="text-sm text-slate-500">Loading league teams...</p>;
  }

  if (error) {
    return <p className="text-sm text-rose-600">{error}</p>;
  }

  if (teams.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <p className="text-lg font-semibold text-slate-900">No teams yet</p>
        <p className="mt-2 text-sm text-slate-500">
          Start the league from the admin area and the leaderboard will populate here.
        </p>
        <Link
          href="/admin"
          className="mt-5 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Open Admin
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {teams.map((team, index) => {
        const isExpanded = expandedTeamId === team.id;
        const details = teamDetails[team.id];

        return (
          <article
            key={team.id}
            className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-lg shadow-slate-200/60"
          >
            <div className="grid gap-4 p-5 sm:grid-cols-[auto_1fr_auto]">
              <button
                type="button"
                onClick={() => void toggleTeam(team.id)}
                className="contents text-left"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cyan-100 text-lg font-semibold text-cyan-950">
                  #{index + 1}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                      {team.name}
                    </h2>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                      {team.rosterCount} players
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-cyan-800">
                    {team.playoffGoals} goals | {team.playoffAssists} assists |{" "}
                    {team.playoffOvertimeGoals} OT goals
                  </p>
                </div>
              </button>
              <div className="flex flex-col items-start gap-3 sm:items-end">
                <div className="text-left sm:text-right">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                    Score
                  </p>
                  <p className="mt-1 text-3xl font-semibold text-slate-950">{team.score}</p>
                </div>
              </div>
            </div>

            {isExpanded ? (
              <div className="border-t border-slate-200 bg-slate-50 px-5 py-5">
                {loadingTeamId === team.id ? (
                  <p className="text-sm text-slate-500">Loading player stats...</p>
                ) : null}
                {detailsError && loadingTeamId !== team.id ? (
                  <p className="text-sm text-rose-600">{detailsError}</p>
                ) : null}
                {!loadingTeamId && details ? (
                  details.players.length > 0 ? (
                    <div className="grid gap-3">
                      {details.players.map((player) => (
                        <div
                          key={player.id}
                          className="grid gap-3 rounded-[1.25rem] border border-slate-200 bg-white px-4 py-4 sm:grid-cols-[1.4fr_repeat(4,minmax(0,1fr))]"
                        >
                          <div>
                            <p className="font-semibold text-slate-950">{player.playerName}</p>
                            <p className="text-sm text-slate-500">
                              {player.position ?? "Position TBD"}
                            </p>
                          </div>
                          <StatCell label="Goals" value={player.playoffGoals ?? 0} />
                          <StatCell label="Assists" value={player.playoffAssists ?? 0} />
                          <StatCell
                            label="OT Goals"
                            value={player.playoffOvertimeGoals ?? 0}
                          />
                          <StatCell label="Score" value={player.playoffScore ?? 0} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">This team has no players yet.</p>
                  )
                ) : null}
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

function StatCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-3 py-3 text-left sm:bg-transparent sm:px-0 sm:py-0 sm:text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}
