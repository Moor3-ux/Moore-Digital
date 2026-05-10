# MDS System Architecture

---

## Overview

Moore Digital Solutions (MDS) is a multi-tenant managed services platform. It hosts client websites and services on AWS while providing a central control panel for operational visibility across all clients.

```
┌─────────────────────────────────────────────────────────────┐
│                    mooreds.net (Amplify)                     │
│                                                             │
│   ┌─────────────────────┐   ┌──────────────────────────┐   │
│   │   Main Site (React) │   │  MDS Panel (/admin)      │   │
│   │   src/              │   │  admin/src/              │   │
│   │   dist/             │   │  admin/dist/ → dist/admin│   │
│   └─────────────────────┘   └────────────┬─────────────┘   │
└────────────────────────────────────────── │ ────────────────┘
                                            │ VITE_MDS_API_URL
                                            ▼
                              ┌─────────────────────────┐
                              │  mds-panel-api (Lambda) │
                              │  HTTP API Gateway v2    │
                              │  qkudf4zvv8             │
                              └────────────┬────────────┘
                                           │
                    ┌──────────────────────┼──────────────────┐
                    ▼                      ▼                   ▼
              mds-clients           mds-leads           mds-deployments
              mds-events            (DynamoDB)          (DynamoDB)
              (DynamoDB)
```

---

## Monorepo Dual-Build (Moore-Digital)

The `Moore-Digital` GitHub repo builds two separate React applications from one Amplify job.

```
Moore-Digital/
├── src/                    ← Main public site (React 19)
├── admin/
│   └── src/                ← MDS Control Panel (React 18)
├── amplify.yml             ← Dual build pipeline
├── customHttp.yml          ← Cache headers for both apps
└── dist/                   ← Amplify artifact root
    ├── index.html          ← Main site entry
    ├── assets/             ← Main site assets
    └── admin/
        ├── index.html      ← Panel entry
        └── assets/         ← Panel assets (/admin/assets/*)
```

### Build pipeline (`amplify.yml`)

```yaml
preBuild:
  - nvm use 22
  - npm ci                        # main site deps
  - cd admin && npm ci && cd ..   # panel deps

build:
  - npm run build                 # outputs to dist/
  - cd admin && npm run build && cd ..   # outputs to admin/dist/
  - mkdir -p dist/admin
  - cp -r admin/dist/. dist/admin/       # merge into single artifact

artifacts:
  baseDirectory: dist
```

### Vite configuration (admin)

- `base: '/admin/'` — all assets compile to `/admin/assets/*`
- React Router `basename: '/admin'` — route paths like `/clients` resolve to `/admin/clients`
- `define: { __MDS_BUILD__: {...} }` — build identity injected at compile time

---

## MDS Control Panel Frontend

```
admin/src/
├── main.jsx              ← Entry: router setup, diagnostics init, health check
├── App.jsx               ← Auth gate + layout shell
├── index.css             ← Tailwind + design tokens
├── panel.config.js       ← Demo data, config constants
├── lib/
│   ├── api.js            ← API client (VITE_MDS_API_URL, PANEL_KEY, DEMO_MODE)
│   ├── auth.js           ← sessionStorage password gate
│   └── utils.js          ← Shared helpers
├── hooks/
│   └── useApi.js         ← Data fetching hook with loading/error states
├── components/
│   ├── Sidebar.jsx       ← Nav + build info + sign out
│   ├── PageHeader.jsx    ← Page title/subtitle
│   ├── MetricCard.jsx    ← Dashboard stat cards
│   ├── StatusBadge.jsx   ← Colored status labels
│   └── EmptyState.jsx    ← Empty list placeholder
└── pages/
    ├── Login.jsx         ← Password gate UI
    ├── Overview.jsx      ← Dashboard metrics
    ├── Clients.jsx       ← Client list + cards
    ├── Leads.jsx         ← Lead list + filters
    ├── Deployments.jsx   ← Deployment history
    ├── Diagnostics.jsx   ← Health/diag dashboard
    └── Settings.jsx      ← Env var / config display
```

### Auth flow

```
Browser visits /admin
  → App.jsx reads isAuthed() from sessionStorage
  → Not authed → render <Login />
  → User enters password → checkPassword() against hardcoded value
  → Match → setAuthed() writes to sessionStorage → render panel
  → Tab close → sessionStorage cleared → re-auth required
```

