import { and, count, desc, eq } from "drizzle-orm";

import { getPlayerPlayoffScoring } from "@/lib/api/nhl";
import { getDb } from "@/lib/db";
import { fantasyTeamPlayers, fantasyTeams, users } from "@/lib/db/schema";

export async function listFantasyTeams() {
  const db = getDb();
  const teams = await db
    .select({
      id: fantasyTeams.id,
      name: fantasyTeams.name,
      slug: fantasyTeams.slug,
      createdAt: fantasyTeams.createdAt,
      ownerName: users.displayName,
      ownerEmail: users.email,
    })
    .from(fantasyTeams)
    .innerJoin(users, eq(fantasyTeams.ownerId, users.id))
    .orderBy(desc(fantasyTeams.createdAt));

  return Promise.all(
    teams.map(async (team) => {
      const [{ value: rosterCount }] = await db
        .select({ value: count() })
        .from(fantasyTeamPlayers)
        .where(eq(fantasyTeamPlayers.fantasyTeamId, team.id));
      const rosterPlayers = await db
        .select({
          nhlPlayerId: fantasyTeamPlayers.nhlPlayerId,
        })
        .from(fantasyTeamPlayers)
        .where(eq(fantasyTeamPlayers.fantasyTeamId, team.id));
      const playoffScoring = await Promise.all(
        rosterPlayers.map(async (player) => {
          try {
            return await getPlayerPlayoffScoring(player.nhlPlayerId);
          } catch {
            return {
              goals: 0,
              assists: 0,
              overtimeGoals: 0,
              points: 0,
            };
          }
        }),
      );
      const playoffGoals = playoffScoring.reduce((sum, player) => sum + player.goals, 0);
      const playoffAssists = playoffScoring.reduce(
        (sum, player) => sum + player.assists,
        0,
      );
      const playoffOvertimeGoals = playoffScoring.reduce(
        (sum, player) => sum + player.overtimeGoals,
        0,
      );
      const score = playoffScoring.reduce((sum, player) => sum + player.points, 0);

      return {
        ...team,
        rosterCount,
        playoffGoals,
        playoffAssists,
        playoffOvertimeGoals,
        score,
      };
    }),
  ).then((scoredTeams) =>
    scoredTeams.sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return right.rosterCount - left.rosterCount;
    }),
  );
}

export async function getFantasyTeamWithPlayers(teamId: string) {
  const db = getDb();
  const team = await db.query.fantasyTeams.findFirst({
    where: eq(fantasyTeams.id, teamId),
    with: {
      owner: true,
      players: true,
    },
  });

  return team ?? null;
}

export async function upsertUserByEmail(input: {
  email: string;
  displayName: string;
}) {
  const db = getDb();
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, input.email),
  });

  if (existingUser) {
    return existingUser;
  }

  const [createdUser] = await db
    .insert(users)
    .values({
      email: input.email,
      displayName: input.displayName,
    })
    .returning();

  return createdUser;
}

export async function createFantasyTeam(input: {
  ownerEmail: string;
  ownerName: string;
  teamName: string;
}) {
  const db = getDb();
  const owner = await upsertUserByEmail({
    email: input.ownerEmail,
    displayName: input.ownerName,
  });
  const slugBase = slugify(input.teamName);

  const [team] = await db
    .insert(fantasyTeams)
    .values({
      ownerId: owner.id,
      name: input.teamName,
      slug: `${slugBase}-${crypto.randomUUID().slice(0, 8)}`,
    })
    .returning();

  return team;
}

export async function addPlayerToFantasyTeam(input: {
  teamId: string;
  nhlPlayerId: number;
  playerName: string;
  position?: string | null;
}) {
  const db = getDb();
  const existingPlayer = await db.query.fantasyTeamPlayers.findFirst({
    where: and(
      eq(fantasyTeamPlayers.fantasyTeamId, input.teamId),
      eq(fantasyTeamPlayers.nhlPlayerId, input.nhlPlayerId),
    ),
  });

  if (existingPlayer) {
    return existingPlayer;
  }

  const [player] = await db
    .insert(fantasyTeamPlayers)
    .values({
      fantasyTeamId: input.teamId,
      nhlPlayerId: input.nhlPlayerId,
      playerName: input.playerName,
      position: input.position ?? null,
    })
    .returning();

  return player;
}

export async function removePlayerFromFantasyTeam(input: {
  teamId: string;
  playerId: string;
}) {
  const db = getDb();
  const [player] = await db
    .delete(fantasyTeamPlayers)
    .where(
      and(
        eq(fantasyTeamPlayers.fantasyTeamId, input.teamId),
        eq(fantasyTeamPlayers.id, input.playerId),
      ),
    )
    .returning();

  return player ?? null;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
