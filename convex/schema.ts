import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  games: defineTable({
    name: v.string(),
    link: v.string(),
    image: v.string(),
  }),
  users: defineTable({
    email: v.string(),
    tokenIdentifier: v.string(),
    role: v.string(),
  })
    .index("by_token", ["tokenIdentifier"])
    .index("by_email", ["email"]), // ADDED: This allows us to find you by email reliably
});
