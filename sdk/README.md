# @gatekeeper-dev/sdk

`@gatekeeper-dev/sdk` is a lightweight TypeScript client for evaluating Gatekeeper feature flags from any JavaScript or TypeScript application.

It wraps Gatekeeper's runtime API and adds:

- a simple `isEnabled()` interface
- request timeouts
- in-memory response caching
- bounded cache size protection
- safe fallback behavior through `defaultValue`

## Install

```bash
npm install @gatekeeper-dev/sdk
```

## Quick Start

```ts
import { createClient } from "@gatekeeper-dev/sdk";

const gatekeeper = createClient({
  apiKey: process.env.GATEKEEPER_API_KEY!,
  baseUrl: "http://localhost:3000",
});

const enabled = await gatekeeper.isEnabled("new_checkout", {
  userId: "user_123",
  attributes: {
    email: "dev@company.com",
    plan: "pro",
  },
  defaultValue: false,
});

if (enabled) {
  console.log("Render new checkout");
}
```

## API

### `createClient(config)`

Creates a `GatekeeperClient` instance.

### Configuration

| Option | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `apiKey` | `string` | yes | none | Project API key generated from the Gatekeeper dashboard |
| `baseUrl` | `string` | yes | none | Base URL of the Gatekeeper deployment, for example `https://flags.example.com` |
| `cacheTtl` | `number` | no | `60000` | Cache lifetime in milliseconds |
| `timeout` | `number` | no | `5000` | Request timeout in milliseconds |
| `maxCacheSize` | `number` | no | `1000` | Maximum number of cached evaluations kept in memory |

### `client.isEnabled(flagName, context?)`

Evaluates a feature flag and returns `Promise<boolean>`.

#### Parameters

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `flagName` | `string` | yes | Name of the flag to evaluate |
| `context.userId` | `string` | no | Stable user ID used for deterministic percentage rollout |
| `context.attributes` | `Record<string, string>` | no | Attribute map used for rule matching |
| `context.defaultValue` | `boolean` | no | Value returned if the API request fails |

### `client.clearCache()`

Clears the SDK's local in-memory cache.

## Runtime Behavior

### Request format

The SDK sends:

- `GET /api/v1/evaluate`
- header: `x-api-key`
- query param: `flag`
- optional query params: `userId`, `attributes`

### Cache behavior

The cache key includes:

- flag name
- `userId`
- serialized `attributes`

This means evaluations for different users or different attribute sets are cached separately.

When the cache reaches `maxCacheSize`, the client:

1. removes expired entries first
2. if still full, removes the oldest inserted entry

### Failure behavior

If the API call fails:

- `defaultValue` is returned when provided
- otherwise the SDK returns `false`

This makes the client safe to use in production code paths where availability matters more than strict runtime dependency on the control plane.

## Example Patterns

### Kill switch

```ts
const enabled = await gatekeeper.isEnabled("payments_enabled", {
  defaultValue: true,
});
```

### Percentage rollout

```ts
const enabled = await gatekeeper.isEnabled("new_dashboard", {
  userId: user.id,
  defaultValue: false,
});
```

### Attribute targeting

```ts
const enabled = await gatekeeper.isEnabled("internal_beta", {
  userId: user.id,
  attributes: {
    email: user.email,
    plan: user.plan,
    country: user.country,
  },
  defaultValue: false,
});
```

## Backend Expectations

The SDK expects a Gatekeeper-compatible backend that exposes:

- `GET /api/v1/evaluate`
- API-key authentication through `x-api-key`
- JSON response shaped like:

```json
{ "enabled": true }
```

The reference implementation for that backend lives in the main project root.

## Local Development

From the `sdk/` directory:

```bash
npm install
npm run build
```

For watch mode:

```bash
npm run dev
```

The package is built with `tsup` and outputs:

- `dist/index.js` for ESM
- `dist/index.cjs` for CommonJS
- `dist/index.d.ts` for types

## Source Layout

```text
sdk/
├── src/client.ts   # GatekeeperClient implementation
├── src/types.ts    # public config and evaluation types
└── src/index.ts    # package exports
```
