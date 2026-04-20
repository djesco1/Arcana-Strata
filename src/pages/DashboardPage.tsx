import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Layers, Building2, TrendingUp, Target, Zap, Users,
  GitBranch, Package, BarChart3, ArrowRight, Lock, ChevronRight,
  LogOut, User, Bell, Check, X, Sun, Moon,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../contexts/ThemeContext'
import * as db from '../lib/db'
import type { WorkspaceCounts } from '../lib/db'

// ── Model definitions ──────────────────────────────────────────────────────

interface ModelDef {
  id: number
  key: string
  name: string
  short: string
  description: string
  icon: React.ElementType
  color: string
  available: boolean
  route?: string
  getMetrics: (c: WorkspaceCounts) => { label: string; value: number }[]
}

const MODELS: ModelDef[] = [
  {
    id: 1, key: 'negocio', name: 'Modelo de Negocio', short: 'Negocio',
    description: 'Actores, canales, servicios y la estructura de valor de tu empresa.',
    icon: Building2, color: '#5448A0', available: true, route: '/app/negocio',
    getMetrics: c => [
      { label: 'Actores', value: c.actores },
      { label: 'Canales', value: c.canales },
      { label: 'Servicios', value: c.servicios },
      { label: 'En canvas', value: c.canvasNodes },
    ],
  },
  {
    id: 2, key: 'financiero', name: 'Modelo Financiero', short: 'Financiero',
    description: 'Flujos de ingreso, estructura de costos e inversiones.',
    icon: TrendingUp, color: '#1B7A5F', available: true, route: '/app/financiero',
    getMetrics: c => [
      { label: 'Líneas', value: c.financialLineas },
      { label: 'Períodos', value: c.financialPeriodos },
      { label: 'Ingresos (K)', value: c.financialIngresos > 0 ? Math.round(c.financialIngresos / 1000) : 0 },
      { label: 'Ut. Neta (K)', value: isFinite(c.financialUtilidadNeta) ? Math.round(c.financialUtilidadNeta / 1000) : 0 },
    ],
  },
  {
    id: 3, key: 'estrategico', name: 'Modelo Estratégico', short: 'Estratégico',
    description: 'Visión, misión, objetivos y decisiones estratégicas de largo plazo.',
    icon: Target, color: '#B45309', available: true, route: '/app/estrategico',
    getMetrics: c => [
      { label: 'Objetivos', value: c.strategicObjetivos },
      { label: 'Decisiones', value: c.strategicDecisiones },
      { label: 'Indicadores', value: c.strategicIndicadores },
    ],
  },
  {
    id: 4, key: 'capacidades', name: 'Modelo de Capacidades', short: 'Capacidades',
    description: 'Competencias, habilidades y capacidades organizacionales.',
    icon: Zap, color: '#9B8FE4', available: false,
    getMetrics: () => [{ label: 'Capacidades', value: 0 }, { label: 'Brechas', value: 0 }, { label: 'Dominios', value: 0 }],
  },
  {
    id: 5, key: 'organizacional', name: 'Modelo Organizacional', short: 'Organizacional',
    description: 'Estructura, jerarquías, roles y cultura de la organización.',
    icon: Users, color: '#C87A2F', available: false,
    getMetrics: () => [{ label: 'Roles', value: 0 }, { label: 'Unidades', value: 0 }, { label: 'Personas', value: 0 }],
  },
  {
    id: 6, key: 'procesos', name: 'Modelo de Procesos', short: 'Procesos',
    description: 'Flujos, actividades y automatizaciones de los procesos críticos.',
    icon: GitBranch, color: '#7E57C2', available: false,
    getMetrics: () => [{ label: 'Procesos', value: 0 }, { label: 'Actividades', value: 0 }, { label: 'Flujos', value: 0 }],
  },
  {
    id: 7, key: 'recursos', name: 'Modelo de Recursos', short: 'Recursos',
    description: 'Gestión de recursos humanos, tecnológicos, físicos y financieros.',
    icon: Package, color: '#B03040', available: false,
    getMetrics: () => [{ label: 'Recursos', value: 0 }, { label: 'Activos', value: 0 }, { label: 'Capacidad', value: 0 }],
  },
  {
    id: 8, key: 'indicadores', name: 'Modelo de Indicadores', short: 'Indicadores',
    description: 'KPIs, métricas y dashboards para la toma de decisiones.',
    icon: BarChart3, color: '#0F8B8D', available: false,
    getMetrics: () => [{ label: 'KPIs', value: 0 }, { label: 'Alertas', value: 0 }, { label: 'Reportes', value: 0 }],
  },
]

