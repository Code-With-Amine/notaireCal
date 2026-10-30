import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL);
const rows = await sql`SELECT reference,status,email,title_number,created_at FROM consultation_requests ORDER BY id DESC LIMIT 3`;
console.log(JSON.stringify(rows, null, 2));
