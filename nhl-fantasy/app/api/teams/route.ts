import type { TeamsResponse } from "@/lib/api/contracts";
import { getTeams } from "@/lib/api/nhl";

export async function GET() {
  try {
    const payload: TeamsResponse = await getTeams();

    return Response.json(payload);
  } catch {
    return Response.json(
      {
        error: {
          code: "internal_error",
          message: "Unable to load teams from the NHL API.",
        },
      },
      {
        status: 502,
      },
    );
  }
}
