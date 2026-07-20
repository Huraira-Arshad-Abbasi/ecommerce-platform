import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/auth";

const protectedRoutes = ["/cart", "/checkout"];
const adminRoutes = ["/admin"];
const authRoutes = ["/login", "/register"];

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const session = request.cookies.get("session")?.value;
  const payload = await decrypt(session);

  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));
  const isAdminRoute = adminRoutes.some((route) => path.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => path.startsWith(route));

  // Protected routes require any authenticated user
  if (isProtectedRoute && !payload) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }

  // Admin routes require admin role
  if (isAdminRoute && !payload) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }
  if (isAdminRoute && payload && payload.role !== "admin") {
    return NextResponse.redirect(new URL("/", request.nextUrl));
  }

  // Auth routes redirect to home if already logged in
  if (isAuthRoute && payload) {
    return NextResponse.redirect(new URL("/", request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
