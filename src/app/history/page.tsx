'use client';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { type Match } from '@/lib/types';
import { MatchCard } from './components/match-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { useRef } from 'react';

export default function HistoryPage() {
  const [matches, setMatches] = useLocalStorage<Match[]>('gully-premier-matches', []);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDelete = (matchId: string) => {
    setMatches(matches.filter(m => m.id !== matchId));
    toast({
        title: 'Match Deleted',
        description: 'The match has been removed from your history.',
    });
  };

  const exportData = () => {
    if (matches.length === 0) {
        toast({
            variant: 'destructive',
            title: 'No Data',
            description: 'No match data found to export!',
        });
        return;
    }

    const filename = `gully-premier-backup-${new Date().toISOString().split("T")[0]}.json`;
    const blob = new Blob([JSON.stringify(matches, null, 2)], {
        type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
    toast({
        title: 'Export Successful',
        description: `Backup file '${filename}' downloaded.`,
    });
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
          try {
              const result = e.target?.result;
              if (typeof result !== 'string') {
                  throw new Error("File could not be read");
              }
              const importedMatches = JSON.parse(result);
              
              // Basic validation
              if (!Array.isArray(importedMatches)) {
                  throw new Error("Invalid file format.");
              }

              setMatches(importedMatches);
              toast({
                  title: 'Import Successful',
                  description: 'Your match history has been restored.',
              });
              
              // Reset file input
              if(fileInputRef.current) {
                fileInputRef.current.value = '';
              }

          } catch (error) {
              toast({
                  variant: 'destructive',
                  title: 'Import Failed',
                  description: 'The selected file is not a valid backup file.',
              });
          }
      };
      reader.readAsText(file);
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className='flex flex-wrap justify-between items-center gap-4 mb-6'>
        <h1 className="text-3xl font-bold font-headline">Match History</h1>
        <div className='flex items-center gap-2'>
            <Button onClick={exportData} variant="outline">
                Export Backup
            </Button>
            <Label className="cursor-pointer">
                <div className='inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2'>
                    Import Backup
                </div>
                <input type="file" accept=".json" onChange={importData} ref={fileInputRef} className="hidden" />
            </Label>
        </div>
      </div>
      
      {matches.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h2 className="text-xl font-semibold">No Matches Found</h2>
          <p className="text-muted-foreground mt-2">You haven't saved any matches yet.</p>
          <Button asChild className="mt-4">
            <Link href="/new-match">Start Your First Match</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map(match => (
            <MatchCard key={match.id} match={match} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
