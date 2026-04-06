# Gatekeeper

Gatekeeper is a full-stack feature flag platform. It includes:

- A Next.js dashboard for managing organizations, projects, flags, rollout percentages, and API keys
- A lightweight TypeScript SDK for consuming those flags from client applications
- A runtime evaluation API that supports deterministic rollouts, attribute-based targeting, and optional Redis caching

## What Problem It Solves

Gatekeeper separates deployment from release.

Instead of shipping code and exposing it to everyone immediately, teams can:

- create a flag for a feature
- keep it disabled until the code is live
- roll it out to a percentage of users
- target specific user segments with rules
- kill a feature instantly without redeploying

This is the same control-plane/runtime pattern used by commercial feature management platforms, implemented here in a smaller, interview-friendly system.

## Product Overview

### Dashboard

The dashboard is the control plane. Authenticated users can:

- create organizations
- create projects inside an organization
- generate a project API key
- create feature flags
- toggle flags on and off
- set rollout percentages from `0` to `100`
- add targeting rules such as `email contains @company.com`
- delete flags, API keys, and projects

### SDK

The SDK is the runtime client. Applications use it to ask:

```ts
const enabled = await client.isEnabled("new_checkout", {
  userId: "user_123",
  attributes: { email: "dev@company.com", plan: "pro" },
  defaultValue: false,
});
```

The SDK calls Gatekeeper's evaluation endpoint and returns a boolean. It also includes in-memory caching, request timeouts, and safe fallback behavior.

### Main building blocks

- `src/app/*`: App Router pages for landing, auth, onboarding, orgs, projects, flags, and API keys
- `src/server/trpc/*`: authenticated dashboard APIs for project, flag, and API-key management
- `src/app/api/v1/evaluate/route.ts`: runtime flag evaluation endpoint protected by `x-api-key`
- `src/server/services/flag-evaluation.ts`: core evaluation engine
- `src/server/services/redis.ts`: optional cache layer for flag definitions
- `sdk/src/*`: reusable TypeScript SDK package

## Evaluation Flow

When an app checks a flag, Gatekeeper evaluates it in this order:

1. Authenticate the request using the project API key.
2. Load the flag definition from Redis if available; otherwise query Postgres and cache it.
3. If the flag is globally disabled, return `false`.
4. If targeting rules exist, at least one rule must match the supplied attributes.
5. If a `userId` is provided and rollout is below `100`, hash the user ID into a deterministic bucket.
6. Return `true` only when the user falls inside the rollout threshold.

### Supported targeting operators

- `equals`
- `not_equals`
- `contains`
- `starts_with`
- `ends_with`
- `in` (comma-separated values)

## Tech Stack

- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui
- Auth: Better Auth with organization plugin
- API layer: tRPC
- Database: PostgreSQL + Prisma
- Cache: Upstash Redis
- Tooling: ESLint 9, Prettier

## Data Model

The system is organized around these domain entities:

- `Organization`: workspace boundary for teams
- `Project`: isolated flag space inside an organization
- `ApiKey`: one runtime key per project, stored as a hash plus prefix
- `FeatureFlag`: flag metadata, enabled state, rollout percentage
- `FlagRule`: attribute-based targeting rule attached to a flag

The Prisma schema also includes Better Auth tables such as `User`, `Session`, `Account`, `Member`, and `Invitation`.

## Repository Structure

```text
.
├── src/
│   ├── app/                  # Next.js routes, pages, and API handlers
│   ├── components/           # UI components, forms, modals
│   ├── lib/                  # Prisma, auth client, Redis, tRPC client
│   └── server/               # tRPC routers and domain services
├── prisma/
│   └── schema.prisma         # database schema
├── sdk/
│   ├── src/                  # SDK source
│   └── README.md             # SDK documentation
└── docker-compose.yml        # local Postgres setup
```

## Local Setup

### Prerequisites

- Node.js 20+
- npm
- Docker, if you want the provided local Postgres instance

### 1. Install dependencies

```bash
npm install
cd sdk && npm install
```

### 2. Start Postgres

```bash
docker compose up -d
```

This starts Postgres on `localhost:5436`.

### 3. Configure environment variables

Create a `.env` file in the project root.

```env
DATABASE_URL=postgresql://ffh:ffh_secret@localhost:5436/featureflaghub
NEXT_PUBLIC_APP_URL=http://localhost:3000

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Optional: enables flag-definition caching
REDIS_URL=your_upstash_redis_url
REDIS_TOKEN=your_upstash_redis_token
```

Notes:

- `NEXT_PUBLIC_APP_URL` is used by the Better Auth client in the browser.
- Redis is optional. If `REDIS_URL` and `REDIS_TOKEN` are missing, Gatekeeper falls back to database reads.
- Social provider credentials are expected by the current auth configuration.

### 4. Prepare the database

```bash
npx prisma generate
npx prisma db push
```

### 5. Run the dashboard

```bash
npm run dev
```

Open `http://localhost:3000`.

## SDK Development

The SDK lives in [`sdk/`](/home/kartik-chainscore/Kartik/feature-flag-hub/sdk/README.md).

```bash
cd sdk
npm run build
```

For local SDK iteration:

```bash
cd sdk
npm run dev
```

## Runtime API

### `GET /api/v1/evaluate`

Headers:

- `x-api-key: <project api key>`

Query parameters:

- `flag`: required flag name
- `userId`: optional user identifier for deterministic rollout
- `attributes`: optional JSON-encoded string map for rule matching

Example:

```bash
curl "http://localhost:3000/api/v1/evaluate?flag=new_checkout&userId=u_123&attributes=%7B%22email%22%3A%22dev%40company.com%22%7D" \
  -H "x-api-key: gk_live_your_project_key"
```

Response:

```json
{ "enabled": true }
```

## Useful Commands

```bash
# dashboard
npm run dev
npm run build
npm run start
npm run lint
npm run prettier

# database
docker compose up -d
npx prisma generate
npx prisma db push

# sdk
cd sdk && npm run build
cd sdk && npm run dev
```

## SDK Documentation

The SDK has its own focused README here:

- [`sdk/README.md`](/home/kartik-chainscore/Kartik/feature-flag-hub/sdk/README.md)
