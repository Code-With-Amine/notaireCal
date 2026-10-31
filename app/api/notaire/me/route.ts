import { NextRequest, NextResponse } from "next/server";
import { requireDb } from "@/lib/db";
import { verifyNotaireToken, NOTAIRE_COOKIE } from "@/lib/notaire-auth";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(NOTAIRE_COOKIE)?.value;
  if (!token) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const user = await verifyNotaireToken(token);
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const sql = requireDb();
  const rows = await sql`
    SELECT id, email, full_name, study_name, cin, status, created_at
    FROM notaire_profiles WHERE id = ${user.id}
  `;
  if (rows.length === 0) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, notaire: rows[0] });
}
