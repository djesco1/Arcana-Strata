import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Layers, ArrowRight, Building2, TrendingUp, Target, Zap,
  Users, GitBranch, Package, BarChart3, Check, ChevronRight
} from 'lucide-react'

const MODELS = [
  {
    id: 1, name: 'Modelo de Negocio', short: 'Negocio',
    description: 'Define la propuesta de valor, actores, canales y estructura de monetización de tu empresa.',
    icon: Building2, color: '#5448A0', bg: '#5448A015',
    features: ['Actores y roles', 'Canales de distribución', 'Propuesta de valor', 'Patrones de negocio'],
  },
  {
    id: 2, name: 'Modelo Financiero', short: 'Financiero',
    description: 'Estructura los flujos de ingreso, costos, inversiones y la sostenibilidad económica.',
    icon: TrendingUp, color: '#1B7A5F', bg: '#1B7A5F15',
    features: ['Flujos de ingreso', 'Estructura de costos', 'Inversiones', 'Punto de equilibrio'],
  },
  {
    id: 3, name: 'Modelo Estratégico', short: 'Estratégico',
    description: 'Establece la visión, misión, objetivos y la hoja de ruta estratégica a largo plazo.',
    icon: Target, color: '#2B6CB0', bg: '#2B6CB015',
    features: ['Visión y misión', 'Objetivos estratégicos', 'Iniciativas clave', 'Hoja de ruta'],
  },
  {
    id: 4, name: 'Modelo de Capacidades', short: 'Capacidades',
    description: 'Mapea las competencias, habilidades y capacidades organizacionales esenciales.',
    icon: Zap, color: '#9B8FE4', bg: '#9B8FE415',
    features: ['Capacidades core', 'Brechas de capacidad', 'Desarrollo organizacional', 'Benchmarking'],
  },
  {
    id: 5, name: 'Modelo Organizacional', short: 'Organizacional',
    description: 'Diseña la estructura, jerarquías, roles y la cultura de tu organización.',
    icon: Users, color: '#C87A2F', bg: '#C87A2F15',
    features: ['Estructura jerárquica', 'Roles y responsabilidades', 'Cultura organizacional', 'Gobernanza'],
  },
  {
    id: 6, name: 'Modelo de Procesos', short: 'Procesos',
    description: 'Documenta, optimiza y automatiza los procesos críticos del negocio.',
    icon: GitBranch, color: '#7E57C2', bg: '#7E57C215',
    features: ['Flujos de proceso', 'Puntos de decisión', 'Automatización', 'KPIs de proceso'],
  },
  {
    id: 7, name: 'Modelo de Recursos', short: 'Recursos',
    description: 'Gestiona los recursos humanos, tecnológicos, físicos y financieros.',
    icon: Package, color: '#B03040', bg: '#B0304015',
    features: ['Recursos humanos', 'Tecnología', 'Activos físicos', 'Capital financiero'],
  },
  {
    id: 8, name: 'Modelo de Indicadores', short: 'Indicadores',
    description: 'Define y monitorea los KPIs y métricas que impulsan la toma de decisiones.',
    icon: BarChart3, color: '#0F8B8D', bg: '#0F8B8D15',
    features: ['KPIs estratégicos', 'Dashboards', 'Alertas', 'Análisis de tendencias'],
  },
]

const FEATURES = [
  { title: 'Canvas Interactivo', desc: 'Arrastra, conecta y organiza elementos en un espacio de trabajo visual infinito.', icon: '🎨' },
  { title: '20 Patrones BAC', desc: 'Carga patrones predefinidos que aceleran el modelado de arquitecturas complejas.', icon: '⚡' },
  { title: 'Metodología Rigurosa', desc: 'Basado en el framework BAC del Dr. Jorge Villalobos, Universidad de los Andes.', icon: '🎓' },
  { title: 'Colaboración en Tiempo Real', desc: 'Trabaja con tu equipo simultáneamente en el mismo modelo arquitectónico.', icon: '👥' },
  { title: 'Exportación Profesional', desc: 'Exporta tus arquitecturas en PDF, PNG o compártelas con un enlace.', icon: '📤' },
  { title: '8 Modelos Integrados', desc: 'Todos los modelos están conectados, mostrando cómo cada decisión impacta el todo.', icon: '🔗' },
]

function FloatingOrb({ x, y, size, color, delay = 0 }: { x: string; y: string; size: number; color: string; delay?: number }) {
  return (
    <div
      className="landing-float"
      style={{
        position: 'absolute', left: x, top: y,
        width: size, height: size,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        borderRadius: '50%',
        animationDelay: `${delay}s`,
        pointerEvents: 'none',
      }}
    />
  )
}

