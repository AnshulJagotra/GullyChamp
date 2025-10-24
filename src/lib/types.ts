export interface Player {
  id: string;
  name: string;
}

export interface PlayerBattingStats {
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  isOut: boolean;
  outBy?: string; // Bowler's player ID
}

export interface PlayerBowlingStats {
  overs: number; // Stored as balls bowled
  runsGiven: number;
  wickets: number;
  wides: number;
  noBalls: number;
}

export interface PlayerMatchStats {
  playerId: string;
  batting: PlayerBattingStats;
  bowling: PlayerBowlingStats;
}

export interface MatchResults {
  bestBatsman: string;
  bestBowler: string;
  playerOfTheMatch: string;
}


export interface Match {
  id: string;
  date: string;
  oversPerPlayer: number;
  players: Player[];
  playerStats: Record<string, PlayerMatchStats>;
  results: MatchResults;
}


export interface BattingMatch {
  date: string;
  runs: number;
  balls: number;
  isOut: boolean;
}

export interface BowlingMatch {
  date: string;
  wickets: number;
  runsGiven: number;
  overs: number;
}
