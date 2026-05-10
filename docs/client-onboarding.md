# MDS Client Onboarding
> Template process based on Venture Builders onboarding (2026-05-10).

---

## Two Onboarding Paths

| Path | When to use |
|---|---|
| **Greenfield** | New client, no existing AWS infra |
| **Ingestion** | Existing production client being brought into MDS visibility |

---

## Path A: Greenfield Onboarding

For a new client with no existing infrastructure.

### Step 1: Provision client AWS infrastructure

Use `mds-panel/infra/setup.sh` as a reference. Manually execute AWS CLI commands or adapt the script:

```bash
# 1. DynamoDB lead table (client-specific)
aws dynamodb create-table \
  --table-name <client>-leads \
  --attribute-definitions AttributeName=leadId,AttributeType=S \
  --key-schema AttributeName=leadId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

# 2. IAM role
aws iam create-role \
  --role-name <client>-lambda-role \
  --assume-role-policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"lambda.amazonaws.com"},"Action":"sts:AssumeRole"}]}'

aws iam attach-role-policy --role-name <client>-lambda-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
aws iam attach-role-policy --role-name <client>-lambda-role \
  --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess

# 3. Lambda functions (submit-lead, admin-api)
# Package then create:
aws lambda create-function \
  --function-name <client>-submit-lead \
  --runtime nodejs22.x \
  --role <role-arn> \
  --handler index.handler \
  --zip-file fileb://lambda.zip \
  --timeout 30 --memory-size 128 \
  --region us-east-1

# 4. API Gateway REST API
aws apigateway create-rest-api --name <client>-api --region us-east-1
# (Add resources, methods, integrations, deploy to prod stage)

# 5. Amplify app
aws amplify create-app --name <Client-Name-Live> --region us-east-2
aws amplify create-branch --app-id <id> --branch-name main --stage PRODUCTION --region us-east-2
```

### Step 2: Register in MDS

```bash
MDS_API="https://qkudf4zvv8.execute-api.us-east-1.amazonaws.com"

curl -X POST "$MDS_API/clients" \
  -H "Content-Type: application/json" \
  -H "x-mds-panel-key: <key>" \
  -d '{
    "clientId":       "<slug>",
    "name":           "<Full Client Name>",
    "domain":         "<domain.com>",
    "industry":       "<Industry>",
    "status":         "active",
    "plan":           "standard",
    "amplifyAppId":   "<id>",
    "amplifyRegion":  "us-east-2",
    "apiUrl":         "<api-url>",
    "leadTable":      "<client>-leads",
    "environment":    "production"
  }'
```

### Step 3: Create initial deployment record

```bash
curl -X POST "$MDS_API/deployments" \
  -H "Content-Type: application/json" \
  -H "x-mds-panel-key: <key>" \
  -d '{
    "clientId":       "<slug>",
    "deployedAt":     "<ISO timestamp>",
    "amplifyAppId":   "<id>",
    "commitHash":     "<hash>",
    "amplifyStatus":  "SUCCEED",
    "frontendUrl":    "https://www.<domain>",
    "apiUrl":         "<api-url>",
    "environment":    "production"
  }'
```

### Step 4: Validate

- Frontend returns HTTP 200
- Lead form submits successfully (check DynamoDB)
- Admin API responds with correct auth header
- Client appears in MDS panel Clients page

---

## Path B: Existing Client Ingestion

For a client already running in production. Based on the Venture Builders template.

### Step 1: Discovery (read-only)

Run all discovery in parallel. Do NOT modify anything.

```bash
# Amplify apps
aws amplify list-apps --region us-east-2 --output json
aws amplify list-apps --region us-east-1 --output json

# Lambda functions
aws lambda list-functions --region us-east-1 \
  --query 'Functions[*].{name:FunctionName,runtime:Runtime}' --output json

# API Gateways
aws apigatewayv2 get-apis --region us-east-1 --output json
aws apigateway get-rest-apis --region us-east-1 --output json

# DynamoDB tables
aws dynamodb list-tables --region us-east-1 --output json

# IAM roles (filter by client name)
aws iam list-roles --query 'Roles[?contains(RoleName,`<client>`)].RoleName' --output json
```

**What to look for:**
- Amplify app → get app ID, last build job ID, commit hash, domain
- Lambda functions named `<client>-*` → get env vars (table names, API keys)
- API Gateway → get ID, stage, routes
- DynamoDB tables named `<client>-*` → get schema, item count, GSI config

### Step 2: Inspect discovered resources

```bash
# Deep-dive Amplify app
aws amplify get-app --app-id <id> --region us-east-2

# Get latest build
aws amplify get-job --app-id <id> --branch-name main --job-id <jobId> \
  --region us-east-2

# Lambda env vars (reveals table names, passwords, keys)
aws lambda get-function-configuration \
  --function-name <client>-admin-api --region us-east-1 \
  --query '{env:Environment.Variables,role:Role}'

# Table item count
aws dynamodb describe-table --table-name <client>-leads --region us-east-1 \
  --query 'Table.{status:TableStatus,itemCount:ItemCount,keys:KeySchema}'

# API Gateway routes
aws apigateway get-resources --rest-api-id <id> --region us-east-1 \
  --query 'items[*].{path:path,methods:resourceMethods}'
```

### Step 3: Discover auth header format

Download and inspect the admin Lambda to find the auth mechanism:

