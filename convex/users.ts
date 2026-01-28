import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Fetches the currently logged-in user's data.
 * Optimized for speed and accuracy.
 */
export const getMe = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    // 1. Try finding by unique token ID (Clerk ID)
    const userByToken = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.subject))
      .unique();

    if (userByToken) return userByToken;

    // 2. Fallback: Search by email (handles cases where token changed)
    if (identity.email) {
      return await ctx.db
        .query("users")
        .withIndex("by_email", (q) =>
          q.eq("email", identity.email!.toLowerCase()),
        )
        .unique();
    }

    return null;
  },
});

export const get = query({
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

export const store = mutation({
  args: { email: v.string(), tokenIdentifier: v.string() },
  handler: async (ctx, args) => {
    const emailLower = args.email.toLowerCase();

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", emailLower))
      .unique();

    if (user !== null) {
      // Ensure role is admin for your specific accounts
      const adminEmails = ["nrnbmadmal@gmail.com", "baani@baazidaily.com"];
      if (adminEmails.includes(emailLower) && user.role !== "admin") {
        await ctx.db.patch(user._id, {
          role: "admin",
          tokenIdentifier: args.tokenIdentifier,
        });
      }
      return user._id;
    }

    const role =
      emailLower === "nrnbmadmal@gmail.com" ||
      emailLower === "baani@baazidaily.com"
        ? "admin"
        : "user";
    return await ctx.db.insert("users", {
      email: emailLower,
      tokenIdentifier: args.tokenIdentifier,
      role: role,
    });
  },
});

export const create = mutation({
  args: { email: v.string(), role: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("users", {
      email: args.email.toLowerCase(),
      role: args.role,
      tokenIdentifier: "manual_" + Date.now(),
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
