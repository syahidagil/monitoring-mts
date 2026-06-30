import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ROLE_HOME: Record<string, string> = {
  ADMIN: "/admin/dashboard",
  GURU: "/guru/dashboard",
  ORANGTUA: "/orangtua/dashboard",
};

export default auth((req: NextRequest & { auth?: any }) => {
  const { pathname } = req.nextUrl;
  const role = (req as any).auth?.user?.role as string | undefined;

  if (pathname === "/login" && role) {
    return NextResponse.redirect(
      new URL(ROLE_HOME[role] ?? "/", req.url)
    );
  }

  const protectedPrefixes: Record<string, string> = {
    "/admin": "ADMIN",
    "/guru": "GURU",
    "/orangtua": "ORANGTUA",
  };

  for (const [prefix, requiredRole] of Object.entries(protectedPrefixes)) {
    if (pathname.startsWith(prefix)) {
      if (!role) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
      if (role !== requiredRole) {
        return NextResponse.redirect(
          new URL(ROLE_HOME[role] ?? "/login", req.url)
        );
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/login", "/admin/:path*", "/guru/:path*", "/orangtua/:path*"],
};