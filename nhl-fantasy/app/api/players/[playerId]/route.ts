import { getPlayerDetails } from "@/lib/api/nhl";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ playerId: string }> },
) {
  const { playerId } = await params;
  const parsedPlayerId = Number(playerId);

  if (Number.isNaN(parsedPlayerId)) {
    return Response.json(
      {
        error: {
          code: "invalid_request",
          message: "Player id must be a number.",
        },
      },
      {
        status: 400,
      },
    );
  }

  try {
    const player = await getPlayerDetails(parsedPlayerId);

    return Response.json({ player });
  } catch {
    return Response.json(
      {
        error: {
          code: "not_found",
          message: "Unable to load player details from the NHL API.",
        },
      },
      {
        status: 404,
      },
    );
  }
}
