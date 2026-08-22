import type { ListingKind } from "@/lib/db/schema";

const FETCH_TIMEOUT_MS = 4500;
const MAX_HTML_BYTES = 400_000;
const TITLE_MAX = 120;
const DESCRIPTION_MAX = 240;

const PRIVATE_HOST =
  /^(localhost|127\.\d+\.\d+\.\d+|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|169\.254\.\d+\.\d+|0\.0\.0\.0|\[::1\]|::1)$/i;

export type ListingMeta = {
  title: string | null;
  description: string | null;
  faviconUrl: string | null;
};

export async function fetchListingMeta(input: {
  kind: ListingKind;
  displayUrl: string;
  canonicalKey: string;
}): Promise<ListingMeta> {
  if (input.kind === "handle") {
    const handle = input.canonicalKey.replace(/^@/, "");
    return {
      title: `@${handle}`,
      description: `X · @${handle}`,
      faviconUrl: `https://unavatar.io/x/${encodeURIComponent(handle)}`,
    };
  }

  const pageUrl = safeHttpUrl(input.displayUrl);
  if (!pageUrl) {
    return fallbackMeta(input.displayUrl, input.canonicalKey);
  }

  try {
    const html = await fetchHtml(pageUrl);
    if (!html) {
      return fallbackMeta(input.displayUrl, input.canonicalKey, pageUrl);
    }

    const title =
      cleanText(
        attr(html, "property", "og:title") ??
          attr(html, "name", "twitter:title") ??
          firstTag(html, "title"),
        TITLE_MAX,
      ) ?? hostLabel(pageUrl);

    const description = cleanText(
      attr(html, "name", "description") ??
        attr(html, "property", "og:description") ??
        attr(html, "name", "twitter:description"),
      DESCRIPTION_MAX,
    );

    const iconHref =
      iconFromHtml(html, "apple-touch-icon") ??
      iconFromHtml(html, "icon") ??
      iconFromHtml(html, "shortcut icon");

    const faviconUrl =
      resolveUrl(pageUrl, iconHref) ??
      originFavicon(pageUrl) ??
      googleFavicon(pageUrl.hostname);

    return { title, description, faviconUrl };
  } catch {
    return fallbackMeta(input.displayUrl, input.canonicalKey, pageUrl);
  }
}

function fallbackMeta(
  displayUrl: string,
  canonicalKey: string,
  pageUrl?: URL,
): ListingMeta {
  const host = pageUrl?.hostname ?? canonicalKey.split("/")[0] ?? displayUrl;
  return {
    title: hostLabel(pageUrl ?? host),
    description: null,
    faviconUrl: googleFavicon(host.replace(/^www\./, "")),
  };
}

function hostLabel(value: URL | string) {
  const host = typeof value === "string" ? value : value.hostname;
  return host.replace(/^www\./, "");
}

function googleFavicon(host: string) {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`;
}

function originFavicon(pageUrl: URL) {
  return `${pageUrl.origin}/favicon.ico`;
}

function safeHttpUrl(raw: string): URL | null {
  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }
    if (PRIVATE_HOST.test(url.hostname) || url.hostname.endsWith(".internal")) {
      return null;
    }
    return url;
  } catch {
    return null;
  }
}

async function fetchHtml(url: URL): Promise<string | null> {
  const res = await fetch(url, {
    redirect: "follow",
    headers: {
      Accept: "text/html,application/xhtml+xml",
      "User-Agent": "outboard.lol/1.0 (+https://outboard.lol)",
    },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (!res.ok) {
    return null;
  }

  const type = res.headers.get("content-type") ?? "";
  if (type && !type.includes("html") && !type.includes("text/plain")) {
    return null;
  }

  const finalUrl = safeHttpUrl(res.url);
  if (!finalUrl) {
    return null;
  }

  const reader = res.body?.getReader();
  if (!reader) {
    const text = await res.text();
    return text.slice(0, MAX_HTML_BYTES);
  }

  const chunks: Uint8Array[] = [];
  let size = 0;
  while (size < MAX_HTML_BYTES) {
    const { done, value } = await reader.read();
    if (done || !value) {
      break;
    }
    chunks.push(value);
    size += value.byteLength;
    if (size >= MAX_HTML_BYTES) {
      break;
    }
  }
  await reader.cancel().catch(() => undefined);
  return new TextDecoder("utf-8", { fatal: false }).decode(concat(chunks));
}

function concat(chunks: Uint8Array[]) {
  const total = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return out;
}

function firstTag(html: string, tag: string) {
  const match = html.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return match?.[1] ?? null;
}

function attr(html: string, key: "name" | "property", value: string) {
  const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(
      `<meta[^>]+${key}=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+${key}=["']${escaped}["'][^>]*>`,
      "i",
    ),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }
  return null;
}

function iconFromHtml(html: string, rel: string) {
  const escaped = rel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(
      `<link[^>]+rel=["'][^"']*${escaped}[^"']*["'][^>]+href=["']([^"']+)["'][^>]*>`,
      "i",
    ),
    new RegExp(
      `<link[^>]+href=["']([^"']+)["'][^>]+rel=["'][^"']*${escaped}[^"']*["'][^>]*>`,
      "i",
    ),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }
  return null;
}

function resolveUrl(base: URL, href: string | null) {
  if (!href) {
    return null;
  }
  try {
    const url = new URL(href, base);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

function cleanText(value: string | null | undefined, max: number) {
  if (!value) {
    return null;
  }
  const decoded = decodeEntities(value)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!decoded) {
    return null;
  }
  return decoded.length > max ? `${decoded.slice(0, max - 1).trim()}…` : decoded;
}

function decodeEntities(value: string) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => {
      const code = Number.parseInt(hex, 16);
      return Number.isFinite(code) ? String.fromCodePoint(code) : "";
    })
    .replace(/&#(\d+);/g, (_, dec: string) => {
      const code = Number.parseInt(dec, 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : "";
    });
}
