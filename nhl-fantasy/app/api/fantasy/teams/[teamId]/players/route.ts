import { getPlayerPlayoffScoring } from "@/lib/api/nhl";
import { requireAdminRoute } from "@/lib/auth/admin-server";
import {
  addPlayerToFantasyTeam,
  getFantasyTeamWithPlayers,
  removePlayerFromFantasyTeam,
} from "@/lib/db/queries";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ teamId: string }> },
) {
  const { teamId } = await params;

  try {
    const team = await getFantasyTeamWithPlayers(teamId);

    if (!team) {
      return Response.json(
        {
          error: {
            code: "not_found",
            message: "Fantasy team not found.",
          },
        },
        { status: 404 },
      );
    }

    const players = await Promise.all(
      team.players.map(async (player) => {
        try {
          const playoffScoring = await getPlayerPlayoffScoring(player.nhlPlayerId);

          return {
            ...player,
            createdAt: player.createdAt.toISOString(),
            currentTeamAbbreviation: playoffScoring.currentTeamAbbreviation,
            playoffGoals: playoffScoring.goals,
            playoffAssists: playoffScoring.assists,
            playoffOvertimeGoals: playoffScoring.overtimeGoals,
            playoffScore: playoffScoring.points,
          };
        } catch {
          return {
            ...player,
            createdAt: player.createdAt.toISOString(),
            currentTeamAbbreviation: null,
            playoffGoals: 0,
            playoffAssists: 0,
            playoffOvertimeGoals: 0,
            playoffScore: 0,
          };
        }
      }),
    );

    return Response.json({
      team: {
        ...team,
        players,
      },
    });
  } catch {
    return Response.json(
      {
        error: {
          code: "internal_error",
          message: "Unable to load fantasy team players from the database.",
        },
      },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ teamId: string }> },
) {
  if (!(await requireAdminRoute())) {
    return Response.json(
      {
        error: {
          code: "invalid_request",
          message: "Admin authentication required.",
        },
      },
      { status: 401 },
    );
  }

  const { teamId } = await params;
  const body = (await request.json()) as Partial<{
    nhlPlayerId: number;
    playerName: string;
    position: string;
  }>;

  if (!body.nhlPlayerId || !body.playerName) {
    return Response.json(
      {
        error: {
          code: "invalid_request",
          message: "nhlPlayerId and playerName are required.",
        },
      },
      { status: 400 },
    );
  }

  try {
    const player = await addPlayerToFantasyTeam({
      teamId,
      nhlPlayerId: body.nhlPlayerId,
      playerName: body.playerName,
      position: body.position,
    });

    return Response.json({ player }, { status: 201 });
  } catch {
    return Response.json(
      {
        error: {
          code: "internal_error",
          message: "Unable to add a player to the fantasy team.",
        },
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ teamId: string }> },
) {
  if (!(await requireAdminRoute())) {
    return Response.json(
      {
        error: {
          code: "invalid_request",
          message: "Admin authentication required.",
        },
      },
      { status: 401 },
    );
  }

  const { teamId } = await params;
  const body = (await request.json()) as Partial<{
    playerId: string;
  }>;

  if (!body.playerId) {
    return Response.json(
      {
        error: {
          code: "invalid_request",
          message: "playerId is required.",
        },
      },
      { status: 400 },
    );
  }

  try {
    const player = await removePlayerFromFantasyTeam({
      teamId,
      playerId: body.playerId,
    });

    if (!player) {
      return Response.json(
        {
          error: {
            code: "not_found",
            message: "Player not found on this fantasy team.",
          },
        },
        { status: 404 },
      );
    }

    return Response.json({
      player: {
        ...player,
        createdAt: player.createdAt.toISOString(),
      },
    });
  } catch {
    return Response.json(
      {
        error: {
          code: "internal_error",
          message: "Unable to remove the player from the fantasy team.",
        },
      },
      { status: 500 },
    );
  }
}
