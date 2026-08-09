# Evidence — Definition of Done

One proof per checkbox. Everything below was actually run against the live system during development (Postgres + Mailpit via `docker compose up`, backend on `:4000`) — not written from memory. Automated-test proofs reference `npm run test --workspace backend` (22/22 passing, Vitest + Supertest); the full verbose run:

```
✓ tests/submissions.test.ts > public submission endpoint > handles a CORS preflight request
✓ tests/submissions.test.ts > public submission endpoint > accepts a valid cross-origin submission and stores it
✓ tests/submissions.test.ts > public submission endpoint > rejects a payload missing a required field
✓ tests/submissions.test.ts > public submission endpoint > rejects an oversized payload with a clean 413
✓ tests/submissions.test.ts > public submission endpoint > returns 404 for an unknown widget
✓ tests/submissions.test.ts > public submission endpoint > silently drops a submission that fills the honeypot field
✓ tests/submissions.test.ts > public submission endpoint > keeps storing the submission even if the confirmation email throws
✓ tests/submissions.test.ts > public submission endpoint > rate-limits a burst from one IP while still serving a different IP
✓ tests/widgets.test.ts > widget management API > rejects requests without a valid token
✓ tests/widgets.test.ts > widget management API > answers a PATCH preflight with the dashboard's CORS policy, not the public one
✓ tests/widgets.test.ts > widget management API > serves widget config publicly with its own CORS, without exposing the rest of the router
✓ tests/widgets.test.ts > widget management API > rejects an invalid create payload
✓ tests/widgets.test.ts > widget management API > lets a tenant fully manage its own widget
✓ tests/widgets.test.ts > widget management API > enforces tenant isolation: tenant B cannot read or modify tenant A's widget
✓ tests/delivery.test.ts > widget delivery > serves the versioned bundle with an immutable cache header
✓ tests/delivery.test.ts > widget delivery > 404s for an unknown SDK version
✓ tests/delivery.test.ts > widget delivery > redirects /widget.js to the current version
✓ tests/delivery.test.ts > widget delivery > serves public widget config with a short cache and no auth
✓ tests/delivery.test.ts > widget delivery > returns 404 for config of an unknown widget
✓ tests/enrichment.test.ts > geo enrichment fallback chain > falls back to the second provider when the first is down
✓ tests/enrichment.test.ts > geo enrichment fallback chain > degrades to null geo when every provider fails — never throws
✓ tests/enrichment.test.ts > geo enrichment fallback chain > recovers once a toggled provider comes back up

Test Files  4 passed (4)
     Tests  22 passed (22)
```

## Widget management

