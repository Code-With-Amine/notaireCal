import { NextRequest, NextResponse } from "next/server";
import { requireDb } from "@/lib/db";
import { randomBytes } from "node:crypto";

export const runtime = "nodejs";

function generateReference() {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate(),
  ).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}${String(
    now.getMinutes(),
  ).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;
  const rand = randomBytes(2).toString("hex").toUpperCase();
  return `TNB-${stamp}-${rand}`;
}

export async function POST(req: NextRequest) {
  let body: { titleNumber?: string; cnpNumber?: string; email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const titleNumber = (body.titleNumber || "").trim();
  const email = (body.email || "").trim();
  const cnpNumber = (body.cnpNumber || "").trim();

  if (!titleNumber) {
    return NextResponse.json({ ok: false, error: "Le numéro du titre foncier est obligatoire." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "L'adresse e-mail est invalide." }, { status: 400 });
  }

  const sql = requireDb();
  const reference = generateReference();
  const citizenToken = randomBytes(32).toString("hex");

  try {
    await sql`
      INSERT INTO consultation_requests (reference, title_number, cnp_number, email, status, citizen_token)
      VALUES (${reference}, ${titleNumber}, ${cnpNumber || null}, ${email}, 'Nouvelle', ${citizenToken})
    `;
    await sql`
      INSERT INTO consultation_audit_log (request_id, action, actor_email, new_status, details)
      SELECT id, 'submitted', ${email}, 'Nouvelle', 'Demande soumise par le citoyen'
      FROM consultation_requests WHERE reference = ${reference}
    `;
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Échec de l'enregistrement." }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    reference,
    citizenToken,
    accessUrl: `/consultation/${citizenToken}`,
  });
}
