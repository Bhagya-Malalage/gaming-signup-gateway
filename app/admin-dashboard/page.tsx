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
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const games = useQuery(api.games.get);
  const users = useQuery(api.users.get);
  const addGame = useMutation(api.games.create);
  const updateGame = useMutation(api.games.update);
  const deleteGame = useMutation(api.games.remove);
  const addUser = useMutation(api.users.create); // Mutation to add a user
  const updateUser = useMutation(api.users.update); // Mutation to update user role
  const deleteUser = useMutation(api.users.remove);

  const [newGame, setNewGame] = useState({ name: "", link: "", image: "" });
  const [newUser, setNewUser] = useState({ email: "", role: "user" }); // State for new user
  const [editingId, setEditingId] = useState<Id<"games"> | null>(null);
  const [activeTab, setActiveTab] = useState<"games" | "users">("games"); // Toggle between games and users

  // SECURITY LOCK: If someone tries to visit this URL and isn't the admin, kick them out
  useEffect(() => {
    if (
      isLoaded &&
      user?.emailAddresses[0].emailAddress !== "nrnbmadmal@gmail.com"
    ) {
      router.push("/dashboard");
    }
  }, [isLoaded, user, router]);

  if (!isLoaded)
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white font-sans uppercase italic">
        Secure Login...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col p-8 font-sans">
      <div className="flex justify-between items-center mb-10 border-b border-gray-800 pb-6 max-w-[1600px] mx-auto w-full">
        <h1 className="text-3xl font-black text-yellow-500 uppercase italic tracking-tighter">
          Admin Panel
        </h1>
        <div className="flex items-center gap-4">
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>

      {/* Tab Buttons */}
      <div className="flex justify-center gap-4 mb-8">
        <Button
          onClick={() => setActiveTab("games")}
          className={`px-6 py-2 font-bold uppercase ${
            activeTab === "games"
              ? "bg-orange-400 text-gray-900"
              : "bg-gray-800 text-gray-400"
          } rounded-lg`}
        >
          Manage Games
        </Button>
        <Button
          onClick={() => setActiveTab("users")}
          className={`px-6 py-2 font-bold uppercase ${
            activeTab === "users"
              ? "bg-orange-400 text-gray-900"
              : "bg-gray-800 text-gray-400"
          } rounded-lg`}
        >
          Manage Users
        </Button>
      </div>

      {/* Conditional Rendering Based on Active Tab */}
      {activeTab === "games" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-[1600px] mx-auto w-full">
          {/* Management Form */}
          <div className="lg:col-span-1 bg-gray-800/50 p-6 rounded-3xl border border-white/5 h-fit sticky top-8 backdrop-blur-md">
            <h2 className="text-xl font-bold mb-6 text-orange-400 uppercase italic">
              {editingId ? "Edit Existing Game" : "Add New Game"}
            </h2>
            <div className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-500 ml-1">
                  Title
                </label>
                <Input
                  placeholder="Game Name"
                  value={newGame.name}
                  onChange={(e) =>
                    setNewGame({ ...newGame, name: e.target.value })
                  }
                  className="bg-gray-900 border-gray-700 text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-500 ml-1">
                  Iframe Source
                </label>
                <Input
                  placeholder="https://..."
                  value={newGame.link}
                  onChange={(e) =>
                    setNewGame({ ...newGame, link: e.target.value })
                  }
                  className="bg-gray-900 border-gray-700 text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-500 ml-1">
                  Thumbnail URL
                </label>
                <Input
                  placeholder="https://..."
                  value={newGame.image}
                  onChange={(e) =>
                    setNewGame({ ...newGame, image: e.target.value })
                  }
                  className="bg-gray-900 border-gray-700 text-white"
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
                    } else {
                      if (newGame.name && newGame.link) addGame(newGame);
                    }
                    setNewGame({ name: "", link: "", image: "" });
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 font-bold uppercase italic"
                >
                  {editingId ? "Save Changes" : "Publish Game"}
                </Button>
                {editingId && (
                  <Button
                    variant="ghost"
                    className="text-gray-400"
                    onClick={() => {
                      setEditingId(null);
                      setNewGame({ name: "", link: "", image: "" });
                    }}
                  >
                    Cancel Edit
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Live Game Management */}
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-2xl font-bold mb-6 italic uppercase tracking-tight">
                Active Game Library
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {games?.map((game: Doc<"games">) => (
                  <div
                    key={game._id}
                    className="bg-gray-800/30 p-3 rounded-2xl border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <img
                      src={game.image || "https://placehold.co/200x120"}
                      className="w-full h-24 object-cover rounded-xl mb-3"
                    />
                    <p className="font-bold truncate text-sm px-1">
                      {game.name}
                    </p>
                    <div className="flex gap-2 mt-3 px-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-7 text-[10px] font-bold"
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
                        className="h-7 text-[10px] font-bold"
                        onClick={() => deleteGame({ id: game._id })}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      ) : (
        <div className="space-y-12">
          <section className="bg-gray-800/30 p-6 rounded-3xl border border-white/5">
            <h2 className="text-2xl font-bold mb-6 text-blue-400 italic uppercase">
              Registered Platform Users
            </h2>
            <div className="space-y-5">
              {/* Add New User Form */}
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-orange-400 uppercase">
                  Add New User
                </h3>
                <Input
                  placeholder="User Email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  className="bg-gray-900 border-gray-700 text-white"
                />
                <select
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
                  className="bg-gray-900 border-gray-700 text-white px-4 py-2 rounded-lg"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <Button
                  onClick={() => {
                    if (newUser.email) {
                      addUser(newUser);
                      setNewUser({ email: "", role: "user" });
                    }
                  }}
                  className="bg-green-600 hover:bg-green-700 font-bold uppercase"
                >
                  Add User
                </Button>
              </div>

              {/* User List */}
              <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2 scrollbar-hide">
                {users?.map((u: Doc<"users">) => (
                  <div
                    key={u._id}
                    className="flex justify-between items-center py-3 border-b border-gray-800 hover:bg-white/5 px-4 rounded-lg transition-colors"
                  >
                    <span className="text-sm font-medium">{u.email}</span>
                    <div className="flex items-center gap-4">
                      <select
                        value={u.role}
                        onChange={(e) =>
                          updateUser({ id: u._id, role: e.target.value })
                        }
                        className="bg-gray-900 border-gray-700 text-white px-3 py-1 rounded-lg"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-7 text-[10px] font-bold"
                        onClick={() => deleteUser({ id: u._id })}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
