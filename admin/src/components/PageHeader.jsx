export default function PageHeader({ title, description, actions, badge }) {
  return (
    <div className="flex items-start justify-between gap-3 mb-5 md:mb-6">
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-lg md:text-xl font-bold text-slate-100 leading-tight">{title}</h1>
          {badge}
        </div>
        {description && <p className="text-sm text-slate-400 mt-0.5">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  )
}
