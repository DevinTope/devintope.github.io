import type {
  PlayerDetails,
  PlayerSearchItem,
  PlayerSearchResponse,
  PlayerStat,
  Team,
  TeamsResponse,
} from "@/lib/api/contracts";

const NHL_WEB_API_BASE_URL = "https://api-web.nhle.com/v1";
const NHL_STATS_API_BASE_URL = "https://api.nhle.com/stats/rest/en";

type NhlStandingsResponse = {
  standingsDateTimeUtc: string;
  standings: NhlStanding[];
};

type NhlStanding = {
  conferenceName: string;
  divisionName: string;
  points: number;
  teamAbbrev: {
    default: string;
  };
  teamLogo: string;
  teamName: {
    default: string;
  };
  wins: number;
};

type NhlPlayerSearchResponse = {
  data: NhlPlayerSearchResult[];
};

type NhlPlayerSearchResult = {
  id: number;
  currentTeamId: number | null;
  firstName: string;
  fullName: string;
  lastName: string;
  positionCode: string;
  sweaterNumber: number | null;
};

type NhlPlayerLandingResponse = {
  birthCity?: {
    default: string;
  };
  birthCountry: string;
  birthDate: string;
  birthStateProvince?: {
    default: string;
  };
  currentTeamAbbrev?: string;
  featuredStats?: {
    season?: number;
    playoffs?: {
      career?: Record<string, number | string>;
      subSeason?: Record<string, number | string>;
    };
    regularSeason?: {
      career?: Record<string, number | string>;
      subSeason?: Record<string, number | string>;
    };
  };
  firstName: {
    default: string;
  };
  fullTeamName?: {
    default: string;
  };
  headshot: string;
  heightInCentimeters: number;
  heroImage: string;
  lastName: {
    default: string;
  };
  playerId: number;
  position: string;
  shootsCatches: string;
  sweaterNumber?: number;
  teamLogo?: string;
  weightInKilograms: number;
};

const PLAYER_STAT_LABELS: Record<string, string> = {
  assists: "Assists",
  faceoffWinningPctg: "Faceoff %",
  gamesPlayed: "Games",
  gamesStarted: "Starts",
  goals: "Goals",
  goalsAgainst: "Goals Against",
  goalsAgainstAvg: "GAA",
  losses: "Losses",
  otLosses: "OT Losses",
  pim: "PIM",
  plusMinus: "+/-",
  points: "Points",
  powerPlayGoals: "PP Goals",
  powerPlayPoints: "PP Points",
  savePctg: "Save %",
  shootingPctg: "Shooting %",
  shots: "Shots",
  shotsAgainst: "Shots Against",
  shutouts: "Shutouts",
  shorthandedGoals: "SH Goals",
  shorthandedPoints: "SH Points",
  timeOnIce: "TOI",
  wins: "Wins",
};

const SKATER_STAT_KEYS = [
  "gamesPlayed",
  "goals",
  "assists",
  "points",
  "plusMinus",
  "shots",
  "powerPlayPoints",
  "pim",
] as const;

const GOALIE_STAT_KEYS = [
  "gamesPlayed",
  "wins",
  "losses",
  "otLosses",
  "savePctg",
  "goalsAgainstAvg",
  "shutouts",
] as const;

export async function getTeams(): Promise<TeamsResponse> {
  const payload = await fetchNhlJson<NhlStandingsResponse>(
    `${NHL_WEB_API_BASE_URL}/standings/now`,
    3600,
  );

  return {
    teams: payload.standings
      .map((team) => mapStandingToTeam(team))
      .sort((left, right) => left.name.localeCompare(right.name)),
    updatedAt: payload.standingsDateTimeUtc,
  };
}

export async function searchPlayers(query: string): Promise<PlayerSearchResponse> {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return {
      players: [],
      query: normalizedQuery,
    };
  }

  const encodedQuery = normalizedQuery.replace(/'/g, "\\'");
  const cayenneExp =
    `fullName likeIgnoreCase '%${encodedQuery}%' or ` +
    `firstName likeIgnoreCase '%${encodedQuery}%' or ` +
    `lastName likeIgnoreCase '%${encodedQuery}%'`;
  const url =
    `${NHL_STATS_API_BASE_URL}/players?limit=12&sort=lastName&dir=asc&` +
    `cayenneExp=${encodeURIComponent(cayenneExp)}`;

  const payload = await fetchNhlJson<NhlPlayerSearchResponse>(url, 300);

  return {
    players: payload.data
      .filter((player) => player.currentTeamId !== null)
      .slice(0, 8)
      .map((player) => mapPlayerSearchResult(player)),
    query: normalizedQuery,
  };
}

