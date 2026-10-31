import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL);
const r = await sql`SELECT reference,status,result_grand_total,published_at,published_by FROM consultation_requests WHERE reference='TNB-20261030-214923-3CAD'`;
console.log("request:", JSON.stringify(r));
const y = await sql`SELECT tax_year,annual_total FROM consultation_years WHERE request_id=1`;
console.log("years:", JSON.stringify(y));
const a = await sql`SELECT action,old_status,new_status,details FROM consultation_audit_log WHERE request_id=1 ORDER BY created_at DESC LIMIT 5`;
console.log("audit:", JSON.stringify(a));