### Demo mode

When `VITE_MDS_API_URL` is not set, `DEMO_MODE = true`. All API calls return mock data from `panel.config.js`. A yellow banner appears in the panel. This is the local dev default.

---

## MDS Backend (Lambda + API Gateway)

### mds-panel-api Lambda

- Runtime: Node.js 22.x, ESM (`"type":"module"`)
- Handler: `index.handler`
- Auth: `x-mds-panel-key` header checked on every request
- Payload format: HTTP API v2 (`event.requestContext.http.method`, NOT `event.httpMethod`)
- Memory: 256MB, timeout: 30s
- Env vars: `PANEL_KEY`, `DDB_REGION`

### API Routes

```
GET    /health
GET    /clients
POST   /clients
GET    /clients/{clientId}
PUT    /clients/{clientId}
GET    /leads?clientId=&status=&limit=
PUT    /leads/{leadId}
GET    /deployments?clientId=
POST   /deployments
PUT    /deployments/{deploymentId}
GET    /events?clientId=&severity=&category=&limit=
POST   /events
DELETE /events/{eventId}
OPTIONS /{proxy+}
```

---

## Multi-Tenant DynamoDB Design

Each MDS table uses `clientId` as the GSI partition key, enabling efficient per-client queries without table scans.

```
mds-clients:
  PK: clientId (S)
  Attributes: name, domain, industry, status, plan, amplifyAppId,
              apiUrl, leadTable, lambdas, deployStatus, ...

mds-leads:
  PK: leadId (S)
  GSI: clientId-createdAt-index (clientId HASH, createdAt RANGE)
  Attributes: source, status, fullName, email, phone, ...

mds-deployments:
  PK: deploymentId (S)
  GSI: clientId-deployedAt-index (clientId HASH, deployedAt RANGE)
  Attributes: amplifyAppId, commitHash, amplifyStatus, ...

mds-events:
  PK: eventId (S)
  GSI: clientId-timestamp-index (clientId HASH, timestamp RANGE)
  Attributes: category, severity, message, meta {}
```

---

## Client Infrastructure Model

Each managed client has its own isolated AWS infrastructure:

```
Client (e.g., Venture Builders)
├── Amplify app (own app ID, own CloudFront)
├── API Gateway (REST v1 or HTTP v2)
├── Lambda functions (submit, admin)
├── DynamoDB table (e.g., vb-leads)
├── IAM role (e.g., vb-lambda-role)
└── Custom domain (e.g., venturebuildersmbs.com)
```

MDS references client infrastructure via metadata stored in `mds-clients` — it does not own or manage client infra directly. The MDS panel reads from both MDS tables (aggregated view) and can proxy queries to client APIs.

---

## Diagnostics Architecture

### Build visibility (`window.__MDS_BUILD__`)

Injected at Vite build time via `define: {}`. Available globally in browser:

```js
window.__MDS_BUILD__ = {
  commit:       "f3d19c8",
  frontendHash: "index-DwT_lm_X.js",
  builtAt:      "2026-05-10T...",
  version:      "1.0.0",
  env:          "production"
}
```

### Runtime health (`window.__MDS_HEALTH__`)

Set by `admin-healthcheck.js` after React mounts (non-blocking):

```js
window.__MDS_HEALTH__ = {
  apiReachable: true,
  apiStatus:    200,
  latencyMs:    142,
  region:       "us-east-1",
  demoMode:     false,
  error:        null
}
```

### MDS-DIAG console logging

Structured logs prefixed `[MDS-DIAG/<CATEGORY>]` — filter in DevTools. Categories: `ENV`, `AUTH`, `ROUTE`, `API`, `HEALTH`, `ERR`.

---

## AWS Region Layout

| Service | Region | Notes |
|---|---|---|
| Amplify (both apps) | us-east-2 | Amplify control plane |
| CloudFront | us-east-1 (global) | Amplify-managed distributions |
| Lambda | us-east-1 | All functions |
| API Gateway | us-east-1 | Both APIs |
| DynamoDB | us-east-1 | All tables |
| IAM | global | All roles |
| SES | us-east-1 | VB email sending |
