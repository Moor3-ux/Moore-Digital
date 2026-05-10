# MDS AWS Resources
> Source of truth for all AWS infrastructure.
> Account: 028919064032 | Primary region: us-east-1 | Amplify region: us-east-2

---

## Amplify Apps

### Moore-Digital
| Field | Value |
|---|---|
| App ID | `dq6bff22v126m` |
| Region | us-east-2 |
| Name | Moore-Digital |
| Repo | https://github.com/Moor3-ux/Moore-Digital |
| Branch | main |
| Domain | www.mooreds.net |
| CloudFront | (Amplify-managed, internal) |
| Last Build | job #19, 2026-05-10, SUCCEED |
| Last Commit | `f3d19c8bc2a5294d157b9f52aa44fcdd67c4f25e` |
| WAF | None |

**Environment Variables (Amplify console):**
```
VITE_MDS_API_URL  = https://qkudf4zvv8.execute-api.us-east-1.amazonaws.com
VITE_MDS_PANEL_KEY = <secret>
```

**Custom Rewrite Rules (order-sensitive):**
```json
[
  {"source":"https://mooreds.net","target":"https://www.mooreds.net","status":"302"},
  {"source":"/admin/assets/<*>","target":"/admin/assets/<*>","status":"200"},
  {"source":"/admin/<*>","target":"/admin/index.html","status":"200"},
  {"source":"/<*>","target":"/index.html","status":"404-200"}
]
```

---

### Venture-Builders-Live
| Field | Value |
|---|---|
| App ID | `d64oi6w1xtlwf` |
| Region | us-east-2 |
| Name | Venture-Builders-Live |
| Repo | https://github.com/Moor3-ux/Venture-Builders-Live |
| Branch | main |
| Domain | www.venturebuildersmbs.com |
| CloudFront | dfbrrn3yx9cg3.cloudfront.net |
| Last Build | job #36, 2026-05-09, SUCCEED |
| Last Commit | `b452c8b0caa657a0ddc14929256c9451d0c6adb3` |
| WAF | `CreatedByAmplify-d64oi6w1xtlwf-...` |
| Build Compute | STANDARD_8GB |

**Environment Variables:**
```
VITE_API_URL = https://yl66hfyp08.execute-api.us-east-1.amazonaws.com/prod
```

**Custom Rewrite Rules:**
```json
[
  {"source":"https://venturebuildersmbs.com","target":"https://www.venturebuildersmbs.com","status":"302"},
  {"source":"</^[^.]+$|.../>","target":"/index.html","status":"200"},
  {"source":"/<*>","target":"/index.html","status":"404-200"}
]
```

**Domain status:** www subdomain verified ✅ | apex domain CNAME pending ⚠️

---

## Lambda Functions (us-east-1)

### mds-panel-api
| Field | Value |
|---|---|
| ARN | `arn:aws:lambda:us-east-1:028919064032:function:mds-panel-api` |
| Runtime | nodejs22.x |
| Handler | index.handler |
| Memory | 256 MB |
| Timeout | 30s |
| Role | `mds-panel-lambda-role` |
| Last Modified | 2026-05-10 |

**Env vars:**
```
PANEL_KEY  = <secret>
DDB_REGION = us-east-1
```

---

### vb-submit-lead
| Field | Value |
|---|---|
| Function | `vb-submit-lead` |
| Runtime | nodejs22.x |
| Handler | index.handler |
| Memory | 128 MB |
| Timeout | 30s |
| Role | `vb-lambda-role` |
| Last Modified | 2026-05-09 |

**Env vars:**
```
DDB_TABLE       = vb-leads
DDB_REGION      = us-east-1
SES_REGION      = us-east-1
FROM_EMAIL      = info@VentureBuildersMBS.com
OWNER_EMAIL     = info@VentureBuildersMBS.com
ALLOWED_ORIGINS = https://venturebuildersmbs.com
```

---

### vb-admin-api
| Field | Value |
|---|---|
| Function | `vb-admin-api` |
| Runtime | nodejs22.x |
| Handler | index.handler |
| Memory | 128 MB |
| Timeout | 30s |
| Role | `vb-lambda-role` |
| Last Modified | 2026-05-09 |

