import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { isReservedSlug, normalizeSlug } from "@/lib/slug";
import { isApexHost, rootDomain, tenantSlugFromHost } from "@/lib/tenant";

const isProtected = createRouteMatcher([
  "/overview(.*)",
  "/leaderboard(.*)",
  "/payments(.*)",
  "/settings(.*)",
  "/dashboard(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const host = req.headers.get("host") ?? "";
  const slug = tenantSlugFromHost(host);

  // Reserved host like admin.outboard.lol
  const hostname = host.toLowerCase().split(":")[0] ?? "";
  const rootHost = rootDomain().toLowerCase().split(":")[0] ?? "outboard.lol";
  if (
    hostname.endsWith(`.${rootHost}`) ||
    hostname.endsWith(".localhost")
  ) {
    const maybe =
      hostname.endsWith(".localhost")
        ? hostname.slice(0, -".localhost".length)
        : hostname.slice(0, -(`.${rootHost}`.length));
    const candidate = normalizeSlug(maybe);
    if (candidate && isReservedSlug(candidate) && !isApexHost(host)) {
      return new NextResponse("Not found", { status: 404 });
    }
  }

  if (slug) {
    const url = req.nextUrl.clone();
    // Already rewritten under /b/
    if (url.pathname.startsWith(`/b/${slug}`)) {
      return NextResponse.next();
    }
    // Avoid double-wrapping
    if (url.pathname.startsWith("/b/")) {
      return NextResponse.next();
    }

    const path = url.pathname === "/" ? "" : url.pathname;
    url.pathname = `/b/${slug}${path}`;
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-tenant-slug", slug);
    return NextResponse.rewrite(url, {
      request: { headers: requestHeaders },
    });
  }

  // Apex: redirect accidental /b/:slug to subdomain in production
  if (isApexHost(host) && req.nextUrl.pathname.startsWith("/b/")) {
    const parts = req.nextUrl.pathname.split("/");
    const boardSlug = parts[2];
    if (boardSlug && !isReservedSlug(boardSlug)) {
      const rest = parts.slice(3).join("/");
      const dest = new URL(req.url);
      const root = rootDomain();
      const rootHostOnly = root.split(":")[0] ?? root;
      const port = root.includes(":") ? `:${root.split(":")[1]}` : "";
      const protocol =
        rootHostOnly === "localhost" ? "http:" : req.nextUrl.protocol;
      dest.host = `${boardSlug}.${rootHostOnly}${port}`;
      dest.pathname = rest ? `/${rest}` : "/";
      dest.protocol = protocol;
      if (process.env.NODE_ENV === "production") {
        return NextResponse.redirect(dest);
      }
    }
  }

  if (isProtected(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
