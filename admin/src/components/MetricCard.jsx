export default function MetricCard({ label, value, sub, colorClass = 'bg-indigo-600/20 text-indigo-400', icon }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</span>
        {icon && (
          <div className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 ${colorClass}`}>
            {icon}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-slate-100">{value ?? '—'}</div>
      {sub != null && (
        <div className="text-xs text-slate-500 mt-1">{sub}</div>
      )}
    </div>
  )
}
