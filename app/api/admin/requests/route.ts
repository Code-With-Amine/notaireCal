import { NextRequest, NextResponse } from "next/server";
import { requireDb } from "@/lib/db";
import { verifyAdminToken, ADMIN_COOKIE } from "@/lib/admin-auth";

export const runtime = "nodejs";

async function authed(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  return await verifyAdminToken(token);
}

export async function GET(req: NextRequest) {
  const user = await authed(req);
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const sql = requireDb();
  const rows = await sql`
    SELECT id, reference, title_number, cnp_number, email, status, result_amount, result_note, created_at, updated_at
    FROM consultation_requests
    ORDER BY created_at DESC
    LIMIT 200
  `;
  return NextResponse.json({ ok: true, requests: rows });
}

export async function PATCH(req: NextRequest) {
  const user = await authed(req);
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const id = Number(body.id);
  if (!id) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });

  const sql = requireDb();
  const status = body.status ? String(body.status) : null;
  const resultAmount = body.resultAmount != null ? Number(body.resultAmount) : null;
  const resultNote = body.resultNote != null ? String(body.resultNote) : null;

  await sql`
    UPDATE consultation_requests
    SET status = COALESCE(${status}, status),
        result_amount = COALESCE(${resultAmount}, result_amount),
        result_note = COALESCE(${resultNote}, result_note),
        updated_at = NOW()
    WHERE id = ${id}
  `;
  return NextResponse.json({ ok: true });
}
