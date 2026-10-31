import { NextRequest, NextResponse } from "next/server";
import { requireDb } from "@/lib/db";
import { verifyAdminToken, ADMIN_COOKIE } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  const user = token ? await verifyAdminToken(token) : null;
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const grandTotal = Number(body.grandTotal);
  const sql = requireDb();

  const old = await sql`SELECT status, result_grand_total FROM consultation_requests WHERE id = ${Number(id)}`;
  if (old.length === 0) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  // If already published, require explicit correction (record old/new)
  const wasPublished = old[0].status === "Terminée" || old[0].status === "completed";

  await sql`
    UPDATE consultation_requests
    SET status = 'Terminée',
        result_grand_total = ${grandTotal},
        published_at = NOW(),
        published_by = ${user.email},
        updated_at = NOW(),
        admin_notes = COALESCE(${body.adminNotes ?? null}, admin_notes)
    WHERE id = ${Number(id)}
  `;

  await sql`
    INSERT INTO consultation_audit_log (request_id, action, actor_email, old_status, new_status, details)
    VALUES (${Number(id)}, ${wasPublished ? "result_corrected" : "result_published"}, ${user.email},
            ${old[0].status}, 'Terminée',
            ${wasPublished ? `Old total: ${old[0].result_grand_total}, New total: ${grandTotal}` : `Total: ${grandTotal}`})
  `;

  return NextResponse.json({ ok: true, wasPublished });
}
