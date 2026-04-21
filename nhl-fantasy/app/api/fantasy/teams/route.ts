import { createFantasyTeam, listFantasyTeams } from "@/lib/db/queries";
import { requireAdminRoute } from "@/lib/auth/admin-server";

export async function GET() {
  try {
    const teams = await listFantasyTeams();
    return Response.json({ teams });
  } catch {
    return Response.json(
      {
        error: {
          code: "internal_error",
          message: "Unable to load fantasy teams from the database.",
        },
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
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

  const body = (await request.json()) as Partial<{
    ownerEmail: string;
    ownerName: string;
    teamName: string;
  }>;

  if (!body.ownerEmail || !body.ownerName || !body.teamName) {
    return Response.json(
      {
        error: {
          code: "invalid_request",
          message: "ownerEmail, ownerName, and teamName are required.",
        },
      },
      { status: 400 },
    );
  }

  try {
    const team = await createFantasyTeam({
      ownerEmail: body.ownerEmail,
      ownerName: body.ownerName,
      teamName: body.teamName,
    });

    return Response.json({ team }, { status: 201 });
  } catch {
    return Response.json(
      {
        error: {
          code: "internal_error",
          message: "Unable to create a fantasy team in the database.",
        },
      },
      { status: 500 },
    );
  }
}
