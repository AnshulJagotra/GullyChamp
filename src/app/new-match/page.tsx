'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { type Match, type Player, type PlayerMatchStats, type MatchResults } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { MatchSetup } from './components/match-setup';
import { MatchPlay } from './components/match-play';
import { MatchSummary } from './components/match-summary';
import { calculateResults } from '@/lib/utils';


type MatchState = 'setup' | 'playing' | 'summary';

export default function NewMatchPage() {
  const [matches, setMatches] = useLocalStorage<Match[]>('gully-premier-matches', []);
  const router = useRouter();
  const { toast } = useToast();

  const [matchState, setMatchState] = useState<MatchState>('setup');
  const [players, setPlayers] = useState<Player[]>([]);
  const [oversPerPlayer, setOversPerPlayer] = useState(0);
  const [playerStats, setPlayerStats] = useState<Record<string, PlayerMatchStats>>({});
  const [results, setResults] = useState<MatchResults | null>(null);


  const handleMatchSetupComplete = (players: Player[], overs: number) => {
    setPlayers(players);
    setOversPerPlayer(overs);
    
    const initialStats: Record<string, PlayerMatchStats> = {};
    for (const player of players) {
      initialStats[player.id] = {
        playerId: player.id,
        batting: { runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false },
        bowling: { overs: 0, runsGiven: 0, wickets: 0, wides: 0, noBalls: 0 },
      };
    }
    setPlayerStats(initialStats);
    
    setMatchState('playing');
    toast({
      title: 'Match Setup Complete!',
      description: `Starting match with ${players.length} players.`,
    });
  };

  const handleMatchComplete = (finalStats: Record<string, PlayerMatchStats>) => {
    const finalResults = calculateResults(finalStats, players);
    
    setPlayerStats(finalStats);
    setResults(finalResults);

    const newMatch: Match = {
      id: new Date().toISOString(),
      date: new Date().toISOString(),
      oversPerPlayer: oversPerPlayer,
      players: players,
      playerStats: finalStats,
      results: finalResults,
    };
    
    setMatches(prevMatches => [newMatch, ...prevMatches]);
    
    setMatchState('summary');

    toast({
      title: "Match Finished & Saved!",
      description: "The results have been automatically saved to your history.",
    });
  };
  
  const handleViewHistory = () => {
    router.push('/history');
  };

  const renderContent = () => {
    switch (matchState) {
      case 'playing':
        return <MatchPlay players={players} oversPerPlayer={oversPerPlayer} onMatchComplete={handleMatchComplete} />;
      case 'summary':
        return <MatchSummary players={players} playerStats={playerStats} results={results!} onDone={handleViewHistory} oversPerPlayer={oversPerPlayer}/>;
      case 'setup':
      default:
        return <MatchSetup onSetupComplete={handleMatchSetupComplete} />;
    }
  };


  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
       {renderContent()}
    </div>
  );
}
