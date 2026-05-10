import { useState }   from 'react'
import { useApi }     from '../hooks/useApi.js'
import { api, DEMO_MODE } from '../lib/api.js'
import PageHeader     from '../components/PageHeader.jsx'

export default function Settings() {
  const [testing,  setTesting]  = useState(false)
  const [testResult, setTestResult] = useState(null)

  const build = window.__MDS_BUILD__

  async function testConnection() {
    setTesting(true)
    setTestResult(null)
    try {
      const res = await api.health()
      setTestResult({ ok: true, message: res.message || 'Connection successful', ts: res.ts })
    } catch (err) {
      setTestResult({ ok: false, message: err.message })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div>
      <PageHeader title="Settings" description="MDS Panel configuration and diagnostics" />

      <div className="max-w-2xl space-y-5">

        {/* Connection */}
        <Section title="API Connection">
          <Row label="Mode">
            {DEMO_MODE
              ? <span className="badge bg-amber-500/10 text-amber-400 border-amber-500/20">DEMO MODE</span>
              : <span className="badge bg-emerald-500/10 text-emerald-400 border-emerald-500/20">LIVE</span>
            }
          </Row>
          <Row label="API URL">
            <code className="monospace text-slate-400">
              {import.meta.env.VITE_MDS_API_URL || '(not set — demo mode)'}
            </code>
          </Row>
          <Row label="Panel Key">
            <code className="monospace text-slate-400">
              {import.meta.env.VITE_MDS_PANEL_KEY ? '••••••••' : '(not set)'}
            </code>
          </Row>
          <Row label="AWS Region">
            <code className="monospace text-slate-400">
              {import.meta.env.VITE_AWS_REGION || 'us-east-1'}
            </code>
          </Row>
          <div className="mt-3 flex items-center gap-3">
            <button
              className="btn-primary text-sm"
              onClick={testConnection}
              disabled={testing}
            >
              {testing ? 'Testing…' : 'Test API Connection'}
            </button>
            {testResult && (
              <span className={`text-sm ${testResult.ok ? 'text-emerald-400' : 'text-red-400'}`}>
                {testResult.ok ? '✓' : '✗'} {testResult.message}
              </span>
            )}
          </div>
          {DEMO_MODE && (
            <p className="mt-3 text-xs text-slate-500 leading-relaxed">
              To connect to AWS: set <code className="font-mono">VITE_MDS_API_URL</code> and <code className="font-mono">VITE_MDS_PANEL_KEY</code>{' '}
              in your <code className="font-mono">.env.local</code> file (local dev) or Amplify environment variables (production).
            </p>
          )}
        </Section>

        {/* Build Info */}
        {build && (
          <Section title="Build Identification">
            <Row label="Panel">     <Mono>{build.panel}</Mono></Row>
            <Row label="Version">   <Mono>{build.version}</Mono></Row>
            <Row label="Commit">    <Mono>{build.commit}</Mono></Row>
            <Row label="Frontend">  <Mono>{build.frontendHash}</Mono></Row>
            <Row label="Built At">  <Mono>{new Date(build.builtAt).toLocaleString()}</Mono></Row>
            <Row label="Env">       <Mono>{build.env}</Mono></Row>
          </Section>
        )}

        {/* DynamoDB Tables */}
        <Section title="DynamoDB Tables">
          <p className="text-xs text-slate-500 mb-3">
            All tables are provisioned in pay-per-request mode. Run <code className="font-mono">bash infra/setup.sh</code> to create them.
          </p>
          {['mds-clients', 'mds-leads', 'mds-deployments', 'mds-events'].map(table => (
            <Row key={table} label={table}>
              <span className="text-slate-400 text-xs">{TABLE_SCHEMAS[table]}</span>
            </Row>
          ))}
        </Section>

        {/* Infra Scripts */}
        <Section title="Infrastructure Scripts">
          <div className="space-y-2 text-sm">
            <ScriptRow cmd="bash infra/setup.sh"    desc="Create all AWS resources (DynamoDB, Lambda, API Gateway)" />
            <ScriptRow cmd="bash infra/validate.sh" desc="Verify all resources exist and API Gateway routes work" />
            <ScriptRow cmd="bash infra/teardown.sh" desc="Remove all AWS resources (destructive)" />
          </div>
        </Section>

        {/* MDS-DIAG */}
        <Section title="MDS-DIAG Console Diagnostics">
          <p className="text-xs text-slate-500 mb-3">
            Open browser DevTools → Console and filter by <code className="font-mono">MDS-DIAG</code> to see structured diagnostic output.
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-400">
            {['ENV', 'BUILD', 'AUTH', 'API', 'NETWORK', 'DEPLOY', 'PANEL', 'ERR', 'WARN'].map(cat => (
              <div key={cat} className="bg-slate-800 px-2 py-1 rounded">[MDS-DIAG/{cat}]</div>
            ))}
          </div>
        </Section>

      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="card p-5">
      <h2 className="text-sm font-semibold text-slate-200 mb-4">{title}</h2>
      <div className="space-y-2.5">{children}</div>
    </div>
  )
}

function Row({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-slate-500 flex-shrink-0 w-28">{label}</span>
      <div className="text-right flex-1">{children}</div>
    </div>
  )
}

function Mono({ children }) {
  return <code className="monospace text-slate-400">{children}</code>
}

function ScriptRow({ cmd, desc }) {
  return (
    <div>
      <code className="monospace text-indigo-400">{cmd}</code>
      <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
    </div>
  )
}

const TABLE_SCHEMAS = {
  'mds-clients':     'clientId (String)',
  'mds-leads':       'leadId (String) · GSI: clientId+createdAt',
  'mds-deployments': 'deploymentId (String) · GSI: clientId+deployedAt',
  'mds-events':      'eventId (String) · GSI: clientId+timestamp',
}
