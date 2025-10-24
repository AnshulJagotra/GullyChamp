'use client';

import { useState, useEffect } from 'react';
import { Icons } from './icons';

const WelcomeScreen = () => (
  <div className="fixed inset-0 z-[100] flex h-screen w-screen flex-col items-center justify-center bg-background text-center transition-opacity duration-500">
     <div className="absolute inset-0 -z-10 h-full w-full bg-background animated-gradient" />
     <div className='flex items-center gap-4 animate-pulse'>
        <Icons.cricket className="h-16 w-16 text-primary" />
        <h1 className="text-4xl md:text-6xl font-bold font-headline text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400 drop-shadow-md">
            Welcome to Gully Premier
        </h1>
     </div>
  </div>
);


export function WelcomeProvider({ children }: { children: React.ReactNode }) {
  const [showWelcome, setShowWelcome] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const splashShown = sessionStorage.getItem('splashShown');
    if (splashShown) {
        setShowWelcome(false);
        return;
    }

    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, 2500); // Start fading at 2.5 seconds

    const hideTimer = setTimeout(() => {
      setShowWelcome(false);
      sessionStorage.setItem('splashShown', 'true');
    }, 3000); // Hide completely at 3 seconds

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (showWelcome) {
     return (
      <div className={`transition-opacity duration-500 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
        <WelcomeScreen />
      </div>
    );
  }

  return <>{children}</>;
}
