import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL);
await sql`UPDATE consultation_requests SET status='Nouvelle' WHERE status='pending'`;
await sql`UPDATE consultation_requests SET status='Terminée' WHERE status='completed'`;
console.log("done");
const rows = await sql`SELECT DISTINCT status FROM consultation_requests`;
console.log("statuses:", rows.map(r => r.status));
