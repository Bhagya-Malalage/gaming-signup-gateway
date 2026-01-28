"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { isLoaded, user } = useUser();
  const router = useRouter();

  // FETCH ALL GAMES (No slice)
  const games = useQuery(api.games.get);
  const currentUser = useQuery(api.users.getMe);
  const [selectedGame, setSelectedGame] = useState<null | {
    name: string;
    link: string;
  }>(null);

  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
  const isAdmin =
    userEmail === "nrnbmadmal@gmail.com" ||
    userEmail === "baani@baazidaily.com" ||
    currentUser?.role === "admin";

  if (!isLoaded || currentUser === undefined) {
    return (
      <div className="h-screen bg-black text-white flex items-center justify-center font-sans uppercase tracking-widest">
        <div className="animate-pulse text-yellow-500">
          Syncing Full Library...
        </div>
      </div>
    );
  }

  return (
    <main className="h-screen w-full bg-black text-white flex flex-col overflow-hidden font-sans">
      {/* FIXED HEADER */}
      <header className="flex-none flex justify-between items-center px-6 py-3 border-b border-white/5 bg-gray-900/50 backdrop-blur-md z-20">
        <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 uppercase italic tracking-tighter">
          Gaming Hub
        </h1>
        <div className="flex items-center gap-4">
          {isAdmin && (
            <Button
              onClick={() => router.push("/admin-dashboard")}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-black uppercase text-[10px] h-8 px-4 rounded-lg shadow-lg"
            >
              Admin Panel
            </Button>
          )}
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      {/* FULL SCROLLABLE GRID (All Games) */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-hide">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 max-w-[1800px] mx-auto">
          {games?.map((game) => (
            <div
              key={game._id}
              className="group bg-gray-900/60 rounded-xl p-2 border border-white/5 hover:border-orange-500/50 transition-all cursor-pointer flex flex-col shadow-xl"
              onClick={() =>
                setSelectedGame({ name: game.name, link: game.link })
              }
            >
              <div className="relative overflow-hidden rounded-lg aspect-video bg-black">
                <img
                  src={game.image || "https://placehold.co/400x225"}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                  alt={game.name}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-orange-600 px-4 py-1 rounded-full font-black text-[10px] shadow-lg uppercase">
                    Play
                  </span>
                </div>
              </div>
              <h3 className="text-center mt-2 font-bold text-xs group-hover:text-orange-400 transition-colors uppercase tracking-tight truncate">
                {game.name}
              </h3>
            </div>
          ))}
        </div>
      </div>

      {/* GAME MODAL */}
      {selectedGame && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[100] p-4 backdrop-blur-md">
          <div className="bg-gray-900 rounded-3xl p-4 max-w-5xl w-full relative border border-white/10 shadow-2xl">
            <button
              className="absolute -top-3 -right-3 bg-red-600 text-white w-9 h-9 rounded-full font-black shadow-xl"
              onClick={() => setSelectedGame(null)}
            >
              ×
            </button>
            <h2 className="text-xl font-black mb-3 text-orange-400 uppercase tracking-tight">
              {selectedGame.name}
            </h2>
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/5">
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
