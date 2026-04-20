import {
  Users, Zap, Settings, Database, BookOpen, Sparkles, LayoutDashboard,
  Link2, Wrench, Smartphone, Map
} from 'lucide-react'
import type { BACPanel } from '../../store/bacStore'

interface SidebarItem {
  panel: BACPanel
  icon: React.ElementType
  code: string
  label: string
  color: string
}

interface Props {
  activePanel: BACPanel
  onPanelToggle: (panel: BACPanel) => void
  counts: {
    actores: number
    servicios: number
    canales: number
    componentes: number
    escenarios: number
    participantes: number
    recursos: number
    medios: number
    journeys: number
  }
}

const GROUP_ACT: SidebarItem[] = [
  { panel: 'bac01', icon: Users,    code: '01', label: 'Actores',       color: '#2B6CB0' },
  { panel: 'bac02', icon: Settings, code: '02', label: 'Servicios',     color: '#1B7A5F' },
]

const GROUP_NEG: SidebarItem[] = [
  { panel: 'bac06', icon: Database,   code: '06', label: 'Componentes',      color: '#7C3D9F' },
  { panel: 'bac03', icon: Zap,        code: '03', label: 'Canales',          color: '#C87A2F' },
  { panel: 'bac04', icon: Link2,      code: '04', label: 'Participantes',    color: '#5448A0' },
  { panel: 'bac05', icon: Wrench,     code: '05', label: 'Recursos',         color: '#2B6CB0' },
  { panel: 'bac80', icon: Map,        code: '80', label: 'Customer Journey', color: '#9B8FE4' },
  { panel: 'bac79', icon: Smartphone, code: '79', label: 'Medios',           color: '#C87A2F' },
]

const GROUP_ESC: SidebarItem[] = [
  { panel: 'bac08', icon: BookOpen, code: '08', label: 'Escenarios', color: '#9B8FE4' },
]

export function Sidebar({ activePanel, onPanelToggle, counts }: Props) {
  const countMap: Record<string, number> = {
    bac01: counts.actores,
    bac02: counts.servicios,
    bac03: counts.canales,
    bac04: counts.participantes,
    bac05: counts.recursos,
    bac06: counts.componentes,
    bac08: counts.escenarios,
    bac79: counts.medios,
    bac80: counts.journeys,
  }

  const renderGroup = (items: SidebarItem[]) => items.map(item => (
    <SidebarBtn key={item.panel} icon={item.icon} label={`${item.label} · BAC-${item.code}`}
      color={item.color} active={activePanel === item.panel}
      onClick={() => onPanelToggle(item.panel)} count={countMap[item.panel!] || 0} />
  ))

  return (
    <div
      className="flex flex-col items-center py-3 gap-0.5 flex-shrink-0"
      style={{ width: 52, background: 'var(--bg-base)', borderRight: '1px solid var(--border-lo)' }}
    >
      <SidebarBtn icon={LayoutDashboard} label="Canvas · BAC-07" color="#5448A0"
        active={activePanel === null} onClick={() => onPanelToggle(null)} />

      <Divider />
      <GroupLabel>Act.</GroupLabel>
      {renderGroup(GROUP_ACT)}

      <Divider />
      <GroupLabel>Neg.</GroupLabel>
      {renderGroup(GROUP_NEG)}

      <Divider />
      <GroupLabel>Esc.</GroupLabel>
      {renderGroup(GROUP_ESC)}

      <Divider />
      <SidebarBtn icon={Sparkles} label="Patrones de Negocio · P1–P20" color="#9B8FE4"
        active={activePanel === 'patterns'} onClick={() => onPanelToggle('patterns')} />
    </div>
  )
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[7px] font-bold uppercase tracking-widest my-0.5" style={{ color: 'var(--text-xdim)' }}>
      {children}
    </span>
  )
}

function Divider() {
  return <div className="w-6 h-px my-1" style={{ background: 'var(--border-lo)' }} />
}

function SidebarBtn({ icon: Icon, label, color, active, onClick, count }: {
  icon: React.ElementType; label: string; color: string
  active: boolean; onClick: () => void; code?: string; count?: number
}) {
  return (
    <button onClick={onClick} title={label}
      className="relative w-9 h-9 flex items-center justify-center rounded-xl transition-all"
      style={{
        background: active ? color + '22' : 'transparent',
        color: active ? color : 'var(--text-lo)',
        border: active ? `1px solid ${color}30` : '1px solid transparent',
      }}
      onMouseEnter={(e) => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.background = color + '14'
          ;(e.currentTarget as HTMLElement).style.color = color
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.background = 'transparent'
          ;(e.currentTarget as HTMLElement).style.color = 'var(--text-lo)'
        }
      }}
    >
      <Icon size={15} strokeWidth={1.8} />
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full" style={{ background: color }} />
      )}
      {count !== undefined && count > 0 && !active && (
        <div className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center rounded-full text-[8px] font-bold"
          style={{ background: color, color: '#fff' }}>
          {count > 9 ? '9+' : count}
        </div>
      )}
    </button>
  )
}
