import { NextRequest, NextResponse } from "next/server";
import { requireDb } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signAdminToken, ADMIN_COOKIE } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (!email || !password) {
    return NextResponse.json({ ok: false, error: "Email et mot de passe requis" }, { status: 400 });
  }

  const sql = requireDb();
  const rows = await sql`SELECT email, password_hash FROM admins WHERE email = ${email}`;
  if (rows.length === 0) {
    return NextResponse.json({ ok: false, error: "Identifiants invalides" }, { status: 401 });
  }
  const ok = await bcrypt.compare(password, rows[0].password_hash);
  if (!ok) {
    return NextResponse.json({ ok: false, error: "Identifiants invalides" }, { status: 401 });
  }

  const token = await signAdminToken(email);
  const res = NextResponse.json({ ok: true, email });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 8 * 60 * 60,
  });
  return res;
}