- [x] **Authenticated CRUD endpoints; no-auth rejected.** `GET /api/widgets` without a token → `401`. Test: `widgets.test.ts > rejects requests without a valid token`. Manual: `curl http://localhost:4000/api/widgets` → `401 {"error":{"code":"UNAUTHORIZED",...}}`.
- [x] **Multi-tenant isolation proven.** Test: `widgets.test.ts > enforces tenant isolation: tenant B cannot read or modify tenant A's widget` — tenant B's `GET`/`PATCH` on tenant A's widget both return `404` (not 403, so existence isn't leaked either), and tenant B's widget list comes back empty. Manual repro during Faz 2: created widget as tenant A, `GET /api/widgets/:id` as tenant B → `404`; `GET /api/widgets` as tenant B → `{"widgets":[]}`.
- [x] **Embed snippet generated per widget.** `GET /api/widgets/:id/embed` (auth) → `{"snippet":"<script src=\"http://localhost:4000/widget.v1.js?id=...\" async></script>"}`. Verified live and via the dashboard's "Copy" button (screenshot: widget detail page shows the exact snippet in a `<code>` block).

## Widget delivery

- [x] **Public config endpoint, correct cache headers.** Test: `delivery.test.ts > serves public widget config with a short cache and no auth`. Manual: `curl -i http://localhost:4000/api/widgets/:id/config` → `Cache-Control: public, max-age=60`, `Access-Control-Allow-Origin: *`, no `Authorization` header sent.
- [x] **Versioned bundle.** Test: `delivery.test.ts > serves the versioned bundle with an immutable cache header`. `GET /widget.v1.js` → `Cache-Control: public, max-age=31536000, immutable`; `GET /widget.js` → `302` to `/widget.v1.js` (test: `redirects /widget.js to the current version`).
- [x] **Widget renders on a different-origin page.** `customer-site/index.html` served on `:5500`, backend on `:4000` — two different origins. Verified with a real headless-browser (Playwright) run: navigated to `:5500`, injected the real embed `<script>` pointing at `:4000`, the widget rendered as a floating box, and a full submit → "Thanks — you're all set!" flow completed with **zero console errors**. (Along the way this caught and fixed a real bug: the success message was a child of the form it hid on submit — see git history, "Fix: success message hidden along with the form on submit".)

## Public submission API

- [x] **Cross-origin + preflight.** Test: `submissions.test.ts > handles a CORS preflight request` (`OPTIONS /api/submissions` → `204`, `Access-Control-Allow-Origin: *`). Also regression-tested for the auth-gated router after a real CORS bug: `widgets.test.ts > answers a PATCH preflight with the dashboard's CORS policy, not the public one`.
- [x] **All input validated; clean 4xx JSON.** Missing required field → `400` (test: `rejects a payload missing a required field`). Oversized body (200KB against a 100KB limit) → `413 {"error":{"code":"PAYLOAD_TOO_LARGE",...}}` (test: `rejects an oversized payload with a clean 413`). Unknown widget → `404` (test: `returns 404 for an unknown widget`).
- [x] **Valid submissions stored, linked correctly.** Test: `accepts a valid cross-origin submission and stores it` asserts the row exists in Postgres via Prisma with the exact submitted `data`. Manual: `POST /api/submissions` with a real widget id → `201 {"id":"...","createdAt":"..."}`, row confirmed via `psql`.

## Abuse protection

- [x] **Rate limiting, service stays up.** Test: `rate-limits a burst from one IP while still serving a different IP` — 25 rapid requests from one simulated IP produce ≤20 `201`s and at least one `429`; a request from a different IP immediately after still gets `201`. Manual (Faz 3): with `RATE_LIMIT_MAX_PER_IP=5`, 8 rapid requests → `201 201 201 201 201 429 429 429`, then a request with a different `X-Forwarded-For` → `201`.
- [x] **Honeypot blocks spam.** Test: `silently drops a submission that fills the honeypot field` — filled `website` field → `201` with `id: null`, and the submission count for that widget stays `0`. Manual: same result via curl, confirmed zero rows written with `psql`.

## Enrichment & safe side effects

- [x] **Geo fallback chain.** Tests (`enrichment.test.ts`, deterministic mocks per DESIGN.md's "mock the geo providers" constraint): provider A down → B answers; both down → `{country: null, city: null}`; a toggled-down provider recovers once re-enabled. Manual with the **real** providers: a submission with `X-Forwarded-For: 8.8.8.8` was enriched via ip-api.com to `country: "United States", city: "Ashburn"` (confirmed in Postgres).
- [x] **All providers down → still succeeds.** Same enrichment test (`degrades to null geo when every provider fails`) plus the submission pipeline never throws on enrichment failure (`enrichIp` is wrapped in try/catch per provider, see `src/modules/enrichment/enrich.ts`).
- [x] **Failing email doesn't block the submission.** Test: `keeps storing the submission even if the confirmation email throws` (mocks `transporter.sendMail` to reject, asserts `201` and the row exists). Manual: stopped the Mailpit container mid-session, submitted a form → still `201 Created`, log line `"Confirmation notification failed; submission was already stored"` with the real `ECONNREFUSED` error captured, submission confirmed stored in Postgres.

## Tests & documentation

- [x] **Automated tests cover the required cases.** CORS preflight ✓, invalid payload ✓, oversized payload ✓, rate limiting ✓, spam control ✓, provider fallback ✓ — all listed above with file:test references. **Successful widget rendering** is verified with a real browser (Playwright) rather than inside `npm test`, since a browser engine isn't guaranteed on an arbitrary evaluator machine — see the Widget Delivery section above and the screenshots taken during development (register → create widget → embed on a second origin → submit → success message, and the dashboard's charts/tables rendering against real seeded data).
- [x] **README + submission pack present.** [README.md](./README.md) has the architecture diagram, full setup, API table, and an honest limitations section. [capstone.yaml](./capstone.yaml), this file, [BUILDLOG.md](./BUILDLOG.md), and `backend/.env.example` / `frontend/.env.example` are all in place.
