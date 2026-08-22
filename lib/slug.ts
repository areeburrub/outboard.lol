export const RESERVED_SLUGS = [
  "www",
  "app",
  "api",
  "admin",
  "dashboard",
  "mail",
  "status",
  "docs",
  "help",
  "cdn",
  "static",
] as const;

export function sanitizeSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .slice(0, 32);
}

export function normalizeSlug(value: string) {
  return sanitizeSlug(value).replace(/^-+|-+$/g, "");
}

export function isReservedSlug(slug: string) {
  return (RESERVED_SLUGS as readonly string[]).includes(slug);
}

export function slugError(slug: string) {
  if (!slug) {
    return "Pick a name for your board.";
  }

  if (slug.length < 4) {
    return "Use at least 4 characters.";
  }

  if (isReservedSlug(slug)) {
    return "That name is reserved.";
  }

  return null;
}
