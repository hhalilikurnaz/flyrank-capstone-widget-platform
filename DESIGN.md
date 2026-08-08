# Design Doc — Embeddable Widget & Lead-Capture Platform

## Problem

Customers need to collect leads from web pages they don't want to build a backend for. They should be able to design a widget (signup form / CTA / popover), get a single `<script>` tag, paste it into any site, and see submissions land in a dashboard — safely, even though the traffic comes from the open internet.

## Actors & request paths

1. **Widget owner** (authenticated tenant) — creates/manages widgets, views dashboard.
2. **Customer website** (any origin) — loads `widget.js`, fetches public widget config, renders the widget.
3. **Website visitor** (anonymous, any origin) — submits the form; this is the untrusted, adversarial path.

```
Widget Owner (authenticated)
  └─► Widget Management API ─► Widget DB (tenant-isolated) ─► embed snippet

Customer Website (any origin)
  └─ <script src="widget.js?id=123">
      └─► GET /api/widgets/:id/config   (public · cached · CORS *)
          └─► render widget

Website Visitor
  └─► POST /api/submissions   (public · CORS *)
        ├─► validation        — bad payload? → 4xx, never 500
        ├─► rate limit + honeypot — flood/bot? → 429 / silently dropped
        ├─► geo enrichment: provider A ─(fails)─► provider B ─(fails)─► store anyway
        ├─► store submission
        └─► email side effect (failure must NOT block success)

Widget Owner (authenticated)
  └─► Dashboard API ◄── submissions + stats
```

## Data model

```
Tenant
  id            uuid PK
  name          string
  email         string  unique
  passwordHash  string
  createdAt     datetime

Widget
  id               uuid PK
  tenantId         uuid FK -> Tenant, indexed
  type             enum(SIGNUP, CTA, POPOVER)
  title            string
  description      string?
  fields           json      // [{ name, label, type, required }]
  buttonText       string
  displayOptions   json      // { position, delaySeconds, theme }
  isActive         boolean   default true
  createdAt        datetime
  updatedAt        datetime
  index (tenantId)

Submission
  id            uuid PK
  widgetId      uuid FK -> Widget, indexed
  tenantId      uuid FK -> Tenant, indexed   // denormalized for fast tenant-scoped queries
  data          json      // submitted field values
  ip            string
  country       string?
  city          string?
  isSpam        boolean   default false
  createdAt     datetime, indexed
  index (widgetId, createdAt)
  index (tenantId, createdAt)
```

Tenant isolation is enforced at the query layer (repository functions always take `tenantId` and filter by it) — never trusted from the client, always derived from the JWT.

## API contracts (summary)

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/api/auth/register` | none | creates Tenant, returns JWT |
| POST | `/api/auth/login` | none | returns JWT |
| GET/POST | `/api/widgets` | JWT | list/create, tenant-scoped |
| GET/PATCH/DELETE | `/api/widgets/:id` | JWT | tenant-scoped, 404 if not owned |
| GET | `/api/widgets/:id/embed` | JWT | returns `<script>` snippet string |
| GET | `/widget.js` | none | versioned bundle, `Cache-Control: immutable` |
| GET | `/api/widgets/:id/config` | none | public, CORS `*`, short cache + ETag |
| POST | `/api/submissions` | none | public, CORS `*`, the hardened path |
| GET | `/api/dashboard/stats` | JWT | counts over time, tenant-scoped |
| GET | `/api/dashboard/submissions` | JWT | paginated list |
| GET | `/api/dashboard/geo-breakdown` | JWT | aggregation by country |

Full request/response shapes are documented inline via Zod schemas in `backend/src/modules/*/schema.ts` (source of truth — this doc gives the shape, not the exhaustive field list).

## Non-goal

**No real CDN, hosting, or multi-region deployment.** The "customer site" is a plain HTML file served from a second local port. Widget rendering targets modern evergreen browsers only — no IE11 polyfills, no SSR of the widget itself. Everything runs locally with Docker Compose; deployment is out of scope for this capstone.

## Failure-handling philosophy

Two dependencies in the submission path are allowed to fail without failing the request:

- **Geo enrichment** — provider A → provider B → no geo data. The submission is stored either way.
- **Email/webhook side effect** — runs after the submission is already persisted; a thrown error is caught and logged, never surfaced to the client.

Everything else (validation, tenant auth, rate limiting) is a hard boundary: bad input never reaches business logic.
