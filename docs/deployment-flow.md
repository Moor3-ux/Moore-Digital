# MDS Deployment Flow
> Exact sequences, failure points, and recovery procedures.

---

## Moore-Digital (Main Site + Panel)

### Normal deployment sequence

```
1. git push origin main
      ↓
2. GitHub webhook triggers Amplify build
      ↓
3. Amplify preBuild:
   - nvm use 22
   - npm ci               (main site)
   - cd admin && npm ci   (panel)
      ↓
4. Amplify build:
   - npm run build         → dist/
   - cd admin && npm run build → admin/dist/
   - cp -r admin/dist/. dist/admin/
      ↓
5. Amplify deploys dist/ as artifact root
      ↓
6. CloudFront invalidation runs automatically
      ↓
7. New assets live at /admin/assets/index-<HASH>.js
```

### Triggering a manual build (no code change)

```bash
aws amplify start-job \
  --app-id dq6bff22v126m \
  --branch-name main \
  --job-type RELEASE \
  --region us-east-2
```

Use this to force CDN invalidation when a cache bug is suspected.

### Monitoring build status

```bash
aws amplify get-job \
  --app-id dq6bff22v126m \
  --branch-name main \
  --job-id <ID> \
  --region us-east-2 \
  --query 'job.summary.status' \
  --output text
```

---

## Env Var Injection

Environment variables must be set in Amplify before they are compiled into the bundle. They are baked in at Vite build time via `import.meta.env.*`.

**Set/update env vars:**
```bash
aws amplify update-app \
  --app-id dq6bff22v126m \
  --region us-east-2 \
  --environment-variables \
    'VITE_MDS_API_URL=https://qkudf4zvv8.execute-api.us-east-1.amazonaws.com,VITE_MDS_PANEL_KEY=<key>'
```

**After setting env vars, a new build is required** — env var changes do not redeploy the existing bundle.

**Verify env vars were compiled in:**
```bash
BASE="https://www.mooreds.net"
JS_URL=$(curl -s "$BASE/admin/" | grep -o '/admin/assets/index-[^"]*\.js' | head -1)
curl -s "$BASE$JS_URL" | grep -c 'execute-api'
# Expect: 2
```

---

## Amplify Rewrite Rules

Rules are evaluated **top to bottom, first match wins**. Order is critical.

### Current rules (Moore-Digital)

```json
[
  {"source":"https://mooreds.net","target":"https://www.mooreds.net","status":"302"},
  {"source":"/admin/assets/<*>","target":"/admin/assets/<*>","status":"200"},
  {"source":"/admin/<*>","target":"/admin/index.html","status":"200"},
  {"source":"/<*>","target":"/index.html","status":"404-200"}
]
```

**Apply via:**
```bash
aws amplify update-app \
  --app-id dq6bff22v126m \
  --region us-east-2 \
  --custom-rules '[...]'
```

### Why rule 2 (`/admin/assets/<*>`) must come first

Without it, rule 3 (`/admin/<*>` → `index.html` status `200`) rewrites ALL `/admin/*` paths unconditionally, including actual JS/CSS files. The browser receives HTML where it expects JavaScript. This causes a silent failure: the page loads but React never executes.

**Rule status semantics:**
- `200` = unconditional rewrite — always serves the target, even if the file exists
- `404-200` = conditional rewrite — only serves target when the file is NOT found

**Do NOT use `404-200` for the SPA rule** (`/admin/<*>`) because Amplify's built-in trailing-slash redirect (`/admin/clients` → `/admin/clients/`) fires before custom rules apply. After the redirect, `/admin/clients/` returns 404 instead of triggering the rewrite.

---

## Cache Control Headers

Configured in `customHttp.yml` (applied via Amplify custom headers):

