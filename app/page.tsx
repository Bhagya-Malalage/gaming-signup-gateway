"use client";

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";
import { SignUp, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

// 1. Define the Game structure to fix red squiggles on game.name/image
interface Game {
  _id: string;
  name: string;
  link: string;
  image?: string;
}

export default function LandingPage() {
  const { isLoaded, isSignedIn } = useUser();
  const games = useQuery(api.games.get);

  const [selectedGame, setSelectedGame] = useState<null | {
    name: string;
    link: string;
  }>(null);

  // 2. Logic to split games for the side columns
  const leftGames = games ? games.slice(0, Math.ceil(games.length / 2)) : [];
  const rightGames = games ? games.slice(Math.ceil(games.length / 2)) : [];

  const handleGameClick = (game: Game) => {
    setSelectedGame({ name: game.name, link: game.link });
  };

  // 3. Prevent hydration errors while Clerk loads
  if (!isLoaded) return null;

  return (
    <main className="min-h-screen w-full bg-black text-white relative overflow-x-hidden">
      {/* BACKGROUND DECORATION */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-600 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-600 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 p-4 md:p-8 max-w-[1600px] mx-auto">
        {/* HEADER SECTION */}
        <div className="text-center mb-10 space-y-2">
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 drop-shadow-2xl uppercase tracking-tighter italic">
            CLAIM ₹5000 BONUS
          </h1>
          <p className="text-xl text-gray-400 font-medium">
            Join thousands of winners. Sign up to unlock all games!
          </p>
        </div>

        {/* MAIN INTERACTIVE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* LEFT SIDE: GAME CARDS */}
          <div className="hidden lg:grid grid-cols-1 gap-6">
            {leftGames.map((game) => (
              <GameCard
                key={game._id}
                game={game}
                onClick={() => handleGameClick(game)}
              />
            ))}
          </div>

          {/* CENTER: SIGN UP FORM */}
          <div className="lg:col-span-2 flex flex-col items-center sticky top-8">
            <div className="w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 p-2 rounded-3xl shadow-[0_0_60px_rgba(255,165,0,0.15)] transition-all hover:shadow-[0_0_80px_rgba(255,165,0,0.25)]">
              <SignUp
                routing="hash"
                forceRedirectUrl="/dashboard"
                signInUrl="/sign-in"
                appearance={{
                  elements: {
                    card: "bg-transparent shadow-none",
                    headerTitle: "hidden",
                    headerSubtitle: "hidden",
                    formButtonPrimary:
                      "bg-gradient-to-r from-orange-500 to-red-600 hover:scale-105 transition-transform border-none text-lg font-bold py-6",
                    formFieldInput:
                      "bg-white/10 border-white/20 text-white focus:border-orange-500",
                    footer: "hidden",
                  },
                }}
              />
            </div>

            {/* Mobile View Games (Visible only on small screens) */}
            <div className="lg:hidden mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              {games?.map((game) => (
                <GameCard
                  key={game._id}
                  game={game}
                  onClick={() => handleGameClick(game)}
                />
              ))}
            </div>
          </div>

          {/* RIGHT SIDE: GAME CARDS */}
          <div className="hidden lg:grid grid-cols-1 gap-6">
            {rightGames.map((game) => (
              <GameCard
                key={game._id}
                game={game}
                onClick={() => handleGameClick(game)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* GAME MODAL */}
      {selectedGame && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[100] p-4 backdrop-blur-md">
          <div className="bg-gray-900 rounded-3xl shadow-2xl border border-white/10 p-4 max-w-5xl w-full relative">
            <button
              className="absolute -top-4 -right-4 bg-red-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-2xl font-bold hover:bg-red-700 shadow-xl"
              onClick={() => setSelectedGame(null)}
            >
              ×
            </button>
            <div className="mb-4 flex justify-between items-center px-2">
              <h2 className="text-2xl font-bold text-orange-400">
                {selectedGame.name}
              </h2>
              {!isSignedIn && (
                <span className="text-sm bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full border border-orange-500/30">
                  Preview Mode
                </span>
              )}
            </div>
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/5 bg-black">
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

// 4. Properly typed GameCard component
function GameCard({ game, onClick }: { game: Game; onClick: () => void }) {
  return (
    <div
      className="group bg-gray-900/40 rounded-2xl p-3 border border-white/5 hover:border-orange-500/50 hover:bg-gray-800/60 transition-all cursor-pointer shadow-lg"
      onClick={onClick}
    >
      <div className="relative overflow-hidden rounded-xl aspect-[16/9]">
        <img
          src={game.image || "https://placehold.co/400x225"}
          alt={game.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
          <Button className="w-full bg-orange-600 hover:bg-orange-700 font-bold">
            PLAY NOW
          </Button>
        </div>
      </div>
      <h3 className="text-center mt-3 font-semibold text-gray-200 group-hover:text-orange-400 transition-colors">
        {game.name}
      </h3>
    </div>
  );
}
