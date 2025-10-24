'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Player } from '@/lib/types';
import { X } from 'lucide-react';

interface MatchSetupProps {
  onSetupComplete: (players: Player[], overs: number) => void;
}

export function MatchSetup({ onSetupComplete }: MatchSetupProps) {
  const [numPlayers, setNumPlayers] = useState(2);
  const [players, setPlayers] = useState<Player[]>(Array.from({ length: 2 }, (_, i) => ({ id: `p${i+1}`, name: '' })));
  const [oversPerPlayer, setOversPerPlayer] = useState(4);
  
  const handleNumPlayersChange = (value: string) => {
    const count = parseInt(value, 10);
    setNumPlayers(count);
    const newPlayers = Array.from({ length: count }, (_, i) => {
        return players[i] || { id: `p${i+1}`, name: '' };
    });
    setPlayers(newPlayers);
  };

  const handlePlayerNameChange = (index: number, name: string) => {
    const newPlayers = [...players];
    newPlayers[index].name = name;
    setPlayers(newPlayers);
  };

  const handleOversChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
        setOversPerPlayer(0); // Allow empty state, but treat as 0 or handle in validation
        return;
    }
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
        setOversPerPlayer(Math.max(1, numValue));
    }
  };

  const handleStartMatch = () => {
    const allNamesEntered = players.every(p => p.name.trim() !== '');
    if (!allNamesEntered) {
      alert('Please enter names for all players.');
      return;
    }
    if (oversPerPlayer < 1) {
        alert('Please enter a valid number of overs (at least 1).');
        return;
    }
    onSetupComplete(players, oversPerPlayer);
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">New Match Setup</CardTitle>
        <CardDescription>Configure your Gully Premier match.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="num-players">Number of Players</Label>
          <Select value={numPlayers.toString()} onValueChange={handleNumPlayersChange}>
            <SelectTrigger id="num-players">
              <SelectValue placeholder="Select number of players" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                  n > 1 && <SelectItem key={n} value={n.toString()}>{n} Players</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Player Names</Label>
          <div className="space-y-3">
            {players.map((player, index) => (
              <div key={player.id} className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder={`Player ${index + 1}`}
                  value={player.name}
                  onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
            <Label htmlFor="overs-per-player">Overs Per Player</Label>
            <Input 
                id="overs-per-player"
                type="number"
                value={oversPerPlayer === 0 ? '' : oversPerPlayer}
                onChange={handleOversChange}
                min="1"
            />
        </div>

      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleStartMatch}>Start Match</Button>
      </CardFooter>
    </Card>
  );
}
