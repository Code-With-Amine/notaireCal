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
    SELECT id, reference, title_number, cnp_number, email, status, result_grand_total, admin_notes,
           ignored_reason, cancelled_reason, created_at, updated_at, published_at, published_by, citizen_token
    FROM consultation_requests WHERE id = ${Number(id)}
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
          ignored_reason = COALESCE(${body.ignoredReason ?? null}, ignored_reason),
          cancelled_reason = COALESCE(${body.cancelledReason ?? null}, cancelled_reason)
      WHERE id = ${Number(id)}
    `;
    await sql`
      INSERT INTO consultation_audit_log (request_id, action, actor_email, old_status, new_status, details)
      VALUES (${Number(id)}, 'status_change', ${user.email}, ${old[0]?.status ?? null}, ${String(body.status)}, ${body.details ?? null})
    `;
  } else if (body.adminNotes !== undefined) {
    await sql`
      UPDATE consultation_requests SET admin_notes = ${String(body.adminNotes)}, updated_at = NOW() WHERE id = ${Number(id)}
    `;
  }

  return NextResponse.json({ ok: true });
}
