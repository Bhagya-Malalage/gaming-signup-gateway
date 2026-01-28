"use client";

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";
import { SignUp, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface Game {
  _id: string;
  name: string;
  link: string;
  image?: string;
}

export default function LandingPage() {
  const { isLoaded, user, isSignedIn } = useUser();
  const router = useRouter();
  const games = useQuery(api.games.get);
  const currentUser = useQuery(api.users.getMe);

  const [selectedGame, setSelectedGame] = useState<null | {
    name: string;
    link: string;
  }>(null);

  // FAIL-SAFE Admin check
  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
  const isPlatformAdmin =
    userEmail === "nrnbmadmal@gmail.com" ||
    userEmail === "baani@baazidaily.com" ||
    currentUser?.role === "admin";

  // NEW LOGIC: Only take the first 12 games for the Landing Page
  // We reverse() them so the "Latest" ones appear first
  const displayGames = games ? [...games].reverse().slice(0, 12) : [];

  const leftGames = displayGames.slice(0, Math.ceil(displayGames.length / 2));
  const rightGames = displayGames.slice(Math.ceil(displayGames.length / 2));

  if (!isLoaded) return null;

  return (
    <main className="h-screen w-full bg-black text-white relative overflow-hidden flex flex-col font-sans">
      {/* GLOWING BACKGROUND */}
      <div className="absolute inset-0 z-0 opacity-15 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-orange-600 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-yellow-600 rounded-full blur-[120px]" />
      </div>

      {/* COMPACT HEADER */}
      <header className="relative z-30 flex justify-between items-center px-6 py-2 border-b border-white/5 bg-black/80 backdrop-blur-md">
        <div className="flex items-baseline gap-3">
          <h1 className="text-xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 uppercase italic tracking-tighter leading-none">
            CLAIM ₹5000 BONUS
          </h1>
          <span className="hidden md:inline text-[9px] text-orange-500 font-bold uppercase tracking-widest border-l border-gray-800 pl-3">
            LATEST HITS
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isPlatformAdmin && (
            <Button
              onClick={() => router.push("/admin-dashboard")}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-black uppercase italic text-[9px] h-7 px-3 rounded-md"
            >
              Admin
            </Button>
          )}
          {isSignedIn && (
            <Button
              onClick={() => router.push("/dashboard")}
              variant="outline"
              className="h-7 text-[9px] font-bold border-gray-700 hover:bg-gray-800 text-white"
            >
              Hub
            </Button>
          )}
        </div>
      </header>

      {/* MAIN GRID - Showing only 12 Games */}
      <div className="relative z-10 flex-1 w-full max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-6 gap-3 p-4 overflow-hidden">
        <div className="hidden lg:grid grid-cols-2 grid-rows-3 gap-3 col-span-2 content-start z-0">
          {leftGames.map((game) => (
            <GameCard
              key={game._id}
              game={game}
              onClick={() =>
                setSelectedGame({ name: game.name, link: game.link })
              }
            />
          ))}
        </div>

        <div className="col-span-1 lg:col-span-2 flex flex-col items-center justify-center z-20">
          <div className="w-full max-w-[380px] bg-white/5 backdrop-blur-3xl border border-white/10 p-1 rounded-2xl shadow-2xl scale-90 xl:scale-95 transition-transform">
            <SignUp
              routing="hash"
              forceRedirectUrl="/dashboard"
              signInUrl="/sign-in"
              appearance={{
                elements: {
                  card: "bg-transparent shadow-none w-full",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  formButtonPrimary:
                    "bg-gradient-to-r from-orange-500 to-red-600 hover:opacity-90 border-none font-black uppercase italic py-4",
                  formFieldInput:
                    "bg-white/5 border-white/10 text-white h-9 text-xs",
                  footer: "hidden",
                },
              }}
            />
          </div>
          <p className="text-[10px] text-orange-500 font-bold uppercase mt-3 tracking-widest animate-pulse">
            Join to unlock full library
          </p>
        </div>

        <div className="hidden lg:grid grid-cols-2 grid-rows-3 gap-3 col-span-2 content-start z-0">
          {rightGames.map((game) => (
            <GameCard
              key={game._id}
              game={game}
              onClick={() =>
                setSelectedGame({ name: game.name, link: game.link })
              }
            />
          ))}
        </div>
      </div>

      <footer className="relative z-30 py-1 px-6 bg-black border-t border-white/5 text-center">
        <p className="text-[8px] text-gray-700 font-bold uppercase tracking-[0.4em]">
          Official Gaming Hub © 2024
        </p>
      </footer>

      {/* GAME MODAL */}
      {selectedGame && (
        <div className="fixed inset-0 bg-black/98 flex items-center justify-center z-[100] p-4 backdrop-blur-xl">
          <div className="bg-gray-900 rounded-2xl shadow-2xl border border-white/10 p-3 max-w-5xl w-full relative">
            <button
              className="absolute -top-3 -right-3 bg-red-600 text-white w-8 h-8 rounded-full font-black shadow-xl hover:bg-red-700"
              onClick={() => setSelectedGame(null)}
            >
              ×
            </button>
            <h2 className="text-lg font-black text-orange-400 uppercase italic mb-3 tracking-tight px-2">
              {selectedGame.name}
            </h2>
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-white/10">
              <iframe
                src={selectedGame.link}
                title={selectedGame.name}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function GameCard({ game, onClick }: { game: Game; onClick: () => void }) {
  return (
    <div
      className="group bg-gray-900/60 rounded-xl p-2 border border-white/5 hover:border-orange-500/50 hover:bg-gray-800/80 transition-all cursor-pointer flex flex-col h-full"
      onClick={onClick}
    >
      <div className="relative overflow-hidden rounded-lg aspect-video bg-black flex-1">
        <img
          src={game.image || "https://placehold.co/400x225"}
          alt={game.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-[7px] font-black bg-orange-600 px-3 py-1 rounded-full uppercase italic">
            Play
          </span>
        </div>
      </div>
      <h3 className="text-center mt-2 font-black text-gray-400 group-hover:text-orange-400 transition-colors text-[8px] uppercase tracking-tighter truncate px-1">
        {game.name}
      </h3>
    </div>
  );
}
