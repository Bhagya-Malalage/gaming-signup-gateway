"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Doc, Id } from "../../convex/_generated/dataModel";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const { isLoaded, user } = useUser();
  const router = useRouter();

  // Data Queries
  const games = useQuery(api.games.get);
  const users = useQuery(api.users.get);
  const currentUser = useQuery(api.users.getMe);

  // Mutations
  const addGame = useMutation(api.games.create);
  const updateGame = useMutation(api.games.update);
  const deleteGame = useMutation(api.games.remove);
  const addUser = useMutation(api.users.create);
  const updateUser = useMutation(api.users.update);
  const deleteUser = useMutation(api.users.remove);

  // States
  const [newGame, setNewGame] = useState({ name: "", link: "", image: "" });
  const [newUser, setNewUser] = useState({ email: "", role: "user" });
  const [editingId, setEditingId] = useState<Id<"games"> | null>(null);
  const [activeTab, setActiveTab] = useState<"games" | "users">("games");

  // FINAL SECURITY CHECK:
  // This logic is now identical to the Hub to prevent the redirection loop.
  useEffect(() => {
    if (isLoaded) {
      const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase();

      // List of absolute admin emails
      const isFailSafeAdmin =
        userEmail === "nrnbmadmal@gmail.com" ||
        userEmail === "baani@baazidaily.com";

      const isDatabaseAdmin = currentUser?.role === "admin";

      // If NOT a fail-safe admin AND the database has finished loading and says NOT an admin
      if (!isFailSafeAdmin && currentUser !== undefined && !isDatabaseAdmin) {
        router.push("/dashboard");
      }
    }
  }, [isLoaded, user, currentUser, router]);

  // Keep the "Verifying" screen visible until we are sure
  if (
    !isLoaded ||
    (currentUser === undefined &&
      !["nrnbmadmal@gmail.com", "baani@baazidaily.com"].includes(
        user?.primaryEmailAddress?.emailAddress?.toLowerCase() || "",
      ))
  ) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center font-black italic uppercase tracking-tighter">
        <div className="animate-pulse text-yellow-500">
          Authenticating Admin...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col p-4 md:p-8 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-10 border-b border-gray-800 pb-6 max-w-[1600px] mx-auto w-full">
        <div>
          <h1 className="text-3xl font-black text-yellow-500 uppercase tracking-tighter">
            Admin Panel
          </h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
            Platform Control Hub
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.push("/dashboard")}
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase text-sm px-10 py-4 rounded-2xl shadow-xl transition-all duration-200 border-none"
          >
            Back to Hub
          </Button>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex justify-center gap-2 mb-10 bg-gray-800/30 p-1 rounded-2xl w-fit mx-auto border border-white/5 shadow-2xl">
        <button
          onClick={() => setActiveTab("games")}
          className={`px-10 py-3 rounded-xl font-black uppercase text-xs transition-all duration-300 ${activeTab === "games" ? "bg-orange-500 text-black shadow-lg" : "text-gray-500 hover:text-white"}`}
        >
          Manage Library
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-10 py-3 rounded-xl font-black uppercase text-xs transition-all duration-300 ${activeTab === "users" ? "bg-blue-600 text-white shadow-lg" : "text-gray-500 hover:text-white"}`}
        >
          User Database
        </button>
      </div>

      <div className="max-w-[1600px] mx-auto w-full">
        {activeTab === "games" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Game Form */}
            <div className="bg-gray-800/50 p-6 rounded-3xl border border-white/5 h-fit sticky top-8 backdrop-blur-md shadow-2xl">
              <h2 className="text-xl font-black mb-6 text-orange-400 uppercase">
                {editingId ? "Update Entry" : "New Entry"}
              </h2>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-500 uppercase ml-1">
                    Game Title
                  </label>
                  <Input
                    value={newGame.name}
                    onChange={(e) =>
                      setNewGame({ ...newGame, name: e.target.value })
                    }
                    className="bg-gray-900 border-gray-700 text-white h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-500 uppercase ml-1">
                    Embed URL
                  </label>
                  <Input
                    value={newGame.link}
                    onChange={(e) =>
                      setNewGame({ ...newGame, link: e.target.value })
                    }
                    className="bg-gray-900 border-gray-700 text-white h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-500 uppercase ml-1">
                    Image URL
                  </label>
                  <Input
                    value={newGame.image}
                    onChange={(e) =>
                      setNewGame({ ...newGame, image: e.target.value })
                    }
                    className="bg-gray-900 border-gray-700 text-white h-12 rounded-xl"
                  />
                </div>

                <div className="pt-4 flex flex-col gap-2">
                  <Button
                    onClick={() => {
                      if (editingId) {
                        updateGame({
                          id: editingId,
                          name: newGame.name,
                          link: newGame.link,
                          image: newGame.image,
                        });
                        setEditingId(null);
                      } else if (newGame.name && newGame.link) {
                        addGame(newGame);
                      }
                      setNewGame({ name: "", link: "", image: "" });
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 font-black py-7 text-lg shadow-xl uppercase rounded-2xl"
                  >
                    {editingId ? "Save Changes" : "Publish Game"}
                  </Button>
                  {editingId && (
                    <button
                      className="text-gray-500 text-xs font-bold uppercase hover:text-white transition-colors py-2"
                      onClick={() => {
                        setEditingId(null);
                        setNewGame({ name: "", link: "", image: "" });
                      }}
                    >
                      Cancel Editing
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Game Grid */}
            <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-6">
              {games?.map((game: Doc<"games">) => (
                <div
                  key={game._id}
                  className="bg-gray-800/30 p-3 rounded-2xl border border-white/5 hover:border-white/10 transition-all shadow-xl group"
                >
                  <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-black">
                    <img
                      src={game.image || "https://placehold.co/400x225"}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <p className="font-bold truncate text-xs px-1 text-gray-300 uppercase tracking-tighter">
                    {game.name}
                  </p>
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="flex-1 h-8 text-[10px] font-black uppercase rounded-lg"
                      onClick={() => {
                        setEditingId(game._id);
                        setNewGame({
                          name: game.name,
                          link: game.link,
                          image: game.image || "",
                        });
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1 h-8 text-[10px] font-black uppercase rounded-lg"
                      onClick={() => deleteGame({ id: game._id })}
                    >
                      Del
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* User Form */}
            <div className="bg-gray-800/50 p-6 rounded-3xl border border-white/5 h-fit sticky top-8 backdrop-blur-md shadow-2xl">
              <h2 className="text-xl font-black mb-6 text-blue-400 uppercase">
                Add User
              </h2>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-500 uppercase ml-1">
                    Email
                  </label>
                  <Input
                    placeholder="user@example.com"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    className="bg-gray-900 border-gray-700 h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-500 uppercase ml-1">
                    Role
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) =>
                      setNewUser({ ...newUser, role: e.target.value })
                    }
                    className="w-full bg-gray-900 border-gray-700 text-white px-4 py-3 rounded-xl text-sm font-bold uppercase outline-none focus:ring-1 ring-blue-500 appearance-none"
                  >
                    <option value="user">Standard User</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <Button
                  onClick={() => {
                    if (newUser.email) {
                      addUser({ email: newUser.email, role: newUser.role });
                      setNewUser({ email: "", role: "user" });
                    }
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 font-black py-7 text-lg shadow-xl uppercase mt-4 rounded-2xl"
                >
                  Create Account
                </Button>
              </div>
            </div>

            {/* User List */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-2xl font-black uppercase tracking-tighter mb-6">
                Registered Base
              </h2>
              <div className="grid grid-cols-1 gap-3">
                {users?.map((u: Doc<"users">) => (
                  <div
                    key={u._id}
                    className="flex justify-between items-center py-4 px-6 bg-gray-800/30 border border-white/5 rounded-2xl hover:bg-white/5 transition-colors shadow-lg"
                  >
                    <div>
                      <p className="font-bold text-gray-100 text-sm tracking-tight">
                        {u.email}
                      </p>
                      <p className="text-[8px] text-gray-600 font-mono tracking-widest mt-1 uppercase">
                        {u._id}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <select
                        value={u.role}
                        onChange={(e) =>
                          updateUser({ id: u._id, role: e.target.value })
                        }
                        className="bg-gray-900 border-gray-700 text-[10px] font-black px-4 py-2 rounded-full outline-none focus:ring-1 ring-white/20 uppercase"
                      >
                        <option value="user">USER</option>
                        <option value="admin">ADMIN</option>
                      </select>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="h-9 w-9 rounded-full p-0 flex items-center justify-center font-black shadow-lg"
                        onClick={() => deleteUser({ id: u._id })}
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
