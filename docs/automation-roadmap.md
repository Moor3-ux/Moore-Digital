# MDS Automation Roadmap
> Future CLI tooling and orchestration architecture.

---

## Vision: `mds` CLI

A single command-line tool that wraps all operational workflows. Every manual process documented elsewhere in `/docs` becomes a subcommand.

```
mds <command> [options]

Commands:
  create-client   Provision full client infrastructure
  deploy          Deploy a client's latest build
  doctor          Health check across all active clients
  sync-client     Reconcile client infra state with MDS records
  onboard         Ingest an existing client into MDS
  logs            Tail Lambda CloudWatch logs
  status          Current platform operational snapshot
```

---

## `mds create-client`

**Purpose:** Greenfield client provisioning in one command.

```bash
mds create-client \
  --name "Acme Corp" \
  --slug acme \
  --domain acmecorp.com \
  --industry "Construction" \
  --plan standard
```

**What it does:**
1. Creates `<slug>-leads` DynamoDB table
2. Creates `<slug>-lambda-role` IAM role with standard policies
3. Packages and deploys `<slug>-submit-lead` Lambda
4. Packages and deploys `<slug>-admin-api` Lambda
5. Creates REST API Gateway with standard routes
6. Creates Amplify app from template repo
7. Registers client in `mds-clients`
8. Creates initial deployment record in `mds-deployments`
9. Creates `onboarding` event in `mds-events`
10. Outputs `.mds-<slug>-resources.json`

**Template Lambda source:** `mds-panel/templates/submit-lead/` and `mds-panel/templates/admin-api/` — parameterized by slug, table name, domain.

---

## `mds deploy`

**Purpose:** Trigger and monitor a client's Amplify build.

```bash
mds deploy --client venture-builders
mds deploy --client venture-builders --wait
mds deploy --client venture-builders --validate
```

**What it does:**
1. Calls `aws amplify start-job --job-type RELEASE`
2. Polls for completion (with `--wait`)
3. Runs post-deploy validation (with `--validate`):
   - JS asset Content-Type check
   - Cache header verification
   - API URL compiled-in check
   - Nested route hard-refresh test
4. Updates `mds-deployments` with new job ID, commit, status
5. Creates `deployment` event in `mds-events`

---

## `mds doctor`

**Purpose:** Automated health sweep across all active clients.

```bash
mds doctor
mds doctor --client venture-builders
mds doctor --fix
```

**What it checks:**

For each active client in `mds-clients`:
- Frontend: `curl -s -o /dev/null -w "%{http_code}" https://www.<domain>`
- API: authenticated GET to admin/leads endpoint
- Latest Amplify job status
- Lead table accessible (DynamoDB describe-table)
- SSL cert validity (certificate expiry)
- DNS resolution correct

**Output format:**
```
[OK]   venture-builders  frontend=200  api=200  deploy=SUCCEED  leads=3
[WARN] acme              frontend=200  api=401  deploy=SUCCEED  leads=12  ← api auth issue
[FAIL] example-co        frontend=503  api=N/A  deploy=FAILED   leads=0   ← frontend down
```

**With `--fix`:**
- Clears stale CDN cache (triggers new build)
- Resets Lambda env vars from `.mds-<slug>-resources.json`
- Re-registers missing routes in API Gateway

---

## `mds sync-client`

**Purpose:** Reconcile drift between live AWS infrastructure and MDS records.

```bash
mds sync-client --client venture-builders
mds sync-client --all
```

**What it does:**
1. Runs the same discovery queries as the onboarding discovery phase
2. Compares live state against `mds-clients` record
3. Reports drifted fields (new Lambda, different API URL, changed domain, etc.)
4. With `--update`: writes discovered state back to `mds-clients` and creates a `sync` event

**Drift examples it catches:**
- Lambda function updated but `mds-clients.lambdas` not updated
- New Amplify build but `deployStatus` still shows old job ID
- Lead count in DynamoDB increased but `mds-clients.leadCount` is stale

