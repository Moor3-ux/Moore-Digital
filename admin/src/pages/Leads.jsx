import { useState, useMemo }    from 'react'
import { useApi }               from '../hooks/useApi.js'
import { api }                  from '../lib/api.js'
import { formatDateTime, filterBySearch } from '../lib/utils.js'
import PageHeader               from '../components/PageHeader.jsx'
import { LeadStatusBadge }      from '../components/StatusBadge.jsx'
import EmptyState               from '../components/EmptyState.jsx'
import { LEAD_STATUSES } from '../panel.config.js'

const SORT_OPTIONS = [
  { value: 'createdAt_desc', label: 'Newest first' },
  { value: 'createdAt_asc',  label: 'Oldest first' },
  { value: 'status_asc',     label: 'Status A–Z' },
  { value: 'contactName_asc',label: 'Name A–Z' },
]

export default function Leads() {
  const [clientFilter, setClientFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [search,       setSearch]       = useState('')
  const [sort,         setSort]         = useState('createdAt_desc')
  const [editLead,     setEditLead]     = useState(null)

  const clients  = useApi(() => api.getClients())
  const leadsRes = useApi(() => api.getLeads())

  const allClients = clients.data?.clients || []
  const rawLeads   = leadsRes.data?.leads  || []

  const clientMap = useMemo(() => {
    const m = {}
    allClients.forEach(c => { m[c.clientId] = c })
    return m
  }, [allClients])

  const leads = useMemo(() => {
    let rows = rawLeads
    if (clientFilter) rows = rows.filter(l => l.clientId === clientFilter)
    if (statusFilter) rows = rows.filter(l => l.status   === statusFilter)
    rows = filterBySearch(rows, ['contactName', 'email', 'phone', 'source', 'message'], search)

    const [field, dir] = sort.split('_')
    rows = [...rows].sort((a, b) => {
      const av = a[field] || '', bv = b[field] || ''
      return dir === 'desc' ? bv.localeCompare(av) : av.localeCompare(bv)
    })
    return rows
  }, [rawLeads, clientFilter, statusFilter, search, sort])

  const newCount = rawLeads.filter(l => l.status === 'New').length

  async function handleStatusChange(lead, newStatus) {
    try {
      await api.updateLead(lead.leadId, { status: newStatus })
      leadsRes.refetch()
    } catch (err) {
      console.error('Failed to update lead:', err)
    }
  }

  return (
    <div>
      <PageHeader
        title="Leads"
        description="Aggregated leads across all client deployments"
        badge={
          <span className="badge bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
            {rawLeads.length} total
          </span>
        }
        actions={
          <>
            {newCount > 0 && (
              <span className="badge bg-amber-500/10 text-amber-400 border-amber-500/20">
                {newCount} new
              </span>
            )}
            <button className="btn-ghost text-xs" onClick={leadsRes.refetch}>Refresh</button>
          </>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <input
          className="input max-w-56"
          placeholder="Search leads…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="select w-auto pr-8" value={clientFilter} onChange={e => setClientFilter(e.target.value)}>
          <option value="">All Clients</option>
          {allClients.map(c => (
            <option key={c.clientId} value={c.clientId}>{c.name}</option>
          ))}
        </select>
        <select className="select w-auto pr-8" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {LEAD_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="select w-auto pr-8" value={sort} onChange={e => setSort(e.target.value)}>
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {leadsRes.error && (
        <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
          {leadsRes.error}
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-800">
              <tr>
                <th className="th">Date</th>
                <th className="th">Client</th>
                <th className="th">Name</th>
                <th className="th">Contact</th>
                <th className="th">Source</th>
                <th className="th">Status</th>
                <th className="th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 && !leadsRes.loading && (
                <tr>
                  <td colSpan="7">
                    <EmptyState
                      title="No leads found"
                      description={search || clientFilter || statusFilter ? 'Try adjusting your filters.' : 'No leads have been submitted yet.'}
                    />
                  </td>
                </tr>
              )}
              {leads.map(lead => {
                const client = clientMap[lead.clientId]
                return (
                  <tr key={lead.leadId} className="table-row">
                    <td className="td text-slate-400 text-xs whitespace-nowrap">
                      {formatDateTime(lead.createdAt)}
                    </td>
                    <td className="td">
                      {client ? (
                        <div className="flex items-center gap-2">
                          <div
                            className="w-5 h-5 rounded flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                            style={{ backgroundColor: client.primaryColor || '#6366f1' }}
                          >
                            {client.name[0]}
                          </div>
                          <span className="text-slate-300 text-xs">{client.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-xs font-mono">{lead.clientId}</span>
                      )}
                    </td>
                    <td className="td font-medium text-slate-200">{lead.contactName || '—'}</td>
                    <td className="td">
                      <div className="text-slate-300">{lead.email}</div>
                      <div className="text-slate-500 text-xs">{lead.phone}</div>
                    </td>
                    <td className="td text-slate-400 text-xs">{lead.source || '—'}</td>
                    <td className="td">
                      <LeadStatusBadge status={lead.status} />
                    </td>
                    <td className="td">
                      <div className="flex items-center gap-1">
                        <select
                          className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300
                                     focus:outline-none focus:border-indigo-500"
                          value={lead.status}
                          onChange={e => handleStatusChange(lead, e.target.value)}
                        >
                          {LEAD_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <button
                          className="btn-ghost text-xs px-2 py-1"
                          onClick={() => setEditLead(editLead?.leadId === lead.leadId ? null : lead)}
                        >
                          {editLead?.leadId === lead.leadId ? 'Close' : 'Detail'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lead Detail Panel */}
      {editLead && (
        <LeadDetailPanel
          lead={editLead}
          client={clientMap[editLead.clientId]}
          onClose={() => setEditLead(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  )
}

function LeadDetailPanel({ lead, client, onClose, onStatusChange }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div
        className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div>
            <div className="text-base font-semibold text-slate-100">{lead.contactName}</div>
            <div className="text-xs text-slate-500">{client?.name || lead.clientId}</div>
          </div>
          <button className="btn-ghost text-xs" onClick={onClose}>Close ✕</button>
        </div>

        {/* Content */}
        <div className="px-5 py-5 space-y-4">
          <InfoSection title="Status">
            <div className="flex items-center gap-3">
              <LeadStatusBadge status={lead.status} />
              <select
                className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300
                           focus:outline-none focus:border-indigo-500"
                value={lead.status}
                onChange={e => onStatusChange(lead, e.target.value)}
              >
                {LEAD_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </InfoSection>

          <InfoSection title="Contact">
            <div className="space-y-1 text-sm text-slate-300">
              <div><span className="text-slate-500 w-16 inline-block">Email</span>{lead.email || '—'}</div>
              <div><span className="text-slate-500 w-16 inline-block">Phone</span>{lead.phone || '—'}</div>
              <div><span className="text-slate-500 w-16 inline-block">Source</span>{lead.source || '—'}</div>
            </div>
          </InfoSection>

          <InfoSection title="Message">
            <p className="text-sm text-slate-300 leading-relaxed">{lead.message || 'No message provided.'}</p>
          </InfoSection>

          {lead.notes && (
            <InfoSection title="Notes">
              <p className="text-sm text-slate-300 leading-relaxed">{lead.notes}</p>
            </InfoSection>
          )}

          <InfoSection title="Metadata">
            <div className="space-y-1 text-xs text-slate-500 font-mono">
              <div>ID: {lead.leadId}</div>
              <div>Created: {formatDateTime(lead.createdAt)}</div>
              {lead.updatedAt && <div>Updated: {formatDateTime(lead.updatedAt)}</div>}
            </div>
          </InfoSection>

          {lead.email && (
            <a
              href={`mailto:${lead.email}?subject=Re: Your Inquiry`}
              className="btn-primary w-full justify-center text-sm"
            >
              Reply by Email
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoSection({ title, children }) {
  return (
    <div>
      <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">{title}</div>
      {children}
    </div>
  )
}
