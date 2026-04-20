import { X, Trash2, Tag } from 'lucide-react'
import type { Edge } from '@xyflow/react'

interface Props {
  edge: Edge
  onUpdate: (id: string, patch: Partial<Edge>) => void
  onDelete: (id: string) => void
  onClose: () => void
}

export function EdgePanel({ edge, onUpdate, onDelete, onClose }: Props) {
  return (
    <div
      className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 px-3 py-2 rounded-xl"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid rgba(155,143,228,0.25)',
        boxShadow: '0 4px 20px rgba(15,26,46,0.35)',
      }}
    >
      <Tag size={12} strokeWidth={2} style={{ color: '#9B8FE4', flexShrink: 0 }} />

      <input
        value={(edge.label as string) ?? ''}
        onChange={e => onUpdate(edge.id, { label: e.target.value || undefined })}
        placeholder="Etiqueta de la relación…"
        className="bg-transparent outline-none text-[11px]"
        style={{ color: 'var(--text-hi)', fontFamily: 'Raleway, sans-serif', width: 180 }}
        autoFocus
      />

      <div style={{ width: 1, height: 16, background: 'rgba(155,143,228,0.2)', flexShrink: 0 }} />

      {/* Edge type toggle: smoothstep ↔ straight */}
      <button
        title={edge.type === 'straight' ? 'Cambiar a ortogonal' : 'Cambiar a recta'}
        onClick={() => onUpdate(edge.id, { type: edge.type === 'straight' ? 'smoothstep' : 'straight' })}
        className="text-[9px] font-bold px-1.5 py-0.5 rounded"
        style={{
          color: '#9B8FE4',
          border: '1px solid rgba(155,143,228,0.3)',
          fontFamily: 'Raleway, sans-serif',
          letterSpacing: '0.04em',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(155,143,228,0.1)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        {edge.type === 'straight' ? 'RECTA' : 'ORTOG.'}
      </button>

      <div style={{ width: 1, height: 16, background: 'rgba(155,143,228,0.2)', flexShrink: 0 }} />

      <button
        title="Eliminar relación"
        onClick={() => { onDelete(edge.id); onClose() }}
        style={{ color: '#F87171', flexShrink: 0 }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.6')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        <Trash2 size={13} strokeWidth={1.8} />
      </button>

      <button
        onClick={onClose}
        style={{ color: 'var(--text-dim)', flexShrink: 0 }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-hi)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}
      >
        <X size={12} strokeWidth={2} />
      </button>
    </div>
  )
}
