import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import {
  NextResponse,
  type NextFetchEvent,
  type NextRequest,
} from "next/server";

import { isReservedSlug, normalizeSlug } from "@/lib/slug";
import { isApexHost, rootDomain, tenantSlugFromHost } from "@/lib/tenant";

const isProtected = createRouteMatcher([
  "/overview(.*)",
  "/leaderboard(.*)",
  "/payments(.*)",
  "/settings(.*)",
  "/dashboard(.*)",
]);

const isClerkRoute = createRouteMatcher([
  "/overview(.*)",
  "/leaderboard(.*)",
  "/payments(.*)",
  "/settings(.*)",
  "/dashboard(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/sso-callback(.*)",
  "/api/webhooks/clerk(.*)",
]);

function reservedHostBlocked(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  const hostname = host.toLowerCase().split(":")[0] ?? "";
  const rootHost = rootDomain().toLowerCase().split(":")[0] ?? "outboard.lol";
  if (
    hostname.endsWith(`.${rootHost}`) ||
    hostname.endsWith(".localhost")
  ) {
    const maybe = hostname.endsWith(".localhost")
      ? hostname.slice(0, -".localhost".length)
      : hostname.slice(0, -(`.${rootHost}`.length));
    const candidate = normalizeSlug(maybe);
    if (candidate && isReservedSlug(candidate) && !isApexHost(host)) {
      return new NextResponse("Not found", { status: 404 });
    }
  }
  return null;
}

function tenantRewrite(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  const slug = tenantSlugFromHost(host);
  if (!slug) {
    return null;
  }

  const url = req.nextUrl.clone();
  if (url.pathname.startsWith(`/b/${slug}`) || url.pathname.startsWith("/b/")) {
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

function apexBoardRedirect(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  if (!isApexHost(host) || !req.nextUrl.pathname.startsWith("/b/")) {
    return null;
  }

  const parts = req.nextUrl.pathname.split("/");
  const boardSlug = parts[2];
  if (!boardSlug || isReservedSlug(boardSlug)) {
    return null;
  }

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
  return null;
}

const runClerk = clerkMiddleware(async (auth, req) => {
  if (isProtected(req)) {
    await auth.protect();
  }
});

export default function proxy(req: NextRequest, event: NextFetchEvent) {
  const blocked = reservedHostBlocked(req);
  if (blocked) {
    return blocked;
  }

  const rewritten = tenantRewrite(req);
  if (rewritten) {
    return rewritten;
  }

  const redirected = apexBoardRedirect(req);
  if (redirected) {
    return redirected;
  }

  if (isClerkRoute(req)) {
    return runClerk(req, event);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
