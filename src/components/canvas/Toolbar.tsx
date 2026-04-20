import { MousePointer2, Hand, Link2, Trash2, Maximize2, Wand2 } from 'lucide-react'

export type ToolMode = 'select' | 'pan' | 'connect'

interface ToolbarProps {
  mode: ToolMode
  onModeChange: (m: ToolMode) => void
  onDeleteSelected: () => void
  onFitView: () => void
  onAutoLayout: () => void
}

const MODES = [
  { key: 'select' as ToolMode,  icon: MousePointer2, label: 'Seleccionar  V' },
  { key: 'pan' as ToolMode,     icon: Hand,          label: 'Mover  H' },
  { key: 'connect' as ToolMode, icon: Link2,         label: 'Conectar  C' },
]

export function Toolbar({ mode, onModeChange, onDeleteSelected, onFitView, onAutoLayout }: ToolbarProps) {
  return (
    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-1">
      <ToolGroup>
        {MODES.map(({ key, icon: Icon, label }) => (
          <ToolBtn key={key} active={mode === key} onClick={() => onModeChange(key)} title={label}>
            <Icon size={15} strokeWidth={1.8} />
          </ToolBtn>
        ))}
      </ToolGroup>

      <ToolGroup>
        <ToolBtn onClick={onAutoLayout} title="Auto-organizar nodos">
          <Wand2 size={14} strokeWidth={1.8} />
        </ToolBtn>
        <ToolBtn onClick={onFitView} title="Ajustar vista  F">
          <Maximize2 size={14} strokeWidth={1.8} />
        </ToolBtn>
        <ToolBtn onClick={onDeleteSelected} title="Eliminar  Del" danger>
          <Trash2 size={14} strokeWidth={1.8} />
        </ToolBtn>
      </ToolGroup>
    </div>
  )
}

function ToolGroup({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex flex-col rounded-xl overflow-hidden"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid rgba(155,143,228,0.12)',
        boxShadow: '0 2px 16px rgba(15,26,46,0.25)',
      }}
    >
      {children}
    </div>
  )
}

function ToolBtn({
  children, active, onClick, title, danger,
}: {
  children: React.ReactNode
  active?: boolean
  onClick: () => void
  title?: string
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-9 h-9 flex items-center justify-center transition-colors"
      style={{
        background: active ? 'rgba(84,72,160,0.35)' : 'transparent',
        color: active ? '#C8BFFF' : danger ? '#B03040' : '#9080C4',
        borderLeft: active ? '2px solid #9B8FE4' : '2px solid transparent',
      }}
      onMouseEnter={(e) => {
        if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(155,143,228,0.08)'
        if (!active) (e.currentTarget as HTMLElement).style.color = '#D4CCF0'
      }}
      onMouseLeave={(e) => {
        if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent'
        if (!active) (e.currentTarget as HTMLElement).style.color = danger ? '#B03040' : '#9080C4'
      }}
    >
      {children}
    </button>
  )
}
