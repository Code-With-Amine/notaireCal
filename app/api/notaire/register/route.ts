import { NextRequest, NextResponse } from "next/server";
import { requireDb } from "@/lib/db";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const fullName = String(body.fullName || "").trim();
  const studyName = String(body.studyName || "").trim() || null;
  const cin = String(body.cin || "").trim().toUpperCase();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (!fullName || !cin || !email || !password) {
    return NextResponse.json({ ok: false, error: "Tous les champs obligatoires doivent être remplis." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "E-mail invalide." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ ok: false, error: "Le mot de passe doit contenir au moins 8 caractères." }, { status: 400 });
  }
  // Moroccan CIN: 1-2 letters + 5-6 digits (simplified)
  if (!/^[A-Z]{1,2}[0-9]{5,6}$/.test(cin)) {
    return NextResponse.json({ ok: false, error: "Format de CIN invalide (ex. : AB123456)." }, { status: 400 });
  }

  const sql = requireDb();
  const existing = await sql`SELECT id FROM notaire_profiles WHERE email = ${email} OR cin = ${cin}`;
  if (existing.length > 0) {
    return NextResponse.json({ ok: false, error: "Un compte existe déjà avec cet e-mail ou ce CIN." }, { status: 409 });
  }

  const hash = await bcrypt.hash(password, 12);
  const rows = await sql`
    INSERT INTO notaire_profiles (email, password_hash, full_name, study_name, cin)
    VALUES (${email}, ${hash}, ${fullName}, ${studyName}, ${cin})
    RETURNING id, email, full_name
  `;
  return NextResponse.json({ ok: true, notaire: rows[0] });
}
