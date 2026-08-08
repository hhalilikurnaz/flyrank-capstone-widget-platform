# Embeddable Widget & Lead-Capture Platform

> FlyRank Internship · Backend Track · Capstone

Let a customer define a widget, hand them one line of `<script>`, and safely catch everything the public internet throws back — validated, spam-filtered, enriched, and dashboarded.

**Status:** 🚧 In progress. See [DESIGN.md](./DESIGN.md) for architecture and [EVIDENCE.md](./EVIDENCE.md) for verification proofs as they land.

## Stack

- **Backend:** Node.js + Express + TypeScript, Prisma + PostgreSQL, Zod validation, JWT auth
- **Frontend:** React + Vite + TypeScript + Tailwind CSS
- **Infra:** Docker Compose (Postgres, Mailpit), free no-key geo providers (ip-api.com, ipapi.co)

## Setup

```bash
docker compose up -d       # Postgres + Mailpit
cp backend/.env.example backend/.env
npm install
npm run dev:backend        # http://localhost:4000
npm run dev:frontend       # http://localhost:5173
```

Full setup, seed, and run instructions land here as each phase ships (see [capstone.yaml](./capstone.yaml)).

## Architecture

See [DESIGN.md](./DESIGN.md).

## License

MIT — see [LICENSE](./LICENSE).
