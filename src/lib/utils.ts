import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Player, PlayerMatchStats, MatchResults } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatOvers(balls: number): string {
  if (balls < 0) return "0.0";
  const overs = Math.floor(balls / 6);
  const remainingBalls = balls % 6;
  return `${overs}.${remainingBalls}`;
}

export function calculateStrikeRate(runs: number, balls: number): string {
  if (balls === 0) return "0.00";
  return ((runs / balls) * 100).toFixed(2);
}

export function calculateEconomy(runs: number, balls: number): string {
  if (balls === 0) return "0.00";
  const overs = balls / 6;
  return (runs / overs).toFixed(2);
}

export function calculateResults(playerStats: Record<string, PlayerMatchStats>, players: Player[]): MatchResults {
  let bestBatsman = { id: '', name: 'N/A', runs: -1 };
  let bestBowler = { id: '', name: 'N/A', wickets: -1, economy: Infinity };
  const playerScores: Record<string, number> = {};

  for (const player of players) {
    const stats = playerStats[player.id];
    if (!stats) continue;

    const battingScore = stats.batting.runs * 1;
    const bowlingScore = stats.bowling.wickets * 20 - (stats.bowling.runsGiven * 0.5);
    playerScores[player.id] = (battingScore) + (bowlingScore);

    // Best Batsman
    if (stats.batting.runs > bestBatsman.runs) {
      bestBatsman = { id: player.id, name: player.name, runs: stats.batting.runs };
    }

    // Best Bowler
    const economy = parseFloat(calculateEconomy(stats.bowling.runsGiven, stats.bowling.overs));
    if (stats.bowling.wickets > bestBowler.wickets) {
      bestBowler = { id: player.id, name: player.name, wickets: stats.bowling.wickets, economy };
    } else if (stats.bowling.wickets === bestBowler.wickets && stats.bowling.wickets > 0) {
      if (economy < bestBowler.economy) {
        bestBowler = { id: player.id, name: player.name, wickets: stats.bowling.wickets, economy };
      }
    }
  }
  
  let potm = { id: '', name: 'N/A', score: -Infinity };
  for (const playerId in playerScores) {
    if (playerScores[playerId] > potm.score) {
      potm = { id: playerId, name: players.find(p => p.id === playerId)?.name || 'N/A', score: playerScores[playerId] };
    }
  }

  return {
    bestBatsman: bestBatsman.name,
    bestBowler: bestBowler.name,
    playerOfTheMatch: potm.name,
  };
}
