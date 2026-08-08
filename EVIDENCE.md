# Evidence — Definition of Done

One pasted proof per checkbox, filled in as each phase ships. Unchecked = not built yet.

## Widget management
- [ ] Authenticated CRUD endpoints for widgets; requests without valid auth are rejected.
- [ ] Multi-tenant isolation proven: tenant A cannot read or modify tenant B's widgets or submissions.
- [ ] Embed snippet generated per widget.

## Widget delivery
- [ ] Public config endpoint serves a small payload with correct HTTP cache headers.
- [ ] Widget JavaScript is served as a versioned bundle (new version = new URL or cache-bust).
- [ ] The widget renders on a page served from a different origin than the API.

## Public submission API
- [ ] Cross-origin submissions work: CORS headers correct, preflight (`OPTIONS`) handled.
- [ ] All incoming input validated; malformed and oversized payloads rejected with clean 4xx + JSON errors.
- [ ] Valid submissions stored safely, linked to the right widget and tenant.

## Abuse protection
- [ ] Rate limiting per IP and/or per widget returns 429 under a burst — API keeps serving legitimate traffic.
- [ ] At least one spam-prevention technique (honeypot) demonstrably blocks a spam submission.

## Enrichment & safe side effects
- [ ] IP→geo enrichment uses a provider fallback chain: provider A down → provider B answers → enriched.
- [ ] All providers down → submission still succeeds (without geo). Degrade, never fail.
- [ ] A failing confirmation email/webhook does not prevent the submission from being stored.

## Tests & documentation
- [ ] Automated tests cover: CORS preflight, invalid payload, oversized payload, rate limiting, spam control, provider fallback, successful widget rendering.
- [ ] README with architecture diagram, setup instructions, and API documentation; the five submission-pack files present.
