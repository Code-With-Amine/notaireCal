import { neon } from "@neondatabase/serverless";
import { randomBytes } from "node:crypto";

const sql = neon(process.env.DATABASE_URL);
const rows = await sql`SELECT id FROM consultation_requests WHERE citizen_token IS NULL`;
console.log("rows to backfill:", rows.length);
for (const r of rows) {
  const token = randomBytes(32).toString("hex");
  await sql`UPDATE consultation_requests SET citizen_token = ${token} WHERE id = ${r.id}`;
  console.log("  backfilled id", r.id, token.slice(0, 12) + "...");
}
// verify
const all = await sql`SELECT id, citizen_token IS NOT NULL AS has_token FROM consultation_requests`;
console.log("all have token:", all.every((r) => r.has_token));
