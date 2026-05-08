import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Zap, BarChart3, Flag, Target, Activity, FileText, GanttChart, GitFork, TrendingUp, Monitor, Users, Building, ClipboardList } from 'lucide-react'
import { StrategicProvider, useStrategicStore } from '../store/strategicStore'
import { Header } from '../components/layout/Header'
import { MotivacionalSection } from '../components/strategic/MotivacionalSection'
import { PromesaValorSection } from '../components/strategic/PromesaValorSection'
import { IndicadoresSection } from '../components/strategic/IndicadoresSection'
import { SituacionObjetivoSection } from '../components/strategic/SituacionObjetivoSection'
import { ObjetivosSection } from '../components/strategic/ObjetivosSection'
import { AccionesEstrategicasSection } from '../components/strategic/AccionesEstrategicasSection'
import { FichaAccionSection } from '../components/strategic/FichaAccionSection'
import { GanttSection } from '../components/strategic/GanttSection'
import { GrafoDependenciasSection } from '../components/strategic/GrafoDependenciasSection'
import { CatalogoIndEjecucionSection } from '../components/strategic/CatalogoIndEjecucionSection'
import { TableroControlSection } from '../components/strategic/TableroControlSection'
import { RolesFuncionesSection } from '../components/strategic/RolesFuncionesSection'
import { ComitesSection } from '../components/strategic/ComitesSection'
import { ProcesosSeguimientoSection } from '../components/strategic/ProcesosSeguimientoSection'
import { STRATEGIC_COLORS as COLORS } from '../constants/colors'
import { useAuth } from '../hooks/useAuth'

// ── Sidebar definition ────────────────────────────────────────────────────────
type BACKey = 'bac17' | 'bac21' | 'bac18' | 'bac19' | 'bac20' | 'bac22' | 'bac23' | 'bac24' | 'bac25' | 'bac26' | 'bac27' | 'bac28' | 'bac29' | 'bac30'

interface BACItem {
  key: BACKey
  icon: React.ElementType
  code: string
  label: string
  color: string
}

const GROUP_MOT: BACItem[] = [
  { key: 'bac17', icon: Sparkles, code: '17', label: 'Motivacional',       color: COLORS.bac17 },
]
const GROUP_EST: BACItem[] = [
  { key: 'bac21', icon: Zap,      code: '21', label: 'Promesa de Valor',   color: COLORS.bac21 },
]
const GROUP_OBJ: BACItem[] = [
  { key: 'bac18', icon: BarChart3, code: '18', label: 'Indicadores',       color: COLORS.bac18 },
  { key: 'bac19', icon: Target,    code: '19', label: 'Situacion Objetivo', color: COLORS.bac19 },
  { key: 'bac20', icon: Flag,      code: '20', label: 'Objetivos & Metas',  color: COLORS.bac20 },
]
const GROUP_EJEC: BACItem[] = [
  { key: 'bac22', icon: Activity,  code: '22', label: 'Catalogo de Acciones', color: COLORS.bac22 },
  { key: 'bac23', icon: FileText,  code: '23', label: 'Ficha de Accion',      color: COLORS.bac23 },
  { key: 'bac24', icon: GanttChart,code: '24', label: 'Diagrama de Gantt',    color: COLORS.bac24 },
  { key: 'bac25', icon: GitFork,   code: '25', label: 'Grafo de Dependencias',color: COLORS.bac25 },
]
const GROUP_MED: BACItem[] = [
  { key: 'bac26', icon: TrendingUp,    code: '26', label: 'Ind. Ejecución',    color: COLORS.bac26 },
  { key: 'bac27', icon: Monitor,       code: '27', label: 'Tablero Control',   color: COLORS.bac27 },
  { key: 'bac28', icon: Users,         code: '28', label: 'Roles y Funciones', color: COLORS.bac28 },
  { key: 'bac29', icon: Building,      code: '29', label: 'Comités',           color: COLORS.bac29 },
  { key: 'bac30', icon: ClipboardList, code: '30', label: 'Proc. Gobierno',    color: COLORS.bac30 },
]

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

