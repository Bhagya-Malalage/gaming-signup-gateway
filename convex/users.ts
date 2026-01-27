import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Fetches the currently logged-in user's data from the database
 */
export const getMe = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .unique();
  },
});

export const get = query({
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

export const create = mutation({
  args: { email: v.string(), role: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .unique();
    if (existing) throw new Error("A user with this email already exists.");

    return await ctx.db.insert("users", {
      email: args.email,
      role: args.role,
      tokenIdentifier: "manual_entry_" + Date.now(),
    });
  },
});

export const update = mutation({
  args: { id: v.id("users"), role: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { role: args.role });
  },
});

export const remove = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const store = mutation({
  args: { email: v.string(), tokenIdentifier: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", args.tokenIdentifier),
      )
      .unique();
    if (user !== null) return user._id;
    const role = args.email === "nrnbmadmal@gmail.com" ? "admin" : "user";
    return await ctx.db.insert("users", {
      email: args.email,
      tokenIdentifier: args.tokenIdentifier,
      role: role,
    });
  },
});
