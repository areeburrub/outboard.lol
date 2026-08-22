import { isReservedSlug, normalizeSlug } from "@/lib/slug";

export function rootDomain() {
  return (
    process.env.NEXT_PUBLIC_ROOT_DOMAIN?.trim() ||
    (process.env.NODE_ENV === "production" ? "outboard.lol" : "localhost:3000")
  );
}

export function isApexHost(host: string) {
  const root = rootDomain().toLowerCase();
  const h = host.toLowerCase().split(":")[0] ?? host;
  const rootHost = root.split(":")[0] ?? root;
  return h === rootHost || h === `www.${rootHost}` || h === "localhost";
}

/** Extract tenant slug from Host, or null if apex/reserved/invalid. */
export function tenantSlugFromHost(host: string): string | null {
  const root = rootDomain().toLowerCase();
  const rootHost = root.split(":")[0] ?? root;
  const hostname = host.toLowerCase().split(":")[0] ?? host;

  if (
    hostname === rootHost ||
    hostname === `www.${rootHost}` ||
    hostname === "localhost"
  ) {
    return null;
  }

  // slug.localhost or slug.outboard.lol
  const suffix =
    hostname.endsWith(".localhost") || hostname === "localhost"
      ? ".localhost"
      : `.${rootHost}`;

  if (!hostname.endsWith(suffix) && hostname !== rootHost) {
    // Also support slug.localhost when root is localhost:3000
    if (hostname.endsWith(".localhost")) {
      const slug = normalizeSlug(hostname.slice(0, -".localhost".length));
      if (!slug || isReservedSlug(slug)) {
        return null;
      }
      return slug;
    }
    return null;
  }

  const raw = hostname.slice(0, -suffix.length);
  if (!raw || raw.includes(".")) {
    return null;
  }

  const slug = normalizeSlug(raw);
  if (!slug || isReservedSlug(slug)) {
    return null;
  }

  return slug;
}

export function publicBoardUrl(slug: string, path = "") {
  const root = rootDomain();
  const rootHost = root.split(":")[0] ?? root;
  const port = root.includes(":") ? `:${root.split(":")[1]}` : "";
  const protocol =
    rootHost === "localhost" || root.includes("localhost") ? "http" : "https";
  const cleanPath = path.startsWith("/") ? path : path ? `/${path}` : "";
  return `${protocol}://${slug}.${rootHost}${port}${cleanPath}`;
}

export function apexUrl(path = "") {
  const root = rootDomain();
  const rootHost = root.split(":")[0] ?? root;
  const port = root.includes(":") ? `:${root.split(":")[1]}` : "";
  const protocol =
    rootHost === "localhost" || root.includes("localhost") ? "http" : "https";
  const cleanPath = path.startsWith("/") ? path : path ? `/${path}` : "";
  return `${protocol}://${rootHost}${port}${cleanPath}`;
}

export function operatorWebhookUrl(boardId: string) {
  return `${apexUrl()}/api/webhooks/dodo/${boardId}`;
}
