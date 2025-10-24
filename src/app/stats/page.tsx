'use client';
import { useMemo } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { type Match, type Player, type BattingMatch, type BowlingMatch } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Icons } from '@/components/common/icons';
import Link from 'next/link';
import { StatCard } from './components/stat-card';
import { calculateEconomy, calculateStrikeRate } from '@/lib/utils';
import { PerformanceChart } from './components/performance-chart';

export default function StatsPage() {
  const [matches, setMatches] = useLocalStorage<Match[]>('gully-premier-matches', []);
  const [selectedPlayerId, setSelectedPlayerId] = useLocalStorage<string | null>('gully-premier-selected-player', null);

  const allPlayers = useMemo(() => {
    const playersMap = new Map<string, Player>();
    matches.forEach(match => {
      match.players.forEach(player => {
        if (!playersMap.has(player.id)) {
          playersMap.set(player.id, player);
        }
      });
    });
    return Array.from(playersMap.values());
  }, [matches]);

  const selectedPlayer = useMemo(() => {
    if (!selectedPlayerId) {
      return allPlayers.length > 0 ? allPlayers[0] : null;
    }
    return allPlayers.find(p => p.id === selectedPlayerId) || (allPlayers.length > 0 ? allPlayers[0] : null);
  }, [selectedPlayerId, allPlayers]);


  const stats = useMemo(() => {
    if (!selectedPlayer) return null;

    let totalMatches = 0;
    let totalRuns = 0;
    let totalBallsFaced = 0;
    let notOuts = 0;
    let highestScore = 0;
    let totalWickets = 0;
    let totalRunsGiven = 0;
    let totalBallsBowled = 0;
    let bestWickets = 0;
    let bestRunsGiven = Infinity;

    const battingData: BattingMatch[] = [];
    const bowlingData: BowlingMatch[] = [];

    matches.forEach(match => {
      if(match.playerStats[selectedPlayer.id]) {
        totalMatches++;
        const playerStats = match.playerStats[selectedPlayer.id];
        
        // Batting
        totalRuns += playerStats.batting.runs;
        totalBallsFaced += playerStats.batting.balls;
        if(playerStats.batting.runs > highestScore) highestScore = playerStats.batting.runs;
        if(!playerStats.batting.isOut && playerStats.batting.balls >= match.oversPerPlayer * 6) notOuts++;

        if(playerStats.batting.balls > 0) {
            battingData.push({
                date: match.date,
                runs: playerStats.batting.runs,
                balls: playerStats.batting.balls,
                isOut: playerStats.batting.isOut
            });
        }
        
        // Bowling
        totalWickets += playerStats.bowling.wickets;
        totalRunsGiven += playerStats.bowling.runsGiven;
        totalBallsBowled += playerStats.bowling.overs;

        if (playerStats.bowling.wickets > bestWickets) {
            bestWickets = playerStats.bowling.wickets;
            bestRunsGiven = playerStats.bowling.runsGiven;
        } else if (playerStats.bowling.wickets === bestWickets && playerStats.bowling.runsGiven < bestRunsGiven) {
            bestRunsGiven = playerStats.bowling.runsGiven;
        }

        if(playerStats.bowling.overs > 0){
             bowlingData.push({
                date: match.date,
                wickets: playerStats.bowling.wickets,
                runsGiven: playerStats.bowling.runsGiven,
                overs: playerStats.bowling.overs
            });
        }
      }
    });
    
    const battingAverage = (totalRuns / (totalMatches - notOuts)).toFixed(2);

    return {
       totalMatches,
       totalRuns,
       battingAverage: isNaN(parseFloat(battingAverage)) ? '0.00' : battingAverage,
       strikeRate: calculateStrikeRate(totalRuns, totalBallsFaced),
       highestScore,
       totalWickets,
       bowlingEconomy: calculateEconomy(totalRunsGiven, totalBallsBowled),
       bestBowling: `${bestWickets}/${bestRunsGiven === Infinity ? 0 : bestRunsGiven}`,
       battingData,
       bowlingData
    };
  }, [matches, selectedPlayer]);

  const handleReset = () => {
    setMatches([]);
    setSelectedPlayerId(null);
  }

  if (matches.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h2 className="text-xl font-semibold">No Stats to Show</h2>
          <p className="text-muted-foreground mt-2">Play some matches to see your stats here.</p>
          <Button asChild className="mt-4">
            <Link href="/new-match">Start a Match</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Player Stats</h1>
        <p className="text-muted-foreground">Your overall gully cricket career performance.</p>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Select Player</CardTitle>
          <CardDescription>Choose a player to view their career stats.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
            {allPlayers.map(player => (
                <Button 
                    key={player.id} 
                    variant={selectedPlayer?.id === player.id ? 'default' : 'outline'}
                    onClick={() => setSelectedPlayerId(player.id)}
                >
                    {player.name}
                </Button>
            ))}
        </CardContent>
      </Card>
      
      {selectedPlayer && stats && (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-4'>
                        <span className='text-2xl font-bold'>{selectedPlayer.name}'s Career</span> 
                        <span className='text-sm font-medium text-muted-foreground'>({stats.totalMatches} Matches)</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard label="Total Runs" value={stats.totalRuns} />
                    <StatCard label="Highest Score" value={stats.highestScore} />
                    <StatCard label="Batting Avg." value={stats.battingAverage} />
                    <StatCard label="Strike Rate" value={stats.strikeRate} />
                    <StatCard label="Total Wickets" value={stats.totalWickets} />
                    <StatCard label="Best Bowling" value={stats.bestBowling} />
                    <StatCard label="Economy" value={stats.bowlingEconomy} />
                </CardContent>
            </Card>

            <PerformanceChart battingData={stats.battingData} bowlingData={stats.bowlingData} />

        </>
      )}

      
      <div className="pt-8 text-center">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="gap-2">
              <Icons.delete /> Reset All Data
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete all your match data. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleReset}>Yes, delete everything</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
