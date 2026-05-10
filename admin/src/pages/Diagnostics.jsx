import { useState, useMemo }  from 'react'
import { useApi }             from '../hooks/useApi.js'
import { api }                from '../lib/api.js'
import { timeAgo }            from '../lib/utils.js'
import PageHeader             from '../components/PageHeader.jsx'
import { SeverityBadge }      from '../components/StatusBadge.jsx'
import EmptyState             from '../components/EmptyState.jsx'

const CATEGORIES = ['All', 'API', 'AUTH', 'ROUTING', 'DASHBOARD', 'CSS', 'DOM', 'ENV', 'ERRORS', 'NETWORK', 'DEPLOYMENTS']
const SEVERITIES = ['All', 'ERROR', 'WARN', 'INFO', 'DEBUG']

export default function Diagnostics() {
  const [clientFilter,   setClientFilter]   = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [severityFilter, setSeverityFilter] = useState('All')
  const [search,         setSearch]         = useState('')

  const clients  = useApi(() => api.getClients())
  const eventsRes = useApi(() => api.getEvents({ limit: 100 }))

  const allClients = clients.data?.clients || []
  const rawEvents  = eventsRes.data?.events || []

  const clientMap = useMemo(() => {
    const m = {}
    allClients.forEach(c => { m[c.clientId] = c })
    return m
  }, [allClients])

  const events = useMemo(() => {
    let rows = rawEvents
    if (clientFilter                ) rows = rows.filter(e => e.clientId === clientFilter)
    if (categoryFilter !== 'All'    ) rows = rows.filter(e => e.category === categoryFilter)
    if (severityFilter !== 'All'    ) rows = rows.filter(e => e.severity === severityFilter)
    if (search) {
      const q = search.toLowerCase()
      rows = rows.filter(e =>
        e.message?.toLowerCase().includes(q) ||
        e.clientId?.toLowerCase().includes(q) ||
        e.category?.toLowerCase().includes(q)
      )
    }
    return rows
  }, [rawEvents, clientFilter, categoryFilter, severityFilter, search])

  const errorCount = rawEvents.filter(e => e.severity === 'ERROR').length
  const warnCount  = rawEvents.filter(e => e.severity === 'WARN').length

  return (
    <div>
      <PageHeader
        title="Diagnostics"
        description="MDS-DIAG centralized event log — API failures, deployment issues, stale bundle detection"
        badge={
          errorCount > 0
            ? <span className="badge bg-red-500/10 text-red-400 border-red-500/20">{errorCount} errors</span>
            : <span className="badge bg-emerald-500/10 text-emerald-400 border-emerald-500/20">No errors</span>
        }
        actions={<button className="btn-ghost text-xs" onClick={eventsRes.refetch}>Refresh</button>}
      />

      {/* Severity summary */}
      <div className="flex items-center gap-4 mb-5 text-sm">
        <SeverityPill label="Errors"   count={errorCount} cls="text-red-400" />
        <SeverityPill label="Warnings" count={warnCount}  cls="text-amber-400" />
        <SeverityPill label="Total"    count={rawEvents.length} cls="text-slate-400" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <input
          className="input max-w-56"
          placeholder="Search events…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="select w-auto" value={clientFilter} onChange={e => setClientFilter(e.target.value)}>
          <option value="">All Clients</option>
          {allClients.map(c => <option key={c.clientId} value={c.clientId}>{c.name}</option>)}
        </select>
        <select className="select w-auto" value={severityFilter} onChange={e => setSeverityFilter(e.target.value)}>
          {SEVERITIES.map(s => <option key={s} value={s}>{s === 'All' ? 'All Severities' : s}</option>)}
        </select>
        <div className="flex items-center gap-1 flex-wrap">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`btn text-xs px-2 py-1 ${categoryFilter === cat ? 'bg-indigo-600/20 text-indigo-300' : 'btn-ghost'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {eventsRes.error && (
        <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
          {eventsRes.error}
        </div>
      )}

      {/* Event Log */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-800">
              <tr>
                <th className="th w-28">Severity</th>
                <th className="th w-24">Category</th>
                <th className="th w-36">Client</th>
                <th className="th w-28">Time</th>
                <th className="th">Message</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 && !eventsRes.loading && (
                <tr>
                  <td colSpan="5">
                    <EmptyState
                      title="No events"
                      description={search || clientFilter ? 'Try adjusting filters.' : 'No diagnostic events recorded. The panel will log events here as they occur.'}
                    />
                  </td>
                </tr>
              )}
              {events.map(evt => {
                const client = clientMap[evt.clientId]
                return (
                  <tr key={evt.eventId} className="table-row align-top">
                    <td className="td pt-3.5">
                      <SeverityBadge severity={evt.severity} />
                    </td>
                    <td className="td">
                      <span className="font-mono text-xs text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                        {evt.category}
                      </span>
                    </td>
                    <td className="td">
                      {client ? (
                        <div className="flex items-center gap-1.5">
                          <div
                            className="w-4 h-4 rounded flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
                            style={{ backgroundColor: client.primaryColor || '#6366f1' }}
                          >
                            {client.name[0]}
                          </div>
                          <span className="text-xs text-slate-400">{client.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs font-mono text-slate-500">{evt.clientId}</span>
                      )}
                    </td>
                    <td className="td text-xs text-slate-500 whitespace-nowrap">
                      {timeAgo(evt.timestamp)}
                    </td>
                    <td className="td text-slate-300 leading-relaxed max-w-xl">
                      {evt.message}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Panel Health */}
      <PanelHealthCard />

      {/* MDS-DIAG Info */}
      <div className="mt-4 card p-4">
        <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">MDS-DIAG Categories</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs text-slate-500">
          {['API', 'AUTH', 'ROUTING', 'DASHBOARD', 'CSS', 'DOM', 'ENV', 'ERRORS', 'NETWORK', 'DEPLOYMENTS'].map(cat => (
            <div key={cat} className="font-mono bg-slate-800 px-2 py-1 rounded text-slate-400">{cat}</div>
          ))}
        </div>
        <p className="text-xs text-slate-600 mt-3">
          Filter browser console with <code className="font-mono bg-slate-800 px-1 rounded">MDS-DIAG</code> to see real-time diagnostic output.
        </p>
      </div>
    </div>
  )
}

function PanelHealthCard() {
  const build  = window.__MDS_BUILD__
  const health = window.__MDS_HEALTH__

  if (!build && !health) return null

  return (
    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      {build && (
        <div className="card p-4">
          <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Build Identity</h3>
          <div className="space-y-1.5 text-xs font-mono">
            <HealthRow label="commit"  value={build.commit} />
            <HealthRow label="hash"    value={build.frontendHash} />
            <HealthRow label="version" value={build.version} />
            <HealthRow label="env"     value={build.env} />
            <HealthRow label="built"   value={build.builtAt ? new Date(build.builtAt).toLocaleString() : '—'} />
          </div>
        </div>
      )}

      {health && (
        <div className="card p-4">
          <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
            API Health
            <span className={`ml-2 badge ${health.apiReachable ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : health.demoMode ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
              {health.demoMode ? 'demo' : health.apiReachable ? 'reachable' : 'unreachable'}
            </span>
          </h3>
          <div className="space-y-1.5 text-xs font-mono">
            <HealthRow label="mode"    value={health.demoMode ? 'demo' : 'live'} />
            <HealthRow label="status"  value={health.apiStatus != null ? String(health.apiStatus) : '—'} />
            <HealthRow label="latency" value={health.latencyMs != null ? `${health.latencyMs}ms` : '—'} />
            <HealthRow label="region"  value={health.region || '—'} />
            {health.error && <HealthRow label="error" value={health.error} cls="text-red-400" />}
            <HealthRow label="checked" value={health.ts ? new Date(health.ts).toLocaleTimeString() : '—'} />
          </div>
        </div>
      )}
    </div>
  )
}

function HealthRow({ label, value, cls = 'text-slate-400' }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-slate-600 w-14 flex-shrink-0">{label}</span>
      <span className={cls}>{value}</span>
    </div>
  )
}

function SeverityPill({ label, count, cls }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`text-lg font-bold ${cls}`}>{count}</span>
      <span className="text-slate-500">{label}</span>
    </div>
  )
}
