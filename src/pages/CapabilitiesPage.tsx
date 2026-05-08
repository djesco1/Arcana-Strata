import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layers, LayoutGrid, Map, Table2, Network, Share2 } from 'lucide-react'
import { CapabilityProvider, useCapabilityStore } from '../store/capabilitiesStore'
import { Header } from '../components/layout/Header'
import { CatalogoPaquetesSection } from '../components/capabilities/CatalogoPaquetesSection'
import { ImplementacionSection } from '../components/capabilities/ImplementacionSection'
import { ClasificacionSection } from '../components/capabilities/ClasificacionSection'
import { MapaCapacidadesSection } from '../components/capabilities/MapaCapacidadesSection'
import { ServiciosNegocioSection } from '../components/capabilities/ServiciosNegocioSection'
import { ServiciosInternosSection } from '../components/capabilities/ServiciosInternosSection'
import { CAPABILITY_COLORS as COLORS } from '../constants/colors'
import { allCapacidades } from '../types/capabilities'
import { useAuth } from '../hooks/useAuth'

// ── Sidebar definition ────────────────────────────────────────────────────────

type BACKey = 'bac31' | 'bac32' | 'bac33a' | 'bac33b' | 'bac34' | 'bac64'

interface BACItem {
  key: BACKey
  icon: React.ElementType
  code: string
  label: string
  color: string
}

const SIDEBAR_ITEMS: BACItem[] = [
  { key: 'bac31',  icon: Layers,      code: '31',  label: 'Catálogo',          color: COLORS.bac31  },
  { key: 'bac32',  icon: Network,     code: '32',  label: 'Implementación',    color: COLORS.bac32  },
  { key: 'bac33a', icon: Table2,      code: '33A', label: 'Clasificación',     color: COLORS.bac33a },
  { key: 'bac33b', icon: Map,         code: '33B', label: 'Mapa Visual',       color: COLORS.bac33b },
  { key: 'bac34',  icon: Share2,      code: '34',  label: 'Serv. Negocio',     color: COLORS.bac34  },
  { key: 'bac64',  icon: LayoutGrid,  code: '64',  label: 'Serv. Internos',    color: COLORS.bac64  },
]

const BAC_META: Record<BACKey, { icon: React.ElementType; code: string; title: string; desc: string; color: string }> = {
  bac31:  { icon: Layers,     code: 'BAC-31',  title: 'Catálogo de Capacidades',                  desc: 'Paquetes, subpaquetes y capacidades individuales con su tipo y criticidad',                                                   color: COLORS.bac31  },
  bac32:  { icon: Network,    code: 'BAC-32',  title: 'Implementación de Capacidades',             desc: 'Responsables, recursos y notas para cada capacidad (proceso de implementación disponible cuando exista el Modelo de Procesos)', color: COLORS.bac32  },
  bac33a: { icon: Table2,     code: 'BAC-33A', title: 'Clasificación Jerárquica',                  desc: 'Vista tabular de la jerarquía completa: paquete → subpaquete → capacidad, con tipo y criticidad',                           color: COLORS.bac33a },
  bac33b: { icon: Map,        code: 'BAC-33B', title: 'Mapa de Capacidades',                       desc: 'Representación visual en cajas anidadas de la arquitectura de capacidades de la organización',                              color: COLORS.bac33b },
  bac34:  { icon: Share2,     code: 'BAC-34',  title: 'Servicios de Negocio vs. Capacidades',      desc: 'Flujo de valor entre los servicios de negocio y las capacidades organizacionales que los soportan',                         color: COLORS.bac34  },
  bac64:  { icon: LayoutGrid, code: 'BAC-64',  title: 'Servicios Internos vs. Capacidades',        desc: 'Flujo de valor entre los servicios internos de la organización y las capacidades que los habilitan',                        color: COLORS.bac64  },
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

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

function SidebarBtn({ item, active, onClick, count }: {
  item: BACItem; active: boolean; onClick: () => void; count?: number
}) {
  const Icon = item.icon
  return (
    <button onClick={onClick} title={`${item.label} · BAC-${item.code}`}
      className="relative w-9 h-9 flex items-center justify-center rounded-xl transition-all"
      style={{
        background: active ? item.color + '22' : 'transparent',
        color: active ? item.color : 'var(--text-lo)',
        border: active ? `1px solid ${item.color}30` : '1px solid transparent',
      }}
      onMouseEnter={e => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.background = item.color + '14'
          ;(e.currentTarget as HTMLElement).style.color = item.color
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.background = 'transparent'
          ;(e.currentTarget as HTMLElement).style.color = 'var(--text-lo)'
        }
      }}
    >
      <Icon size={15} strokeWidth={1.8} />
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full" style={{ background: item.color }} />
      )}
      {count !== undefined && count > 0 && !active && (
        <div className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center rounded-full text-[8px] font-bold"
          style={{ background: item.color, color: '#fff' }}>
          {count > 9 ? '9+' : count}
        </div>
      )}
    </button>
  )
}

