import { NextRequest, NextResponse } from "next/server";
import { requireDb } from "@/lib/db";
import { randomBytes } from "node:crypto";
import { verifyNotaireToken, NOTAIRE_COOKIE } from "@/lib/notaire-auth";

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
  let body: { titleNumber?: string; cnpNumber?: string; cin?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const titleNumber = (body.titleNumber || "").trim();
  const cnpNumber = (body.cnpNumber || "").trim();
  const cin = (body.cin || "").trim().toUpperCase();

  if (!titleNumber) {
    return NextResponse.json({ ok: false, error: "Le numéro du titre foncier est obligatoire." }, { status: 400 });
  }
  if (!cin) {
    return NextResponse.json({ ok: false, error: "Le CIN est obligatoire." }, { status: 400 });
  }

  // Require notaire authentication
  const token = req.cookies.get(NOTAIRE_COOKIE)?.value;
  const notaire = token ? await verifyNotaireToken(token) : null;
  if (!notaire) {
    return NextResponse.json({ ok: false, error: "Authentification notaire requise." }, { status: 401 });
  }

  const sql = requireDb();
  const reference = generateReference();
  const citizenToken = randomBytes(32).toString("hex");

  const notaireRows = await sql`SELECT full_name, study_name, email, cin FROM notaire_profiles WHERE id = ${notaire.id}`;
  if (notaireRows.length === 0) {
    return NextResponse.json({ ok: false, error: "Compte notaire introuvable." }, { status: 404 });
  }
  const notaireInfo = notaireRows[0];

  // Verify CIN matches the notaire's account
  if (notaireInfo.cin !== cin) {
    return NextResponse.json({ ok: false, error: "Le CIN ne correspond pas à votre compte." }, { status: 400 });
  }

  try {
    await sql`
      INSERT INTO consultation_requests (reference, title_number, cnp_number, email, status, citizen_token, notaire_id)
      VALUES (${reference}, ${titleNumber}, ${cnpNumber || null}, ${notaireInfo.email}, 'Nouvelle', ${citizenToken}, ${notaire.id})
    `;
    await sql`
      INSERT INTO consultation_audit_log (request_id, action, actor_email, new_status, details)
      SELECT id, 'submitted', ${notaireInfo.email}, 'Nouvelle', ${`Soumis par ${notaireInfo.full_name}`}
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
    notaire: notaireInfo.full_name,
  });
}

