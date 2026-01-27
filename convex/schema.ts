import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Table for storing your game library
  games: defineTable({
    name: v.string(),
    link: v.string(),
    image: v.string(),
  }),

  // Table for storing platform users and their roles
  users: defineTable({
    email: v.string(),
    tokenIdentifier: v.string(),
    role: v.string(), // Values: "admin" or "user"
  }).index("by_token", ["tokenIdentifier"]), // This index is required for fast user lookups
});
