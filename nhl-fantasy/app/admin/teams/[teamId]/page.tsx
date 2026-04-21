import { notFound } from "next/navigation";

import { AdminTeamRosterManager } from "@/app/components/admin-team-roster-manager";
import type { FantasyTeamDetails } from "@/lib/api/contracts";
import { requireAdminPage } from "@/lib/auth/admin-server";
import { getFantasyTeamWithPlayers } from "@/lib/db/queries";

export default async function AdminTeamPage({
  params,
}: {
  params: Promise<{ teamId: string }>;
}) {
  const { teamId } = await params;
  await requireAdminPage(`/admin/teams/${teamId}`);
  const team = await getFantasyTeamWithPlayers(teamId);

  if (!team) {
    notFound();
  }

  const initialTeam: FantasyTeamDetails = {
    id: team.id,
    name: team.name,
    slug: team.slug,
    owner: {
      id: team.owner.id,
      displayName: team.owner.displayName,
      email: team.owner.email,
    },
    players: team.players.map((player) => ({
      id: player.id,
      fantasyTeamId: player.fantasyTeamId,
      nhlPlayerId: player.nhlPlayerId,
      playerName: player.playerName,
      position: player.position,
      createdAt: player.createdAt.toISOString(),
    })),
  };

  return <AdminTeamRosterManager teamId={teamId} initialTeam={initialTeam} />;
}
