import { NextResponse } from "next/server";
import { NOTAIRE_COOKIE } from "@/lib/notaire-auth";

export const runtime = "nodejs";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(NOTAIRE_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
