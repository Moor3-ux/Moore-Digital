# MDS Current State
> Operational snapshot — update this file after every significant change.
> Last updated: 2026-05-10

---

## Platform Status: LIVE

| Component | Status | URL |
|---|---|---|
| Moore Digital main site | ✅ live | https://www.mooreds.net |
| MDS Control Panel | ✅ live | https://www.mooreds.net/admin |
| MDS Panel API (Lambda) | ✅ live | https://qkudf4zvv8.execute-api.us-east-1.amazonaws.com |
| Venture Builders site | ✅ live | https://www.venturebuildersmbs.com |
| VB Lead API | ✅ live | https://yl66hfyp08.execute-api.us-east-1.amazonaws.com/prod |

---

## Active Amplify Apps

| App | ID | Region | Branch | Last Build | Commit |
|---|---|---|---|---|---|
| Moore-Digital | `dq6bff22v126m` | us-east-2 | main | 2026-05-10 job #19 SUCCEED | `f3d19c8` |
| Venture-Builders-Live | `d64oi6w1xtlwf` | us-east-2 | main | 2026-05-09 job #36 SUCCEED | `b452c8b` |

## Active Lambda Functions (us-east-1)

| Function | Role | Last Modified |
|---|---|---|
| `mds-panel-api` | MDS unified API | 2026-05-10 |
| `vb-submit-lead` | VB lead capture + SES | 2026-05-09 |
| `vb-admin-api` | VB admin dashboard API | 2026-05-09 |

## Active API Gateways (us-east-1)

| Name | ID | Type | Base URL |
|---|---|---|---|
| `mds-panel-api` | `qkudf4zvv8` | HTTP v2 | `https://qkudf4zvv8.execute-api.us-east-1.amazonaws.com` |
| `vb-lead-api` | `yl66hfyp08` | REST v1 | `https://yl66hfyp08.execute-api.us-east-1.amazonaws.com/prod` |

## Active DynamoDB Tables (us-east-1)

| Table | Purpose | Items |
|---|---|---|
| `mds-clients` | MDS client registry | 1 (venture-builders) |
| `mds-leads` | MDS unified lead store | 3 (bridged from VB) |
| `mds-deployments` | Deployment history | 1 |
| `mds-events` | Diagnostics + events | 3 |
| `vb-leads` | VB native lead store | 3 |

---

## Active Clients

### venture-builders
- **Name:** Venture Builders Metal Building Systems
- **Domain:** venturebuildersmbs.com
- **Status:** active / production
- **Amplify:** `d64oi6w1xtlwf` (us-east-2)
- **API:** `yl66hfyp08` REST v1 `/prod`
- **Lead table:** `vb-leads` (bridged → `mds-leads`)
- **Leads:** 3 (all test/archived)
- **Onboarded:** 2026-05-10

---

## MDS Control Panel

- **Auth:** sessionStorage password gate (`NinJA3154!` — do not commit)
- **Env vars in Amplify:**
  - `VITE_MDS_API_URL` → `https://qkudf4zvv8.execute-api.us-east-1.amazonaws.com`
  - `VITE_MDS_PANEL_KEY` → (secret, in Amplify env)
- **Panel key used as:** `x-mds-panel-key` header on all MDS API calls
- **Demo mode:** activates automatically when `VITE_MDS_API_URL` is unset

---

## Amplify Rewrite Rules (Moore-Digital)

Applied via `aws amplify update-app --custom-rules`:

```
1. https://mooreds.net → https://www.mooreds.net (302)
2. /admin/assets/<*> → /admin/assets/<*> (200)   ← assets identity rule, must be first
3. /admin/<*>        → /admin/index.html (200)    ← SPA rewrite
4. /<*>              → /index.html (404-200)      ← main site SPA
```

Rule order is critical — see `deployment-flow.md`.

---

## Pending / Known Issues

- VB apex domain (`venturebuildersmbs.com` without www) not verified on Amplify — CNAME record for root domain pending DNS update
- All 3 VB leads are test records (status: Archived); no real production leads yet
- MDS Control Panel Clients/Leads/Deployments pages render data from live API but UI detail views are read-only (no create form yet)
