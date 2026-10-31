import { NextRequest, NextResponse } from "next/server";
import { requireDb } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signNotaireToken, NOTAIRE_COOKIE } from "@/lib/notaire-auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (!email || !password) {
    return NextResponse.json({ ok: false, error: "E-mail et mot de passe requis." }, { status: 400 });
  }

  const sql = requireDb();
  const rows = await sql`SELECT id, email, password_hash, status FROM notaire_profiles WHERE email = ${email}`;
  if (rows.length === 0) {
    return NextResponse.json({ ok: false, error: "Identifiants invalides." }, { status: 401 });
  }
  if (rows[0].status !== "active") {
    return NextResponse.json({ ok: false, error: "Compte suspendu." }, { status: 403 });
  }
  const ok = await bcrypt.compare(password, rows[0].password_hash);
  if (!ok) {
    return NextResponse.json({ ok: false, error: "Identifiants invalides." }, { status: 401 });
  }

  const token = await signNotaireToken(email, rows[0].id);
  const res = NextResponse.json({ ok: true, email });
  res.cookies.set(NOTAIRE_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 8 * 60 * 60,
  });
  return res;
}
