# Embeddable Widget & Lead-Capture Platform

> FlyRank Internship · Backend Track · Capstone

Let a customer define a widget, hand them one line of `<script>`, and safely catch everything the public internet throws back — validated, spam-filtered, rate-limited, enriched, and dashboarded.

**Status:** ✅ Ships — every core Definition-of-Done item is implemented and verified. See [EVIDENCE.md](./EVIDENCE.md) for proof, [DESIGN.md](./DESIGN.md) for the full architecture writeup, and [BUILDLOG.md](./BUILDLOG.md) for the AI-usage log.

## What this is

A customer registers, designs a widget (signup form / CTA / popover), and gets back a one-line `<script>` tag. They paste it into any website — one we don't control, running on a different origin. Visitors who fill out the widget hit a public API that has to survive the open internet: malformed input, floods, bots, and dead dependencies, without ever losing a legitimate submission.

## Stack

- **Backend:** Node.js + Express + TypeScript, Prisma + PostgreSQL, Zod validation, JWT auth, Vitest + Supertest
- **Frontend:** React 19 + Vite + TypeScript + Tailwind CSS v4, react-router
- **Infra:** Docker Compose (Postgres, Mailpit), free no-key geo providers (ip-api.com, ipapi.co) — nothing in this stack requires a credit card or an API key

## Architecture

Three independent request paths, kept deliberately separate — the owner manages widgets, a customer site loads the script, a visitor submits the form:

```
Widget Owner (authenticated, React dashboard)
  └─► /api/auth, /api/widgets, /api/dashboard  ─► Postgres (tenant-isolated)
                                                      │
                                                      ▼
                                              embed snippet
                                        <script src=".../widget.v1.js?id=...">

Customer Website (any origin — e.g. customer-site/index.html on :5500)
  └─ loads the snippet
      └─► GET /widget.v1.js               (public · immutable cache)
      └─► GET /api/widgets/:id/config      (public · CORS * · 60s cache)
          └─► widget SDK renders the form in the page

Website Visitor (anonymous, any origin)
  └─► POST /api/submissions   (public · CORS *, preflight handled)
        ├─► Zod validation against the widget's own field config → 400 on bad input
        ├─► honeypot check                 → filled? 201-shaped response, nothing stored
        ├─► rate limit (per IP + per widget) → over limit? 429, service stays up
        ├─► geo enrichment: ip-api.com ─(fails)─► ipapi.co ─(fails)─► store without geo
        ├─► store submission (Postgres)
        └─► confirmation email to the owner (Mailpit) — failure is caught & logged,
            never blocks the response
```

Backend layout (`backend/src/modules/*`): each of `auth`, `widgets`, `submissions`, `enrichment`, `notifications`, `delivery`, `dashboard` is `schema.ts` (Zod) → `repository.ts` (Prisma) → `service.ts` (business logic) → `routes.ts` (Express), so swapping the DB or a geo provider never touches an HTTP handler. Full data model and API contract table: [DESIGN.md](./DESIGN.md).

## Setup

Requires Docker and Node 20+.

```bash
git clone <this-repo> && cd flyrank-capstone-widget-platform
docker compose up -d                        # Postgres :5432, Mailpit :1025/:8025
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
npm install                                  # installs all workspaces
npm run --workspace backend prisma:migrate   # applies the schema
npm run --workspace backend seed             # demo tenant + 2 widgets + 18 submissions
npm run dev:backend                          # http://localhost:4000
npm run dev:frontend                         # http://localhost:5173 (separate terminal)
npm run dev:customer-site                    # http://localhost:5500 (separate terminal, optional)
```

Log in to the dashboard at `http://localhost:5173/login` with the seeded demo account:

```
demo@widget-platform.local / demo12345
```

To see the widget render on a page this API doesn't own, open `http://localhost:5500`, paste a widget id from the dashboard (or `00000000-0000-0000-0000-000000000001` from the seed data) into the demo control panel, and click **Load widget**.

### Tests

```bash
npm run test --workspace backend     # Vitest + Supertest, 22 tests
npm run lint --workspace backend     # ESLint
npm run lint --workspace frontend    # oxlint
```

The suite mocks the geo providers (deterministic, no network) but runs everything else — validation, CORS, rate limiting, honeypot, side-effect resilience, tenant isolation, delivery caching — against the real Postgres from `docker compose up`. `npm test` also rebuilds the widget SDK bundle first (`pretest` hook) so the delivery tests have a real file to serve.

## API surface

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/api/auth/register`, `/api/auth/login` | none | returns `{ tenant, token }` |
| GET/POST | `/api/widgets` | Bearer | list/create, tenant-scoped |
| GET/PATCH/DELETE | `/api/widgets/:id` | Bearer | 404 (not 403) if not owned |
| GET | `/api/widgets/:id/embed` | Bearer | returns the `<script>` snippet |
| GET | `/api/widgets/:id/config` | none | public, CORS `*`, 60s cache |
| GET | `/widget.js`, `/widget.:version.js` | none | public, immutable cache |
| POST | `/api/submissions` | none | public, CORS `*`, the hardened path |
| GET | `/api/dashboard/stats\|geo-breakdown\|submissions` | Bearer | tenant-scoped analytics |

Full request/response shapes live in each module's `schema.ts` (Zod is the source of truth).

## Honest limitations

- **Rate limiting is in-memory, single-process.** Fine for one instance; a real multi-instance deployment needs a shared store (Redis) behind `express-rate-limit` and the per-widget counter in `middleware/rateLimiter.ts`.
- **No real hosting/CDN/domain**, by design — see [DESIGN.md](./DESIGN.md)'s non-goal. Everything runs locally via Docker Compose.
- **Dev and test share one Postgres database.** Simple and matches the `$0 stack`, but running the test suite repeatedly does add rows (unique `@example.test` tenant emails per run) — a production setup would point `NODE_ENV=test` at a separate `DATABASE_URL`.
- **Automated tests don't drive a real browser.** Widget rendering and the full dashboard UI flows were verified with real headless-browser runs during development (screenshots + zero console errors — see [EVIDENCE.md](./EVIDENCE.md)), but that isn't wired into `npm test` since a browser engine isn't a safe assumption for an arbitrary evaluator machine.
- **Geo enrichment on `localhost`/private IPs returns nothing** (both providers correctly refuse to geolocate private ranges) — the fallback-to-null-geo path is exactly what fires, which is itself proof the degrade-gracefully behavior works; enrichment of a real public IP is verified in EVIDENCE.md.

## Repo layout

```
backend/          Express + TS API, Prisma schema, widget SDK source, tests
frontend/         React + Vite dashboard
customer-site/    Plain HTML page — the "site we don't control", a second origin
docker-compose.yml Postgres + Mailpit
DESIGN.md          Data model, API contracts, non-goal
EVIDENCE.md         Proof per Definition-of-Done checkbox
BUILDLOG.md         AI-usage log
capstone.yaml       Evaluator manifest
```

## License

MIT — see [LICENSE](./LICENSE).
