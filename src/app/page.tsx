import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/common/icons";
import { ArrowRight } from "lucide-react";

const features = [
  {
    title: "Start New Match",
    description: "Set up a new match with your friends and start scoring.",
    href: "/new-match",
    icon: <Icons.newMatch className="h-10 w-10" />,
  },
  {
    title: "Match History",
    description: "Review your past glories and defeats.",
    href: "/history",
    icon: <Icons.history className="h-10 w-10" />,
  },
  {
    title: "Player Stats",
    description: "Check career stats and track your performance.",
    href: "/stats",
    icon: <Icons.stats className="h-10 w-10" />,
  },
];

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-16 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
      <section className="text-center">
        <h1 className="text-5xl md:text-8xl font-bold font-headline text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400 drop-shadow-md">
          Gully Premier
        </h1>
        <p className="mt-4 text-lg md:text-xl text-muted-foreground font-body">
          Team nahi, talent bolta hai!
        </p>
      </section>

      <section className="mt-16 w-full max-w-5xl grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card
            key={feature.title}
            className="group flex flex-col overflow-hidden transition-all duration-300 ease-in-out hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2 border-border/80 bg-card/80 backdrop-blur-sm"
          >
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 p-6">
              <div className="rounded-lg border border-primary/20 bg-primary/10 p-3 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                {feature.icon}
              </div>
              <CardTitle className="font-headline text-2xl text-card-foreground">
                {feature.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow p-6 pt-0">
              <p className="text-muted-foreground">{feature.description}</p>
            </CardContent>
            <div className="p-6 pt-0">
              <Button asChild className="w-full group/btn">
                <Link href={feature.href}>
                  Go to {feature.title} 
                  <ArrowRight className="transition-transform duration-300 group-hover/btn:translate-x-1" />
                </Link>
              </Button>
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
}
