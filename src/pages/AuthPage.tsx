import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { Layers, Mail, Lock, User, Eye, EyeOff, ArrowRight, ChevronRight } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const MODELS = [
  { name: 'Negocio', color: '#5448A0' },
  { name: 'Financiero', color: '#1B7A5F' },
  { name: 'Estratégico', color: '#2B6CB0' },
  { name: 'Capacidades', color: '#9B8FE4' },
  { name: 'Organizacional', color: '#C87A2F' },
  { name: 'Procesos', color: '#7E57C2' },
  { name: 'Recursos', color: '#B03040' },
  { name: 'Indicadores', color: '#1B7A5F' },
]

export function AuthPage() {
  const { user, loading, signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [showPass, setShowPass] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [signupDone, setSignupDone] = useState<string | null>(null) // email after successful signup
  const [form, setForm] = useState({ email: '', password: '', name: '' })

  if (!loading && user) return <Navigate to="/app" replace />

  const update = (field: string, value: string) => {
    setForm(f => ({ ...f, [field]: value }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    if (mode === 'signup') {
      if (!form.name.trim()) { setError('Por favor ingresa tu nombre.'); setSubmitting(false); return }
      if (form.password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres.'); setSubmitting(false); return }
      const { error: err } = await signUp(form.email, form.password, form.name)
      if (err) { setError(err); setSubmitting(false); return }
      setSignupDone(form.email)
    } else {
      const { error: err } = await signIn(form.email, form.password)
      if (err) {
        const msg = err.toLowerCase()
        if (msg.includes('email not confirmed') || msg.includes('not confirmed')) {
          setError('Debes confirmar tu correo antes de ingresar. Revisa tu bandeja de entrada.')
        } else if (msg.includes('invalid') || msg.includes('credentials')) {
          setError('Correo o contraseña incorrectos.')
        } else {
          setError(err)
        }
        setSubmitting(false)
        return
      }
      navigate('/app')
    }
    setSubmitting(false)
  }

  if (signupDone) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A0D1E' }}>
      <div style={{ maxWidth: 420, width: '100%', padding: '0 24px', textAlign: 'center' }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(155,143,228,0.1)', border: '1px solid rgba(155,143,228,0.2)' }}>
          <Mail size={28} style={{ color: '#9B8FE4' }} strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-bold mb-3" style={{ color: '#E8DFF5', fontFamily: 'Raleway, sans-serif' }}>
          Revisa tu correo
        </h2>
        <p className="text-sm leading-relaxed mb-2" style={{ color: '#7060A8', fontFamily: 'Raleway, sans-serif' }}>
          Te enviamos un enlace de confirmación a
        </p>
        <p className="text-sm font-semibold mb-6" style={{ color: '#9B8FE4', fontFamily: 'Raleway, sans-serif' }}>
          {signupDone}
        </p>
        <p className="text-xs leading-relaxed mb-8" style={{ color: '#5448A0', fontFamily: 'Raleway, sans-serif' }}>
          Abre el correo y haz clic en el enlace para activar tu cuenta. Luego regresa aquí e inicia sesión.
        </p>
        <button
          onClick={() => { setSignupDone(null); setMode('login'); setForm({ email: signupDone, password: '', name: '' }) }}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold"
          style={{ background: 'linear-gradient(135deg, #5448A0, #7B6EC8)', color: '#fff', fontFamily: 'Raleway, sans-serif', boxShadow: '0 4px 20px rgba(84,72,160,0.4)' }}
        >
          Ya confirmé, iniciar sesión
          <ArrowRight size={15} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0A0D1E' }}>
      {/* Left panel — branding */}
      <div
        className="hidden lg:flex flex-col justify-between p-12"
        style={{ width: 480, flexShrink: 0, background: 'linear-gradient(145deg, #0D1030 0%, #1A1050 50%, #0A0D1E 100%)', position: 'relative', overflow: 'hidden' }}
      >
        {/* Blobs */}
        <div className="auth-blob" style={{ width: 400, height: 400, top: -80, left: -80, background: 'radial-gradient(circle, rgba(84,72,160,0.25) 0%, transparent 70%)' }} />
        <div className="auth-blob" style={{ width: 300, height: 300, bottom: 80, right: -60, background: 'radial-gradient(circle, rgba(155,143,228,0.15) 0%, transparent 70%)', animationDelay: '2s' }} />
        <div className="auth-blob" style={{ width: 200, height: 200, bottom: 200, left: 60, background: 'radial-gradient(circle, rgba(27,122,95,0.12) 0%, transparent 70%)', animationDelay: '4s' }} />

        {/* Grid lines */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(155,143,228,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(155,143,228,0.04) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div style={{ position: 'relative' }}>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #5448A0 0%, #9B8FE4 100%)' }}>
              <Layers size={18} color="#fff" strokeWidth={2.5} />
            </div>
            <div className="flex items-center gap-1.5" style={{ fontFamily: 'Raleway, sans-serif' }}>
              <span className="text-lg font-bold" style={{ color: '#E8DFF5' }}>Arcana</span>
              <span className="text-lg font-bold" style={{ color: '#9B8FE4' }}>Strata</span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full ml-0.5" style={{ background: 'rgba(84,72,160,0.25)', color: '#9B8FE4', border: '1px solid rgba(84,72,160,0.4)' }}>BETA</span>
            </div>
          </div>

          <h1 className="text-4xl font-bold mb-5 leading-tight" style={{ fontFamily: 'Raleway, sans-serif', color: '#E8DFF5' }}>
            El futuro de la<br />
            <span style={{ background: 'linear-gradient(90deg, #9B8FE4, #5448A0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              arquitectura empresarial
            </span>
          </h1>
          <p className="text-sm leading-relaxed mb-10" style={{ color: '#7060A8', fontFamily: 'Raleway, sans-serif' }}>
            Diseña arquitecturas completas con metodología BAC. Modela tu negocio desde 8 dimensiones integradas.
          </p>

          {/* Model pills */}
          <div className="flex flex-wrap gap-2">
            {MODELS.map(m => (
              <span
                key={m.name}
                className="text-[11px] font-semibold px-3 py-1 rounded-full"
                style={{ background: m.color + '18', color: m.color, border: `1px solid ${m.color}30`, fontFamily: 'Raleway, sans-serif' }}
              >
                {m.name}
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8" style={{ position: 'relative' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-10 justify-center">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #5448A0 0%, #9B8FE4 100%)' }}>
              <Layers size={16} color="#fff" strokeWidth={2.5} />
            </div>
            <span className="text-base font-bold" style={{ color: '#E8DFF5', fontFamily: 'Raleway, sans-serif' }}>Arcana <span style={{ color: '#9B8FE4' }}>Strata</span></span>
          </div>

          <h2 className="text-2xl font-bold mb-2" style={{ color: '#E8DFF5', fontFamily: 'Raleway, sans-serif' }}>
            {mode === 'login' ? 'Bienvenido de vuelta' : 'Crear cuenta'}
          </h2>
          <p className="text-sm mb-8" style={{ color: '#7060A8', fontFamily: 'Raleway, sans-serif' }}>
            {mode === 'login' ? 'Ingresa a tu espacio de arquitectura' : 'Comienza a modelar tu empresa hoy'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-semibold mb-1.5" style={{ color: '#7060A8', fontFamily: 'Raleway, sans-serif' }}>NOMBRE COMPLETO</label>
                <div className="relative">
                  <User size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#5448A0' }} />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    placeholder="Tu nombre"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{ background: 'rgba(155,143,228,0.06)', border: '1px solid rgba(155,143,228,0.15)', color: '#E8DFF5', fontFamily: 'Raleway, sans-serif' }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(155,143,228,0.4)')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(155,143,228,0.15)')}
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold mb-1.5" style={{ color: '#7060A8', fontFamily: 'Raleway, sans-serif' }}>CORREO ELECTRÓNICO</label>
              <div className="relative">
                <Mail size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#5448A0' }} />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{ background: 'rgba(155,143,228,0.06)', border: '1px solid rgba(155,143,228,0.15)', color: '#E8DFF5', fontFamily: 'Raleway, sans-serif' }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(155,143,228,0.4)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(155,143,228,0.15)')}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold mb-1.5" style={{ color: '#7060A8', fontFamily: 'Raleway, sans-serif' }}>CONTRASEÑA</label>
              <div className="relative">
                <Lock size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#5448A0' }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  placeholder={mode === 'signup' ? 'Mínimo 6 caracteres' : '••••••••'}
                  className="w-full pl-10 pr-12 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{ background: 'rgba(155,143,228,0.06)', border: '1px solid rgba(155,143,228,0.15)', color: '#E8DFF5', fontFamily: 'Raleway, sans-serif' }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(155,143,228,0.4)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(155,143,228,0.15)')}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                  style={{ color: '#5448A0' }}
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg px-4 py-3 text-xs" style={{ background: 'rgba(176,48,64,0.1)', border: '1px solid rgba(176,48,64,0.25)', color: '#E07080', fontFamily: 'Raleway, sans-serif' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all mt-2 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #5448A0 0%, #7B6EC8 100%)', color: '#fff', fontFamily: 'Raleway, sans-serif', boxShadow: '0 4px 20px rgba(84,72,160,0.4)' }}
              onMouseEnter={(e) => !submitting && (e.currentTarget.style.boxShadow = '0 6px 28px rgba(84,72,160,0.6)')}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(84,72,160,0.4)')}
            >
              {submitting ? (
                <span className="auth-spin w-4 h-4 rounded-full" style={{ border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
              ) : (
                <>
                  {mode === 'login' ? 'Ingresar' : 'Crear cuenta'}
                  <ArrowRight size={15} strokeWidth={2.5} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm" style={{ color: '#5448A0', fontFamily: 'Raleway, sans-serif' }}>
              {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
              {' '}
              <button
                onClick={() => { setMode(m => m === 'login' ? 'signup' : 'login'); setError(null); setForm({ email: '', password: '', name: '' }) }}
                className="font-semibold transition-colors"
                style={{ color: '#9B8FE4' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#B8ACEF')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#9B8FE4')}
              >
                {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
              </button>
            </p>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1 text-xs mx-auto transition-colors"
              style={{ color: '#3A2F70' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#7060A8')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#3A2F70')}
            >
              <ChevronRight size={10} style={{ transform: 'rotate(180deg)' }} />
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
