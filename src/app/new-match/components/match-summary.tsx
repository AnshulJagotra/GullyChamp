'use client';

import { Player, PlayerMatchStats, MatchResults } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatOvers, calculateStrikeRate, calculateEconomy } from "@/lib/utils";

interface MatchSummaryProps {
    players: Player[];
    playerStats: Record<string, PlayerMatchStats>;
    results: MatchResults;
    oversPerPlayer: number;
    onDone: () => void;
}

export function MatchSummary({ players, playerStats, results, onDone, oversPerPlayer }: MatchSummaryProps) {
    const sortedPlayers = [...players].sort((a,b) => {
        const statsA = playerStats[a.id];
        const statsB = playerStats[b.id];
        return (statsB.batting.runs - statsA.batting.runs);
    })

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-3xl text-center">Match Summary</CardTitle>
        <CardDescription className="text-center">The results are in!</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        
        {/* Awards Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">🏆 Best Batsman</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-xl md:text-2xl font-bold">{results.bestBatsman}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">🎯 Best Bowler</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-xl md:text-2xl font-bold">{results.bestBowler}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">🌟 Player of the Match</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-xl md:text-2xl font-bold">{results.playerOfTheMatch}</p>
                </CardContent>
            </Card>
        </div>

        {/* Scorecard Table */}
        <div>
            <h3 className="font-bold text-xl mb-4 text-center">Full Scorecard</h3>
            <div className="border rounded-lg overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="min-w-[120px]">Player</TableHead>
                            <TableHead className="text-right">Batting</TableHead>
                            <TableHead className="text-right">Bowling</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedPlayers.map(player => {
                            const stats = playerStats[player.id];
                            const batting = stats.batting;
                            const bowling = stats.bowling;
                            const outByPlayer = players.find(p => p.id === batting.outBy)?.name;
                            const isNotOut = !batting.isOut && batting.balls >= oversPerPlayer * 6;

                            return (
                                <TableRow key={player.id}>
                                    <TableCell className="font-medium">
                                        <p>{player.name}</p>
                                        {batting.isOut && <p className="text-xs text-muted-foreground">out by {outByPlayer || 'N/A'}</p>}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <p>{batting.runs}{isNotOut ? '*' : ''} ({batting.balls})</p>
                                        <p className="text-xs text-muted-foreground">SR: {calculateStrikeRate(batting.runs, batting.balls)}</p>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <p>{bowling.wickets}/{bowling.runsGiven} ({formatOvers(bowling.overs)})</p>
                                        <p className="text-xs text-muted-foreground">Econ: {calculateEconomy(bowling.runsGiven, bowling.overs)}</p>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>

      </CardContent>
      <CardFooter>
        <Button className="w-full" size="lg" onClick={onDone}>View History</Button>
      </CardFooter>
    </Card>
  );
}
