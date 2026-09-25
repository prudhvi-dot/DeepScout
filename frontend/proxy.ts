// proxy.ts (rename from middleware.ts, same location — project root)
import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PATHS = ["/chat"];
const AUTH_PATHS = ["/signin", "/signup"];

export function proxy(request: NextRequest) {  
  const token = request.cookies.get("access_token");
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));
  const isAuthPage = AUTH_PATHS.some((path) => pathname.startsWith(path));

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/chat", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/chat/:path*", "/signin", "/signup"],
};