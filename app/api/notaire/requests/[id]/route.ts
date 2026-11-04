import { NextRequest, NextResponse } from "next/server";
import { requireDb } from "@/lib/db";
import { verifyNotaireToken, NOTAIRE_COOKIE } from "@/lib/notaire-auth";

export const runtime = "nodejs";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = req.cookies.get(NOTAIRE_COOKIE)?.value;
  if (!token) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const user = await verifyNotaireToken(token);
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const sql = requireDb();
  const rows = await sql`
    SELECT id, reference, title_number, cnp_number, status, result_grand_total, result_note,
           created_at, updated_at, published_at, citizen_token
    FROM consultation_requests
    WHERE id = ${Number(id)} AND notaire_id = ${user.id}
  `;
  if (rows.length === 0) {
    return NextResponse.json({ ok: false, error: "Introuvable" }, { status: 404 });
  }
  const reqRow = rows[0];
  let years: unknown[] = [];
  if (reqRow.status === "Terminée" || reqRow.status === "completed") {
    years = await sql`
      SELECT tax_year, surface_area, legacy_zone, modern_zone, modern_rate, is_declared,
             principal, def, majoration10, majoration5, months_late, majoration05, annual_total, unresolved_reason
      FROM consultation_years
      WHERE request_id = ${reqRow.id}
      ORDER BY tax_year
    `;
  }
  return NextResponse.json({ ok: true, request: reqRow, years });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = req.cookies.get(NOTAIRE_COOKIE)?.value;
  if (!token) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const user = await verifyNotaireToken(token);
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const sql = requireDb();
  const existing = await sql`SELECT id FROM consultation_requests WHERE id = ${Number(id)} AND notaire_id = ${user.id}`;
  if (existing.length === 0) return NextResponse.json({ ok: false, error: "Introuvable" }, { status: 404 });
  await sql`DELETE FROM consultation_requests WHERE id = ${Number(id)} AND notaire_id = ${user.id}`;
  return NextResponse.json({ ok: true });
}
