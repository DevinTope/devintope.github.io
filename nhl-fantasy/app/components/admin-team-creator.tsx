"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type {
  CreateFantasyTeamResponse,
  FantasyLeagueTeam,
  FantasyTeamsResponse,
} from "@/lib/api/contracts";
import { ApiClientError, apiFetch } from "@/lib/api/http";
import { apiRoutes } from "@/lib/api/routes";

export function AdminTeamCreator() {
  const [teams, setTeams] = useState<FantasyLeagueTeam[]>([]);
  const [teamName, setTeamName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
          setError("Unable to load teams from the database.");
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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await apiFetch<CreateFantasyTeamResponse>(apiRoutes.fantasyTeams, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teamName,
          ownerName,
          ownerEmail,
        }),
      });

      setSuccess(`Created ${response.team.name}.`);
      setTeamName("");
      setOwnerName("");
      setOwnerEmail("");

      const nextTeams = await apiFetch<FantasyTeamsResponse>(apiRoutes.fantasyTeams);
      setTeams(nextTeams.teams);
    } catch (cause) {
      if (cause instanceof ApiClientError) {
        setError(cause.message);
      } else {
        setError("Unable to create the fantasy team.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/60">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
          New Team
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
          Create a fantasy team
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Add teams to the league and assign an owner. Once created, each team gets its
          own admin roster page for player management.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Field
            label="Team name"
            value={teamName}
            onChange={setTeamName}
            placeholder="Northern Lights"
          />
          <Field
            label="Owner name"
            value={ownerName}
            onChange={setOwnerName}
            placeholder="Taylor"
          />
          <Field
            label="Owner email"
            type="email"
            value={ownerEmail}
            onChange={setOwnerEmail}
            placeholder="taylor@example.com"
          />
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          {success ? <p className="text-sm text-emerald-600">{success}</p> : null}
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Creating team..." : "Create Team"}
          </button>
        </form>
      </div>

      <div className="rounded-[2rem] border border-cyan-200 bg-cyan-50 p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-700">
          League Teams
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
          Manage existing teams
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Jump into a team page to add players and build the roster.
        </p>
        <div className="mt-6 space-y-3">
          {isLoading ? <p className="text-sm text-slate-500">Loading teams...</p> : null}
          {!isLoading && teams.length === 0 ? (
            <p className="text-sm text-slate-500">No teams created yet.</p>
          ) : null}
          {teams.map((team) => (
            <article
              key={team.id}
              className="flex flex-col gap-3 rounded-[1.5rem] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-lg font-semibold text-slate-950">{team.name}</p>
                <p className="text-sm text-slate-500">
                  {team.ownerName} · {team.rosterCount} players
                </p>
              </div>
              <Link
                href={`/admin/teams/${team.id}`}
                className="inline-flex rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-950 hover:text-slate-950"
              >
                Open Team Admin
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: React.HTMLInputTypeAttribute;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:bg-white"
      />
    </label>
  );
}
