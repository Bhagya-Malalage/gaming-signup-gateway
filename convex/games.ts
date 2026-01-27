import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get all games
export const get = query({
  handler: async (ctx) => {
    return await ctx.db.query("games").collect();
  },
});

// Add a game (Admin & User)
export const create = mutation({
  args: { name: v.string(), link: v.string(), image: v.string() },
  handler: async (ctx, args) => {
    // In a real app, check ctx.auth.getUserIdentity() here for permissions
    await ctx.db.insert("games", args);
  },
});

// Delete a game (Admin ONLY)
// We will enforce this on UI, but strictly this should verify user role
export const remove = mutation({
  args: { id: v.id("games") },
  handler: async (ctx, args) => {
    // TO DO: Add role check here using ctx.auth
    await ctx.db.delete(args.id);
  },
});

// Edit a game (Admin)
export const update = mutation({
  args: {
    id: v.id("games"),
    name: v.string(),
    link: v.string(),
    image: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      name: args.name,
      link: args.link,
      image: args.image,
    });
  },
});
