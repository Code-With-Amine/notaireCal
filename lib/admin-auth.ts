import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || "dev-insecure-secret-change-me",
);

export const ADMIN_COOKIE = "daribati_admin";

export async function signAdminToken(email: string) {
  return await new SignJWT({ email, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);
}

export async function verifyAdminToken(token: string): Promise<{ email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== "admin" || typeof payload.email !== "string") return null;
    return { email: payload.email };
  } catch {
    return null;
  }
}
