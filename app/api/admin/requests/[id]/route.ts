import { NextRequest, NextResponse } from "next/server";
import { requireDb } from "@/lib/db";
import { verifyAdminToken, ADMIN_COOKIE } from "@/lib/admin-auth";

export const runtime = "nodejs";

async function authed(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  return await verifyAdminToken(token);
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await authed(req);
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const sql = requireDb();
  const rows = await sql`
    SELECT cr.id, cr.reference, cr.title_number, cr.cnp_number, cr.email, cr.status,
           cr.result_grand_total, cr.admin_notes, cr.result_note,
           cr.ignored_reason, cr.cancelled_reason, cr.created_at, cr.updated_at,
           cr.published_at, cr.published_by, cr.citizen_token,
           np.full_name AS notaire_name, np.study_name AS notaire_study, np.email AS notaire_email
    FROM consultation_requests cr
    LEFT JOIN notaire_profiles np ON np.id = cr.notaire_id
    WHERE cr.id = ${Number(id)}
  `;
  if (rows.length === 0) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  const years = await sql`
    SELECT * FROM consultation_years WHERE request_id = ${Number(id)} ORDER BY tax_year
  `;
  const audit = await sql`
    SELECT * FROM consultation_audit_log WHERE request_id = ${Number(id)} ORDER BY created_at DESC LIMIT 50
  `;
  return NextResponse.json({ ok: true, request: rows[0], years, audit });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await authed(req);
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const sql = requireDb();

  if (body.status) {
    const old = await sql`SELECT status FROM consultation_requests WHERE id = ${Number(id)}`;
    await sql`
      UPDATE consultation_requests
      SET status = ${String(body.status)}, updated_at = NOW(),
          admin_notes = COALESCE(${body.adminNotes ?? null}, admin_notes),
          result_note = COALESCE(${body.resultNote ?? null}, result_note),
          ignored_reason = COALESCE(${body.ignoredReason ?? null}, ignored_reason),
          cancelled_reason = COALESCE(${body.cancelledReason ?? null}, cancelled_reason)
      WHERE id = ${Number(id)}
    `;
    await sql`
      INSERT INTO consultation_audit_log (request_id, action, actor_email, old_status, new_status, details)
      VALUES (${Number(id)}, 'status_change', ${user.email}, ${old[0]?.status ?? null}, ${String(body.status)}, ${body.details ?? null})
    `;
  } else if (body.adminNotes !== undefined || body.resultNote !== undefined) {
    await sql`
      UPDATE consultation_requests
      SET admin_notes = COALESCE(${body.adminNotes ?? null}, admin_notes),
          result_note = COALESCE(${body.resultNote ?? null}, result_note),
          updated_at = NOW()
      WHERE id = ${Number(id)}
    `;
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await authed(req);
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const sql = requireDb();
  const existing = await sql`SELECT id FROM consultation_requests WHERE id = ${Number(id)}`;
  if (existing.length === 0) return NextResponse.json({ ok: false, error: "Introuvable" }, { status: 404 });
  await sql`DELETE FROM consultation_requests WHERE id = ${Number(id)}`;
  return NextResponse.json({ ok: true });
}
