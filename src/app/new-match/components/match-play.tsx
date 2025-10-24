'use client';

import { useState, useReducer, useEffect, useMemo } from 'react';
import { Player, PlayerMatchStats } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { calculateStrikeRate, formatOvers } from '@/lib/utils';
import { Undo2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface MatchPlayProps {
    players: Player[];
    oversPerPlayer: number;
    onMatchComplete: (finalStats: Record<string, PlayerMatchStats>) => void;
}

type State = {
  stats: Record<string, PlayerMatchStats>;
  history: {
    batsmanId: string;
    bowlerId: string;
    action: 'score' | 'wicket' | 'extra';
    details: any;
    wasLegalBall: boolean;
  }[];
};

type Action = 
    | { type: 'SCORE', payload: { runs: number, batsmanId: string, bowlerId: string } }
    | { type: 'WICKET', payload: { batsmanId: string, bowlerId: string } }
    | { type: 'EXTRA', payload: { type: 'Wd' | 'Nb', batsmanId: string, bowlerId: string } }
    | { type: 'UNDO' }
    | { type: 'RESET_BATTING', payload: { batsmanId: string } }
    | { type: 'RESET_BOWLING', payload: { bowlerId: string } };

function getInitialState(players: Player[]): State {
    const stats: Record<string, PlayerMatchStats> = {};
    players.forEach(p => {
        stats[p.id] = {
            playerId: p.id,
            batting: { runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false },
            bowling: { overs: 0, runsGiven: 0, wickets: 0, wides: 0, noBalls: 0 },
        };
    });
    return { stats, history: [] };
}


function matchReducer(state: State, action: Action): State {
    switch (action.type) {
        case 'SCORE': {
            const { runs, batsmanId, bowlerId } = action.payload;
            const newState = JSON.parse(JSON.stringify(state)); 

            const batsmanStats = newState.stats[batsmanId].batting;
            batsmanStats.runs += runs;
            batsmanStats.balls += 1;
            if (runs === 4) batsmanStats.fours += 1;
            if (runs === 6) batsmanStats.sixes += 1;

            const bowlerStats = newState.stats[bowlerId].bowling;
            bowlerStats.overs += 1;
            bowlerStats.runsGiven += runs;
            
            newState.history.push({ batsmanId, bowlerId, action: 'score', details: { runs }, wasLegalBall: true });
            return newState;
        }
        case 'WICKET': {
            const { batsmanId, bowlerId } = action.payload;
            const newState = JSON.parse(JSON.stringify(state));

            newState.stats[batsmanId].batting.isOut = true;
            newState.stats[batsmanId].batting.outBy = bowlerId;
            newState.stats[batsmanId].batting.balls += 1;

            newState.stats[bowlerId].bowling.wickets += 1;
            newState.stats[bowlerId].bowling.overs += 1;
            
            newState.history.push({ batsmanId, bowlerId, action: 'wicket', details: {}, wasLegalBall: true });
            return newState;
        }
        case 'EXTRA': {
             const { type, bowlerId, batsmanId } = action.payload;
             const newState = JSON.parse(JSON.stringify(state));
             
             const bowlerStats = newState.stats[bowlerId].bowling;
             bowlerStats.runsGiven += 1;
             
             const batsmanStats = newState.stats[batsmanId].batting;
             batsmanStats.runs += 1;

             if (type === 'Wd') bowlerStats.wides += 1;
             if (type === 'Nb') bowlerStats.noBalls += 1;

             newState.history.push({ batsmanId, bowlerId, action: 'extra', details: {type}, wasLegalBall: false });
             return newState;
        }
        case 'UNDO': {
             if (state.history.length === 0) return state;
             const newState = JSON.parse(JSON.stringify(state)); 
             const lastAction = newState.history.pop();
             if (!lastAction) return state;

             const { batsmanId, bowlerId, action, details } = lastAction;

             if (action === 'score') {
                const batsmanStats = newState.stats[batsmanId].batting;
                batsmanStats.runs -= details.runs;
                batsmanStats.balls -= 1;
                if (details.runs === 4) batsmanStats.fours -= 1;
                if (details.runs === 6) batsmanStats.sixes -= 1;

                const bowlerStats = newState.stats[bowlerId].bowling;
                bowlerStats.overs -= 1;
                bowlerStats.runsGiven -= details.runs;
             } else if (action === 'wicket') {
                newState.stats[batsmanId].batting.isOut = false;
                delete newState.stats[batsmanId].batting.outBy;
                newState.stats[batsmanId].batting.balls -= 1;

                newState.stats[bowlerId].bowling.wickets -= 1;
                newState.stats[bowlerId].bowling.overs -= 1;
             } else if (action === 'extra') {
                 const bowlerStats = newState.stats[bowlerId].bowling;
                 bowlerStats.runsGiven -= 1;
                 
                 const batsmanStats = newState.stats[batsmanId].batting;
                 batsmanStats.runs -=1;
                 
                 if (details.type === 'Wd') bowlerStats.wides -= 1;
                 if (details.type === 'Nb') bowlerStats.noBalls -= 1;
             }

             return newState;
        }
        case 'RESET_BATTING':
            return state;
        case 'RESET_BOWLING':
            return state;
        default:
            return state;
    }
}


export function MatchPlay({ players, oversPerPlayer, onMatchComplete }: MatchPlayProps) {
  const [state, dispatch] = useReducer(matchReducer, getInitialState(players));
  const { toast } = useToast();

  const [currentBatsmanIndex, setCurrentBatsmanIndex] = useState(0);
  const [currentBowlerId, setCurrentBowlerId] = useState<string | null>(null);
  
  const [ballsThisOver, setBallsThisOver] = useState(0);

  const currentBatsman = players[currentBatsmanIndex];
  const batsmanStats = state.stats[currentBatsman.id]?.batting;

  const isBowlerOverFinished = ballsThisOver > 0 && ballsThisOver % 6 === 0;

  const isOversFinished = batsmanStats.balls >= oversPerPlayer * 6;
  const isLastBatsman = currentBatsmanIndex >= players.length - 1;
  const isMatchFinished = isLastBatsman && (batsmanStats.isOut || isOversFinished);

  useEffect(() => {
    if (isBowlerOverFinished) {
      toast({ title: "Over Complete!", description: `Time to select a new bowler.` });
      setCurrentBowlerId(null);
      setBallsThisOver(0);
    }
  }, [isBowlerOverFinished, toast]);
  
  useEffect(() => {
    if (isMatchFinished) {
      const timer = setTimeout(() => onMatchComplete(state.stats), 500);
      return () => clearTimeout(timer);
    }
  }, [isMatchFinished, onMatchComplete, state.stats]);


  const potentialBowlers = useMemo(() => {
    return players.filter(p => p.id !== currentBatsman.id);
  }, [players, currentBatsman.id]);

  
  const previousInnings = useMemo(() => {
    return players.slice(0, currentBatsmanIndex);
  }, [players, currentBatsmanIndex]);

  useEffect(() => {
    const handleNextBatsman = () => {
      if (!isMatchFinished) {
          toast({ title: "Innings Over!", description: `${currentBatsman.name}'s innings has concluded.` });
          setCurrentBatsmanIndex(currentBatsmanIndex + 1);
          setCurrentBowlerId(null);
          setBallsThisOver(0);
      }
    };
    
    if (batsmanStats?.isOut || isOversFinished) {
      if (!isLastBatsman) {
        setBallsThisOver(0);
        setCurrentBowlerId(null);
        const timer = setTimeout(handleNextBatsman, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [batsmanStats?.isOut, isOversFinished, currentBatsmanIndex, players.length, toast, isLastBatsman, isMatchFinished, currentBatsman.name]);


  if (isMatchFinished) {
    return (
        <Card className="w-full shadow-lg">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Match Finished</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-center text-lg">Calculating results...</p>
                 <Progress value={100} className='w-full mt-4'/>
            </CardContent>
        </Card>
    );
  }
  
  const handleScore = (runs: number) => {
      if (!currentBowlerId) {
          toast({ variant: 'destructive', title: 'Select a bowler first!' });
          return;
      }
      dispatch({ type: 'SCORE', payload: { runs, batsmanId: currentBatsman.id, bowlerId: currentBowlerId } });
      setBallsThisOver(ballsThisOver + 1);
  }

  const handleWicket = () => {
      if (!currentBowlerId) {
          toast({ variant: 'destructive', title: 'Select a bowler first!' });
          return;
      }
      dispatch({ type: 'WICKET', payload: { batsmanId: currentBatsman.id, bowlerId: currentBowlerId } });
      setBallsThisOver(ballsThisOver + 1);
  }
  
  const handleExtra = (type: 'Wd' | 'Nb') => {
       if (!currentBowlerId) {
          toast({ variant: 'destructive', title: 'Select a bowler first!' });
          return;
      }
      dispatch({ type: 'EXTRA', payload: { type, batsmanId: currentBatsman.id, bowlerId: currentBowlerId } });
  }

  const handleUndo = () => {
    const lastAction = state.history[state.history.length - 1];
    if (lastAction && lastAction.wasLegalBall) {
        setBallsThisOver(prev => Math.max(0, prev - 1));
    }
    dispatch({ type: 'UNDO' });
  }

  const scoreButtons = [0, 1, 2, 3, 4, 6];
  const isNotOutAndInningsOver = isOversFinished && !batsmanStats?.isOut;

  return (
    <div className="space-y-6">
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Match in Progress</CardTitle>
          <div className='flex justify-between items-center pt-2'>
              <CardDescription>
                  Player {currentBatsmanIndex + 1} of {players.length}
              </CardDescription>
              <Progress value={((currentBatsmanIndex + 1) / players.length) * 100} className='w-1/2'/>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center bg-primary text-primary-foreground rounded-lg p-4 md:p-6 shadow-inner">
            <p className="text-sm">Now Batting</p>
            <p className="text-2xl md:text-3xl font-bold">{currentBatsman.name}</p>
            <p className="text-4xl md:text-5xl font-bold mt-2">
              {batsmanStats?.runs ?? 0}
              {(isNotOutAndInningsOver) ? '*' : ''}
              <span className="text-xl md:text-2xl font-normal"> ({batsmanStats?.balls ?? 0})</span>
            </p>
            <p className="text-base md:text-lg">SR: {calculateStrikeRate(batsmanStats?.runs ?? 0, batsmanStats?.balls ?? 0)}</p>
          </div>

          <div className="space-y-2">
              <label className='text-sm font-medium'>Current Bowler</label>
              <Select onValueChange={(id) => { setCurrentBowlerId(id); setBallsThisOver(0); }} value={currentBowlerId || ''} disabled={!!currentBowlerId && !isBowlerOverFinished} >
                  <SelectTrigger>
                      <SelectValue placeholder="Select a bowler" />
                  </SelectTrigger>
                  <SelectContent>
                      {potentialBowlers.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name} - Total: {formatOvers(state.stats[p.id]?.bowling.overs ?? 0)}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
              {currentBowlerId && (
                  <div className="mt-2 bg-accent/20 border border-accent/50 p-2 rounded-lg text-center">
                      <p className="text-sm font-medium text-accent">This Over</p>
                      <p className="text-lg font-bold text-accent">{formatOvers(ballsThisOver)}</p>
                  </div>
              )}
          </div>


          <div className="grid grid-cols-4 gap-2 md:gap-3">
              {scoreButtons.map((score) => (
                  <Button key={score} onClick={() => handleScore(score)} disabled={!currentBowlerId} variant="outline" className="h-14 md:h-16 text-lg">
                  +{score}
                  </Button>
              ))}
              <Button onClick={() => handleExtra('Wd')} disabled={!currentBowlerId} variant="secondary" className="h-14 md:h-16 text-md">Wide</Button>
              <Button onClick={() => handleExtra('Nb')} disabled={!currentBowlerId} variant="secondary" className="h-14 md:h-16 text-md">No Ball</Button>
              <Button onClick={handleWicket} disabled={!currentBowlerId} variant="destructive" className="h-14 md:h-16 text-lg col-span-2">
                  Wicket
              </Button>
              <Button onClick={handleUndo} disabled={state.history.length === 0} variant="secondary" className="h-14 md:h-16 text-lg col-span-2 gap-2">
                  <Undo2 size={20}/> Undo
              </Button>
          </div>

        </CardContent>
        <CardFooter>
              <Button variant="destructive" className="w-full" onClick={() => onMatchComplete(state.stats)}>End Match Manually</Button>
        </CardFooter>
      </Card>

      {previousInnings.length > 0 && (
        <Card className="w-full shadow-lg">
            <CardHeader>
                <CardTitle className="font-headline text-xl">Previous Innings</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Player</TableHead>
                            <TableHead className="text-right">Score</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {previousInnings.map(player => {
                            const stats = state.stats[player.id];
                            const isNotOut = !stats.batting.isOut && stats.batting.balls >= oversPerPlayer * 6;
                            return (
                                <TableRow key={player.id}>
                                    <TableCell className="font-medium">{player.name}</TableCell>
                                    <TableCell className="text-right">{stats.batting.runs}{isNotOut ? '*' : ''} ({stats.batting.balls})</TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
