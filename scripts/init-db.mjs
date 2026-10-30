import { neon } from "@neondatabase/serverless";
import fs from "node:fs";

const url = process.env.DATABASE_URL;
if (!url) { console.error("DATABASE_URL missing"); process.exit(1); }
const sql = neon(url);
const schema = fs.readFileSync("db/schema.sql", "utf8");
// split on semicolons at end of statements (naive but fine for this file)
const stmts = schema.split(/;\s*\n/).map(s => s.trim()).filter(s => s.length > 0);
console.log("statements:", stmts.length);
for (const s of stmts) {
  try {
    await sql.query(s);
    console.log("OK:", s.slice(0, 60).replace(/\n/g, " "));
  } catch (e) {
    console.error("FAIL:", s.slice(0, 80));
    console.error(e.message);
  }
}
console.log("done");
