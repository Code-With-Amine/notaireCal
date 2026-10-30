import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || "dev-insecure-secret-change-me",
);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect admin page and requests API.
  const protectedPath =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/admin/requests");

  if (!protectedPath) return NextResponse.next();

  const token = req.cookies.get("daribati_admin")?.value;
  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== "admin") throw new Error("bad role");
    return NextResponse.next();
  } catch {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    const res = NextResponse.redirect(new URL("/admin", req.url));
    res.cookies.set("daribati_admin", "", { path: "/", maxAge: 0 });
    return res;
  }
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/requests/:path*"],
};
