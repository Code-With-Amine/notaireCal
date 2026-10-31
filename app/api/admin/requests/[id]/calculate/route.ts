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
  const years = Array.isArray(body.years) ? body.years : [];
  const sql = requireDb();

  // Replace years for this request
  await sql`DELETE FROM consultation_years WHERE request_id = ${Number(id)}`;
  for (const y of years) {
    await sql`
      INSERT INTO consultation_years (
        request_id, tax_year, surface_area, legacy_zone, modern_zone, modern_rate,
        is_declared, calculation_date, principal, def, majoration10, majoration5,
        months_late, majoration05, annual_total, unresolved_reason, notes
      ) VALUES (
        ${Number(id)}, ${Number(y.taxYear)}, ${Number(y.surfaceArea) || 0},
        ${y.legacyZone || null}, ${y.modernZone || null}, ${y.modernRate != null ? Number(y.modernRate) : null},
        ${!!y.isDeclared}, ${y.calculationDate || null},
        ${y.principal != null ? Number(y.principal) : null},
        ${y.def != null ? Number(y.def) : null},
        ${y.majoration10 != null ? Number(y.majoration10) : null},
        ${y.majoration5 != null ? Number(y.majoration5) : null},
        ${y.monthsLate != null ? Number(y.monthsLate) : null},
        ${y.majoration05 != null ? Number(y.majoration05) : null},
        ${y.annualTotal != null ? Number(y.annualTotal) : null},
        ${y.unresolvedReason || null}, ${y.notes || null}
      )
    `;
  }

  await sql`
    INSERT INTO consultation_audit_log (request_id, action, actor_email, details)
    VALUES (${Number(id)}, 'calculation_saved', ${user.email}, ${`Saved ${years.length} year(s)`})
  `;

  return NextResponse.json({ ok: true });
}