```yaml
customHeaders:
  - pattern: '**/*.html'
    headers:
      - key: 'Cache-Control'
        value: 'no-cache, no-store, must-revalidate'
  - pattern: '/assets/**'
    headers:
      - key: 'Cache-Control'
        value: 'public, max-age=31536000, immutable'
  - pattern: '/admin/assets/**'
    headers:
      - key: 'Cache-Control'
        value: 'public, max-age=31536000, immutable'
  - pattern: '/admin/**/*.html'
    headers:
      - key: 'Cache-Control'
        value: 'no-cache, no-store, must-revalidate'
```

**Rule:** HTML is always no-cache. Assets are immutable (content-hashed filenames).

---

## Lambda Deployment

Lambda functions are deployed independently from Amplify. Packaging on Windows (no `zip` CLI):

```powershell
# In the lambda function directory
cd C:\Users\moore\mds-panel\lambda\mds-api
npm install --production
Compress-Archive -Path * -DestinationPath mds-api.zip -Force
```

**Deploy:**
```bash
aws lambda update-function-code \
  --function-name mds-panel-api \
  --zip-file fileb://lambda/mds-api/mds-api.zip \
  --region us-east-1
```

---

## Post-Deploy Validation Checklist

Run after every production deployment:

```bash
BASE="https://www.mooreds.net"
JS_URL=$(curl -s "$BASE/admin/" | grep -o '/admin/assets/index-[^"]*\.js' | head -1)

# 1. JS asset served as JavaScript (not HTML)
curl -sI "$BASE$JS_URL" | grep "content-type"
# Expect: text/javascript

# 2. JS asset has immutable cache
curl -sI "$BASE$JS_URL" | grep "cache-control"
# Expect: public, max-age=31536000, immutable

# 3. HTML is no-cache
curl -sI "$BASE/admin/" | grep "cache-control"
# Expect: no-cache, no-store, must-revalidate

# 4. All nested routes return 200
for R in /admin/clients /admin/leads /admin/deployments /admin/events /admin/diagnostics /admin/settings; do
  echo "$R → $(curl -sI "$BASE$R" | grep "^HTTP" | awk '{print $2}')"
done

# 5. API URL compiled into bundle
curl -s "$BASE$JS_URL" | grep -c 'execute-api'
# Expect: 2

# 6. API health
curl -s https://qkudf4zvv8.execute-api.us-east-1.amazonaws.com/health \
  -H "x-mds-panel-key: <key>"
# Expect: {"status":"ok",...}

# 7. Main site intact
curl -sI "$BASE/" | grep "^HTTP"
# Expect: 200
```

---

## Rollback

Amplify has no built-in rollback. Options:

1. **Git revert + push** — fastest; triggers a new build with previous code
2. **Manual redeploy** — `aws amplify start-job --job-type RELEASE` re-runs the last successful build artifact (does not recompile, only re-serves)

For Lambda rollback, AWS keeps previous versions. Publish a version before updating:
```bash
aws lambda publish-version --function-name mds-panel-api --region us-east-1
```

---

## Common Failure Points

| Symptom | Root Cause | Fix |
|---|---|---|
| Admin assets return HTML (1576 bytes) | Rewrite rule `status:"200"` rewrites everything including assets | Add `/admin/assets/<*>` identity rule before the SPA rule |
| Hard refresh on `/admin/clients` → 404 | SPA rule uses `404-200` + trailing-slash redirect creates 2-step 301→404 | Use `status:"200"` for SPA rule (assets rule protects files) |
| Admin shows demo mode | `VITE_MDS_API_URL` not set in Amplify, or set after last build | Set env var + trigger new build |
| API 401 on all requests | `VITE_MDS_PANEL_KEY` missing or mismatched | Check Amplify env vars, rebuild |
| Stale bundle after deploy | CloudFront cached the wrong response (old HTML-for-JS cache) | Trigger new Amplify build — it always invalidates CDN |
| `npm ci` fails in preBuild | `package-lock.json` missing (first run) | Run `npm install` locally first to generate lock file, commit it |
| Lambda `500` on all routes | HTTP API v2 payload format mismatch | Lambda must use `event.requestContext.http.method` not `event.httpMethod` |
