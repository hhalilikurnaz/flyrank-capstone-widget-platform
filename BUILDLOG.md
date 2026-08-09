# Build Log — AI usage

Honest record of where AI (Claude, via Claude Code) helped, where it was wrong, and what changed. Written as each phase shipped, not rewritten after the fact.

## Faz 0–1 — Repo skeleton & design

- **AI helped:** scaffolding repo structure, `.gitignore`, `LICENSE`, `capstone.yaml`, `EVIDENCE.md` checklist, and the initial `DESIGN.md` (data model, request paths, API contract table) based on the capstone brief.
- **Human decisions:** stack choice (Node/Express/TS backend, React/Vite/Tailwind frontend, Postgres/Prisma, monorepo layout), commit phasing/order, `dev` branch workflow.
- **Corrections made:** none yet at this stage.

## Faz 2 — Backend foundation (auth, widgets, embed snippet)

- **AI helped:** Express + TS scaffold, Zod-validated env config, the layered module structure (`schema → repository → service → routes`), Prisma schema, JWT auth, tenant-scoped widget CRUD.
- **Human decisions:** the `updateMany`/`deleteMany` with a compound `(id, tenantId)` where-clause pattern for tenant isolation (404 instead of 403, so existence isn't leaked) was an explicit choice, not a default AI suggestion — confirmed as the right call since it's the same trick used for the submission/dashboard queries later.
- **Corrections made:** every endpoint in this phase was hand-verified with live `curl` against the running server before moving on (register/login error codes, tenant-isolation 404s, invalid-payload 400s) — nothing here shipped on the strength of "the code looks right."

## Faz 3 — The hardened submission path

- **AI helped:** the full pipeline (validation → honeypot → rate limit → geo enrichment → store → email side effect), the `GeoProvider` interface with real (ip-api.com/ipapi.co) and deterministic mock implementations, the rate limiter split (per-IP via `express-rate-limit` + a custom per-widget sliding window).
- **Bugs found and fixed during this phase, all via live testing, not code review:**
  1. **Logger field collision.** `logger.warn(msg, { message: err.message })` silently overwrote the intended log message because the fields object was spread *after* the explicit params. Every warning log in the app was printing the wrong message until this was caught by actually reading `/tmp/backend.log` output rather than assuming the log call was fine. Fixed by spreading fields first, explicit params last.
  2. **`trust proxy: true`.** `express-rate-limit` itself threw a validation error at runtime (`ERR_ERL_PERMISSIVE_TRUST_PROXY`) once the automated test suite exercised it — trusting the entire `X-Forwarded-For` chain lets a client spoof its way around per-IP rate limiting. Narrowed to `trust proxy: 1` (one hop).
- **Human decisions:** honeypot spam is "silently dropped" (fake `201`, `id: null`, nothing written) rather than rejected with an error, so a bot gets no signal to adapt to.

## Faz 4 — Widget SDK, delivery, dashboard

- **AI helped:** the vanilla-JS embed script (esbuild IIFE bundle), cached delivery routes, the dashboard aggregation queries.
- **Bugs found and fixed, both via a real headless browser (Playwright), not curl:**
  1. **Success message hidden with the form.** The confirmation `<div>` was a child of the `<form>` the widget hides on successful submit — so a real visitor who submitted successfully saw nothing. Curl testing (which only checks HTTP status/body) could never have caught this; it took loading the actual page in a browser and looking at the screenshot. Moved the message to be a sibling of the form.
  2. **Blanket CORS mount hijacked unrelated preflights.** `app.use(publicCors, deliveryRouter)` had no path argument, so it ran for *every* request in the app — including `OPTIONS` preflight for `PATCH /api/widgets/:id` from the dashboard, which it answered with its own restricted `GET/POST/OPTIONS` methods list before the request ever reached the router that actually owned that route. This is invisible to `curl` (which never sends real preflight) and only surfaced once the dashboard's "Save changes" button was clicked in a real browser and the request hung on a CORS error in the console. Fixed by moving the public config route into `widgetsRouter` itself (registered, with its own per-route CORS, before the auth middleware) and applying CORS per-route everywhere instead of as a blanket router-level mount. Two regression tests were added specifically so this class of bug can't come back silently.
- **Takeaway carried into every later phase:** curl/Vitest verify status codes and payloads; only a real browser catches CORS preflight bugs and DOM-visibility bugs. Both bug classes above were caught *because* a headless-browser pass was run after each frontend-adjacent change, not skipped as "probably fine."

## Faz 5 — Automated tests

- **AI helped:** the Vitest + Supertest suite (22 tests across submissions/widgets/delivery/enrichment), mocking the geo providers and `transporter.sendMail` for determinism per DESIGN.md's testing constraint.
- **Corrections made:** the submission tests initially called the *real* `enrichIp` (hitting ip-api.com/ipapi.co over the network) — functionally correct (enrichment degrades gracefully either way) but slow (~9s) and network-dependent, which conflicts with "mock the geo providers in tests." Mocked `enrichIp` for that file, dropping runtime to ~3s. Also found and fixed a broken `lint` script — `eslint` was referenced in `package.json` but never installed, so `npm run lint` always failed with `command not found`.

## Faz 6 — React dashboard frontend

- **AI helped:** the full frontend (auth context, protected routes, widget CRUD UI with a dynamic field builder, the analytics dashboard). For the charts, followed the project's `dataviz` skill: single sequential hue for the one-series time chart, categorical order for the per-widget/geo bar lists, a real hover crosshair + tooltip, tabular-nums on all numeric values — and dropped the initially-installed `recharts` dependency in favor of a small hand-written SVG chart once it was clear the actual requirement (one line chart, two bar lists) didn't need a charting library.
- **Human decisions:** kept the dashboard light-mode-only rather than shipping a half-implemented dark mode.
- **Corrections made:** a label-truncation issue (`w-28` too narrow for widget titles like "Newsletter signup") was caught in the first dashboard screenshot and widened before committing.

## General note on verification discipline

Every commit in this repo's history was preceded by actually running the thing — `curl` against the live server, `npm run test`, `tsc --noEmit`, or a headless-browser (Playwright) pass with a screenshot actually looked at — not just written and assumed correct. Three real bugs (logger field collision, hidden success message, blanket-CORS preflight hijack) were only found this way; none would have been caught by reading the code a second time.