function CapabilitiesSidebar({ active, onChange }: { active: BACKey; onChange: (k: BACKey) => void }) {
  const { state } = useCapabilityStore()
  const caps = allCapacidades(state.paquetes)

  const counts: Record<BACKey, number> = {
    bac31:  state.paquetes.length,
    bac32:  state.implementaciones.length,
    bac33a: caps.length,
    bac33b: state.paquetes.length,
    bac34:  state.serviciosNegocio.length,
    bac64:  state.serviciosInternos.length,
  }

  return (
    <div className="flex flex-col items-center py-3 gap-0.5 flex-shrink-0"
      style={{ width: 52, background: 'var(--bg-base)', borderRight: '1px solid var(--border-lo)' }}>

      <Divider />
      <GroupLabel>Cat.</GroupLabel>
      {[SIDEBAR_ITEMS[0], SIDEBAR_ITEMS[1]].map(item => (
        <SidebarBtn key={item.key} item={item} active={active === item.key}
          onClick={() => onChange(item.key)} count={counts[item.key]} />
      ))}

      <Divider />
      <GroupLabel>Vis.</GroupLabel>
      {[SIDEBAR_ITEMS[2], SIDEBAR_ITEMS[3]].map(item => (
        <SidebarBtn key={item.key} item={item} active={active === item.key}
          onClick={() => onChange(item.key)} count={counts[item.key]} />
      ))}

      <Divider />
      <GroupLabel>Flujo</GroupLabel>
      {[SIDEBAR_ITEMS[4], SIDEBAR_ITEMS[5]].map(item => (
        <SidebarBtn key={item.key} item={item} active={active === item.key}
          onClick={() => onChange(item.key)} count={counts[item.key]} />
      ))}
    </div>
  )
}

// ── Panel header ──────────────────────────────────────────────────────────────

function PanelHeading({ bacKey }: { bacKey: BACKey }) {
  const { icon: Icon, code, title, desc, color } = BAC_META[bacKey]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
      <div style={{ width: 44, height: 44, borderRadius: 13, flexShrink: 0, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h1 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-hi)', margin: 0 }}>{title}</h1>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', padding: '2px 7px', borderRadius: 20, background: color + '18', color }}>{code}</span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-lo)', margin: '3px 0 0', lineHeight: 1.5 }}>{desc}</p>
      </div>
    </div>
  )
}

// ── Main content ──────────────────────────────────────────────────────────────

function CapabilitiesContent() {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const { dbLoading } = useCapabilityStore()
  const [activeBAC, setActiveBAC] = useState<BACKey>('bac31')
  const [saved, setSaved] = useState(false)

  const handleSignOut = async () => { await signOut(); navigate('/') }
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  if (dbLoading) return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: 'var(--bg-base)' }}>
      <div className="auth-spin w-10 h-10 rounded-full" style={{ border: `2px solid ${COLORS.bac31}25`, borderTopColor: COLORS.bac31 }} />
      <p style={{ color: COLORS.bac31, fontFamily: 'Raleway, sans-serif', fontSize: 13 }}>Cargando modelo de capacidades…</p>
    </div>
  )

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-base)' }}>
      <Header
        projectName="Modelo de Capacidades"
        onSignOut={handleSignOut}
        onSave={handleSave}
        saved={saved}
        onBackToDashboard={() => navigate('/app')}
      />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <CapabilitiesSidebar active={activeBAC} onChange={setActiveBAC} />

        <div style={{ flex: 1, overflow: 'auto', background: 'var(--bg-base)' }}>
          <div style={{ maxWidth: 1020, margin: '0 auto', padding: '32px 40px' }}>
            <PanelHeading bacKey={activeBAC} />

            {activeBAC === 'bac31'  && <CatalogoPaquetesSection />}
            {activeBAC === 'bac32'  && <ImplementacionSection />}
            {activeBAC === 'bac33a' && <ClasificacionSection />}
            {activeBAC === 'bac33b' && <MapaCapacidadesSection />}
            {activeBAC === 'bac34'  && <ServiciosNegocioSection />}
            {activeBAC === 'bac64'  && <ServiciosInternosSection />}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Page wrapper ──────────────────────────────────────────────────────────────

export function CapabilitiesPage() {
  return (
    <CapabilityProvider>
      <CapabilitiesContent />
    </CapabilityProvider>
  )
}
