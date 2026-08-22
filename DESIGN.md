# Outboard.lol — Design language

Living visual source of truth. Inspired by **outbid.lol**: bold type, generous padding, high contrast, and a scoreboard that reads in one glance. We borrow the *feel* (clarity, weight, breathing room), not a pixel clone. Marketing surfaces stay light; tenant boards can go darker later.

---

## North star

Read like a public scoreboard, not a SaaS dashboard.

- One idea per section.
- Rank and money are the loudest signals.
- Padding and type size do the hierarchy — not cards, chips, or glow.
- Motion is quiet: enter, hover, settle. Never confetti, never perpetual bounce.

---

## Inspiration takeaways (from outbid.lol)

| Trait | How we use it |
| --- | --- |
| Bold, easy-to-scan type | Heavy display for brand + headlines; big numbers for ranks and `$` |
| Generous padding | Wide gutters, tall row/section rhythm; never cramped chrome |
| High contrast | Near-black ink on soft paper; muted secondary text only |
| Radical simplicity | Sparse nav, few CTAs, no feature grids stuffed with icons |
| Scoreboard metaphor | Leaderboard rows as the product visual — not abstract illustrations |

---

## Brand

- **Name:** outboard (lowercase in wordmark; `outboard.lol` in URLs and footer)
- **Promise:** Anyone can spin up a branded pay-to-rank board in seconds.
- **Voice:** Direct, dry, a little competitive. Short sentences. No hype adjectives.

Brand must win the first viewport. If you strip the nav and the page could belong to another product, the branding is too weak.

---

## Color

Light marketing default (avoid purple, cream/terracotta, neon lime, and default “AI dark mode”).

| Token | Value | Use |
| --- | --- | --- |
| `--ob-paper` | `#F5F7FA` | Page background |
| `--ob-ink` | `#12141A` | Primary text, logos, primary buttons |
| `--ob-mute` | `#667085` | Supporting copy |
| `--ob-line` | `#E4E7EC` | Hairlines, row dividers |
| `--ob-surface` | `#FFFFFF` | Elevated panels (board preview) |
| `--ob-win` | `#0D9488` | Accent — #1, live badge, secondary CTAs |
| `--ob-win-ink` | `#FFFFFF` | Text on accent |
| `--ob-win-soft` | `#CCFBF1` | Soft wash behind #1 row |

Atmosphere: cool blue-gray paper, soft teal wash at the top, faint dot grid. No multi-layer shadows, no glow blobs.

---

## Typography

Clean and readable. One family for UI + display. Do not use Inter, Roboto, Arial, or quirky display faces.

| Role | Family | Notes |
| --- | --- | --- |
| Display / body | **Plus Jakarta Sans** (400–800) | Brand, headlines, body, buttons — one clean grotesque |
| Figures | **JetBrains Mono** (500–700) | Ranks, bids, `$` amounts, slugs only |

### Scale (desktop → mobile)

| Step | Desktop | Mobile | Use |
| --- | --- | --- | --- |
| Brand | `clamp(3rem, 8vw, 5.5rem)` | ~3rem | Wordmark in hero |
| H1 | `clamp(2.25rem, 5vw, 3.75rem)` | ~2.25rem | Hero headline |
| H2 | `clamp(1.75rem, 3vw, 2.5rem)` | ~1.75rem | Section titles |
| Lead | `1.25rem` / `1.75` lh | `1.125rem` | Hero support |
| Body | `1.0625rem` / `1.7` lh | `1rem` | Paragraphs |
| Meta | `0.8125rem` | — | Nav, captions, footers |
| Bid | `1.125–1.5rem` mono | — | Money figures |

Tracking: headlines slightly tight (`-0.02em` to `-0.03em`). Body normal. Never uppercase walls of text except tiny labels.

---

## Layout & spacing

- Content width: `min(1120px, 100% - 3rem)` on marketing; board preview can go slightly wider.
- Section vertical rhythm: `py-24` / `py-32` desktop; `py-16` / `py-20` mobile.
- Hero: one composition — brand, one headline, one support line, one CTA group, one product visual (live-feeling board).
- No cards in the hero. Cards only if they wrap a real interaction.
- Row padding in board UI: at least `1rem 1.25rem`; rank column fixed and loud.
- Prefer lists and rules over boxed grids.

---

## Motion

Subtle only. Prefer CSS (`@keyframes` / `tw-animate-css`). Respect `prefers-reduced-motion`.

1. **Hero entrance** — brand, copy, then board: fade + 12px rise, staggered ~80ms.
2. **Board rows** — stagger in; #1 row gets a soft accent wash.
3. **CTA** — 150ms background / translate on hover; `active` presses 1px.
4. Optional later: idle bid figure tick on #1 (paused when reduced-motion).

No scroll-jacking, no parallax stacks, no endless loaders as decoration.

---

## Components (marketing)

- **Primary button:** solid `--ob-ink`, white label, **fully rounded** (`rounded-full` on the button only), tall hit area (`h-12`+), generous horizontal padding.
- **Secondary button:** transparent + `--ob-line` border, ink text, same rounded-full shape.
- **Accent button** (on dark bands): `--ob-win` fill, white label, rounded-full.
- **Board / panels:** soft rect radius (`1rem`), never pill-shaped. Global `--radius` stays ~`1rem` so Tailwind radius tokens don’t inherit `9999px`.
- **Nav:** brand left, sparse links, one primary CTA right. Sticky optional with blur only if needed.
- **Board preview:** white surface, hairline border, rank | listing | bid columns; hover shows “claim for $X” affordance in mute text.
- **Footer:** quiet meta, monospace URLs, no icon rows.

---

## Do / don’t

**Do**

- Make `$` and rank sizes compete with headlines.
- Leave empty space; let the scoreboard breathe.
- Keep copy short enough to screenshot.

**Don’t**

- Purple gradients, glow, pill badge clusters, stat strips in the hero.
- Soft gray-on-gray body text.
- Dashboard chrome on the marketing page.
- Emoji as decoration.

---

## Surfaces covered by this doc

1. Apex landing (`outboard.lol`) — this language first.
2. Tenant board (`{slug}.outboard.lol`) — claim-first stepper, then stacked listing rows with favicon + description. Content width `max-w-4xl`. Same tokens and type scale.

---

## Decisions log

| Date | Decision |
| --- | --- |
| 2026-08-23 | Initial language: outbid-inspired bold scoreboard readability; light paper + ink + lime accent; Syne + DM Sans + JetBrains Mono; CSS-only subtle motion. |
| 2026-08-23 | Swap to Plus Jakarta Sans (clean); teal `#0D9488` accent; rounded-full buttons; softer blue-gray paper. |
| 2026-08-23 | Tenant board: claim-first amount stepper; listing rows show favicon, title, and meta description. |
