import { useState, useMemo }       from 'react'
import { useApi }                  from '../hooks/useApi.js'
import { api }                     from '../lib/api.js'
import { timeAgo, formatDateTime } from '../lib/utils.js'
import PageHeader                  from '../components/PageHeader.jsx'
import { DeployStatusBadge, HealthIndicator } from '../components/StatusBadge.jsx'
import EmptyState                  from '../components/EmptyState.jsx'

export default function Deployments() {
  const [clientFilter, setClientFilter] = useState('')

  const clients     = useApi(() => api.getClients())
  const deployments = useApi(() => api.getDeployments())

  const allClients     = clients.data?.clients         || []
  const allDeployments = deployments.data?.deployments || []

  const clientMap = useMemo(() => {
    const m = {}
    allClients.forEach(c => { m[c.clientId] = c })
    return m
  }, [allClients])

  const filtered = clientFilter
    ? allDeployments.filter(d => d.clientId === clientFilter)
    : allDeployments

  const failed    = allDeployments.filter(d => d.amplifyStatus === 'FAILED').length
  const succeeded = allDeployments.filter(d => ['SUCCEED','SUCCEEDED'].includes(d.amplifyStatus)).length
  const pending   = allDeployments.filter(d => d.amplifyStatus === 'PENDING').length

  return (
    <div>
      <PageHeader
        title="Deployments"
        description="Amplify build status, API health, and frontend integrity across all clients"
        actions={<button className="btn-ghost text-xs" onClick={deployments.refetch}>Refresh</button>}
      />

      {/* Summary Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <SummaryCard label="Succeeded" count={succeeded} color="text-emerald-400 border-emerald-500/20 bg-emerald-500/5" />
        <SummaryCard label="Failed"    count={failed}    color="text-red-400 border-red-500/20 bg-red-500/5" />
        <SummaryCard label="Pending"   count={pending}   color="text-slate-400 border-slate-500/20 bg-slate-800/50" />
      </div>

      {/* Filter */}
      <div className="mb-5">
        <select className="select w-auto" value={clientFilter} onChange={e => setClientFilter(e.target.value)}>
          <option value="">All Clients</option>
          {allClients.map(c => (
            <option key={c.clientId} value={c.clientId}>{c.name}</option>
          ))}
        </select>
      </div>

      {deployments.error && (
        <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
          {deployments.error}
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-800">
              <tr>
                <th className="th">Client</th>
                <th className="th">Amplify Status</th>
                <th className="th">Build Hash</th>
                <th className="th">API Health</th>
                <th className="th">Frontend</th>
                <th className="th">Deployed</th>
                <th className="th">Summary</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && !deployments.loading && (
                <tr>
                  <td colSpan="7">
                    <EmptyState title="No deployments found" description="Deployments are recorded automatically when infra/setup.sh runs." />
                  </td>
                </tr>
              )}
              {filtered.map(dep => {
                const client = clientMap[dep.clientId]
                return (
                  <tr key={dep.deploymentId} className="table-row">
                    <td className="td">
                      {client ? (
                        <div className="flex items-center gap-2">
                          <div
                            className="w-5 h-5 rounded flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                            style={{ backgroundColor: client.primaryColor || '#6366f1' }}
                          >
                            {client.name[0]}
                          </div>
                          <div>
                            <div className="text-slate-200 text-sm font-medium">{client.name}</div>
                            <div className="text-slate-500 text-xs">{dep.clientId}</div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-500 font-mono text-xs">{dep.clientId}</span>
                      )}
                    </td>
                    <td className="td">
                      <DeployStatusBadge status={dep.amplifyStatus} />
                    </td>
                    <td className="td">
                      <span className="font-mono text-xs text-slate-400">{dep.buildHash || '—'}</span>
                    </td>
                    <td className="td">
                      <HealthIndicator status={dep.apiHealth} />
                    </td>
                    <td className="td">
                      <HealthIndicator status={dep.frontendHealth} />
                    </td>
                    <td className="td text-slate-400 text-xs whitespace-nowrap">
                      {dep.deployedAt ? (
                        <span title={formatDateTime(dep.deployedAt)}>{timeAgo(dep.deployedAt)}</span>
                      ) : '—'}
                    </td>
                    <td className="td max-w-xs">
                      <span className="text-xs text-slate-400 line-clamp-2" title={dep.diagnosticsSummary}>
                        {dep.diagnosticsSummary || '—'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deployment Notes */}
      <div className="mt-4 card p-4">
        <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Cache & Integrity Rules</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-500">
          <div>
            <div className="text-slate-300 font-medium mb-1">index.html</div>
            <div>no-cache, no-store — always fresh on every load</div>
          </div>
          <div>
            <div className="text-slate-300 font-medium mb-1">Hashed assets</div>
            <div>max-age=31536000, immutable — content hash ensures cache busting</div>
          </div>
          <div>
            <div className="text-slate-300 font-medium mb-1">Build hash</div>
            <div>Injected as window.__MDS_BUILD__ — verified by MDS-DIAG on load</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SummaryCard({ label, count, color }) {
  return (
    <div className={`card px-5 py-4 border ${color}`}>
      <div className="text-2xl font-bold mb-1">{count}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  )
}
