export type ApiErrorCode = "internal_error" | "invalid_request" | "not_found";

export type ApiErrorResponse = {
  error: {
    code: ApiErrorCode;
    message: string;
  };
};

export type Conference = "Eastern" | "Western";

export type Team = {
  id: string;
  name: string;
  abbreviation: string;
  conference: Conference;
  division: string;
  logoUrl: string;
  points: number;
  wins: number;
};

export type TeamsResponse = {
  teams: Team[];
  updatedAt: string;
};

export type PlayerSearchItem = {
  id: number;
  fullName: string;
  firstName: string;
  lastName: string;
  position: string;
  sweaterNumber: number | null;
  teamId: number | null;
};

export type PlayerSearchResponse = {
  players: PlayerSearchItem[];
  query: string;
};

export type PlayerStat = {
  label: string;
  value: string;
};

export type PlayerDetails = {
  id: number;
  fullName: string;
  teamName: string | null;
  teamAbbreviation: string | null;
  teamLogoUrl: string | null;
  position: string;
  sweaterNumber: number | null;
  headshotUrl: string;
  heroImageUrl: string;
  birthDate: string;
  birthPlace: string;
  shootsCatches: string;
  height: string;
  weight: string;
  currentSeason: number | null;
  currentRegularSeason: PlayerStat[];
  currentPlayoffs: PlayerStat[];
  careerRegularSeason: PlayerStat[];
  careerPlayoffs: PlayerStat[];
};

export type PlayerDetailsResponse = {
  player: PlayerDetails;
};

export type FantasyLeagueTeam = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  ownerName: string;
  ownerEmail: string;
  rosterCount: number;
  score: number;
  playoffGoals: number;
  playoffAssists: number;
  playoffOvertimeGoals: number;
};

export type FantasyTeamsResponse = {
  teams: FantasyLeagueTeam[];
};

export type FantasyTeamPlayerRecord = {
  id: string;
  fantasyTeamId: string;
  nhlPlayerId: number;
  playerName: string;
  position: string | null;
  createdAt: string;
  currentTeamAbbreviation?: string | null;
  playoffGoals?: number;
  playoffAssists?: number;
  playoffOvertimeGoals?: number;
  playoffScore?: number;
};

export type FantasyTeamDetails = {
  id: string;
  name: string;
  slug: string;
  owner: {
    id: string;
    displayName: string;
    email: string;
  };
  players: FantasyTeamPlayerRecord[];
};

export type FantasyTeamDetailsResponse = {
  team: FantasyTeamDetails;
};

export type CreateFantasyTeamResponse = {
  team: {
    id: string;
    ownerId: string;
    name: string;
    slug: string;
    createdAt: string;
    updatedAt: string;
  };
};

export type AddFantasyTeamPlayerResponse = {
  player: FantasyTeamPlayerRecord;
};

export type RemoveFantasyTeamPlayerResponse = {
  player: FantasyTeamPlayerRecord | null;
};
