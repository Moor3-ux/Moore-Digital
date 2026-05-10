/**
 * panel.config.js — MDS Control Panel Configuration
 *
 * DEMO DATA: shown when VITE_MDS_API_URL is not set.
 * These represent realistic client deployments managed by Moore Digital Solutions.
 */

const now = Date.now()
const ago = (ms) => new Date(now - ms).toISOString()
const MIN = 60_000, HR = 3_600_000, DAY = 86_400_000

// ── Demo Clients ──────────────────────────────────────────────────────────────
export const DEMO_CLIENTS = [
  {
    clientId:         'riverside-plumbing',
    name:             'Riverside Plumbing',
    status:           'active',
    domain:           'riversideplumbing.com',
    industry:         'Home Services',
    primaryColor:     '#0ea5e9',
    apiUrl:           'https://abc123.execute-api.us-east-1.amazonaws.com',
    amplifyAppId:     'd1a2b3c4e5f6',
    deploymentStatus: 'SUCCEEDED',
    createdAt:        ago(30 * DAY),
    monthlyPlan:      'Professional',
  },
  {
    clientId:         'mountain-steel',
    name:             'Mountain Steel Co.',
    status:           'active',
    domain:           'mountainsteel.com',
    industry:         'Manufacturing',
    primaryColor:     '#f59e0b',
    apiUrl:           'https://xyz789.execute-api.us-east-1.amazonaws.com',
    amplifyAppId:     'g7h8i9j0k1l2',
    deploymentStatus: 'SUCCEEDED',
    createdAt:        ago(21 * DAY),
    monthlyPlan:      'Professional',
  },
  {
    clientId:         'summit-roofing',
    name:             'Summit Roofing LLC',
    status:           'warning',
    domain:           'summitroofing.io',
    industry:         'Construction',
    primaryColor:     '#10b981',
    apiUrl:           'https://def456.execute-api.us-east-1.amazonaws.com',
    amplifyAppId:     'm3n4o5p6q7r8',
    deploymentStatus: 'FAILED',
    createdAt:        ago(14 * DAY),
    monthlyPlan:      'Starter',
  },
  {
    clientId:         'valley-hvac',
    name:             'Valley HVAC Solutions',
    status:           'active',
    domain:           'valleyhvac.com',
    industry:         'Home Services',
    primaryColor:     '#8b5cf6',
    apiUrl:           'https://ghi012.execute-api.us-east-1.amazonaws.com',
    amplifyAppId:     's9t0u1v2w3x4',
    deploymentStatus: 'SUCCEEDED',
    createdAt:        ago(7 * DAY),
    monthlyPlan:      'Starter',
  },
  {
    clientId:         'metro-electric',
    name:             'Metro Electric Inc.',
    status:           'inactive',
    domain:           'metroelectric.co',
    industry:         'Electrical',
    primaryColor:     '#ef4444',
    apiUrl:           '',
    amplifyAppId:     '',
    deploymentStatus: 'PENDING',
    createdAt:        ago(2 * DAY),
    monthlyPlan:      'Starter',
  },
]

