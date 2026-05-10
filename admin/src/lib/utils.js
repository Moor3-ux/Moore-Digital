// ── Date / Time ───────────────────────────────────────────────────────────────

export function formatDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    })
  } catch { return iso }
}

export function formatDateTime(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
    })
  } catch { return iso }
}

export function timeAgo(iso) {
  if (!iso) return '—'
  try {
    const diff = Date.now() - new Date(iso).getTime()
    if (diff < 60_000)         return 'just now'
    if (diff < 3_600_000)      return `${Math.floor(diff / 60_000)}m ago`
    if (diff < 86_400_000)     return `${Math.floor(diff / 3_600_000)}h ago`
    if (diff < 7 * 86_400_000) return `${Math.floor(diff / 86_400_000)}d ago`
    return formatDate(iso)
  } catch { return iso }
}

// ── String Helpers ────────────────────────────────────────────────────────────

export function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function slugToTitle(slug) {
  return slug.split('-').map(capitalize).join(' ')
}

// ── Data Aggregation ──────────────────────────────────────────────────────────

export function countLeadsByStatus(leads) {
  return leads.reduce((acc, l) => {
    acc[l.status] = (acc[l.status] || 0) + 1
    return acc
  }, {})
}

export function countLeadsForClient(leads, clientId) {
  return leads.filter(l => l.clientId === clientId).length
}

export function newLeadsForClient(leads, clientId) {
  return leads.filter(l => l.clientId === clientId && l.status === 'New').length
}

export function latestDeploymentForClient(deployments, clientId) {
  return deployments
    .filter(d => d.clientId === clientId && d.deployedAt)
    .sort((a, b) => new Date(b.deployedAt) - new Date(a.deployedAt))[0] || null
}

// ── Filtering ─────────────────────────────────────────────────────────────────

export function filterBySearch(items, fields, query) {
  if (!query) return items
  const q = query.toLowerCase()
  return items.filter(item =>
    fields.some(f => String(item[f] || '').toLowerCase().includes(q))
  )
}
