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
  const games = useQuery(api.games.get);
  const currentUser = useQuery(api.users.getMe);
  const [selectedGame, setSelectedGame] = useState<null | {
    name: string;
    link: string;
  }>(null);

  // FAIL-SAFE: Verify admin status by email or database role
  const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
  const isAdmin =
    userEmail === "nrnbmadmal@gmail.com" ||
    userEmail === "baani@baazidaily.com" ||
    currentUser?.role === "admin";

  if (!isLoaded || currentUser === undefined) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center font-sans uppercase italic tracking-widest">
        <div className="animate-pulse text-yellow-500">
          Syncing Gaming Hub...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col p-4 md:p-8 font-sans">
      {/* Header / Navbar */}
      <div className="flex justify-between items-center mb-10 border-b border-gray-800 pb-6 max-w-7xl mx-auto w-full">
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 uppercase italic tracking-tighter">
          Gaming Hub
        </h1>

        <div className="flex items-center gap-4">
          {/* Admin Panel Button */}
          {isAdmin && (
            <Button
              onClick={() => router.push("/admin-dashboard")}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-black uppercase italic text-xs px-6 py-5 rounded-xl shadow-[0_0_30px_rgba(234,179,8,0.5)] transition-all hover:scale-105 active:scale-95 border-none"
            >
              Admin Panel
            </Button>
          )}
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>

      {/* Game Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto w-full">
        {games === undefined ? (
          <div className="col-span-full text-center py-20 text-gray-500 italic">
            Loading Games Library...
          </div>
        ) : games.length === 0 ? (
          <div className="col-span-full text-center py-20 text-gray-500 italic">
            No games found.
          </div>
        ) : (
          games.map((game) => (
            <div
              key={game._id}
              className="bg-gray-800/40 rounded-2xl p-4 border border-white/5 hover:border-orange-500/50 transition-all cursor-pointer group shadow-xl"
              onClick={() =>
                setSelectedGame({ name: game.name, link: game.link })
              }
            >
              <div className="relative overflow-hidden rounded-xl mb-4 aspect-video bg-black">
                <img
                  src={game.image || "https://placehold.co/400x225"}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  alt={game.name}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-orange-600 px-6 py-2 rounded-full font-black text-xs shadow-lg uppercase italic">
                    PLAY NOW
                  </span>
                </div>
              </div>
              <h3 className="text-center font-bold text-lg group-hover:text-orange-400 transition-colors uppercase tracking-tight">
                {game.name}
              </h3>
            </div>
          ))
        )}
      </div>

      {/* Game Modal */}
      {selectedGame && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4 backdrop-blur-md">
          <div className="bg-gray-900 rounded-3xl p-4 max-w-5xl w-full relative border border-white/10 shadow-2xl">
            <button
              className="absolute -top-4 -right-4 bg-red-600 text-white w-10 h-10 rounded-full font-black shadow-xl hover:bg-red-700 transition-colors"
              onClick={() => setSelectedGame(null)}
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-4 text-orange-400 uppercase italic px-2">
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
    </div>
  );
}
