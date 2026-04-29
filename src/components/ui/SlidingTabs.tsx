interface Tab<T extends string> {
  key: T
  label: string
}

interface SlidingTabsProps<T extends string> {
  tabs: Tab<T>[]
  active: T
  onChange: (key: T) => void
}

export default function SlidingTabs<T extends string>({ tabs, active, onChange }: SlidingTabsProps<T>) {
  const activeIdx = tabs.findIndex(t => t.key === active)
  const pct = 100 / tabs.length

  return (
    <div
      className="relative flex rounded-xl p-1"
      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
    >
      {/* Pill deslizante */}
      <div
        className="absolute top-1 bottom-1 rounded-lg"
        style={{
          background: '#e8572a',
          width: `calc(${pct}% - 8px / ${tabs.length})`,
          left: `calc(${activeIdx * pct}% + 4px)`,
          transition: 'left 220ms cubic-bezier(0.4,0,0.2,1)',
          boxShadow: '0 1px 6px rgba(232,87,42,0.35)',
        }}
      />
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className="relative flex-1 py-2 text-sm font-semibold z-10 rounded-lg transition-colors duration-150"
          style={{ color: active === tab.key ? 'white' : 'var(--text-muted)' }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
