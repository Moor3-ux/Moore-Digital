# MDS Lessons Learned
> Engineering incidents, architectural mistakes, and hard-won discoveries.
> Every entry here cost time. None should cost time twice.

---

## Incident 1: Amplify Rewrite Rule Wipes JS Assets

**Date:** 2026-05-10
**Severity:** Critical (panel completely broken post-deploy)
**Time to diagnose:** ~30 minutes

### What happened

The admin SPA rewrite rule was configured as:
```json
{"source":"/admin/<*>","target":"/admin/index.html","status":"200"}
```

Status `200` means **unconditional rewrite** — Amplify serves `index.html` for every path matching `/admin/*`, including actual static files. When the browser requested `/admin/assets/index-C3-0Co2m.js`, it received `text/html` (1576 bytes) instead of JavaScript. React never executed. Blank screen.

### Why it was hard to catch

- The Amplify build succeeded (it's a rewrite rule, not a build problem)
- The HTML loaded fine — `curl https://mooreds.net/admin/` returned 200
- The failure was in the browser's JS request, not the HTML request
- Network tab in DevTools would have shown it immediately, but CLI testing checked the wrong thing

### The fix

Add an identity rule for assets **before** the SPA rule:
```json
[
  {"source":"/admin/assets/<*>","target":"/admin/assets/<*>","status":"200"},
  {"source":"/admin/<*>","target":"/admin/index.html","status":"200"}
]
```

Rules are evaluated first-match-wins. Assets match rule 1 and are served directly. SPA routes match rule 2 and are rewritten.

### Permanent rule

**Never use `status:"200"` for a SPA catchall without an assets identity rule first.**

---

## Incident 2: 404-200 Rule + Trailing Slash = SPA Routes Dead

**Date:** 2026-05-10
**Severity:** High (all nested admin routes return 404 on hard refresh)

### What happened

After fixing Incident 1 by switching to `status:"404-200"`, a new problem appeared: hard refresh on `/admin/clients` returned 404.

Amplify has a built-in trailing-slash redirect that fires **before** custom rules:
```
/admin/clients  →  301  →  /admin/clients/
```

Then `/admin/clients/` hits the `404-200` rule. Since the file doesn't exist, the rule should trigger. But it doesn't — it returns 404 instead.

Root cause: Amplify's internal redirect to the trailing-slash version creates a two-step sequence that bypasses the `404-200` custom rule on the second step.

### The fix

Use `status:"200"` (unconditional) for the SPA rule, but protect assets with the identity rule first:

```json
[
  {"source":"/admin/assets/<*>","target":"/admin/assets/<*>","status":"200"},
  {"source":"/admin/<*>","target":"/admin/index.html","status":"200"}
]
```

With `status:"200"`, the SPA rule fires **before** the trailing-slash redirect, so the redirect never happens. `/admin/clients` is immediately rewritten to `/admin/index.html` and returns 200.

### Permanent rule

**`404-200` does not work for SPA rewrite rules when Amplify's trailing-slash redirect is involved. Use `200` + assets identity rule.**

---

## Incident 3: Stale CloudFront Cache After Rewrite Rule Fix

**Date:** 2026-05-10
**Severity:** Medium (fix applied but not visible)

### What happened

After fixing the rewrite rule via `aws amplify update-app`, CloudFront still served the cached (wrong) response for JS asset URLs. The CDN had cached `text/html` for `/admin/assets/index-C3-0Co2m.js`. Even with `Cache-Control: no-cache` in the request, the CDN returned a `Hit from cloudfront`.

Rewrite rule changes do not automatically invalidate the CloudFront cache.

### The fix

Trigger a new Amplify build:
```bash
aws amplify start-job --app-id dq6bff22v126m --branch-name main --job-type RELEASE --region us-east-2
```

Every Amplify deployment runs a CDN invalidation automatically. The new build also produced new content-hashed filenames, making the stale cache irrelevant.

### Permanent rule

**After any Amplify rewrite rule change that affects how assets are served, trigger a new build to invalidate the CDN.** Do not rely on browser cache headers to bypass CloudFront's cache.

---

## Incident 4: HTTP API v2 Payload Format Mismatch

**Date:** 2026-05-10
**Severity:** Critical (all Lambda routes returned 500)

### What happened

The MDS panel Lambda was written to read `event.httpMethod` (the HTTP API v1 / REST API field). The MDS API Gateway was created as HTTP API v2 with `payload-format-version: "2.0"`. With payload format 2.0, `event.httpMethod` is `undefined`.

### The fix

Use `event.requestContext.http.method` for HTTP API v2 (payload format 2.0):

```js
// Wrong (payload format 1.0 / REST API):
const method = event.httpMethod

// Correct (payload format 2.0):
const method = event.requestContext.http.method
```

Similarly, the path:
```js
// Wrong:
const path = event.path

// Correct:
const path = event.requestContext.http.path
```

### Permanent rule

**When creating a Lambda for HTTP API v2 Gateway, always use `event.requestContext.http.*` for method and path. Never `event.httpMethod` or `event.path`.**

---

## Incident 5: npm ci Fails — Missing package-lock.json

**Date:** 2026-05-10
**Severity:** Medium (Amplify build fails on first run)

### What happened

The `amplify.yml` preBuild step ran `npm ci` for the admin subpackage. This requires `package-lock.json` to exist. The lock file had never been generated and wasn't committed.

### The fix

Run `npm install` locally first (not `npm ci`) to generate the lock file, then commit it:
```bash
cd admin && npm install
git add admin/package-lock.json
git commit -m "Add admin package-lock.json"
```

### Permanent rule

**Always commit `package-lock.json`. Run `npm install` locally before the first `npm ci` can work. Every new package.json needs a corresponding lock file committed.**

---

## Incident 6: @aws-sdk Version Doesn't Exist

**Date:** 2026-05-10
**Severity:** Medium (Lambda packaging fails)

### What happened

`mds-panel/lambda/mds-api/package.json` specified `@aws-sdk/client-dynamodb@3.717.0`. This version doesn't exist on npm. `npm install` fails silently or with a resolution error.

### The fix

Use `"latest"` for AWS SDK packages, or pin to a known-good version after checking npm:
```json
{
  "@aws-sdk/client-dynamodb": "latest",
  "@aws-sdk/util-dynamodb": "latest"
}
```

Note: `util-dynamodb` version numbers are lower than `client-dynamodb` (3.996 vs 3.1045 as of 2026-05). They are independently versioned. Do not assume they share version numbers.

---

## Incident 7: API Gateway $default Stage Not Existing

**Date:** 2026-05-10
**Severity:** Medium (API Gateway deployment fails)

### What happened

`aws apigatewayv2 create-deployment --stage-name '$default'` failed because the `$default` stage didn't exist yet for the HTTP API.

### The fix

Create the `$default` stage with `--auto-deploy` first:
```bash
aws apigatewayv2 create-stage \
  --api-id <id> \
  --stage-name '$default' \
  --auto-deploy \
  --region us-east-1
```

With `--auto-deploy`, any subsequent deployment automatically publishes to this stage without a manual `create-deployment` call.

---

## Incident 8: Windows — No zip CLI for Lambda Packaging

**Date:** 2026-05-10
**Severity:** Low (blocker for setup.sh on Windows)

### What happened

`infra/setup.sh` uses the `zip` CLI which doesn't exist on Windows by default. Running the script in Git Bash or WSL fails at the packaging step.

### The fix (PowerShell)

```powershell
cd lambda/mds-api
npm install --production
Compress-Archive -Path * -DestinationPath mds-api.zip -Force
```

Then upload:
```bash
aws lambda update-function-code \
  --function-name mds-panel-api \
  --zip-file fileb://lambda/mds-api/mds-api.zip \
  --region us-east-1
```

---

## Diagnostic Lessons

### Always check Content-Type before checking functionality

When a page loads but doesn't work, the first check is whether the JS bundle is actually JavaScript:
```bash
curl -sI <url>/admin/assets/index-*.js | grep content-type
```
If `text/html` → rewrite rule bug. Stop debugging React and fix the CDN.

### Build identity is mandatory

Before adding `window.__MDS_BUILD__`, there was no way to know which code version was running in production. After a deploy, if behavior didn't change, it was impossible to tell whether the old bundle was cached or whether the new code had a bug.

`window.__MDS_BUILD__` makes this a one-second check.

### Diagnostics must fire before React renders

MDS-DIAG runs on module import, before `createRoot`. If it ran inside a component, a React crash would silence all diagnostic output. By running at import time, even a completely broken React app emits environment and error logs.

### The CSS invisible render class is real

A component can mount, execute all its logic, make all its API calls, and still be completely invisible if a parent element has `display:none`, `visibility:hidden`, `opacity:0`, or `height:0`. React DevTools shows it as mounted. Network tab shows API calls succeeded. The page is blank.

VB-DIAG's CSS audit category was added specifically because of this failure class. Always audit computed styles on the root render tree when "mounted but invisible" is suspected.

---

## Architecture Decisions

### Why React Router basename instead of subdomain

Using `/admin` as a subpath (not `admin.mooreds.net`) keeps everything in one Amplify app with one build, one CDN, and one deployment lifecycle. The tradeoff is rewrite rule complexity, but the operational simplicity is worth it.

### Why sessionStorage instead of localStorage for auth

Panel auth uses sessionStorage so the session expires when the browser tab closes. This is appropriate for an internal ops tool — you don't want a shared computer staying authenticated indefinitely. localStorage would persist across tab closes.

### Why PAY_PER_REQUEST for all DynamoDB tables

The MDS platform is at low traffic volume. PAY_PER_REQUEST has no minimum cost and scales automatically. Provisioned capacity would require capacity planning and would waste money at low scale.

### Why HTTP API v2 for MDS panel, REST v1 for VB

MDS was built from scratch with HTTP API v2 (cheaper, simpler, faster). VB was already deployed with REST v1. Do not migrate VB — the cost and risk aren't worth it for a working system. Document the difference so future clients can be consistently HTTP v2.