**Env vars:**
```
DDB_TABLE       = vb-leads
ADMIN_PASSWORD  = <secret>
DDB_REGION      = us-east-1
ALLOWED_ORIGINS = https://venturebuildersmbs.com
```

**Auth:** `x-admin-password` header (NOT Authorization, NOT Bearer)

---

## API Gateway

### mds-panel-api (HTTP v2)
| Field | Value |
|---|---|
| API ID | `qkudf4zvv8` |
| Type | HTTP API (v2) |
| Region | us-east-1 |
| Endpoint | `https://qkudf4zvv8.execute-api.us-east-1.amazonaws.com` |
| Stage | `$default` (auto-deploy) |
| Integration | AWS_PROXY, payload format 2.0 |
| CORS | AllowOrigins: `*`, AllowHeaders: `Content-Type,x-mds-panel-key` |

**Critical:** Uses payload format 2.0 → Lambda must read `event.requestContext.http.method`, NOT `event.httpMethod`.

---

### vb-lead-api (REST v1)
| Field | Value |
|---|---|
| API ID | `yl66hfyp08` |
| Type | REST API (v1) |
| Region | us-east-1 |
| Endpoint | `https://yl66hfyp08.execute-api.us-east-1.amazonaws.com/prod` |
| Stage | `prod` |
| Deployment | `bhle4r` |

**Routes:**
```
POST /leads                    → vb-submit-lead (public, no auth)
GET  /admin/leads              → vb-admin-api (x-admin-password)
PUT  /admin/leads/{leadId}     → vb-admin-api (x-admin-password)
GET  /admin/export             → vb-admin-api (x-admin-password)
OPTIONS *                      → CORS preflight
```

---

## DynamoDB Tables (us-east-1)

### mds-clients
| Field | Value |
|---|---|
| Table | `mds-clients` |
| PK | `clientId` (S) |
| Billing | PAY_PER_REQUEST |
| GSI | None |

### mds-leads
| Field | Value |
|---|---|
| Table | `mds-leads` |
| PK | `leadId` (S) |
| Billing | PAY_PER_REQUEST |
| GSI | `clientId-createdAt-index` (clientId HASH, createdAt RANGE) |

### mds-deployments
| Field | Value |
|---|---|
| Table | `mds-deployments` |
| PK | `deploymentId` (S) |
| Billing | PAY_PER_REQUEST |
| GSI | `clientId-deployedAt-index` (clientId HASH, deployedAt RANGE) |

### mds-events
| Field | Value |
|---|---|
| Table | `mds-events` |
| PK | `eventId` (S) |
| Billing | PAY_PER_REQUEST |
| GSI | `clientId-timestamp-index` (clientId HASH, timestamp RANGE) |

### vb-leads
| Field | Value |
|---|---|
| Table | `vb-leads` |
| PK | `leadId` (S) |
| Billing | PAY_PER_REQUEST |
| GSI | None |
| Items | 3 (test/archived) |

**Schema fields:** leadId, fullName, email, phone, company, location, buildingType, buildingSize, budget, timeline, referral, message, pageUrl, referrerUrl, fileAttached, status, createdAt, updatedAt, notes

---

## IAM Roles

### mds-panel-lambda-role
- **Trusts:** lambda.amazonaws.com
- **Policies:** AWSLambdaBasicExecutionRole, AmazonDynamoDBFullAccess

### vb-lambda-role
- **Trusts:** lambda.amazonaws.com
- **Policies:** AWSLambdaBasicExecutionRole, AmazonDynamoDBFullAccess, SES send access

---

## Route53 / DNS

### mooreds.net
- `www` CNAME → Amplify CloudFront (Moore-Digital app)
- Apex → redirects to www via Amplify rule

### venturebuildersmbs.com
- `www` CNAME → `dfbrrn3yx9cg3.cloudfront.net` ✅ verified
- Apex CNAME → pending (DNS not yet updated for apex verification) ⚠️
- ACM cert: `_765b0e62a70dba86c943f2957a4a25fa.venturebuildersmbs.com` → ACM validation CNAME

---

## SES (us-east-1)

- From address: `info@VentureBuildersMBS.com`
- Used by: `vb-submit-lead` for owner + customer confirmation emails
- Verification status: assumed verified (production emails sending)
