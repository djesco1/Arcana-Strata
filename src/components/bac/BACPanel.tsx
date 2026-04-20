import { X } from 'lucide-react'

interface BACPanelProps {
  title: string
  code: string
  color: string
  onClose: () => void
  children: React.ReactNode
}

export function BACPanel({ title, code, color, onClose, children }: BACPanelProps) {
  return (
    <div
      className="absolute left-14 top-3 bottom-3 z-20 flex flex-col rounded-2xl overflow-hidden"
      style={{
        width: 300,
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-md)',
        boxShadow: 'var(--shadow-panel)',
      }}
    >
      <div className="h-0.5 w-full flex-shrink-0" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />

      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border-lo)' }}>
        <div className="flex items-center gap-2.5">
          <span className="text-[9px] font-black px-1.5 py-0.5 rounded" style={{ background: color + '20', color }}>
            {code}
          </span>
          <span className="text-sm font-semibold" style={{ color: 'var(--text-hi)', fontFamily: 'Raleway, sans-serif' }}>
            {title}
          </span>
        </div>
        <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
          style={{ color: 'var(--text-dim)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--c-accent)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}>
          <X size={14} strokeWidth={1.8} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