```bash
URL=$(aws lambda get-function --function-name <client>-admin-api \
  --region us-east-1 --query 'Code.Location' --output text)
curl -s -L "$URL" -o /tmp/<client>-admin.zip
mkdir -p /tmp/<client>-admin && cd /tmp/<client>-admin
unzip ../admin.zip > /dev/null
grep -n "auth\|password\|header\|Authorization" index.mjs | head -20
```

### Step 4: Test live endpoints

```bash
# Frontend
curl -s -o /dev/null -w "%{http_code}" "https://www.<domain>"

# Admin API (with discovered auth)
curl -s -o /dev/null -w "%{http_code}" \
  "<api-url>/admin/leads" \
  -H "x-admin-password: <discovered-password>"
```

### Step 5: Register/update in MDS

Use `PUT /clients/<clientId>` if record exists, `POST /clients` if new:

```bash
curl -X PUT "$MDS_API/clients/<clientId>" \
  -H "Content-Type: application/json" \
  -H "x-mds-panel-key: <key>" \
  -d '{
    "name":           "<Full Name>",
    "domain":         "<domain>",
    "industry":       "<industry>",
    "status":         "active",
    "amplifyAppId":   "<id>",
    "amplifyRegion":  "us-east-2",
    "cloudfront":     "<cf-domain>",
    "apiUrl":         "<api-url>",
    "apiGatewayId":   "<api-id>",
    "leadTable":      "<client>-leads",
    "leadCount":      <N>,
    "lambdas":        ["<client>-submit-lead","<client>-admin-api"],
    "iamRole":        "<client>-lambda-role",
    "lastDeployAt":   "<ISO>",
    "lastDeployJob":  "<jobId>",
    "deployStatus":   "SUCCEED",
    "frontendStatus": "up",
    "environment":    "production"
  }'
```

### Step 6: Hydrate mds-deployments

```bash
curl -X POST "$MDS_API/deployments" \
  -H "Content-Type: application/json" \
  -H "x-mds-panel-key: <key>" \
  -d '{
    "clientId":       "<clientId>",
    "deployedAt":     "<lastDeployTime>",
    "amplifyAppId":   "<id>",
    "amplifyJobId":   "<jobId>",
    "branchName":     "main",
    "commitHash":     "<fullSHA>",
    "commitShort":    "<shortSHA>",
    "commitMessage":  "<message>",
    "amplifyStatus":  "SUCCEED",
    "frontendUrl":    "https://www.<domain>",
    "apiUrl":         "<api-url>",
    "cloudfront":     "<cf-domain>",
    "apiHealth":      "up",
    "frontendHealth": "up",
    "environment":    "production"
  }'
```

### Step 7: Bridge existing leads to mds-leads

Read leads from client's native table, write to `mds-leads` with `clientId` added. The `mds-leads` GSI requires `clientId` + `createdAt`.

```bash
# Scan client lead table
aws dynamodb scan --table-name <client>-leads --region us-east-1 \
  --query 'Items[*]' --output json

# For each lead, write to mds-leads
aws dynamodb put-item --table-name mds-leads --region us-east-1 \
  --item '{
    "leadId":    {"S":"<leadId>"},
    "clientId":  {"S":"<clientId>"},
    "createdAt": {"S":"<createdAt>"},
    "source":    {"S":"<client>-leads"},
    <...other fields...>
  }'
```

**Important:** Preserve the original lead table. This is additive — do NOT delete from the client's native table.

### Step 8: Create onboarding event

```bash
curl -X POST "$MDS_API/events" \
  -H "Content-Type: application/json" \
  -H "x-mds-panel-key: <key>" \
  -d '{
    "clientId":  "<clientId>",
    "timestamp": "<ISO now>",
    "category":  "onboarding",
    "severity":  "info",
    "message":   "Client onboarded into MDS. Discovered: Amplify <id>, API <api-id>, Lambda <fns>, DynamoDB <table> (<N> leads bridged).",
    "meta": {
      "amplifyAppId": "<id>",
      "apiGatewayId": "<api-id>",
      "leadsBridged": <N>
    }
  }'
```

### Step 9: Validation

```bash
# Client record
curl -s "$MDS_API/clients/<clientId>" -H "x-mds-panel-key: <key>"

# Leads visible via GSI
curl -s "$MDS_API/leads?clientId=<clientId>" -H "x-mds-panel-key: <key>" \
  | grep '"count"'

# Deployments
curl -s "$MDS_API/deployments?clientId=<clientId>" -H "x-mds-panel-key: <key>" \
  | grep '"count"'

# Events
curl -s "$MDS_API/events?clientId=<clientId>" -H "x-mds-panel-key: <key>" \
  | grep '"count"'

# Live frontend still up
curl -s -o /dev/null -w "%{http_code}" "https://www.<domain>"
# Expect: 200

# Live API still responding
curl -s -o /dev/null -w "%{http_code}" "<api-url>/admin/leads" \
  -H "x-admin-password: <password>"
# Expect: 200
```

---

## Post-Onboarding Checklist

- [ ] Client record in `mds-clients` with full metadata
- [ ] At least 1 deployment record in `mds-deployments`
- [ ] Leads bridged to `mds-leads` (even if 0 — verify GSI works)
- [ ] Onboarding event in `mds-events`
- [ ] Client appears in panel at `/admin` → Clients
- [ ] Leads visible at `/admin` → Leads (filtered by client)
- [ ] Deployment visible at `/admin` → Deployments
- [ ] Original client infrastructure untouched and still operational
- [ ] Update `docs/current-state.md`
- [ ] Update `docs/aws-resources.md`
