# MDS Diagnostics Architecture
> How to debug every failure class in the MDS ecosystem.

---

## Diagnostic Layers

The MDS platform has four diagnostic layers, from build time to runtime:

```
Layer 1: Build Identity     window.__MDS_BUILD__          (compile-time injection)
Layer 2: Environment Diag   MDS-DIAG console logs         (import-time execution)
Layer 3: Runtime Health     window.__MDS_HEALTH__         (post-mount async)
Layer 4: Panel UI           /diagnostics page             (human-readable view)
```

---

## Layer 1: Build Identity (`window.__MDS_BUILD__`)

Injected via `vite.config.js` `define: {}` at compile time. Always present in production.

```js
window.__MDS_BUILD__ = {
  commit:       "f3d19c8",          // git SHA (short)
  frontendHash: "index-DwT_lm_X",  // Vite output bundle hash
  builtAt:      "2026-05-10T...",   // ISO timestamp
  version:      "1.0.0",            // package.json version
  env:          "production"         // import.meta.env.MODE
}
```

**To verify in browser console:**
```js
window.__MDS_BUILD__
// If undefined → bundle is not loading (asset serving bug, blank screen)
```

**To verify bundle hash matches deployment:**
```bash
# In terminal
JS_URL=$(curl -s https://www.mooreds.net/admin/ | grep -o '/admin/assets/index-[^"]*\.js')
echo $JS_URL   # Should match window.__MDS_BUILD__.frontendHash
```

---

## Layer 2: MDS-DIAG Console Logging

Installed via `mds-diag.js`, executes on module import before React renders. Filter DevTools console with `[MDS-DIAG`.

### Categories

| Category | What it logs |
|---|---|
| `ENV` | API URL, hostname, demo mode state, env var presence |
| `AUTH` | sessionStorage ops, auth state on render, login/logout events |
| `ROUTE` | Component mount/unmount, route resolution |
| `API` | Full request (method, URL, headers), response (status, latency, body preview), per-status hints |
| `HEALTH` | Post-mount health check result |
| `ERR` | `window.onerror`, unhandledrejection, render loop detection |

### Filtering in DevTools

```
[MDS-DIAG/ENV]   → environment and config issues
[MDS-DIAG/API]   → all API calls with status codes and latency
[MDS-DIAG/AUTH]  → login state and session issues
[MDS-DIAG/ERR]   → uncaught errors
```

### API diagnostic hints by status code

| Status | Meaning | Diagnostic action |
|---|---|---|
| 0 | Network error / CORS / Lambda cold start timeout | Check VITE_MDS_API_URL, CORS config |
| 200 | OK | — |
| 401 | Panel key wrong or missing | Verify VITE_MDS_PANEL_KEY matches Lambda PANEL_KEY |
| 403 | Key present but method blocked | Check API Gateway route + integration |
| 404 | Route not found in Lambda | Check route handler, API Gateway route registration |
| 502 | Lambda crash | Check CloudWatch logs for the function |
| 504 | Lambda timeout | Increase Lambda timeout, check DynamoDB query efficiency |

---

## Layer 3: Runtime Health (`window.__MDS_HEALTH__`)

Set by `admin-healthcheck.js` after React first mount. Non-blocking — never delays initial render.

```js
window.__MDS_HEALTH__ = {
  apiReachable: true,    // false = network/CORS/Lambda down
  apiStatus:    200,     // HTTP status from /health endpoint
  latencyMs:    142,     // round-trip time
  region:       "us-east-1",  // from health response body
  demoMode:     false,   // true = VITE_MDS_API_URL not set
  error:        null     // Error message if apiReachable === false
}
```

**To check in browser:**
```js
window.__MDS_HEALTH__
// apiReachable: false → check API URL and key
// demoMode: true → check Amplify env vars, rebuild
```

---

## Layer 4: Diagnostics Page (`/diagnostics`)

The panel's Diagnostics page renders `window.__MDS_BUILD__` and `window.__MDS_HEALTH__` in a visual card layout. Share a screenshot of this page when reporting issues.

---

## VB-DIAG (Venture Builders Diagnostic Layer)

The Venture Builders frontend has a parallel diagnostic system (`diag.js`) with category prefix `[VB-DIAG/<CATEGORY>]`.

**Additional categories in VB-DIAG:**
- `CSS` — checks computed styles for display:none, visibility:hidden, opacity:0, off-viewport (the invisible render bug class)
- `DOM` — viewport dimensions, scroll state, horizontal overflow
- `DASH` — lead payload shape validation, required field audit
- `STATE` — impossible-state assertions (authed + empty password, etc.)
- `ERR` — render loop detector (>12 VB log lines in 500ms)

