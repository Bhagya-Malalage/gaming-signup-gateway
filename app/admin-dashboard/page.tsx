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

  const games = useQuery(api.games.get);
  const users = useQuery(api.users.get);
  const currentUser = useQuery(api.users.getMe);

  const addGame = useMutation(api.games.create);
  const updateGame = useMutation(api.games.update);
  const deleteGame = useMutation(api.games.remove);
  const addUser = useMutation(api.users.create);
  const updateUser = useMutation(api.users.update);
  const deleteUser = useMutation(api.users.remove);

  const [newGame, setNewGame] = useState({ name: "", link: "", image: "" });
  const [newUser, setNewUser] = useState({ email: "", role: "user" });
  const [editingId, setEditingId] = useState<Id<"games"> | null>(null);
  const [activeTab, setActiveTab] = useState<"games" | "users">("games");

  useEffect(() => {
    if (isLoaded) {
      const userEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
      const isAdmin =
        userEmail === "nrnbmadmal@gmail.com" ||
        userEmail === "baani@baazidaily.com" ||
        currentUser?.role === "admin";
      if (currentUser !== undefined && !isAdmin) router.push("/dashboard");
    }
  }, [isLoaded, user, currentUser, router]);

  if (!isLoaded || currentUser === undefined)
    return (
      <div className="h-screen bg-black flex items-center justify-center text-white italic">
        SECURE ACCESS...
      </div>
    );

  return (
    <div className="h-screen w-full bg-black text-white flex flex-col overflow-hidden font-sans">
      {/* FIXED HEADER */}
      <header className="flex-none flex justify-between items-center px-6 py-3 border-b border-white/5 bg-gray-900/80 backdrop-blur-md z-30">
        <h1 className="text-2xl font-black text-yellow-500 uppercase tracking-tighter">
          Admin Panel
        </h1>
        <div className="flex items-center gap-4">
          <Button
            onClick={() => router.push("/dashboard")}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-black uppercase text-[10px] h-8 px-4 rounded-lg shadow-lg"
          >
            Back to Hub
          </Button>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>
      {/* FIXED TAB SWITCHER */}
      <div className="flex-none flex justify-center py-3 bg-gray-900/30">
        <div className="flex gap-2 bg-black/40 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveTab("games")}
            className={`px-8 py-2 rounded-lg font-black uppercase text-[10px] transition-all ${activeTab === "games" ? "bg-orange-500 text-black shadow-lg" : "text-gray-500 hover:text-white"}`}
          >
            Manage Games
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-8 py-2 rounded-lg font-black uppercase text-[10px] transition-all ${activeTab === "users" ? "bg-blue-600 text-white shadow-lg" : "text-gray-500 hover:text-white"}`}
          >
            Access Control
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex overflow-hidden p-4 gap-6 max-w-[1800px] mx-auto w-full">
        {activeTab === "games" ? (
          <>
            {/* LEFT: FIXED FORM */}
            <div className="w-80 flex-none bg-gray-900/50 p-5 rounded-2xl border border-white/5 h-fit shadow-2xl">
              <h2 className="text-sm font-black mb-4 text-orange-400 uppercase">
                {editingId ? "Update Entry" : "New Entry"}
              </h2>
              <div className="space-y-3">
                <Input
                  placeholder="Game Title"
                  value={newGame.name}
                  onChange={(e) =>
                    setNewGame({ ...newGame, name: e.target.value })
                  }
                  className="bg-black/40 border-gray-700 h-9 text-xs"
                />
                <Input
                  placeholder="Iframe Link"
                  value={newGame.link}
                  onChange={(e) =>
                    setNewGame({ ...newGame, link: e.target.value })
                  }
                  className="bg-black/40 border-gray-700 h-9 text-xs"
                />
                <Input
                  placeholder="Image URL"
                  value={newGame.image}
                  onChange={(e) =>
                    setNewGame({ ...newGame, image: e.target.value })
                  }
                  className="bg-black/40 border-gray-700 h-9 text-xs"
                />
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
                  className="w-full bg-green-600 hover:bg-green-700 font-black uppercase py-5 shadow-lg"
                >
                  {editingId ? "Save Changes" : "Publish Game"}
                </Button>
                {editingId && (
                  <button
                    className="w-full text-[10px] text-gray-500 font-bold uppercase mt-2 hover:text-white"
                    onClick={() => {
                      setEditingId(null);
                      setNewGame({ name: "", link: "", image: "" });
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>

            {/* RIGHT: SCROLLABLE LIBRARY */}
            <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {games?.map((game: Doc<"games">) => (
                  <div
                    key={game._id}
                    className="bg-gray-900/40 p-2 rounded-xl border border-white/5 group hover:border-white/10 shadow-lg"
                  >
                    <img
                      src={game.image || "https://placehold.co/400x225"}
                      className="w-full aspect-video object-cover rounded-lg mb-2 bg-black"
                    />
                    <p className="font-bold truncate text-[10px] text-gray-300 uppercase px-1">
                      {game.name}
                    </p>
                    <div className="flex gap-2 mt-3 px-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="flex-1 h-7 text-[9px] font-black uppercase"
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
                        className="flex-1 h-7 text-[9px] font-black uppercase"
                        onClick={() => deleteGame({ id: game._id })}
                      >
                        Del
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="w-full flex overflow-hidden gap-6">
            {/* USER FORM */}
            <div className="w-80 flex-none bg-gray-900/50 p-5 rounded-2xl border border-white/5 h-fit shadow-2xl">
              <h2 className="text-sm font-black mb-4 text-blue-400 uppercase">
                Add User
              </h2>
              <div className="space-y-3">
                <Input
                  placeholder="Email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  className="bg-black/40 border-gray-700 h-9 text-xs"
                />
                <select
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
                  className="w-full bg-black/40 border-gray-700 text-white h-9 px-3 rounded-md text-[10px] font-bold uppercase outline-none"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <Button
                  onClick={() => {
                    if (newUser.email) {
                      addUser({ email: newUser.email, role: newUser.role });
                      setNewUser({ email: "", role: "user" });
                    }
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 font-black uppercase py-5 shadow-lg"
                >
                  Create
                </Button>
              </div>
            </div>

            {/* SCROLLABLE USER LIST */}
            <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
              <div className="space-y-2">
                {users?.map((u: Doc<"users">) => (
                  <div
                    key={u._id}
                    className="flex justify-between items-center py-3 px-5 bg-gray-900/40 border border-white/5 rounded-xl hover:bg-gray-800/50 transition-colors"
                  >
                    <span className="font-bold text-gray-200 text-xs truncate max-w-[200px]">
                      {u.email}
                    </span>
                    <div className="flex items-center gap-3">
                      <select
                        value={u.role}
                        onChange={(e) =>
                          updateUser({ id: u._id, role: e.target.value })
                        }
                        className="bg-black/60 border-gray-800 text-[9px] font-black px-3 py-1.5 rounded-full outline-none"
                      >
                        <option value="user">USER</option>
                        <option value="admin">ADMIN</option>
                      </select>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="h-7 w-7 rounded-full p-0 flex items-center justify-center font-black"
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
