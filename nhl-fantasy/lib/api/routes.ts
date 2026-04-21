export const apiRoutes = {
  teams: "/api/teams",
  players: "/api/players",
  player: (playerId: number | string) => `/api/players/${playerId}`,
  fantasyTeams: "/api/fantasy/teams",
  fantasyTeamPlayers: (teamId: string) => `/api/fantasy/teams/${teamId}/players`,
} as const;