---

## Debugging Workflows

### Blank screen after deploy

**Symptoms:** Page loads but nothing renders, no errors visible.

**Step 1: Check asset content type**
```bash
JS_URL=$(curl -s https://www.mooreds.net/admin/ | grep -o '/admin/assets/index-[^"]*\.js')
curl -sI "https://www.mooreds.net$JS_URL" | grep content-type
```
If `text/html` → the rewrite rule is catching assets. Fix: add `/admin/assets/<*>` identity rule.

**Step 2: Check bundle size**
```bash
curl -s "https://www.mooreds.net$JS_URL" | wc -c
```
~1576 bytes = returning index.html. >50KB = real bundle.

**Step 3: Check window globals in console**
```js
window.__MDS_BUILD__   // undefined = bundle not executing
document.getElementById('root').innerHTML  // "" = React never mounted
```

**Step 4: Check network tab**
Filter by JS. If any `.js` file returns `Content-Type: text/html` → rewrite rule bug.

---

### Stale bundle (old code running in production)

**Symptom:** Deploy succeeded but behavior hasn't changed.

**Step 1: Get current bundle hash from HTML**
```bash
curl -s https://www.mooreds.net/admin/ | grep -o 'index-[^"]*\.js'
```

**Step 2: Compare with window.__MDS_BUILD__.frontendHash**
If they differ → browser has cached the old HTML (which references old hashes).

**Step 3: Force reload**
Hard refresh (Ctrl+Shift+R) or clear cache. If that fixes it, the HTML was cached despite `no-cache` header.

**Step 4: Verify HTML cache header**
```bash
curl -sI https://www.mooreds.net/admin/ | grep cache-control
# Must be: no-cache, no-store, must-revalidate
```
If missing or wrong → check `customHttp.yml` and rebuild.

**Step 5: If CDN has wrong response cached for JS files**
Trigger a new Amplify build. This is the only reliable CDN invalidation. Do NOT rely on `Cache-Control: no-cache` from the browser side — CDN caches the served response for the asset URL, regardless.

---

### API not reachable (demo mode unexpectedly active)

**Step 1: Check window.__MDS_HEALTH__**
```js
window.__MDS_HEALTH__
// demoMode: true → VITE_MDS_API_URL is unset
// apiReachable: false → URL set but API not responding
```

**Step 2: Check bundle for API URL**
```bash
curl -s "$JS_URL" | grep -c 'execute-api'
# 0 = URL not compiled in — env var was not set at build time
```

**Step 3: Check Amplify env vars**
```bash
aws amplify get-app --app-id dq6bff22v126m --region us-east-2 \
  --query 'app.environmentVariables' --output json
```

**Step 4: Rebuild**
After updating env vars, a new build is required. Env var changes do not hot-reload.

---

### API 401 / auth failures

**Check 1:** Correct header name? MDS API uses `x-mds-panel-key`, VB admin API uses `x-admin-password`.

**Check 2:** Key value matches Lambda env var?
```bash
aws lambda get-function-configuration --function-name mds-panel-api \
  --region us-east-1 --query 'Environment.Variables.PANEL_KEY' --output text
```

**Check 3:** Key compiled into frontend bundle?
```bash
curl -s "$JS_URL" | grep -c 'execute-api'
```

---

### Hard refresh 404 on nested admin routes

**Symptom:** `/admin/clients` works via React Router but hard refresh returns 404.

**Cause:** SPA rewrite rule misconfigured.

**Check current rules:**
```bash
aws amplify get-app --app-id dq6bff22v126m --region us-east-2 \
  --query 'app.customRules' --output json
```

**Correct state:** `/admin/<*>` → `/admin/index.html` status `200` (not `404-200`), with `/admin/assets/<*>` identity rule before it.

---

## CloudWatch Logs

```bash
# Last 20 Lambda invocations (MDS panel API)
aws logs tail /aws/lambda/mds-panel-api --region us-east-1 --since 1h

# VB admin API
aws logs tail /aws/lambda/vb-admin-api --region us-east-1 --since 1h

# VB lead submit
aws logs tail /aws/lambda/vb-submit-lead --region us-east-1 --since 1h
```

All MDS Lambda logs use structured prefix: `[MDS-PANEL/<action>]`
VB Lambda logs use: `[VB-ADMIN/<action>]` and `[VB-LEAD/<action>]`
