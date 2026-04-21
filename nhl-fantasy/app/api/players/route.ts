import { type NextRequest } from "next/server";

import { searchPlayers } from "@/lib/api/nhl";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return Response.json(
      {
        error: {
          code: "invalid_request",
          message: "Use at least 2 characters to search for a player.",
        },
      },
      {
        status: 400,
      },
    );
  }

  try {
    const payload = await searchPlayers(query);
    return Response.json(payload);
  } catch {
    return Response.json(
      {
        error: {
          code: "internal_error",
          message: "Unable to search players from the NHL API.",
        },
      },
      {
        status: 502,
      },
    );
  }
}