export async function getPlayerDetails(playerId: number): Promise<PlayerDetails> {
  const payload = await fetchNhlJson<NhlPlayerLandingResponse>(
    `${NHL_WEB_API_BASE_URL}/player/${playerId}/landing`,
    300,
  );
  const isGoalie = payload.position === "G";

  return {
    id: payload.playerId,
    fullName: `${payload.firstName.default} ${payload.lastName.default}`,
    teamName: payload.fullTeamName?.default ?? null,
    teamAbbreviation: payload.currentTeamAbbrev ?? null,
    teamLogoUrl: payload.teamLogo ?? null,
    position: payload.position,
    sweaterNumber: payload.sweaterNumber ?? null,
    headshotUrl: payload.headshot,
    heroImageUrl: payload.heroImage,
    birthDate: payload.birthDate,
    birthPlace: formatBirthPlace(payload),
    shootsCatches: payload.shootsCatches,
    height: `${payload.heightInCentimeters} cm`,
    weight: `${payload.weightInKilograms} kg`,
    currentSeason: payload.featuredStats?.season ?? null,
    currentRegularSeason: mapPlayerStats(
      payload.featuredStats?.regularSeason?.subSeason,
      isGoalie,
    ),
    currentPlayoffs: mapPlayerStats(payload.featuredStats?.playoffs?.subSeason, isGoalie),
    careerRegularSeason: mapPlayerStats(
      payload.featuredStats?.regularSeason?.career,
      isGoalie,
    ),
    careerPlayoffs: mapPlayerStats(payload.featuredStats?.playoffs?.career, isGoalie),
  };
}

export async function getPlayerPlayoffScoring(playerId: number): Promise<{
  currentTeamAbbreviation: string | null;
  goals: number;
  assists: number;
  overtimeGoals: number;
  points: number;
}> {
  const payload = await fetchNhlJson<NhlPlayerLandingResponse>(
    `${NHL_WEB_API_BASE_URL}/player/${playerId}/landing`,
    300,
  );
  const playoffStats = payload.featuredStats?.playoffs?.subSeason;
  const goals = getNumericStat(playoffStats, "goals");
  const assists = getNumericStat(playoffStats, "assists");
  const overtimeGoals = getNumericStat(playoffStats, "otGoals");

  return {
    currentTeamAbbreviation: payload.currentTeamAbbrev ?? null,
    goals,
    assists,
    overtimeGoals,
    points: goals + assists + overtimeGoals,
  };
}

async function fetchNhlJson<TResponse>(url: string, revalidate: number): Promise<TResponse> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
    next: {
      revalidate,
    },
  });

  if (!response.ok) {
    throw new Error(`NHL API request failed with status ${response.status}.`);
  }

  return (await response.json()) as TResponse;
}

function mapStandingToTeam(team: NhlStanding): Team {
  return {
    id: team.teamAbbrev.default.toLowerCase(),
    name: team.teamName.default,
    abbreviation: team.teamAbbrev.default,
    conference: parseConference(team.conferenceName),
    division: team.divisionName,
    logoUrl: team.teamLogo,
    points: team.points,
    wins: team.wins,
  };
}

function parseConference(value: string): Team["conference"] {
  return value === "Western" ? "Western" : "Eastern";
}

function mapPlayerSearchResult(player: NhlPlayerSearchResult): PlayerSearchItem {
  return {
    id: player.id,
    fullName: player.fullName,
    firstName: player.firstName,
    lastName: player.lastName,
    position: player.positionCode,
    sweaterNumber: player.sweaterNumber,
    teamId: player.currentTeamId,
  };
}

function mapPlayerStats(
  stats: Record<string, number | string> | undefined,
  isGoalie: boolean,
): PlayerStat[] {
  if (!stats) {
    return [];
  }

  const keys = isGoalie ? GOALIE_STAT_KEYS : SKATER_STAT_KEYS;

  return keys.flatMap((key) => {
    const value = stats[key];

    if (value === undefined || value === null) {
      return [];
    }

    return [
      {
        label: PLAYER_STAT_LABELS[key] ?? key,
        value: formatStatValue(key, value),
      },
    ];
  });
}

function formatStatValue(key: string, value: number | string): string {
  if (typeof value === "string") {
    return value;
  }

  if (key === "savePctg") {
    return value.toFixed(3);
  }

  if (key === "shootingPctg" || key === "faceoffWinningPctg") {
    return `${(value * 100).toFixed(1)}%`;
  }

  if (key === "goalsAgainstAvg") {
    return value.toFixed(2);
  }

  if (key === "plusMinus") {
    return value > 0 ? `+${value}` : `${value}`;
  }

  return `${value}`;
}

function formatBirthPlace(player: NhlPlayerLandingResponse): string {
  const parts = [
    player.birthCity?.default,
    player.birthStateProvince?.default,
    player.birthCountry,
  ].filter(Boolean);

  return parts.join(", ");
}

function getNumericStat(
  stats: Record<string, number | string> | undefined,
  key: string,
): number {
  const value = stats?.[key];

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}