---

## `mds onboard`

**Purpose:** Automate the existing-client ingestion process from `client-onboarding.md`.

```bash
mds onboard --client venture-builders
```

**What it does:**
1. Runs parallel AWS discovery (Amplify, Lambda, API Gateway, DynamoDB)
2. Identifies resources by name prefix matching `<client>-*`
3. Downloads and inspects Lambda handlers to find auth mechanisms
4. Tests live endpoints to confirm health
5. Creates/updates `mds-clients` record
6. Hydrates `mds-deployments`
7. Bridges leads from native table to `mds-leads`
8. Creates onboarding events
9. Runs validation checklist
10. Outputs discovery report

---

## `mds logs`

**Purpose:** Tail CloudWatch logs for any Lambda.

```bash
mds logs mds-panel-api
mds logs venture-builders          # tails all vb-* lambdas
mds logs --all --since 1h
```

Wrapper around:
```bash
aws logs tail /aws/lambda/<function> --region us-east-1 --since <duration>
```

---

## `mds status`

**Purpose:** Instant platform snapshot (replaces reading `current-state.md`).

```bash
mds status
```

**Output:**
```
MDS Platform Status — 2026-05-10 07:45 UTC

Amplify Apps:
  Moore-Digital (dq6bff22v126m)  main  job#19  SUCCEED  2026-05-10
  Venture-Builders-Live (d64...)  main  job#36  SUCCEED  2026-05-09

Active Clients: 1
  venture-builders  active  www.venturebuildersmbs.com  3 leads

Lambda Functions: 3 active
  mds-panel-api     us-east-1  nodejs22.x
  vb-submit-lead    us-east-1  nodejs22.x
  vb-admin-api      us-east-1  nodejs22.x

API Gateway: 2 active
  mds-panel-api  HTTP v2  qkudf4zvv8
  vb-lead-api    REST v1  yl66hfyp08

DynamoDB Tables: 5 active
  mds-clients(1)  mds-leads(3)  mds-deployments(1)  mds-events(3)  vb-leads(3)
```

---

## Implementation Priority

| Command | Priority | Complexity | Value |
|---|---|---|---|
| `mds doctor` | HIGH | Medium | Replaces manual health checks after every deploy |
| `mds deploy` | HIGH | Low | Single command deploys with validation |
| `mds sync-client` | MEDIUM | Medium | Prevents mds-clients drift over time |
| `mds status` | MEDIUM | Low | Replaces reading current-state.md |
| `mds onboard` | MEDIUM | High | Template already exists in client-onboarding.md |
| `mds create-client` | LOW | High | Needed once per new greenfield client |
| `mds logs` | LOW | Low | Minor wrapper, `aws logs tail` already works |

---

## Technical Architecture

### Language

Node.js (ESM, `"type":"module"`) — consistent with existing Lambda codebase. No transpilation needed.

### Dependencies

Minimal: only `@aws-sdk/client-*` packages (already in use) and `@aws-sdk/util-dynamodb`.

### Config file

`mds.config.json` in project root:
```json
{
  "accountId":   "028919064032",
  "amplifyRegion": "us-east-2",
  "lambdaRegion":  "us-east-1",
  "panelAppId":    "dq6bff22v126m",
  "panelApiId":    "qkudf4zvv8"
}
```

### Location

`mds-panel/cli/` — separate from the Lambda code but in the same repository.

```
mds-panel/
├── cli/
│   ├── index.mjs          ← entry point, command router
│   ├── commands/
│   │   ├── doctor.mjs
│   │   ├── deploy.mjs
│   │   ├── sync-client.mjs
│   │   ├── onboard.mjs
│   │   ├── status.mjs
│   │   └── logs.mjs
│   └── lib/
│       ├── aws.mjs        ← AWS SDK wrappers
│       ├── mds-api.mjs    ← MDS REST API client
│       └── validate.mjs   ← Health check functions
└── lambda/
    └── mds-api/           ← existing Lambda code
```