function ModelCard({ model, index }: { model: typeof MODELS[0]; index: number }) {
  const Icon = model.icon
  return (
    <div
      className="landing-card-fade rounded-2xl p-6 transition-all duration-300 group cursor-default"
      style={{
        background: model.bg,
        border: `1px solid ${model.color}25`,
        animationDelay: `${index * 0.08}s`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.borderColor = model.color + '50'
        e.currentTarget.style.boxShadow = `0 12px 40px ${model.color}20`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.borderColor = model.color + '25'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div className="flex items-start gap-4 mb-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: model.color + '22', border: `1px solid ${model.color}30` }}
        >
          <Icon size={20} style={{ color: model.color }} strokeWidth={1.8} />
        </div>
        <div>
          <span className="text-[10px] font-bold tracking-wider" style={{ color: model.color + 'CC', fontFamily: 'Raleway, sans-serif' }}>
            MODELO {model.id.toString().padStart(2, '0')}
          </span>
          <h3 className="text-[15px] font-bold leading-tight" style={{ color: '#D4CCF0', fontFamily: 'Raleway, sans-serif' }}>
            {model.short}
          </h3>
        </div>
      </div>
      <p className="text-[12px] leading-relaxed mb-4" style={{ color: '#7060A8', fontFamily: 'Raleway, sans-serif' }}>
        {model.description}
      </p>
      <div className="space-y-1.5">
        {model.features.map(f => (
          <div key={f} className="flex items-center gap-2">
            <Check size={10} style={{ color: model.color, flexShrink: 0 }} strokeWidth={3} />
            <span className="text-[11px]" style={{ color: '#8878C0', fontFamily: 'Raleway, sans-serif' }}>{f}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function LandingPage() {
  const navigate = useNavigate()
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      if (!heroRef.current) return
      const rect = heroRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      heroRef.current.style.setProperty('--mx', `${x * 100}%`)
      heroRef.current.style.setProperty('--my', `${y * 100}%`)
    }
    window.addEventListener('mousemove', handleMouse)
    return () => window.removeEventListener('mousemove', handleMouse)
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#0A0D1E', color: '#E8DFF5', overflowX: 'hidden' }}>

      {/* Nav */}
      <nav
        className="flex items-center justify-between px-8 lg:px-16"
        style={{ height: 64, borderBottom: '1px solid rgba(155,143,228,0.08)', position: 'sticky', top: 0, zIndex: 50, background: 'rgba(10,13,30,0.85)', backdropFilter: 'blur(12px)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #5448A0 0%, #9B8FE4 100%)' }}>
            <Layers size={16} color="#fff" strokeWidth={2.5} />
          </div>
          <div className="flex items-center gap-1.5" style={{ fontFamily: 'Raleway, sans-serif' }}>
            <span className="font-bold text-base" style={{ color: '#E8DFF5' }}>Arcana</span>
            <span className="font-bold text-base" style={{ color: '#9B8FE4' }}>Strata</span>
            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full ml-0.5" style={{ background: 'rgba(84,72,160,0.2)', color: '#9B8FE4', border: '1px solid rgba(84,72,160,0.3)' }}>BETA</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/auth')}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors hidden sm:block"
            style={{ color: '#9B8FE4', fontFamily: 'Raleway, sans-serif' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(155,143,228,0.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => navigate('/auth')}
            className="px-4 py-2 rounded-lg text-sm font-bold transition-all"
            style={{ background: 'linear-gradient(135deg, #5448A0, #7B6EC8)', color: '#fff', fontFamily: 'Raleway, sans-serif', boxShadow: '0 2px 12px rgba(84,72,160,0.35)' }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(84,72,160,0.5)')}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 2px 12px rgba(84,72,160,0.35)')}
          >
            Empezar gratis
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section
        ref={heroRef}
        className="relative flex flex-col items-center justify-center text-center px-6 py-28 lg:py-36 overflow-hidden"
        style={{ minHeight: '85vh' }}
      >
        {/* Background orbs */}
        <FloatingOrb x="10%" y="15%" size={500} color="rgba(84,72,160,0.18)" delay={0} />
        <FloatingOrb x="70%" y="5%" size={400} color="rgba(155,143,228,0.12)" delay={3} />
        <FloatingOrb x="50%" y="60%" size={600} color="rgba(27,122,95,0.08)" delay={1.5} />
        <FloatingOrb x="-5%" y="70%" size={350} color="rgba(43,108,176,0.1)" delay={2} />

        {/* Grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(155,143,228,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(155,143,228,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div style={{ position: 'relative', maxWidth: 860, margin: '0 auto' }}>
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 landing-fade-up"
            style={{ background: 'rgba(84,72,160,0.12)', border: '1px solid rgba(155,143,228,0.2)', animationDelay: '0s' }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#9B8FE4' }} />
            <span className="text-xs font-semibold" style={{ color: '#9B8FE4', fontFamily: 'Raleway, sans-serif' }}>Metodología BAC · Universidad de los Andes</span>
          </div>

          <h1
            className="text-5xl lg:text-7xl font-bold mb-6 leading-none landing-fade-up"
            style={{ fontFamily: 'Raleway, sans-serif', animationDelay: '0.1s', letterSpacing: '-0.02em' }}
          >
            <span style={{ color: '#E8DFF5' }}>El futuro de la</span>
            <br />
            <span style={{ background: 'linear-gradient(135deg, #9B8FE4 0%, #5448A0 40%, #2B6CB0 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block' }}>
              arquitectura
            </span>
            <br />
            <span style={{ color: '#E8DFF5' }}>empresarial</span>
          </h1>

          <p
            className="text-lg lg:text-xl leading-relaxed mb-10 landing-fade-up"
            style={{ color: '#7060A8', maxWidth: 600, margin: '0 auto 40px', fontFamily: 'Raleway, sans-serif', animationDelay: '0.2s' }}
          >
            Diseña arquitecturas empresariales completas con 8 modelos integrados.
            Del modelo de negocio a los indicadores — todo conectado, todo visual.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 landing-fade-up" style={{ animationDelay: '0.3s' }}>
            <button
              onClick={() => navigate('/auth')}
              className="flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold transition-all w-full sm:w-auto justify-center"
              style={{ background: 'linear-gradient(135deg, #5448A0 0%, #7B6EC8 100%)', color: '#fff', fontFamily: 'Raleway, sans-serif', boxShadow: '0 6px 32px rgba(84,72,160,0.45)' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 40px rgba(84,72,160,0.6)' }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 32px rgba(84,72,160,0.45)' }}
            >
              Comenzar gratis
              <ArrowRight size={18} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => document.getElementById('models')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold transition-all w-full sm:w-auto justify-center"
              style={{ color: '#9B8FE4', border: '1px solid rgba(155,143,228,0.25)', fontFamily: 'Raleway, sans-serif' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(155,143,228,0.06)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              Ver los modelos
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div
          className="relative mt-20 flex flex-wrap items-center justify-center gap-8 lg:gap-16 landing-fade-up"
          style={{ animationDelay: '0.45s' }}
        >
          {[
            { value: '8', label: 'Modelos integrados' },
            { value: '20', label: 'Patrones de negocio' },
            { value: '∞', label: 'Posibilidades' },
            { value: 'BAC', label: 'Metodología rigurosa' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-bold mb-1" style={{ fontFamily: 'Raleway, sans-serif', background: 'linear-gradient(135deg, #9B8FE4, #5448A0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {s.value}
              </div>
              <div className="text-xs" style={{ color: '#5448A0', fontFamily: 'Raleway, sans-serif' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Models section */}
      <section id="models" className="px-6 lg:px-16 py-24">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold tracking-widest mb-4 px-3 py-1 rounded-full" style={{ color: '#9B8FE4', background: 'rgba(155,143,228,0.1)', border: '1px solid rgba(155,143,228,0.2)', fontFamily: 'Raleway, sans-serif' }}>
              ARQUITECTURA COMPLETA
            </span>
            <h2 className="text-3xl lg:text-5xl font-bold mb-5" style={{ fontFamily: 'Raleway, sans-serif', color: '#E8DFF5', letterSpacing: '-0.02em' }}>
              8 modelos que forman<br />
              <span style={{ background: 'linear-gradient(135deg, #9B8FE4, #5448A0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                una arquitectura completa
              </span>
            </h2>
            <p className="text-base" style={{ color: '#7060A8', maxWidth: 560, margin: '0 auto', fontFamily: 'Raleway, sans-serif' }}>
              Cada modelo es una perspectiva única de tu empresa. Juntos, forman una visión 360° que impulsa decisiones estratégicas certeras.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {MODELS.map((m, i) => <ModelCard key={m.id} model={m} index={i} />)}
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="px-6 lg:px-16 py-24" style={{ background: 'rgba(155,143,228,0.03)', borderTop: '1px solid rgba(155,143,228,0.07)', borderBottom: '1px solid rgba(155,143,228,0.07)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-bold tracking-widest mb-4 px-3 py-1 rounded-full" style={{ color: '#C87A2F', background: 'rgba(200,122,47,0.1)', border: '1px solid rgba(200,122,47,0.2)', fontFamily: 'Raleway, sans-serif' }}>
              PLATAFORMA
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold" style={{ fontFamily: 'Raleway, sans-serif', color: '#E8DFF5' }}>
              Herramientas diseñadas<br />para arquitectos
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="rounded-2xl p-6 transition-all duration-300"
                style={{ background: 'rgba(155,143,228,0.04)', border: '1px solid rgba(155,143,228,0.1)', animationDelay: `${i * 0.07}s` }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(155,143,228,0.08)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(155,143,228,0.04)'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-[15px] font-bold mb-2" style={{ color: '#D4CCF0', fontFamily: 'Raleway, sans-serif' }}>{f.title}</h3>
                <p className="text-[12px] leading-relaxed" style={{ color: '#7060A8', fontFamily: 'Raleway, sans-serif' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Methodology section */}
      <section className="px-6 lg:px-16 py-24">
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div
            className="rounded-3xl p-10 lg:p-16 text-center relative overflow-hidden"
            style={{ background: 'linear-gradient(145deg, rgba(84,72,160,0.15) 0%, rgba(10,13,30,0.8) 100%)', border: '1px solid rgba(155,143,228,0.15)' }}
          >
            <FloatingOrb x="80%" y="10%" size={250} color="rgba(84,72,160,0.2)" />
            <FloatingOrb x="-5%" y="60%" size={200} color="rgba(27,122,95,0.1)" delay={2} />
            <div style={{ position: 'relative' }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-8" style={{ background: 'linear-gradient(135deg, #5448A0, #9B8FE4)' }}>
                <Layers size={28} color="#fff" strokeWidth={2} />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-5" style={{ fontFamily: 'Raleway, sans-serif', color: '#E8DFF5' }}>
                Metodología BAC
              </h2>
              <p className="text-base leading-relaxed mb-8" style={{ color: '#7060A8', maxWidth: 580, margin: '0 auto 32px', fontFamily: 'Raleway, sans-serif' }}>
                Arcana Strata implementa el framework Business Architecture Canvas desarrollado en la Universidad de los Andes. Una metodología rigurosa, probada y adoptada por empresas líderes en Latinoamérica.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
                {['Visión sistémica', 'Integración total', 'Rigor académico', 'Aplicación práctica'].map(tag => (
                  <span key={tag} className="text-xs font-semibold px-4 py-1.5 rounded-full" style={{ background: 'rgba(84,72,160,0.15)', color: '#9B8FE4', border: '1px solid rgba(84,72,160,0.3)', fontFamily: 'Raleway, sans-serif' }}>{tag}</span>
                ))}
              </div>
              <button
                onClick={() => navigate('/auth')}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold transition-all"
                style={{ background: 'linear-gradient(135deg, #5448A0, #7B6EC8)', color: '#fff', fontFamily: 'Raleway, sans-serif', boxShadow: '0 6px 28px rgba(84,72,160,0.45)' }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 10px 40px rgba(84,72,160,0.65)')}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 6px 28px rgba(84,72,160,0.45)')}
              >
                Empezar a modelar
                <ArrowRight size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="px-8 lg:px-16 py-8 flex flex-col sm:flex-row items-center justify-between gap-4"
        style={{ borderTop: '1px solid rgba(155,143,228,0.08)' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #5448A0, #9B8FE4)' }}>
            <Layers size={12} color="#fff" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-bold" style={{ color: '#5448A0', fontFamily: 'Raleway, sans-serif' }}>Arcana Strata</span>
        </div>
        <p className="text-xs text-center" style={{ color: '#3A2F70', fontFamily: 'Raleway, sans-serif' }}>
          © 2026 Arcana Strata · Metodología BAC · Universidad de los Andes
        </p>
        <button
          onClick={() => navigate('/auth')}
          className="text-xs font-semibold transition-colors"
          style={{ color: '#5448A0', fontFamily: 'Raleway, sans-serif' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#9B8FE4')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#5448A0')}
        >
          Ingresar →
        </button>
      </footer>
    </div>
  )
}
