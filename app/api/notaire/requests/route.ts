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
    SELECT id, reference, title_number, cnp_number, status, result_grand_total, created_at, updated_at, published_at, citizen_token
    FROM consultation_requests
    WHERE notaire_id = ${user.id}
    ORDER BY created_at DESC
  `;
  return NextResponse.json({ ok: true, requests: rows });
}
