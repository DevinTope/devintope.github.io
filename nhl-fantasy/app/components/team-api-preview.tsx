"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import type { Team, TeamsResponse } from "@/lib/api/contracts";
import { apiFetch, ApiClientError } from "@/lib/api/http";
import { apiRoutes } from "@/lib/api/routes";

export function TeamApiPreview() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadTeams() {
      try {
        const response = await apiFetch<TeamsResponse>(apiRoutes.teams);

        if (!isCancelled) {
          setTeams(response.teams);
        }
      } catch (cause) {
        if (isCancelled) {
          return;
        }

        if (cause instanceof ApiClientError) {
          setError(cause.message);
          return;
        }

        setError("Something went wrong while loading teams.");
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

  if (isLoading) {
    return <p className="text-sm text-slate-500">Loading teams from the API layer...</p>;
  }

  if (error) {
    return <p className="text-sm text-rose-600">{error}</p>;
  }

  return (
    <ul className="grid gap-3">
      {teams.map((team) => (
        <li
          key={team.id}
          className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <Image
                src={team.logoUrl}
                alt={`${team.name} logo`}
                width={36}
                height={36}
                className="h-9 w-9"
              />
            </div>
            <div>
              <p className="font-semibold text-slate-950">{team.name}</p>
              <p className="text-sm text-slate-500">
                {team.conference} | {team.division}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-white">
              {team.abbreviation}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              {team.points} pts | {team.wins} wins
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
