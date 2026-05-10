import { Link }                  from 'react-router-dom'
import { useApi }                from '../hooks/useApi.js'
import { api }                   from '../lib/api.js'
import { timeAgo }               from '../lib/utils.js'
import MetricCard                from '../components/MetricCard.jsx'
import PageHeader                from '../components/PageHeader.jsx'
import { ClientStatusBadge, DeployStatusBadge, SeverityBadge, HealthIndicator } from '../components/StatusBadge.jsx'
import EmptyState                from '../components/EmptyState.jsx'

export default function Overview() {
  const clients     = useApi(() => api.getClients())
  const leads       = useApi(() => api.getLeads())
  const deployments = useApi(() => api.getDeployments())
  const events      = useApi(() => api.getEvents({ limit: 8 }))

  const allClients     = clients.data?.clients     || []
  const allLeads       = leads.data?.leads         || []
  const allDeployments = deployments.data?.deployments || []
  const recentEvents   = events.data?.events       || []

  const activeClients  = allClients.filter(c => c.status === 'active').length
  const failedDeploys  = allDeployments.filter(d => d.amplifyStatus === 'FAILED').length
  const succeededDeploys = allDeployments.filter(d => ['SUCCEED','SUCCEEDED'].includes(d.amplifyStatus)).length
  const newLeads       = allLeads.filter(l => l.status === 'New').length
  const healthyApis    = allDeployments.filter(d => d.apiHealth === 'healthy').length

  const loading = clients.loading || leads.loading

  return (
    <div>
      <PageHeader
        title="Overview"
        description="Real-time status across all client deployments"
        actions={
          <button className="btn-ghost text-xs" onClick={() => { clients.refetch(); leads.refetch(); deployments.refetch(); events.refetch() }}>
            Refresh
          </button>
        }
      />

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <MetricCard
          label="Total Clients"
          value={loading ? '…' : allClients.length}
          sub={`${activeClients} active`}
          colorClass="bg-indigo-600/20 text-indigo-400"
          icon={<UserIcon />}
        />
        <MetricCard
          label="Active Deploys"
          value={loading ? '…' : succeededDeploys}
          sub="last succeed"
          colorClass="bg-emerald-600/20 text-emerald-400"
          icon={<CheckIcon />}
        />
        <MetricCard
          label="Failed Deploys"
          value={loading ? '…' : failedDeploys}
          sub={failedDeploys > 0 ? 'needs attention' : 'all clear'}
          colorClass={failedDeploys > 0 ? 'bg-red-600/20 text-red-400' : 'bg-slate-700 text-slate-400'}
          icon={<AlertIcon />}
        />
        <MetricCard
          label="Total Leads"
          value={loading ? '…' : allLeads.length}
          sub="across all clients"
          colorClass="bg-blue-600/20 text-blue-400"
          icon={<InboxIcon />}
        />
        <MetricCard
          label="New Leads"
          value={loading ? '…' : newLeads}
          sub="unprocessed"
          colorClass={newLeads > 0 ? 'bg-amber-600/20 text-amber-400' : 'bg-slate-700 text-slate-400'}
          icon={<StarIcon />}
        />
        <MetricCard
          label="Healthy APIs"
          value={loading ? '…' : healthyApis}
          sub={`of ${allDeployments.length} total`}
          colorClass="bg-emerald-600/20 text-emerald-400"
          icon={<PulseIcon />}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Client Health Summary */}
        <div className="card">
          <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-200">Client Health</h2>
            <span className="text-xs text-slate-500">{allClients.length} clients</span>
          </div>
          <div className="divide-y divide-slate-800">
            {allClients.length === 0 && !loading && (
              <EmptyState title="No clients registered" description="Add your first client to see health status." />
            )}
            {allClients.map(client => {
              const dep = allDeployments.find(d => d.clientId === client.clientId)
              const clientLeads = allLeads.filter(l => l.clientId === client.clientId)
              const newCount = clientLeads.filter(l => l.status === 'New').length
              return (
                <div key={client.clientId} className="flex items-center justify-between px-5 py-3 hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <InitialsBadge name={client.name} color={client.primaryColor} />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-200 truncate">{client.name}</div>
                      <div className="text-xs text-slate-500">{client.domain}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                    <ClientStatusBadge status={client.status} />
                    {dep && <HealthIndicator status={dep.apiHealth} />}
                    <span className="text-xs text-slate-500">
                      {clientLeads.length} leads{newCount > 0 ? ` · ${newCount} new` : ''}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Events */}
        <div className="card">
          <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-200">Recent Events</h2>
            <Link to="/diagnostics" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">View all →</Link>
          </div>
          <div className="divide-y divide-slate-800">
            {recentEvents.length === 0 && !events.loading && (
              <EmptyState title="No events recorded" description="Diagnostic events will appear here." />
            )}
            {recentEvents.map(evt => (
              <div key={evt.eventId} className="px-5 py-3 hover:bg-slate-800/30 transition-colors">
                <div className="flex items-start gap-3">
                  <SeverityBadge severity={evt.severity} />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-slate-400 mb-0.5">
                      {evt.clientId} · <span className="font-mono">{evt.category}</span> · {timeAgo(evt.timestamp)}
                    </div>
                    <div className="text-sm text-slate-300 leading-snug line-clamp-2">{evt.message}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function InitialsBadge({ name, color }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div
      className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
      style={{ backgroundColor: color || '#6366f1' }}
    >
      {initials}
    </div>
  )
}

// ── Icons ─────────────────────────────────────────────────────────────────────
const iconCls = 'w-4 h-4'

function UserIcon()  { return <svg className={iconCls} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> }
function CheckIcon() { return <svg className={iconCls} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg> }
function AlertIcon() { return <svg className={iconCls} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> }
function InboxIcon() { return <svg className={iconCls} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> }
function StarIcon()  { return <svg className={iconCls} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> }
function PulseIcon() { return <svg className={iconCls} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg> }
