import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/auth";

const protectedRoutes = ["/cart", "/checkout"];
const authRoutes = ["/login", "/register"];

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const session = request.cookies.get("session")?.value;
  const payload = await decrypt(session);

  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => path.startsWith(route));

  if (isProtectedRoute && !payload) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }

  if (isAuthRoute && payload) {
    return NextResponse.redirect(new URL("/", request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
