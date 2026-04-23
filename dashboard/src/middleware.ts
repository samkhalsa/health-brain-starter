import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  // Local dev: skip auth entirely if DEV_SKIP_AUTH=1
  if (process.env.DEV_SKIP_AUTH === "1") return NextResponse.next();

  const { pathname } = req.nextUrl;
  const publicPaths = ["/login", "/api/auth", "/api/cron"];
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }
  if (!req.auth) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
