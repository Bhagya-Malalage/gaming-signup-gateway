"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const games = useQuery(api.games.get); // Fetch games from the database

  if (!games) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <h1 className="text-2xl font-bold">Loading games...</h1>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <h1 className="text-2xl font-bold">
          No games available at the moment.
        </h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col p-4 md:p-8 font-sans">
      <h1 className="text-3xl font-black text-yellow-500 uppercase italic tracking-tighter mb-8">
        Welcome to Gaming Hub
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => (
          <div
            key={game._id}
            className="bg-gray-800/30 p-4 rounded-2xl border border-white/5"
          >
            <img
              src={game.image || "https://placehold.co/200x120"}
              alt={game.name}
              className="w-full h-32 object-cover rounded-xl mb-3 bg-black"
            />
            <h2 className="font-bold text-lg truncate">{game.name}</h2>
            <Button
              as="a"
              href={game.link}
              target="_blank"
              className="mt-3 w-full bg-blue-600 font-bold uppercase"
            >
              Play Now
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