// ── Demo Leads ────────────────────────────────────────────────────────────────
export const DEMO_LEADS = [
  {
    leadId: 'lead-001', clientId: 'riverside-plumbing', createdAt: ago(25 * MIN),
    status: 'New', contactName: 'John Smith', email: 'john@email.com',
    phone: '(555) 123-4567', source: 'Google Ads',
    notes: '', message: 'Emergency — burst pipe in basement',
  },
  {
    leadId: 'lead-002', clientId: 'riverside-plumbing', createdAt: ago(3 * HR),
    status: 'Contacted', contactName: 'Sarah Davis', email: 'sdavis@gmail.com',
    phone: '(555) 987-6543', source: 'Website',
    notes: 'Called 5/9 — sending quote tomorrow', message: 'Full bathroom remodel, need plumbing rerouted',
  },
  {
    leadId: 'lead-003', clientId: 'riverside-plumbing', createdAt: ago(2 * DAY),
    status: 'Won', contactName: 'Robert Chen', email: 'rchen@business.com',
    phone: '(555) 555-0100', source: 'Referral',
    notes: 'Contract signed. Deposit received.', message: 'Water heater replacement + inspection',
  },
  {
    leadId: 'lead-004', clientId: 'riverside-plumbing', createdAt: ago(5 * DAY),
    status: 'Lost', contactName: 'Lisa Park', email: 'lpark@home.com',
    phone: '(555) 222-3333', source: 'Google Search',
    notes: 'Went with competitor — price too high', message: 'Kitchen sink installation',
  },
  {
    leadId: 'lead-005', clientId: 'mountain-steel', createdAt: ago(1 * HR),
    status: 'New', contactName: 'Tom Harrington', email: 'tom@abcconstruction.com',
    phone: '(555) 444-5555', source: 'LinkedIn',
    notes: '', message: 'Need structural steel quote for 3-story commercial build',
  },
  {
    leadId: 'lead-006', clientId: 'mountain-steel', createdAt: ago(6 * HR),
    status: 'Quote Sent', contactName: 'Karen Mills', email: 'karen@industrialcorp.com',
    phone: '(555) 666-7777', source: 'Trade Show',
    notes: 'Quote sent 5/8. Follow up Friday.', message: 'Metal roofing panels — 40,000 sq ft',
  },
  {
    leadId: 'lead-007', clientId: 'mountain-steel', createdAt: ago(3 * DAY),
    status: 'Won', contactName: 'Denver Builders LLC', email: 'info@denverbuilders.com',
    phone: '(303) 888-9999', source: 'Google Ads',
    notes: 'PO received. Delivery scheduled 6/1.', message: 'I-beams and rebar for parking garage project',
  },
  {
    leadId: 'lead-008', clientId: 'summit-roofing', createdAt: ago(2 * HR),
    status: 'New', contactName: 'Mike Anderson', email: 'manderson@home.net',
    phone: '(555) 100-2000', source: 'Website',
    notes: '', message: 'Full roof replacement after storm damage — 2,800 sq ft',
  },
  {
    leadId: 'lead-009', clientId: 'summit-roofing', createdAt: ago(1 * DAY),
    status: 'Contacted', contactName: 'Nancy Webb', email: 'nwebb@condo.org',
    phone: '(555) 300-4000', source: 'Nextdoor',
    notes: 'HOA approval needed before work starts', message: 'Flat roof repair on commercial building',
  },
  {
    leadId: 'lead-010', clientId: 'valley-hvac', createdAt: ago(45 * MIN),
    status: 'New', contactName: 'Emily Johnson', email: 'emily.j@gmail.com',
    phone: '(555) 500-6000', source: 'Google Search',
    notes: '', message: 'AC installation for new home — 2,400 sq ft',
  },
  {
    leadId: 'lead-011', clientId: 'valley-hvac', createdAt: ago(4 * HR),
    status: 'Contacted', contactName: 'David Brown', email: 'dbrown@office.com',
    phone: '(555) 700-8000', source: 'Yelp',
    notes: 'Scheduled diagnostic for 5/12 10am', message: 'Furnace not heating — emergency repair needed',
  },
  {
    leadId: 'lead-012', clientId: 'valley-hvac', createdAt: ago(2 * DAY),
    status: 'Won', contactName: 'Jennifer White', email: 'jwhite@residence.com',
    phone: '(555) 900-0011', source: 'Referral',
    notes: 'Deposit paid. Install week of 5/20.', message: 'Full HVAC system replacement — old unit failed',
  },
]

// ── Demo Deployments ──────────────────────────────────────────────────────────
export const DEMO_DEPLOYMENTS = [
  {
    deploymentId: 'deploy-001', clientId: 'riverside-plumbing',
    buildHash: 'a1b2c3d', deployedAt: ago(2 * HR),
    amplifyStatus: 'SUCCEED', apiHealth: 'healthy', frontendHealth: 'healthy',
    diagnosticsSummary: 'All systems nominal',
  },
  {
    deploymentId: 'deploy-002', clientId: 'mountain-steel',
    buildHash: 'e4f5g6h', deployedAt: ago(6 * HR),
    amplifyStatus: 'SUCCEED', apiHealth: 'healthy', frontendHealth: 'healthy',
    diagnosticsSummary: 'API latency spike detected (1.8s avg), monitoring',
  },
  {
    deploymentId: 'deploy-003', clientId: 'summit-roofing',
    buildHash: 'i7j8k9l', deployedAt: ago(3 * HR),
    amplifyStatus: 'FAILED', apiHealth: 'unhealthy', frontendHealth: 'pending',
    diagnosticsSummary: 'Build failed: npm ci exit code 1 — lockfile conflict',
  },
  {
    deploymentId: 'deploy-004', clientId: 'valley-hvac',
    buildHash: 'm1n2o3p', deployedAt: ago(1 * DAY),
    amplifyStatus: 'SUCCEED', apiHealth: 'healthy', frontendHealth: 'healthy',
    diagnosticsSummary: 'All systems nominal',
  },
  {
    deploymentId: 'deploy-005', clientId: 'metro-electric',
    buildHash: null, deployedAt: null,
    amplifyStatus: 'PENDING', apiHealth: 'pending', frontendHealth: 'pending',
    diagnosticsSummary: 'Awaiting initial deployment configuration',
  },
]

