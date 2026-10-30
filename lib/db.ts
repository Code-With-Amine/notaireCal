import { neon } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  // Allow build to succeed without a DB; runtime calls will fail gracefully.
}

export const sql = connectionString ? neon(connectionString) : null;

export function requireDb() {
  if (!sql) throw new Error("DATABASE_URL is not configured");
  return sql;
}
