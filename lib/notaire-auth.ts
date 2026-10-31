import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.NOTAIRE_JWT_SECRET || process.env.ADMIN_JWT_SECRET || "dev-insecure-secret-change-me",
);

export const NOTAIRE_COOKIE = "daribati_notaire";

export async function signNotaireToken(email: string, id: number) {
  return await new SignJWT({ email, id, role: "notaire" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);
}

export async function verifyNotaireToken(token: string): Promise<{ email: string; id: number } | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== "notaire" || typeof payload.email !== "string" || typeof payload.id !== "number") return null;
    return { email: payload.email, id: payload.id };
  } catch {
    return null;
  }
}
