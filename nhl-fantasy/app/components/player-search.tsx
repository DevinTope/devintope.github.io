"use client";

import Image from "next/image";
import { useDeferredValue, useEffect, useState } from "react";

import type {
  PlayerDetails,
  PlayerDetailsResponse,
  PlayerSearchItem,
  PlayerSearchResponse,
} from "@/lib/api/contracts";
import { ApiClientError, apiFetch } from "@/lib/api/http";
import { apiRoutes } from "@/lib/api/routes";

export function PlayerSearch() {
  const [query, setQuery] = useState("Connor McDavid");
  const deferredQuery = useDeferredValue(query);
  const [players, setPlayers] = useState<PlayerSearchItem[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerDetails | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingPlayer, setIsLoadingPlayer] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [playerError, setPlayerError] = useState<string | null>(null);

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

        if (isCancelled) {
          return;
        }

        setPlayers(response.players);

        if (response.players.length > 0) {
          setSelectedPlayerId((current) => current ?? response.players[0].id);
        } else {
          setSelectedPlayerId(null);
          setSelectedPlayer(null);
        }
      } catch (cause) {
        if (isCancelled) {
          return;
        }

        setPlayers([]);
        setSelectedPlayerId(null);
        setSelectedPlayer(null);

        if (cause instanceof ApiClientError) {
          setSearchError(cause.message);
        } else {
          setSearchError("Something went wrong while searching players.");
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

  useEffect(() => {
    if (selectedPlayerId === null) {
      return;
    }

    let isCancelled = false;
    const playerId = selectedPlayerId;

    async function loadPlayer() {
      setIsLoadingPlayer(true);
      setPlayerError(null);

      try {
        const response = await apiFetch<PlayerDetailsResponse>(
          apiRoutes.player(playerId),
        );

        if (!isCancelled) {
          setSelectedPlayer(response.player);
        }
      } catch (cause) {
        if (isCancelled) {
          return;
        }

        setSelectedPlayer(null);

        if (cause instanceof ApiClientError) {
          setPlayerError(cause.message);
        } else {
          setPlayerError("Something went wrong while loading player details.");
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingPlayer(false);
        }
      }
    }

    void loadPlayer();

    return () => {
      isCancelled = true;
    };
  }, [selectedPlayerId]);

  return (
    <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/60">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
          Player Search
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight">
          `GET /api/players?q=name`
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Search active NHL players by first name, last name, or full name. Select a
          result to load their stat profile.
        </p>
        <label className="mt-6 block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Player name</span>
          <input
            value={query}
            onChange={handleQueryChange}
            placeholder="Search Connor McDavid"
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:bg-white"
          />
        </label>
        <div className="mt-4 min-h-80 space-y-3">
          {isSearching ? <p className="text-sm text-slate-500">Searching players...</p> : null}
          {searchError ? <p className="text-sm text-rose-600">{searchError}</p> : null}
          {!isSearching && !searchError && deferredQuery.trim().length < 2 ? (
            <p className="text-sm text-slate-500">Type at least two characters to search.</p>
          ) : null}
          {!isSearching && !searchError && deferredQuery.trim().length >= 2 && players.length === 0 ? (
            <p className="text-sm text-slate-500">No active players matched that search.</p>
          ) : null}
          {players.map((player) => {
            const isActive = player.id === selectedPlayerId;

            return (
              <button
                key={player.id}
                type="button"
                onClick={() => setSelectedPlayerId(player.id)}
                className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                  isActive
                    ? "border-cyan-500 bg-cyan-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div>
                  <p className="font-semibold text-slate-950">{player.fullName}</p>
                  <p className="text-sm text-slate-500">
                    {player.position}
                    {player.sweaterNumber ? ` | #${player.sweaterNumber}` : ""}
                  </p>
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                  NHL
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-[2rem] border border-cyan-200 bg-cyan-50 p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-700">
          Player Details
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight">
          `GET /api/players/:id`
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Detail requests load live player profile data plus current and career stat
          snapshots from the NHL player landing endpoint.
        </p>
        <div className="mt-6 min-h-80">
          {isLoadingPlayer ? <p className="text-sm text-slate-500">Loading player stats...</p> : null}
          {playerError ? <p className="text-sm text-rose-600">{playerError}</p> : null}
          {!isLoadingPlayer && !playerError && selectedPlayer ? (
            <div className="space-y-6">
              <div className="flex items-center gap-4 rounded-[1.5rem] bg-white p-4 shadow-sm">
                <div className="relative h-20 w-20 overflow-hidden rounded-full bg-slate-100">
                  <Image
                    src={selectedPlayer.headshotUrl}
                    alt={selectedPlayer.fullName}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-xl font-semibold text-slate-950">{selectedPlayer.fullName}</p>
                  <p className="text-sm text-slate-500">
                    {selectedPlayer.teamAbbreviation ?? "FA"} | {selectedPlayer.position}
                    {selectedPlayer.sweaterNumber ? ` | #${selectedPlayer.sweaterNumber}` : ""}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    {selectedPlayer.birthPlace} | {selectedPlayer.height} | {selectedPlayer.weight}
                  </p>
                </div>
              </div>

              <StatSection
                title={`Current Regular Season${selectedPlayer.currentSeason ? ` (${selectedPlayer.currentSeason})` : ""}`}
                stats={selectedPlayer.currentRegularSeason}
              />
              <StatSection title="Current Playoffs" stats={selectedPlayer.currentPlayoffs} />
              <StatSection title="Career Regular Season" stats={selectedPlayer.careerRegularSeason} />
              <StatSection title="Career Playoffs" stats={selectedPlayer.careerPlayoffs} />
            </div>
          ) : null}
          {!isLoadingPlayer && !playerError && !selectedPlayer ? (
            <p className="text-sm text-slate-500">Search for a player to view stats.</p>
          ) : null}
        </div>
      </div>
    </section>
  );

  function handleQueryChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextQuery = event.target.value;
    setQuery(nextQuery);

    if (nextQuery.trim().length < 2) {
      setPlayers([]);
      setSelectedPlayerId(null);
      setSelectedPlayer(null);
      setSearchError(null);
      setPlayerError(null);
    }
  }
}

function StatSection({
  title,
  stats,
}: {
  title: string;
  stats: PlayerDetails["currentRegularSeason"];
}) {
  return (
    <div className="rounded-[1.5rem] bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
        {title}
      </p>
      {stats.length > 0 ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                {stat.label}
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-950">{stat.value}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-500">No stats available.</p>
      )}
    </div>
  );
}
