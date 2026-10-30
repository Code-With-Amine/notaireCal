import { NextRequest, NextResponse } from "next/server";
import { requireDb } from "@/lib/db";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const setupSecret = process.env.ADMIN_SETUP_SECRET;
  if (!setupSecret) {
    return NextResponse.json({ ok: false, error: "ADMIN_SETUP_SECRET not configured" }, { status: 500 });
  }
  const body = await req.json().catch(() => ({}));
  if (body.secret !== setupSecret) {
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const sql = requireDb();
  const existing = await sql`SELECT COUNT(*)::int AS c FROM admins`;
  if (existing[0].c > 0) {
    return NextResponse.json({ ok: false, error: "Admin already exists" }, { status: 409 });
  }

  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  if (!email || password.length < 8) {
    return NextResponse.json({ ok: false, error: "Email and password (>=8 chars) required" }, { status: 400 });
  }

  const hash = await bcrypt.hash(password, 12);
  await sql`INSERT INTO admins (email, password_hash) VALUES (${email}, ${hash})`;
  return NextResponse.json({ ok: true, email });
}
