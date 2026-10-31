import { neon } from "@neondatabase/serverless";
import { randomBytes } from "node:crypto";
const sql = neon(process.env.DATABASE_URL);
const rows = await sql`SELECT id FROM consultation_requests WHERE share_token IS NULL`;
console.log("rows to backfill:", rows.length);
for (const r of rows) {
  const token = randomBytes(32).toString("hex");
  await sql`UPDATE consultation_requests SET share_token = ${token} WHERE id = ${r.id}`;
}
const all = await sql`SELECT COUNT(*)::int AS total, COUNT(share_token)::int AS with_token FROM consultation_requests`;
console.log("all have share_token:", all[0].total === all[0].with_token);
