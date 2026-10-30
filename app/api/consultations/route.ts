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
  const submittedAt = new Date().toLocaleString("fr-FR");

  try {
    await sql`
      INSERT INTO consultation_requests (reference, title_number, cnp_number, email, status)
      VALUES (${reference}, ${titleNumber}, ${cnpNumber || null}, ${email}, 'pending')
    `;
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Échec de l'enregistrement." }, { status: 500 });
  }

  // Send EmailJS notification server-side using the private key.
  const serviceId = process.env.EMAILJS_SERVICE_ID || process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID || "template_40rn1ny";
  const publicKey = process.env.EMAILJS_PUBLIC_KEY || process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "isBMzeDWTTJ_OkQjE";
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (serviceId && privateKey) {
    try {
      await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: serviceId,
          template_id: templateId,
          user_id: publicKey,
          accessToken: privateKey,
          template_params: {
            reference,
            title_number: titleNumber,
            cnp_number: cnpNumber || "—",
            email,
            submitted_at: submittedAt,
            status: "pending",
          },
        }),
      });
    } catch {
      // Email failure must not invalidate the saved request, but we report it.
      return NextResponse.json({ ok: true, reference, emailSent: false });
    }
  }

  return NextResponse.json({ ok: true, reference, emailSent: true });
}
