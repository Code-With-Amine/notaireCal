import { neon } from "@neondatabase/serverless";
import fs from "node:fs";

const sql = neon(process.env.DATABASE_URL);
const raw = fs.readFileSync("db/migration-tnb-consultation.sql", "utf8");
// strip full-line comments
const cleaned = raw
  .split("\n")
  .filter((line) => !line.trim().startsWith("--"))
  .join("\n");
const stmts = cleaned.split(/;\s*\n/).map((s) => s.trim()).filter((s) => s.length > 0);
console.log("statements:", stmts.length);
for (const s of stmts) {
  try {
    await sql.query(s);
    console.log("OK:", s.slice(0, 60).replace(/\n/g, " "));
  } catch (e) {
    console.error("FAIL:", s.slice(0, 70).replace(/\n/g, " "));
    console.error("  ->", e.message);
  }
}
console.log("done");
