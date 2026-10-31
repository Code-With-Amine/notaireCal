import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL);
await sql`ALTER TABLE consultation_requests ALTER COLUMN share_token SET NOT NULL`;
await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_consultation_share_token ON consultation_requests (share_token)`;
console.log("OK");
