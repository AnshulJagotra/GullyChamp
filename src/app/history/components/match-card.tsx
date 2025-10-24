'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { type Match } from '@/lib/types';
import { formatOvers } from '@/lib/utils';
import { Icons } from '@/components/common/icons';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface MatchCardProps {
  match: Match;
  onDelete: (id: string) => void;
}


const MatchDetails = ({ match }: { match: Match }) => {
  return (
    <div className='space-y-4'>
        <div>
            <h3 className='font-bold mb-2'>Results</h3>
            <p><strong>Best Batsman:</strong> {match.results.bestBatsman}</p>
            <p><strong>Best Bowler:</strong> {match.results.bestBowler}</p>
            <p><strong>Player of the Match:</strong> {match.results.playerOfTheMatch}</p>
        </div>
        <div>
            <h3 className='font-bold mb-2'>Scorecard</h3>
            {match.players.map(player => {
                const stats = match.playerStats[player.id];
                if (!stats) return null;
                return (
                    <div key={player.id} className="p-2 border-b">
                        <p className='font-semibold'>{player.name}</p>
                        <p className='text-sm text-muted-foreground'>
                            Batting: {stats.batting.runs} ({stats.batting.balls})
                        </p>
                         <p className='text-sm text-muted-foreground'>
                            Bowling: {stats.bowling.wickets}/{stats.bowling.runsGiven} ({formatOvers(stats.bowling.overs)})
                        </p>
                    </div>
                )
            })}
        </div>
    </div>
  )
};

export function MatchCard({ match, onDelete }: MatchCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <div>
            <p className="text-lg font-semibold">Match - {format(new Date(match.date), "PPP")}</p>
            <p className="text-sm font-normal text-muted-foreground mt-1">
              {match.players.length} players
            </p>
          </div>
          <div className='text-right'>
            <p className='text-sm font-semibold'>🏆 {match.results.playerOfTheMatch}</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardFooter className="flex justify-end gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost">View Details</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Match Summary</DialogTitle>
            </DialogHeader>
            <MatchDetails match={match} />
          </DialogContent>
        </Dialog>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="icon">
              <Icons.delete className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this match record. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(match.id)}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
