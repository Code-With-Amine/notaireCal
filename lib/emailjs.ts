import emailjs from "@emailjs/browser";

/**
 * EmailJS client-side integration.
 *
 * Only the PUBLIC key is used here. The private key must never be shipped to
 * the browser; it is reserved for a future server-side (Supabase Edge Function)
 * integration. Template variables must be configured in the EmailJS dashboard
 * to match the params sent below.
 */

export const EMAILJS_PUBLIC_KEY = "isBMzeDWTTJ_OkQjE";
export const EMAILJS_SERVICE_ID =
  process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "default_service";
export const EMAILJS_TEMPLATE_ID = "template_40rn1ny";

export interface CnpConsultationEmailParams {
  reference: string;
  titleNumber: string;
  cnpNumber: string;
  email: string;
  submittedAt: string;
  status: string;
}

export async function sendCnpConsultationEmail(
  params: CnpConsultationEmailParams,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        reference: params.reference,
        title_number: params.titleNumber,
        cnp_number: params.cnpNumber || "—",
        email: params.email,
        submitted_at: params.submittedAt,
        status: params.status,
      },
      { publicKey: EMAILJS_PUBLIC_KEY },
    );
    return { ok: true };
  } catch (error) {
    const message =
      error && typeof error === "object" && "text" in error
        ? String((error as { text: unknown }).text)
        : String(error);
    return { ok: false, error: message };
  }
}
