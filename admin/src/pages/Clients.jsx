import { useState }             from 'react'
import { Link }                 from 'react-router-dom'
import { useApi }               from '../hooks/useApi.js'
import { api }                  from '../lib/api.js'
import { timeAgo, filterBySearch, countLeadsForClient, newLeadsForClient, latestDeploymentForClient } from '../lib/utils.js'
import PageHeader               from '../components/PageHeader.jsx'
import { ClientStatusBadge, DeployStatusBadge, HealthIndicator } from '../components/StatusBadge.jsx'
import EmptyState               from '../components/EmptyState.jsx'

const STATUS_FILTERS = ['All', 'active', 'warning', 'inactive']

export default function Clients() {
  const [search,    setSearch]    = useState('')
  const [statusFilter, setStatus] = useState('All')

  const clients     = useApi(() => api.getClients())
  const leads       = useApi(() => api.getLeads())
  const deployments = useApi(() => api.getDeployments())

  const allClients     = clients.data?.clients     || []
  const allLeads       = leads.data?.leads         || []
  const allDeployments = deployments.data?.deployments || []

  let filtered = statusFilter === 'All'
    ? allClients
    : allClients.filter(c => c.status === statusFilter)

  filtered = filterBySearch(filtered, ['name', 'domain', 'industry', 'clientId'], search)

  return (
    <div>
      <PageHeader
        title="Clients"
        description="All registered Moore Digital Solutions client deployments"
        badge={
          <span className="badge bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
            {allClients.length}
          </span>
        }
        actions={
          <button className="btn-ghost text-xs" onClick={clients.refetch}>Refresh</button>
        }
      />

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <input
          className="input max-w-64"
          placeholder="Search clients…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="flex items-center gap-1">
          {STATUS_FILTERS.map(s => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`btn text-xs ${statusFilter === s ? 'bg-indigo-600/20 text-indigo-300' : 'btn-ghost'}`}
            >
              {s === 'All' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {clients.error && <ErrorBanner message={clients.error} />}

      {/* Client Grid */}
      {filtered.length === 0 && !clients.loading ? (
        <EmptyState
          title={search || statusFilter !== 'All' ? 'No clients match' : 'No clients registered'}
          description={search ? `No results for "${search}"` : 'Run infra/setup.sh to provision the first client.'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(client => (
            <ClientCard
              key={client.clientId}
              client={client}
              leadCount={countLeadsForClient(allLeads, client.clientId)}
              newLeads={newLeadsForClient(allLeads, client.clientId)}
              deployment={latestDeploymentForClient(allDeployments, client.clientId)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ClientCard({ client, leadCount, newLeads, deployment }) {
  const initials = client.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div className="card p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
            style={{ backgroundColor: client.primaryColor || '#6366f1' }}
          >
            {initials}
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-100">{client.name}</div>
            <div className="text-xs text-slate-500">{client.industry}</div>
          </div>
        </div>
        <ClientStatusBadge status={client.status} />
      </div>

      {/* Details */}
      <div className="space-y-2 text-sm">
        <DetailRow label="Domain" value={
          client.domain
            ? <a href={`https://${client.domain}`} target="_blank" rel="noreferrer"
                className="text-indigo-400 hover:text-indigo-300 transition-colors">{client.domain}</a>
            : <span className="text-slate-500">—</span>
        } />
        <DetailRow label="Plan"   value={<span className="text-slate-300">{client.monthlyPlan || '—'}</span>} />
        <DetailRow label="Leads"  value={
          <span className="text-slate-300">
            {leadCount}{newLeads > 0 && <span className="text-amber-400 ml-1">({newLeads} new)</span>}
          </span>
        } />
        {deployment && (
          <>
            <DetailRow label="Deploy" value={<DeployStatusBadge status={deployment.amplifyStatus} />} />
            <DetailRow label="API"    value={<HealthIndicator status={deployment.apiHealth} />} />
            <DetailRow label="Built"  value={<span className="text-slate-400 monospace">{deployment.buildHash || '—'}</span>} />
            <DetailRow label="When"   value={<span className="text-slate-400">{timeAgo(deployment.deployedAt)}</span>} />
          </>
        )}
        {!deployment && (
          <DetailRow label="Deploy" value={<span className="text-slate-500">Not yet deployed</span>} />
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
        {client.apiUrl ? (
          <a href={client.apiUrl} target="_blank" rel="noreferrer" className="btn-ghost text-xs">
            Dashboard ↗
          </a>
        ) : (
          <span className="btn text-xs text-slate-600 cursor-not-allowed">Dashboard</span>
        )}
        <Link to="/deployments" className="btn-ghost text-xs">Deploy</Link>
        <Link to="/diagnostics" className="btn-ghost text-xs">Diag</Link>
        {client.amplifyAppId && (
          <a
            href={`https://console.aws.amazon.com/amplify/home#/${client.amplifyAppId}`}
            target="_blank" rel="noreferrer"
            className="btn-ghost text-xs ml-auto"
          >AWS ↗</a>
        )}
      </div>
    </div>
  )
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-slate-500 text-xs w-14 flex-shrink-0">{label}</span>
      <div className="flex-1 text-right">{value}</div>
    </div>
  )
}

function ErrorBanner({ message }) {
  return (
    <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
      Error loading clients: {message}
    </div>
  )
}
