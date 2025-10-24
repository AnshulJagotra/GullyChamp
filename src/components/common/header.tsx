import Link from 'next/link';
import { Icons } from './icons';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

const navLinks = [
  { href: '/new-match', label: 'New Match' },
  { href: '/history', label: 'History' },
  { href: '/stats', label: 'Stats' },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Icons.cricket className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold font-headline text-primary">
            Gully Premier
          </span>
        </Link>

        <nav className="hidden items-center space-x-8 text-sm font-medium md:flex">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="text-muted-foreground transition-colors hover:text-primary">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-background/90 backdrop-blur">
              <div className="flex flex-col space-y-4 p-4">
                <Link href="/" className="mb-4 flex items-center space-x-2">
                  <Icons.cricket className="h-6 w-6 text-primary" />
                  <span className="font-bold text-primary">Gully Premier</span>
                </Link>
                {navLinks.map(link => (
                  <Button key={link.href} variant="ghost" asChild className="justify-start text-lg">
                    <Link href={link.href}>{link.label}</Link>
                  </Button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
