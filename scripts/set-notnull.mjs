import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL);
await sql`ALTER TABLE consultation_requests ALTER COLUMN citizen_token SET NOT NULL`;
console.log("OK: citizen_token NOT NULL");