// ── Helpers ────────────────────────────────────────────────────────────────

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 18) return 'Buenas tardes'
  return 'Buenas noches'
}

function hasActivity(counts: WorkspaceCounts, model: ModelDef) {
  if (!model.available) return false
  const metrics = model.getMetrics(counts)
  return metrics.some(m => m.value > 0)
}

// ── Model card ─────────────────────────────────────────────────────────────

function ModelCard({ model, counts, onNavigate }: {
  model: ModelDef
  counts: WorkspaceCounts | null
  onNavigate: (route: string) => void
}) {
  const Icon = model.icon
  const active = model.available && !!counts
  const ZERO_COUNTS: WorkspaceCounts = { actores: 0, servicios: 0, canales: 0, componentes: 0, recursos: 0, escenarios: 0, participantes: 0, medios: 0, journeys: 0, canvasNodes: 0, financialLineas: 0, financialPeriodos: 0, financialIngresos: 0, financialUtilidadNeta: 0, strategicObjetivos: 0, strategicDecisiones: 0, strategicIndicadores: 0 }
  const metrics = model.getMetrics(counts ?? ZERO_COUNTS)
  const started = active && hasActivity(counts!, model)

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-300 flex flex-col"
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${model.available ? model.color + '25' : 'var(--border-lo)'}`,
        opacity: model.available ? 1 : 0.7,
      }}
      onMouseEnter={(e) => {
        if (!model.available) return
        e.currentTarget.style.transform = 'translateY(-3px)'
        e.currentTarget.style.boxShadow = `0 12px 40px ${model.color}18`
        e.currentTarget.style.borderColor = model.color + '45'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.borderColor = model.available ? model.color + '25' : 'rgba(155,143,228,0.08)'
      }}
    >
      {/* Top accent */}
      <div style={{ height: 3, background: model.available ? `linear-gradient(90deg, ${model.color}, ${model.color}60)` : 'rgba(155,143,228,0.1)' }} />

      <div className="p-5 flex flex-col flex-1">
        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: model.color + (model.available ? '18' : '0D'), border: `1px solid ${model.color}25` }}
            >
              <Icon size={18} style={{ color: model.available ? model.color : model.color + '80' }} strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-[9px] font-bold tracking-widest mb-0.5" style={{ color: model.color + (model.available ? 'CC' : '60'), fontFamily: 'Raleway, sans-serif' }}>
                MODELO {String(model.id).padStart(2, '0')}
              </p>
              <p className="text-[13px] font-bold leading-tight" style={{ color: model.available ? 'var(--text-md)' : 'var(--text-dim)', fontFamily: 'Raleway, sans-serif' }}>
                {model.short}
              </p>
            </div>
          </div>
          {!model.available && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: 'rgba(155,143,228,0.08)', border: '1px solid rgba(155,143,228,0.12)' }}>
              <Lock size={9} style={{ color: '#5448A0' }} strokeWidth={2.5} />
              <span className="text-[8px] font-bold" style={{ color: '#5448A0', fontFamily: 'Raleway, sans-serif' }}>PRONTO</span>
            </div>
          )}
          {started && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: model.color + '15', border: `1px solid ${model.color}30` }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: model.color }} />
              <span className="text-[8px] font-bold" style={{ color: model.color, fontFamily: 'Raleway, sans-serif' }}>ACTIVO</span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-[11px] leading-relaxed mb-4 flex-1" style={{ color: model.available ? 'var(--text-lo)' : 'var(--text-xdim)', fontFamily: 'Raleway, sans-serif' }}>
          {model.description}
        </p>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {metrics.slice(0, 4).map(m => (
            <div
              key={m.label}
              className="rounded-lg px-2.5 py-2 text-center"
              style={{ background: model.available ? model.color + '0A' : 'rgba(155,143,228,0.04)' }}
            >
              <p className="text-base font-bold leading-none mb-0.5" style={{ color: model.available ? model.color : '#3A2F70', fontFamily: 'Raleway, sans-serif' }}>
                {m.value}
              </p>
              <p className="text-[9px]" style={{ color: model.available ? model.color + 'AA' : '#3A2F60', fontFamily: 'Raleway, sans-serif' }}>
                {m.label}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        {model.available ? (
          <button
            onClick={() => model.route && onNavigate(model.route)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all"
            style={{
              background: model.color + '15',
              color: model.color,
              border: `1px solid ${model.color}30`,
              fontFamily: 'Raleway, sans-serif',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = model.color; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = model.color }}
            onMouseLeave={(e) => { e.currentTarget.style.background = model.color + '15'; e.currentTarget.style.color = model.color; e.currentTarget.style.borderColor = model.color + '30' }}
          >
            {started ? 'Continuar' : 'Comenzar'}
            <ArrowRight size={13} strokeWidth={2.5} />
          </button>
        ) : (
          <div
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold"
            style={{ background: 'rgba(155,143,228,0.05)', color: '#3A2F70', border: '1px solid rgba(155,143,228,0.08)', fontFamily: 'Raleway, sans-serif' }}
          >
            <Lock size={11} strokeWidth={2} />
            Próximamente
          </div>
        )}
      </div>
    </div>
  )
}

// ── Dashboard nav ──────────────────────────────────────────────────────────

function DashboardNav({ userName, userEmail, onSignOut, onEditProfile }: {
  userName?: string
  userEmail?: string
  onSignOut: () => void
  onEditProfile: () => void
}) {
  const initials = userName ? userName[0].toUpperCase() : userEmail ? userEmail[0].toUpperCase() : 'A'
  const { theme, toggleTheme } = useTheme()
  return (
    <nav
      className="flex items-center justify-between px-6 lg:px-10 flex-shrink-0"
      style={{ height: 56, background: 'var(--bg-base)', borderBottom: '1px solid var(--border-lo)', position: 'sticky', top: 0, zIndex: 40 }}
    >
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0" style={{ background: 'linear-gradient(135deg, #5448A0 0%, #9B8FE4 100%)' }}>
          <Layers size={14} color="#fff" strokeWidth={2.5} />
        </div>
        <div className="flex items-center gap-1.5" style={{ fontFamily: 'Raleway, sans-serif' }}>
          <span className="text-[13px] font-bold" style={{ color: 'var(--text-hi)' }}>Arcana</span>
          <span className="text-[13px] font-bold" style={{ color: 'var(--c-accent)' }}>Strata</span>
          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full ml-0.5" style={{ background: 'rgba(84,72,160,0.2)', color: 'var(--c-accent)', border: '1px solid rgba(84,72,160,0.3)' }}>BETA</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 ml-2">
          <ChevronRight size={12} style={{ color: 'var(--text-xdim)' }} />
          <span className="text-[11px] font-semibold" style={{ color: 'var(--text-lo)', fontFamily: 'Raleway, sans-serif' }}>Dashboard</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button onClick={toggleTheme} title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
          style={{ color: 'var(--text-dim)' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--c-accent)'; (e.currentTarget as HTMLElement).style.background = 'var(--bg-card-hover)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-dim)'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}
        >
          {theme === 'dark' ? <Sun size={14} strokeWidth={1.8} /> : <Moon size={14} strokeWidth={1.8} />}
        </button>
        <button className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ color: 'var(--text-dim)' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--c-accent)'; (e.currentTarget as HTMLElement).style.background = 'var(--bg-card-hover)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-dim)'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}
        >
          <Bell size={14} strokeWidth={1.8} />
        </button>
        <div className="relative group">
          <button className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold"
            style={{ background: 'linear-gradient(135deg, #5448A0, #9B8FE4)', color: '#fff', fontFamily: 'Raleway, sans-serif' }}>
            {initials}
          </button>
          <div className="absolute right-0 top-9 rounded-xl py-1 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-md)', boxShadow: 'var(--shadow-panel)', minWidth: 180, zIndex: 50 }}>
            <div className="px-3 py-2.5" style={{ borderBottom: '1px solid var(--border-lo)' }}>
              {userName && <p className="text-[12px] font-semibold truncate mb-0.5" style={{ color: 'var(--text-md)', fontFamily: 'Raleway, sans-serif' }}>{userName}</p>}
              {userEmail && <p className="text-[10px] truncate" style={{ color: 'var(--text-dim)', fontFamily: 'Raleway, sans-serif' }}>{userEmail}</p>}
            </div>
            <button onClick={onEditProfile} className="w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors" style={{ color: 'var(--c-accent)', fontFamily: 'Raleway, sans-serif' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
              <User size={12} strokeWidth={2} />Editar perfil
            </button>
            <button onClick={onSignOut} className="w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors" style={{ color: '#B03040', fontFamily: 'Raleway, sans-serif', borderTop: '1px solid var(--border-lo)' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(176,48,64,0.08)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
              <LogOut size={12} strokeWidth={2} />Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

// ── Profile modal (reused from Header) ────────────────────────────────────

function ProfileModal({ userEmail, userName, onClose }: { userEmail?: string; userName?: string; onClose: () => void }) {
  const { updateProfile } = useAuth()
  const [nameInput, setNameInput] = useState(userName ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const save = async () => {
    if (!nameInput.trim()) { setError('El nombre no puede estar vacío.'); return }
    setSaving(true)
    const { error: err } = await updateProfile(nameInput.trim())
    setSaving(false)
    if (err) { setError(err); return }
    setDone(true)
    setTimeout(onClose, 800)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="rounded-2xl p-6 w-full" style={{ maxWidth: 380, background: 'var(--bg-surface)', border: '1px solid var(--border-md)', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold" style={{ color: '#E8DFF5', fontFamily: 'Raleway, sans-serif' }}>Editar perfil</h3>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg" style={{ color: '#5448A0' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(155,143,228,0.1)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          ><X size={14} strokeWidth={2} /></button>
        </div>
        <div className="mb-4">
          <label className="block text-[11px] font-semibold mb-1.5" style={{ color: '#7060A8', fontFamily: 'Raleway, sans-serif' }}>NOMBRE</label>
          <input type="text" value={nameInput} onChange={(e) => { setNameInput(e.target.value); setError(null) }}
            onKeyDown={(e) => e.key === 'Enter' && save()}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none"
            style={{ background: 'rgba(155,143,228,0.06)', border: '1px solid rgba(155,143,228,0.15)', color: '#E8DFF5', fontFamily: 'Raleway, sans-serif' }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(155,143,228,0.4)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(155,143,228,0.15)')}
            autoFocus
          />
        </div>
        <div className="mb-4">
          <label className="block text-[11px] font-semibold mb-1.5" style={{ color: '#7060A8', fontFamily: 'Raleway, sans-serif' }}>CORREO</label>
          <input type="text" value={userEmail ?? ''} disabled className="w-full px-4 py-3 rounded-xl text-sm"
            style={{ background: 'rgba(155,143,228,0.03)', border: '1px solid rgba(155,143,228,0.08)', color: '#5448A0', fontFamily: 'Raleway, sans-serif', cursor: 'not-allowed' }}
          />
        </div>
        {error && <div className="rounded-lg px-3 py-2 mb-4 text-xs" style={{ background: 'rgba(176,48,64,0.1)', border: '1px solid rgba(176,48,64,0.2)', color: '#E07080', fontFamily: 'Raleway, sans-serif' }}>{error}</div>}
        <div className="flex gap-2">
          <button onClick={save} disabled={saving || done}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold disabled:opacity-60"
            style={{ background: done ? '#1B7A5F' : 'linear-gradient(135deg, #5448A0, #7B6EC8)', color: '#fff', fontFamily: 'Raleway, sans-serif' }}
          >
            {saving ? <span className="auth-spin w-4 h-4 rounded-full" style={{ border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
              : done ? <><Check size={14} strokeWidth={2.5} />Guardado</>
              : <><Check size={14} strokeWidth={2.5} />Guardar</>
            }
          </button>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: 'rgba(155,143,228,0.08)', color: '#9B8FE4', fontFamily: 'Raleway, sans-serif' }}
          >Cancelar</button>
        </div>
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────

export function DashboardPage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [counts, setCounts] = useState<WorkspaceCounts | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingProfile, setEditingProfile] = useState(false)

  const userName = user?.user_metadata?.full_name as string | undefined
  const userEmail = user?.email

  useEffect(() => {
    if (!user) return
    db.ensureWorkspace(user.id)
      .then(wsId => db.loadWorkspaceCounts(wsId))
      .then(c => { setCounts(c); setLoading(false) })
      .catch(() => setLoading(false))
  }, [user?.id])  // eslint-disable-line react-hooks/exhaustive-deps

  const handleSignOut = async () => { await signOut(); navigate('/') }

  const activeModels = MODELS.filter(m => m.available && counts && hasActivity(counts, m)).length
  const totalElements = counts
    ? counts.actores + counts.canales + counts.servicios + counts.componentes + counts.recursos
    : 0

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      <DashboardNav
        userName={userName}
        userEmail={userEmail}
        onSignOut={handleSignOut}
        onEditProfile={() => setEditingProfile(true)}
      />

      <main className="flex-1 px-6 lg:px-10 py-8" style={{ maxWidth: 1280, margin: '0 auto', width: '100%' }}>

        {/* Greeting */}
        <div className="mb-10">
          <h1 className="text-2xl lg:text-3xl font-bold mb-1" style={{ color: 'var(--text-hi)', fontFamily: 'Raleway, sans-serif' }}>
            {greeting()}{userName ? `, ${userName.split(' ')[0]}` : ''}
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-dim)', fontFamily: 'Raleway, sans-serif' }}>
            Aquí está el estado de tu arquitectura empresarial.
          </p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Modelos activos', value: loading ? '—' : `${activeModels} / 8`, color: 'var(--c-accent)' },
            { label: 'Elementos totales', value: loading ? '—' : String(totalElements), color: 'var(--c-primary)' },
            { label: 'Nodos en canvas', value: loading ? '—' : String(counts?.canvasNodes ?? 0), color: '#2B6CB0' },
            { label: 'Journeys', value: loading ? '—' : String(counts?.journeys ?? 0), color: '#1B7A5F' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-lo)' }}>
              <p className="text-2xl font-bold mb-1" style={{ color: s.color, fontFamily: 'Raleway, sans-serif' }}>{s.value}</p>
              <p className="text-[11px]" style={{ color: 'var(--text-dim)', fontFamily: 'Raleway, sans-serif' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Models grid */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-base font-bold" style={{ color: 'var(--text-md)', fontFamily: 'Raleway, sans-serif' }}>
            Modelos de arquitectura
          </h2>
          <span className="text-[11px]" style={{ color: 'var(--text-xdim)', fontFamily: 'Raleway, sans-serif' }}>
            8 modelos · {MODELS.filter(m => m.available).length} disponible{MODELS.filter(m => m.available).length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MODELS.map(model => (
            <ModelCard
              key={model.key}
              model={model}
              counts={loading ? null : counts}
              onNavigate={navigate}
            />
          ))}
        </div>
      </main>

      {editingProfile && (
        <ProfileModal
          userEmail={userEmail}
          userName={userName}
          onClose={() => setEditingProfile(false)}
        />
      )}
    </div>
  )
}