// ── Demo Events ───────────────────────────────────────────────────────────────
export const DEMO_EVENTS = [
  {
    eventId: 'evt-001', clientId: 'summit-roofing', category: 'DEPLOYMENTS',
    severity: 'ERROR', timestamp: ago(3 * HR),
    message: 'Amplify build failed — npm ci exit code 1. Lockfile conflict detected. Re-run after resolving package-lock.json.',
  },
  {
    eventId: 'evt-002', clientId: 'summit-roofing', category: 'API',
    severity: 'ERROR', timestamp: ago(3 * HR + 2 * MIN),
    message: 'Lambda 502 on GET /admin/leads — function returned no response. Likely crashed during cold-start. Check CloudWatch.',
  },
  {
    eventId: 'evt-003', clientId: 'mountain-steel', category: 'API',
    severity: 'WARN', timestamp: ago(1 * HR),
    message: 'API response time >2s for GET /admin/leads (avg 1.8s over 10 min window). DynamoDB Scan on large table — consider pagination.',
  },
  {
    eventId: 'evt-004', clientId: 'riverside-plumbing', category: 'DASHBOARD',
    severity: 'INFO', timestamp: ago(30 * MIN),
    message: 'New lead received: John Smith (Emergency plumbing). Source: Google Ads.',
  },
  {
    eventId: 'evt-005', clientId: 'valley-hvac', category: 'DEPLOYMENTS',
    severity: 'INFO', timestamp: ago(1 * DAY),
    message: 'Deployment completed successfully. Build hash: m1n2o3p. Amplify status: SUCCEED.',
  },
  {
    eventId: 'evt-006', clientId: 'riverside-plumbing', category: 'DEPLOYMENTS',
    severity: 'INFO', timestamp: ago(2 * HR),
    message: 'Deployment completed successfully. Build hash: a1b2c3d. Amplify status: SUCCEED.',
  },
  {
    eventId: 'evt-007', clientId: 'metro-electric', category: 'ENV',
    severity: 'WARN', timestamp: ago(2 * DAY),
    message: 'Client onboarded but VITE_MDS_API_URL not yet set in Amplify. Running in demo mode. Configure environment variables to activate.',
  },
  {
    eventId: 'evt-008', clientId: 'mountain-steel', category: 'DEPLOYMENTS',
    severity: 'INFO', timestamp: ago(6 * HR),
    message: 'Deployment completed successfully. Build hash: e4f5g6h. Amplify status: SUCCEED.',
  },
]

// ── Status Options (shared with client systems) ───────────────────────────────
export const LEAD_STATUSES = ['New', 'Contacted', 'Quote Sent', 'Won', 'Lost', 'Archived']

export const LEAD_STATUS_COLORS = {
  'New':        { cls: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  'Contacted':  { cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  'Quote Sent': { cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  'Won':        { cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  'Lost':       { cls: 'bg-red-500/10 text-red-400 border-red-500/20' },
  'Archived':   { cls: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
}

export const CLIENT_STATUS_COLORS = {
  active:   { cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400' },
  warning:  { cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20',       dot: 'bg-amber-400' },
  inactive: { cls: 'bg-slate-500/10 text-slate-400 border-slate-500/20',       dot: 'bg-slate-400' },
  error:    { cls: 'bg-red-500/10 text-red-400 border-red-500/20',             dot: 'bg-red-400' },
}

export const DEPLOYMENT_STATUS_COLORS = {
  SUCCEED:    { cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  SUCCEEDED:  { cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  FAILED:     { cls: 'bg-red-500/10 text-red-400 border-red-500/20' },
  IN_PROGRESS:{ cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  PENDING:    { cls: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
}

export const SEVERITY_COLORS = {
  ERROR: { cls: 'bg-red-500/10 text-red-400 border-red-500/20' },
  WARN:  { cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  INFO:  { cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  DEBUG: { cls: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
}

export const HEALTH_COLORS = {
  healthy:   { cls: 'text-emerald-400', icon: '✓' },
  unhealthy: { cls: 'text-red-400',     icon: '✗' },
  pending:   { cls: 'text-slate-400',   icon: '○' },
  unknown:   { cls: 'text-slate-400',   icon: '?' },
}