function StrategicSidebar({ active, onChange }: { active: BACKey; onChange: (k: BACKey) => void }) {
  const { state } = useStrategicStore()
  const acc = state.ejecucion?.acciones ?? []
  const med = state.medicion
  const counts: Record<BACKey, number> = {
    bac17: state.motivacional.valores.length,
    bac21: state.promesaValor.length,
    bac18: state.indicadoresLogro.length,
    bac19: (state.situacionObjetivo?.indicadores ?? []).length,
    bac20: state.objetivos.objetivos.length,
    bac22: acc.length,
    bac23: acc.reduce((s, a) => s + (a.accionesTacticas?.length ?? 0), 0),
    bac24: acc.filter(a => a.fechaInicio && a.fechaFin).length,
    bac25: acc.reduce((s, a) => s + (a.prerrequisitos?.length ?? 0), 0),
    bac26: med.indicadoresEjecucion.length,
    bac27: med.tableroControl.length,
    bac28: med.roles.length,
    bac29: med.comites.length,
    bac30: med.procesos.length,
  }

  const renderGroup = (items: BACItem[]) => items.map(item => (
    <SidebarBtn key={item.key} item={item} active={active === item.key}
      onClick={() => onChange(item.key)} count={counts[item.key]} />
  ))

  return (
    <div className="flex flex-col items-center py-3 gap-0.5 flex-shrink-0"
      style={{ width: 52, background: 'var(--bg-base)', borderRight: '1px solid var(--border-lo)' }}>

      <Divider />
      <GroupLabel>Mot.</GroupLabel>
      {renderGroup(GROUP_MOT)}

      <Divider />
      <GroupLabel>Est.</GroupLabel>
      {renderGroup(GROUP_EST)}

      <Divider />
      <GroupLabel>Obj.</GroupLabel>
      {renderGroup(GROUP_OBJ)}

      <Divider />
      <GroupLabel>Ejec.</GroupLabel>
      {renderGroup(GROUP_EJEC)}

      <Divider />
      <GroupLabel>Med.</GroupLabel>
      {renderGroup(GROUP_MED)}
    </div>
  )
}

// ── Panel header ──────────────────────────────────────────────────────────────

const BAC_META: Record<BACKey, { icon: React.ElementType; code: string; title: string; desc: string; color: string }> = {
  bac17: { icon: Sparkles,   code: 'BAC-17', title: 'Componente Motivacional',     desc: 'Propósito superior, BHAG, visión, misión y valores de la organización',                          color: COLORS.bac17 },
  bac21: { icon: Zap,        code: 'BAC-21', title: 'Promesa de Valor',            desc: 'Decisiones estratégicas e intenciones de cambio sobre los modelos del negocio',                  color: COLORS.bac21 },
  bac18: { icon: BarChart3,  code: 'BAC-18', title: 'Catalogo de Indicadores',     desc: 'Catalogo de artefactos de medicion usados como referencia en BAC-19 y BAC-20',                  color: COLORS.bac18 },
  bac19: { icon: Target,     code: 'BAC-19', title: 'Situacion Objetivo',          desc: 'Valores iniciales y objetivo para cada indicador del catalogo BAC-18',                           color: COLORS.bac19 },
  bac20: { icon: Flag,       code: 'BAC-20', title: 'Clasificacion de Objetivos',  desc: 'Jerarquia de objetivos estrategicos con metas e indicadores de cambio asociados',               color: COLORS.bac20 },
  bac22: { icon: Activity,   code: 'BAC-22', title: 'Catalogo de Acciones',        desc: 'Catalogo de acciones estrategicas con responsable, fechas e indicadores de logro asociados',    color: COLORS.bac22 },
  bac23: { icon: FileText,   code: 'BAC-23', title: 'Ficha de una Accion',         desc: 'Detalle de cada accion estrategica: costo, proyecto, prerrequisitos y acciones tacticas',        color: COLORS.bac23 },
  bac24: { icon: GanttChart, code: 'BAC-24', title: 'Diagrama de Gantt',           desc: 'Linea de tiempo de las acciones estrategicas distribuidas por mes',                              color: COLORS.bac24 },
  bac25: { icon: GitFork,      code: 'BAC-25', title: 'Grafo de Dependencias',            desc: 'Diagrama de dependencias entre acciones estrategicas segun sus prerrequisitos',                  color: COLORS.bac25 },
  bac26: { icon: TrendingUp,   code: 'BAC-26', title: 'Catalogo de Indicadores de Ejecucion', desc: 'Indicadores utilizados para medir el avance de las acciones estrategicas',                   color: COLORS.bac26 },
  bac27: { icon: Monitor,      code: 'BAC-27', title: 'Tablero de Control de la Ejecucion', desc: 'Estado actual de cada accion estrategica segun sus indicadores de ejecucion',                  color: COLORS.bac27 },
  bac28: { icon: Users,        code: 'BAC-28', title: 'Catalogo de Roles y Funciones',     desc: 'Roles responsables del seguimiento de la ejecucion y garantia del plan estrategico',           color: COLORS.bac28 },
  bac29: { icon: Building,     code: 'BAC-29', title: 'Catalogo de Comites',               desc: 'Comites estrategicos y operativos con roles participantes y funciones asignadas',               color: COLORS.bac29 },
  bac30: { icon: ClipboardList,code: 'BAC-30', title: 'Catalogo de Procesos de Gobierno',  desc: 'Procesos de seguimiento y gobierno con sus objetivos y secuencia de actividades',             color: COLORS.bac30 },
}

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

