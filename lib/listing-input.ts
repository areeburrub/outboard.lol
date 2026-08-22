/**
 * Normalize product website URLs into a stable canonical key.
 * Strips affiliate/tracking params; rejects chat/invite links and shorteners.
 */

const TRACKING_PARAMS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_id",
  "gclid",
  "fbclid",
  "msclkid",
  "ref",
  "ref_src",
  "mc_cid",
  "mc_eid",
]);

const FORBIDDEN_HOSTS = new Set([
  "t.me",
  "telegram.me",
  "discord.gg",
  "discord.com",
  "wa.me",
  "chat.whatsapp.com",
  "bit.ly",
  "t.co",
  "tinyurl.com",
  "goo.gl",
  "ow.ly",
]);

export type ParsedListing =
  | { ok: true; kind: "url"; canonicalKey: string; displayUrl: string }
  | { ok: true; kind: "handle"; canonicalKey: string; displayUrl: string }
  | { ok: false; error: string };

function stripTracking(url: URL) {
  for (const key of [...url.searchParams.keys()]) {
    if (TRACKING_PARAMS.has(key.toLowerCase()) || key.toLowerCase().startsWith("utm_")) {
      url.searchParams.delete(key);
    }
  }
}

export function parseListingInput(raw: string): ParsedListing {
  const value = raw.trim();
  if (!value) {
    return { ok: false, error: "Enter a website URL." };
  }

  if (value.startsWith("@")) {
    return { ok: false, error: "Websites only. Paste a URL, not an @handle." };
  }

  let urlString = value;
  if (!/^https?:\/\//i.test(urlString)) {
    urlString = `https://${urlString}`;
  }

  let url: URL;
  try {
    url = new URL(urlString);
  } catch {
    return { ok: false, error: "Invalid URL." };
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { ok: false, error: "Only http(s) URLs are allowed." };
  }

  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  if (FORBIDDEN_HOSTS.has(host) || FORBIDDEN_HOSTS.has(url.hostname.toLowerCase())) {
    return { ok: false, error: "That link type is not allowed." };
  }

  stripTracking(url);
  url.hash = "";

  // Key by host + path (App Store / Play / GitHub collide on path)
  const path = url.pathname.replace(/\/+$/, "") || "";
  const search = url.searchParams.toString();
  const canonicalKey = `${host}${path}${search ? `?${search}` : ""}`.toLowerCase();
  const displayUrl = url.toString().replace(/\/$/, "");

  return { ok: true, kind: "url", canonicalKey, displayUrl };
}
