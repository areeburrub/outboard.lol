export const SITE_NAME = "outboard";
export const SITE_DOMAIN = "outboard.lol";
export const SITE_TAGLINE = "your own pay-to-rank board";
export const SITE_DESCRIPTION =
  "Spin up a branded pay-to-rank bidding portal in seconds. Visitors bid for rank. You keep 100% — 0% commission.";
export const OG_IMAGE_ALT =
  "outboard — your own pay-to-rank board. Visitors bid real USD for rank. You keep every dollar.";
export const OG_IMAGE_PATH = "/og.png";
export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;

export function getSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (explicit && !/localhost|127\.0\.0\.1/.test(explicit)) {
    return explicit;
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return `https://${SITE_DOMAIN}`;
}
