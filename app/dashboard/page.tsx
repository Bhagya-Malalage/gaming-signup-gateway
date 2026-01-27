"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { isLoaded } = useUser();
  const router = useRouter();
  const games = useQuery(api.games.get);
  const currentUser = useQuery(api.users.getMe); // Fetch role from database
  const [selectedGame, setSelectedGame] = useState<null | {
    name: string;
    link: string;
  }>(null);

  useEffect(() => {
    // If database says role is admin, redirect to Admin Panel
    if (isLoaded && currentUser?.role === "admin") {
      router.push("/admin-dashboard");
    }
  }, [isLoaded, currentUser, router]);

  if (!isLoaded || currentUser === undefined) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-pulse">Loading Hub...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col p-4 md:p-8 font-sans">
      <div className="flex justify-between items-center mb-10 border-b border-gray-800 pb-6 max-w-7xl mx-auto w-full">
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 uppercase italic tracking-tighter">
          Gaming Hub
        </h1>
        <UserButton afterSignOutUrl="/" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto w-full">
        {games?.map((game) => (
          <div
            key={game._id}
            className="bg-gray-800/40 rounded-2xl p-4 border border-white/5 hover:border-orange-500/50 transition-all cursor-pointer group shadow-xl"
            onClick={() =>
              setSelectedGame({ name: game.name, link: game.link })
            }
          >
            <div className="relative overflow-hidden rounded-xl mb-4 aspect-video">
              <img
                src={game.image || "https://placehold.co/400x225"}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                alt={game.name}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="bg-orange-600 px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                  PLAY NOW
                </span>
              </div>
            </div>
            <h3 className="text-center font-bold text-lg group-hover:text-orange-400 transition-colors">
              {game.name}
            </h3>
          </div>
        ))}
      </div>

      {selectedGame && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4 backdrop-blur-md">
          <div className="bg-gray-900 rounded-3xl p-4 max-w-5xl w-full relative border border-white/10 shadow-2xl">
            <button
              className="absolute -top-4 -right-4 bg-red-600 text-white w-10 h-10 rounded-full font-bold"
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
