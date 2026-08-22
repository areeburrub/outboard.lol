import { normalizeSlug } from "@/lib/slug";

export const AFTER_AUTH_PATH = "/overview";
const CLAIM_SLUG_KEY = "ob-claim-slug";

export function parseClaimSlug(value?: string | string[] | null) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) {
    return undefined;
  }

  return normalizeSlug(raw) || undefined;
}

export function afterAuthPath(slug?: string | null) {
  if (!slug) {
    return AFTER_AUTH_PATH;
  }

  return `${AFTER_AUTH_PATH}?slug=${encodeURIComponent(slug)}`;
}

export function authPageHref(
  path: "/sign-in" | "/sign-up",
  slug?: string | null,
) {
  if (!slug) {
    return path;
  }

  return `${path}?slug=${encodeURIComponent(slug)}`;
}

export function persistClaimSlug(slug?: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (slug) {
    window.sessionStorage.setItem(CLAIM_SLUG_KEY, slug);
    return;
  }

  window.sessionStorage.removeItem(CLAIM_SLUG_KEY);
}

export function readClaimSlug() {
  if (typeof window === "undefined") {
    return undefined;
  }

  return window.sessionStorage.getItem(CLAIM_SLUG_KEY) || undefined;
}
