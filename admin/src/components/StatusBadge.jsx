import {
  LEAD_STATUS_COLORS,
  CLIENT_STATUS_COLORS,
  DEPLOYMENT_STATUS_COLORS,
  SEVERITY_COLORS,
  HEALTH_COLORS,
} from '../panel.config.js'

export function LeadStatusBadge({ status }) {
  const cfg = LEAD_STATUS_COLORS[status] || { cls: 'bg-slate-500/10 text-slate-400 border-slate-500/20' }
  return <span className={`badge ${cfg.cls}`}>{status || '—'}</span>
}

export function ClientStatusBadge({ status }) {
  const cfg = CLIENT_STATUS_COLORS[status] || CLIENT_STATUS_COLORS.inactive
  return (
    <span className={`badge gap-1.5 ${cfg.cls}`}>
      <span className={`dot ${cfg.dot}`} />
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : '—'}
    </span>
  )
}

export function DeployStatusBadge({ status }) {
  const cfg = DEPLOYMENT_STATUS_COLORS[status] || { cls: 'bg-slate-500/10 text-slate-400 border-slate-500/20' }
  return <span className={`badge ${cfg.cls}`}>{status || '—'}</span>
}

export function SeverityBadge({ severity }) {
  const cfg = SEVERITY_COLORS[severity] || SEVERITY_COLORS.DEBUG
  return <span className={`badge ${cfg.cls}`}>{severity}</span>
}

export function HealthIndicator({ status }) {
  const cfg = HEALTH_COLORS[status] || HEALTH_COLORS.unknown
  return (
    <span className={`text-sm font-mono font-medium ${cfg.cls}`}>
      {cfg.icon} {status}
    </span>
  )
}
