import { query } from "../_generated/server";

export const get = query(async ({ db }) => {
  // Fetch all games from the database
  return await db.query("games").collect();
});
