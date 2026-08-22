# outboard.lol

Hosted pay-to-rank boards. An operator claims a slug, pastes a Dodo Payments API key, and gets a public board at `{slug}.outboard.lol`. Visitors bid whole USD for rank. The operator keeps 100% of bids. After a board’s bids total $10, they pay a flat $10 to keep it live.

Apex (`outboard.lol` / localhost) is marketing + the operator dashboard. Tenant hosts are public boards only. Bidders do not create accounts.

Product rules and decisions live in [`PLANNING.md`](./PLANNING.md). Visual language is in [`DESIGN.md`](./DESIGN.md).

## Stack

Next.js 16, React 19, Tailwind 4, Clerk, Drizzle + Postgres, Dodo Payments. Package manager is Bun.

## Local setup

Needs Docker (Postgres), Bun, a [Clerk](https://clerk.com) development app, and a [Dodo](https://dodopayments.com) test API key if you want checkout to work.

```bash
bun install
cp .env.example .env.local
bun db:up
```

Fill `.env.local` (see below), then:

```bash
bun db:migrate
bun run dev
```

Apex: [http://localhost:3000](http://localhost:3000)

A claimed board: `http://{slug}.localhost:3000` (Chrome/Firefox resolve `*.localhost` without extra DNS).

Clerk and Dodo webhooks need a public URL in local (ngrok, Cloudflare Tunnel, or Clerk’s local forwarding). Point them at:

- Clerk: `/api/webhooks/clerk` (`user.created`, `user.updated`, `user.deleted`)
- Platform Dodo (flat $10 fee): `/api/webhooks/dodo/platform`
- Operator bid webhooks are created automatically when they connect a key (`/api/webhooks/dodo/{boardId}`)

## Environment

| Variable | Local | Vercel production |
| --- | --- | --- |
| `NEXT_PUBLIC_CLERK_*` / `CLERK_*` | Clerk development keys | Clerk production keys. Add `outboard.lol` as an allowed domain. |
| `DATABASE_URL` | `postgresql://outboard:outboard@localhost:5437/outboard_lol` (from `bun db:up`) | Hosted Postgres (Neon, Supabase, Vercel Postgres). Required at **build** time because `bun run build` runs migrations first. |
| `CREDENTIALS_ENCRYPTION_KEY` | 64-char hex (`openssl rand -hex 32`) | Same format. Changing it invalidates stored operator Dodo keys. |
| `NEXT_PUBLIC_ROOT_DOMAIN` | `localhost:3000` | `outboard.lol` — do not ship the localhost value. Checkout returns and operator webhook URLs are built from this. |
| `DODO_PAYMENTS_API_KEY` | Test key | Live key. `NODE_ENV` is `production` on every Vercel deploy, so Dodo always runs in live mode there. |
| `DODO_WEBHOOK_SECRET` | Platform webhook signing secret | Same, for `/api/webhooks/dodo/platform`. |
| `DODO_PLATFORM_PRODUCT_ID` | Test product for the $10 fee | Live product. |

Optional: `NEXT_PUBLIC_APP_URL` for canonical metadata. If unset on Vercel, the app uses `VERCEL_PROJECT_PRODUCTION_URL` or `https://outboard.lol`.

## Scripts

| Script | What it does |
| --- | --- |
| `bun run dev` | Next.js dev server |
| `bun run build` | `drizzle-kit migrate` then `next build` |
| `bun db:up` / `bun db:down` | Local Postgres 17 on port **5437** |
| `bun db:generate` | New Drizzle migration from `lib/db/schema.ts` |
| `bun db:migrate` | Apply migrations |
| `bun db:studio` | Drizzle Studio |
| `bun brand:images` | Puppeteer screenshots into `public/` (local Chrome; not used on Vercel) |

## Deploy on Vercel

One project. Shared Postgres. Wildcard subdomains.

1. Hosted `DATABASE_URL` on the project (Production + Preview). Local Docker is not reachable from Vercel.
2. Set the env table above. `NEXT_PUBLIC_ROOT_DOMAIN` must be `outboard.lol`.
3. Point `outboard.lol` nameservers at Vercel (`ns1.vercel-dns.com`, `ns2.vercel-dns.com`), then add `outboard.lol`, `www.outboard.lol`, and `*.outboard.lol`. Wildcard TLS only works with Vercel nameservers.
4. Clerk production instance: allowed domain `outboard.lol`, webhook → `https://outboard.lol/api/webhooks/clerk`.
5. Platform Dodo webhook → `https://outboard.lol/api/webhooks/dodo/platform`.

Preview URLs (`*.vercel.app`) serve the apex app only. Tenant boards exist on `*.outboard.lol`.

`bun run build` migrates the database that `DATABASE_URL` points at. Give Preview a separate database if you do not want preview deploys touching production.

## How tenancy works

`proxy.ts` reads `Host`. Apex stays on marketing/dashboard routes. `{slug}.outboard.lol` (or `{slug}.localhost:3000`) is rewritten to `/b/{slug}`. Reserved hosts are never boards: `www`, `app`, `api`, `admin`, `dashboard`, `mail`, `status`, `docs`, `help`, `cdn`, `static`.
