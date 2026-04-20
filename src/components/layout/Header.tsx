import { useState } from 'react'
import { Layers, ChevronDown, Save, Share2, Bell, LogOut, User, Check, X, ChevronRight, Sun, Moon } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../contexts/ThemeContext'

interface HeaderProps {
  projectName?: string
  onSignOut?: () => void
  onSave?: () => void
  saved?: boolean
  onBackToDashboard?: () => void
}

export function Header({ projectName = 'Modelo de Negocio', onSignOut, onSave, saved, onBackToDashboard }: HeaderProps) {
  const { user, updateProfile } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const userEmail = user?.email
  const userName = user?.user_metadata?.full_name as string | undefined
  const initials = userName ? userName[0].toUpperCase() : userEmail ? userEmail[0].toUpperCase() : 'A'

  const [editingProfile, setEditingProfile] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)

  const openEdit = () => { setNameInput(userName ?? ''); setProfileError(null); setEditingProfile(true) }

  const handleSaveProfile = async () => {
    if (!nameInput.trim()) { setProfileError('El nombre no puede estar vacío.'); return }
    setSaving(true)
    const { error } = await updateProfile(nameInput.trim())
    setSaving(false)
    if (error) { setProfileError(error); return }
    setEditingProfile(false)
  }

  return (
    <>
      <header
        className="flex items-center justify-between px-5 flex-shrink-0"
        style={{ height: 48, background: 'var(--bg-base)', borderBottom: '1px solid var(--border-lo)' }}
      >
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #5448A0 0%, #9B8FE4 100%)' }}>
            <Layers size={14} color="#fff" strokeWidth={2.5} />
          </div>
          <div className="flex items-center gap-1.5" style={{ fontFamily: 'Raleway, sans-serif' }}>
            <span className="text-[13px] font-bold tracking-tight" style={{ color: 'var(--text-hi)' }}>Arcana</span>
            <span className="text-[13px] font-bold tracking-tight" style={{ color: 'var(--c-accent)' }}>Strata</span>
            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full ml-0.5"
              style={{ background: 'rgba(84,72,160,0.2)', color: 'var(--c-accent)', border: '1px solid rgba(84,72,160,0.3)', letterSpacing: '0.08em' }}>
              BETA
            </span>
          </div>

          <div className="flex items-center gap-1.5 ml-3">
            {onBackToDashboard ? (
              <button onClick={onBackToDashboard} className="text-[11px] transition-colors"
                style={{ color: 'var(--text-dim)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--c-accent)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}>
                Dashboard
              </button>
            ) : (
              <span className="text-[11px]" style={{ color: 'var(--text-dim)' }}>Módulo de Negocio</span>
            )}
            <ChevronRight size={11} style={{ color: 'var(--text-xdim)' }} />
            <button className="flex items-center gap-1 text-[11px] font-medium transition-colors"
              style={{ color: 'var(--text-md)', fontFamily: 'Raleway, sans-serif' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--c-accent)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-md)')}>
              {projectName}
              <ChevronDown size={11} strokeWidth={2} style={{ color: 'var(--text-dim)' }} />
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: 'var(--text-dim)' }}
            title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--c-accent)'; (e.currentTarget as HTMLElement).style.background = 'var(--bg-card-hover)' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-dim)'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}
          >
            {theme === 'dark' ? <Sun size={14} strokeWidth={1.8} /> : <Moon size={14} strokeWidth={1.8} />}
          </button>

          <button className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: 'var(--text-dim)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--c-accent)'; (e.currentTarget as HTMLElement).style.background = 'var(--bg-card-hover)' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-dim)'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
            <Bell size={14} strokeWidth={1.8} />
          </button>

          <button className="flex items-center gap-1.5 px-3 h-7 rounded-lg text-[11px] font-medium transition-all"
            style={{ color: 'var(--c-accent)', border: '1px solid var(--border-md)', fontFamily: 'Raleway, sans-serif' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
            <Share2 size={12} strokeWidth={1.8} />
            Compartir
          </button>

          <button onClick={onSave}
            className="flex items-center gap-1.5 px-3 h-7 rounded-lg text-[11px] font-semibold"
            style={{
              background: saved ? '#1B7A5F' : '#5448A0',
              color: '#fff',
              boxShadow: saved ? '0 1px 8px rgba(27,122,95,0.4)' : '0 1px 8px rgba(84,72,160,0.35)',
              fontFamily: 'Raleway, sans-serif',
              transition: 'background 0.3s, box-shadow 0.3s',
            }}
            onMouseEnter={(e) => { if (!saved) e.currentTarget.style.background = '#6556B8' }}
            onMouseLeave={(e) => { if (!saved) e.currentTarget.style.background = '#5448A0' }}>
            {saved ? <Check size={12} strokeWidth={2.5} /> : <Save size={12} strokeWidth={2} />}
            {saved ? 'Guardado' : 'Guardar'}
          </button>

          {/* Avatar */}
          <div className="relative group ml-1">
            <button className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #5448A0, #9B8FE4)', color: '#fff', fontFamily: 'Raleway, sans-serif' }}
              title={userEmail}>
              {initials}
            </button>
            <div className="absolute right-0 top-9 rounded-xl py-1 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-md)', boxShadow: 'var(--shadow-panel)', minWidth: 180, zIndex: 50 }}>
              <div className="px-3 py-2.5" style={{ borderBottom: '1px solid var(--border-lo)' }}>
                {userName && <p className="text-[12px] font-semibold truncate mb-0.5" style={{ color: 'var(--text-md)', fontFamily: 'Raleway, sans-serif' }}>{userName}</p>}
                {userEmail && <p className="text-[10px] truncate" style={{ color: 'var(--text-dim)', fontFamily: 'Raleway, sans-serif' }}>{userEmail}</p>}
              </div>
              <button onClick={openEdit} className="w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors"
                style={{ color: 'var(--c-accent)', fontFamily: 'Raleway, sans-serif' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                <User size={12} strokeWidth={2} />Editar perfil
              </button>
              {onSignOut && (
                <button onClick={onSignOut} className="w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors"
                  style={{ color: '#B03040', fontFamily: 'Raleway, sans-serif', borderTop: '1px solid var(--border-lo)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(176,48,64,0.08)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                  <LogOut size={12} strokeWidth={2} />Cerrar sesión
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Profile edit modal */}
      {editingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setEditingProfile(false) }}>
          <div className="rounded-2xl p-6 w-full"
            style={{ maxWidth: 380, background: 'var(--bg-surface)', border: '1px solid var(--border-md)', boxShadow: 'var(--shadow-panel)' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold" style={{ color: 'var(--text-hi)', fontFamily: 'Raleway, sans-serif' }}>Editar perfil</h3>
              <button onClick={() => setEditingProfile(false)} className="w-7 h-7 flex items-center justify-center rounded-lg"
                style={{ color: 'var(--text-dim)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                <X size={14} strokeWidth={2} />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-[11px] font-semibold mb-1.5" style={{ color: 'var(--text-lo)', fontFamily: 'Raleway, sans-serif' }}>NOMBRE</label>
              <input type="text" value={nameInput} onChange={(e) => { setNameInput(e.target.value); setProfileError(null) }}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveProfile()}
                placeholder="Tu nombre completo" className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-md)', color: 'var(--text-hi)', fontFamily: 'Raleway, sans-serif' }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--border-hi)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-md)')}
                autoFocus />
            </div>
            <div className="mb-4">
              <label className="block text-[11px] font-semibold mb-1.5" style={{ color: 'var(--text-lo)', fontFamily: 'Raleway, sans-serif' }}>CORREO</label>
              <input type="text" value={userEmail ?? ''} disabled className="w-full px-4 py-3 rounded-xl text-sm"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-lo)', color: 'var(--text-dim)', fontFamily: 'Raleway, sans-serif', cursor: 'not-allowed' }} />
            </div>
            {profileError && (
              <div className="rounded-lg px-3 py-2 mb-4 text-xs" style={{ background: 'rgba(176,48,64,0.1)', border: '1px solid rgba(176,48,64,0.2)', color: '#E07080', fontFamily: 'Raleway, sans-serif' }}>
                {profileError}
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={handleSaveProfile} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #5448A0, #7B6EC8)', color: '#fff', fontFamily: 'Raleway, sans-serif' }}>
                {saving
                  ? <span className="auth-spin w-4 h-4 rounded-full" style={{ border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
                  : <><Check size={14} strokeWidth={2.5} />Guardar</>}
              </button>
              <button onClick={() => setEditingProfile(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: 'var(--bg-card-hover)', color: 'var(--c-accent)', fontFamily: 'Raleway, sans-serif' }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
