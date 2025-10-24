import type { Metadata } from "next";
import { PT_Sans, Russo_One } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Header } from "@/components/common/header";
import { Toaster } from "@/components/ui/toaster";
import { WelcomeProvider } from "@/components/common/welcome-provider";

const ptSans = PT_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-pt-sans",
});

const russoOne = Russo_One({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-russo-one",
});


export const metadata: Metadata = {
  title: "Gully Premier",
  description: "Team nahi, talent bolta hai!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&family=Russo+One&display=swap" rel="stylesheet" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-body antialiased",
          ptSans.variable,
          russoOne.variable
        )}
      >
        <WelcomeProvider>
          <div className="relative flex min-h-screen flex-col">
            <div className="absolute inset-0 -z-10 h-full w-full bg-background animated-gradient" />
            <Header />
            <main className="flex-1">{children}</main>
          </div>
          <Toaster />
        </WelcomeProvider>
      </body>
    </html>
  );
}