function StrategicContent() {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const { dbLoading } = useStrategicStore()
  const [activeBAC, setActiveBAC] = useState<BACKey>('bac17')
  const [saved, setSaved] = useState(false)

  const handleSignOut = async () => { await signOut(); navigate('/') }
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  if (dbLoading) return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: 'var(--bg-base)' }}>
      <div className="auth-spin w-10 h-10 rounded-full" style={{ border: `2px solid #C87A2F25`, borderTopColor: '#C87A2F' }} />
      <p style={{ color: '#C87A2F', fontFamily: 'Raleway, sans-serif', fontSize: 13 }}>Cargando modelo estratégico…</p>
    </div>
  )

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-base)' }}>
      <Header
        projectName="Modelo Estratégico"
        onSignOut={handleSignOut}
        onSave={handleSave}
        saved={saved}
        onBackToDashboard={() => navigate('/app')}
      />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <StrategicSidebar active={activeBAC} onChange={setActiveBAC} />

        <div style={{ flex: 1, overflow: 'auto', background: 'var(--bg-base)' }}>
          <div style={{ maxWidth: 1020, margin: '0 auto', padding: '32px 40px' }}>
            <PanelHeading bacKey={activeBAC} />

            {activeBAC === 'bac17' && <MotivacionalSection />}
            {activeBAC === 'bac21' && <PromesaValorSection />}
            {activeBAC === 'bac18' && <IndicadoresSection />}
            {activeBAC === 'bac19' && <SituacionObjetivoSection />}
            {activeBAC === 'bac20' && <ObjetivosSection />}
            {activeBAC === 'bac22' && <AccionesEstrategicasSection />}
            {activeBAC === 'bac23' && <FichaAccionSection />}
            {activeBAC === 'bac24' && <GanttSection />}
            {activeBAC === 'bac25' && <GrafoDependenciasSection />}
            {activeBAC === 'bac26' && <CatalogoIndEjecucionSection />}
            {activeBAC === 'bac27' && <TableroControlSection />}
            {activeBAC === 'bac28' && <RolesFuncionesSection />}
            {activeBAC === 'bac29' && <ComitesSection />}
            {activeBAC === 'bac30' && <ProcesosSeguimientoSection />}
          </div>
        </div>

      </div>
    </div>
  )
}

// ── Page wrapper ──────────────────────────────────────────────────────────────

export function StrategicPage() {
  return (
    <StrategicProvider>
      <StrategicContent />
    </StrategicProvider>
  )
}
