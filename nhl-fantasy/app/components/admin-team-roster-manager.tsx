"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useState } from "react";

import type {
  AddFantasyTeamPlayerResponse,
  FantasyTeamDetails,
  FantasyTeamDetailsResponse,
  PlayerSearchItem,
  PlayerSearchResponse,
  RemoveFantasyTeamPlayerResponse,
} from "@/lib/api/contracts";
import { ApiClientError, apiFetch } from "@/lib/api/http";
import { apiRoutes } from "@/lib/api/routes";

export function AdminTeamRosterManager({
  teamId,
  initialTeam,
}: {
  teamId: string;
  initialTeam: FantasyTeamDetails;
}) {
  const [team, setTeam] = useState<FantasyTeamDetails>(initialTeam);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [searchResults, setSearchResults] = useState<PlayerSearchItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAddingPlayerId, setIsAddingPlayerId] = useState<number | null>(null);
  const [isRemovingPlayerId, setIsRemovingPlayerId] = useState<string | null>(null);
  const [teamError, setTeamError] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const normalizedQuery = deferredQuery.trim();

    if (normalizedQuery.length < 2) {
      return;
    }

    let isCancelled = false;

    async function runSearch() {
      setIsSearching(true);
      setSearchError(null);

      try {
        const searchParams = new URLSearchParams({ q: normalizedQuery });
        const response = await apiFetch<PlayerSearchResponse>(
          `${apiRoutes.players}?${searchParams.toString()}`,
        );

        if (!isCancelled) {
          setSearchResults(response.players);
        }
      } catch (cause) {
        if (isCancelled) {
          return;
        }

        setSearchResults([]);

        if (cause instanceof ApiClientError) {
          setSearchError(cause.message);
        } else {
          setSearchError("Unable to search NHL players.");
        }
      } finally {
        if (!isCancelled) {
          setIsSearching(false);
        }
      }
    }

    void runSearch();

    return () => {
      isCancelled = true;
    };
  }, [deferredQuery]);

  async function addPlayer(player: PlayerSearchItem) {
    setIsAddingPlayerId(player.id);
    setSuccess(null);
    setTeamError(null);

    try {
      await apiFetch<AddFantasyTeamPlayerResponse>(apiRoutes.fantasyTeamPlayers(teamId), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nhlPlayerId: player.id,
          playerName: player.fullName,
          position: player.position,
        }),
      });

      setSuccess(`${player.fullName} added to the roster.`);
      const response = await apiFetch<FantasyTeamDetailsResponse>(
        apiRoutes.fantasyTeamPlayers(teamId),
      );
      setTeam(response.team);
    } catch (cause) {
      if (cause instanceof ApiClientError) {
        setTeamError(cause.message);
      } else {
        setTeamError("Unable to add that player to the roster.");
      }
    } finally {
      setIsAddingPlayerId(null);
    }
  }

  async function removePlayer(playerId: string, playerName: string) {
    setIsRemovingPlayerId(playerId);
    setSuccess(null);
    setTeamError(null);

    try {
      await apiFetch<RemoveFantasyTeamPlayerResponse>(apiRoutes.fantasyTeamPlayers(teamId), {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playerId,
        }),
      });

      setSuccess(`${playerName} removed from the roster.`);
      const response = await apiFetch<FantasyTeamDetailsResponse>(
        apiRoutes.fantasyTeamPlayers(teamId),
      );
      setTeam(response.team);
    } catch (cause) {
      if (cause instanceof ApiClientError) {
        setTeamError(cause.message);
      } else {
        setTeamError("Unable to remove that player from the roster.");
      }
    } finally {
      setIsRemovingPlayerId(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-950 sm:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="overflow-hidden rounded-[2rem] bg-linear-to-br from-slate-950 via-slate-900 to-cyan-950 px-8 py-10 text-white shadow-2xl shadow-slate-950/15 sm:px-10">
          <p className="text-sm font-medium uppercase tracking-[0.35em] text-cyan-200">
            Team Admin
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            {team?.name ?? "Manage fantasy team"}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
            Search NHL players by name and add them to this fantasy roster.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40"
            >
              View Leaderboard
            </Link>
            <Link
              href="/admin"
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100"
            >
              Back to Admin
            </Link>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/60">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
              Add Players
            </p>
            <label className="mt-5 block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Search NHL player
              </span>
              <input
                value={query}
                onChange={handleQueryChange}
                placeholder="Search Auston Matthews"
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:bg-white"
              />
            </label>
            {success ? <p className="mt-4 text-sm text-emerald-600">{success}</p> : null}
            {searchError ? <p className="mt-4 text-sm text-rose-600">{searchError}</p> : null}
            <div className="mt-5 space-y-3">
              {isSearching ? <p className="text-sm text-slate-500">Searching players...</p> : null}
              {!isSearching && deferredQuery.trim().length >= 2 && searchResults.length === 0 ? (
                <p className="text-sm text-slate-500">No players matched that search.</p>
              ) : null}
              {searchResults.map((player) => {
                const alreadyOnRoster = !!team?.players.some(
                  (rosterPlayer) => rosterPlayer.nhlPlayerId === player.id,
                );

                return (
                  <article
                    key={player.id}
                    className="flex flex-col gap-3 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold text-slate-950">{player.fullName}</p>
                      <p className="text-sm text-slate-500">
                        {player.position}
                        {player.sweaterNumber ? ` | #${player.sweaterNumber}` : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void addPlayer(player)}
                      disabled={alreadyOnRoster || isAddingPlayerId === player.id}
                      className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {alreadyOnRoster
                        ? "Already Added"
                        : isAddingPlayerId === player.id
                          ? "Adding..."
                          : "Add Player"}
                    </button>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="rounded-[2rem] border border-cyan-200 bg-cyan-50 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-700">
                  Roster
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                  Current team players
                </h2>
                {team ? (
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Owner: {team.owner.displayName} · {team.owner.email}
                  </p>
                ) : null}
              </div>
              {team ? (
                <div className="rounded-2xl bg-white px-4 py-3 text-center shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                    Roster Size
                  </p>
                  <p className="mt-1 text-3xl font-semibold text-slate-950">
                    {team.players.length}
                  </p>
                </div>
              ) : null}
            </div>
            <div className="mt-6 space-y-3">
              {teamError ? <p className="text-sm text-rose-600">{teamError}</p> : null}
              {team.players.length === 0 ? (
                <p className="text-sm text-slate-500">No players added yet.</p>
              ) : null}
              {team.players.map((player) => (
                <article
                  key={player.id}
                  className="flex items-center justify-between rounded-[1.5rem] bg-white p-4 shadow-sm"
                >
                  <div>
                    <p className="font-semibold text-slate-950">{player.playerName}</p>
                    <p className="text-sm text-slate-500">
                      {player.position ?? "Position TBD"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      {player.currentTeamAbbreviation ?? "NHL"}
                    </span>
                    <button
                      type="button"
                      onClick={() => void removePlayer(player.id, player.playerName)}
                      disabled={isRemovingPlayerId === player.id}
                      className="rounded-full border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:border-rose-500 hover:text-rose-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isRemovingPlayerId === player.id ? "Removing..." : "Remove"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );

  function handleQueryChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextQuery = event.target.value;
    setQuery(nextQuery);

    if (nextQuery.trim().length < 2) {
      setSearchResults([]);
      setSearchError(null);
    }
  }
}
