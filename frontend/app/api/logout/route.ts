// app/api/logout/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const cookieStore = await cookies();
  cookieStore.delete("access_token");

  return NextResponse.redirect(new URL("/signin", req.url));
}