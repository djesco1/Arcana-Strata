import { useState } from 'react'
import { Plus, Trash2, ChevronDown, ChevronRight, X } from 'lucide-react'
import { useStrategicStore } from '../../store/strategicStore'
import type { Comite } from '../../types/strategic'
import { STRATEGIC_COLORS as COLORS } from '../../constants/colors'

const C = COLORS.bac29
const C_LIGHT = C + '1E'

function emptyComite(): Comite {
  return { id: crypto.randomUUID(), nombre: '', idRolesParticipantes: [], funciones: [] }
}

function ComiteRow({ comite, index, onUpdate, onRemove, roles }: {
  comite: Comite
  index: number
  onUpdate: (p: Partial<Comite>) => void
  onRemove: () => void
  roles: { id: string; rol: string }[]
}) {
  const [expanded, setExpanded] = useState(false)

  const toggleRol = (id: string) => {
    const current = comite.idRolesParticipantes
    onUpdate({ idRolesParticipantes: current.includes(id) ? current.filter(r => r !== id) : [...current, id] })
  }

  const addFuncion = () =>
    onUpdate({ funciones: [...comite.funciones, { id: crypto.randomUUID(), descripcion: '' }] })

  const removeFuncion = (id: string) =>
    onUpdate({ funciones: comite.funciones.filter(f => f.id !== id) })

  const updateFuncion = (id: string, descripcion: string) =>
    onUpdate({ funciones: comite.funciones.map(f => f.id === id ? { ...f, descripcion } : f) })

  const unselectedRoles = roles.filter(r => !comite.idRolesParticipantes.includes(r.id))

  return (
    <div style={{ borderBottom: '1px solid var(--border-lo)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 28px', gap: 10, padding: '9px 16px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button onClick={() => setExpanded(e => !e)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C, padding: 0 }}>
            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
          <span style={{ fontSize: 11, fontWeight: 800, color: C, fontFamily: 'monospace' }}>
            C-{String(index + 1).padStart(2, '0')}
          </span>
        </div>
        <input value={comite.nombre} onChange={e => onUpdate({ nombre: e.target.value })} placeholder="Nombre del comité…"
          style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-lo)', color: 'var(--text-hi)', fontFamily: 'Raleway, sans-serif', fontSize: 12, fontWeight: 600, outline: 'none', padding: '3px 0' }}
          onFocus={e => (e.currentTarget.style.borderBottomColor = C)}
          onBlur={e => (e.currentTarget.style.borderBottomColor = 'var(--border-lo)')} />
        <button onClick={onRemove} style={{ color: '#F87171', background: 'none', border: 'none', cursor: 'pointer' }}>
          <Trash2 size={12} />
        </button>
      </div>

      {expanded && (
        <div style={{ paddingLeft: 36, paddingRight: 16, paddingBottom: 12, background: C + '05' }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: C, textTransform: 'uppercase', marginBottom: 8 }}>
            Roles participantes (ref. BAC-28)
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {comite.idRolesParticipantes.map(rid => {
              const r = roles.find(x => x.id === rid)
              return (
                <div key={rid} style={{ display: 'flex', alignItems: 'center', gap: 4, background: C + '20', border: `1px solid ${C}40`, borderRadius: 20, padding: '3px 8px', fontSize: 11, color: C, fontWeight: 600 }}>
                  {r?.rol ?? '(eliminado)'}
                  <button onClick={() => toggleRol(rid)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C, padding: 0, display: 'flex' }}>
                    <X size={10} />
                  </button>
                </div>
              )
            })}
            {unselectedRoles.length > 0 && (
              <select value="" onChange={e => { if (e.target.value) toggleRol(e.target.value) }}
                style={{ background: 'var(--bg-surface)', border: `1px dashed ${C}50`, borderRadius: 20, padding: '3px 8px', color: 'var(--text-lo)', fontFamily: 'Raleway, sans-serif', fontSize: 11, outline: 'none', cursor: 'pointer' }}>
                <option value="">+ Rol…</option>
                {unselectedRoles.map(r => <option key={r.id} value={r.id}>{r.rol}</option>)}
              </select>
            )}
            {roles.length === 0 && (
              <span style={{ fontSize: 10, color: 'var(--text-xdim)', fontStyle: 'italic' }}>Define roles en BAC-28.</span>
            )}
          </div>

          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: C, textTransform: 'uppercase', marginBottom: 8 }}>Funciones</p>
          {comite.funciones.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 24px', gap: 8, marginBottom: 6 }}>
              {['ID', 'Descripción', ''].map((h, i) => (
                <span key={i} style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-lo)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</span>
              ))}
            </div>
          )}
          {comite.funciones.map((fn, fi) => (
            <div key={fn.id} style={{ display: 'grid', gridTemplateColumns: '50px 1fr 24px', gap: 8, marginBottom: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 10, fontFamily: 'monospace', color: C }}>F-{String(fi + 1).padStart(2, '0')}</span>
              <input value={fn.descripcion} onChange={e => updateFuncion(fn.id, e.target.value)} placeholder="Descripción de la función…"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-md)', borderRadius: 6, padding: '3px 8px', color: 'var(--text-md)', fontFamily: 'Raleway, sans-serif', fontSize: 11, outline: 'none' }}
                onFocus={e => (e.currentTarget.style.borderColor = C)}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-md)')} />
              <button onClick={() => removeFuncion(fn.id)} style={{ color: '#F87171', background: 'none', border: 'none', cursor: 'pointer' }}>
                <Trash2 size={11} />
              </button>
            </div>
          ))}
          <button onClick={addFuncion}
            style={{ background: 'none', border: `1px dashed ${C}50`, borderRadius: 6, padding: '4px 10px', color: C, fontFamily: 'Raleway, sans-serif', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Plus size={11} /> Función
          </button>
        </div>
      )}
    </div>
  )
}

export function ComitesSection() {
  const { state, dispatch } = useStrategicStore()
  const comites = state.medicion.comites
  const roles = state.medicion.roles

  const setComites = (items: Comite[]) => dispatch({ type: 'SET_COMITES', items })
  const add = () => setComites([...comites, emptyComite()])
  const remove = (id: string) => setComites(comites.filter(c => c.id !== id))
  const update = (id: string, patch: Partial<Comite>) =>
    setComites(comites.map(c => c.id === id ? { ...c, ...patch } : c))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-lo)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 28px', gap: 10, padding: '10px 16px', background: C_LIGHT, borderBottom: '1px solid var(--border-lo)' }}>
          {['ID', 'Nombre comité', ''].map((h, i) => (
            <span key={i} style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.09em', color: i === 0 ? C : 'var(--text-lo)', textTransform: 'uppercase' }}>{h}</span>
          ))}
        </div>

        {comites.map((c, i) => (
          <ComiteRow key={c.id} comite={c} index={i} roles={roles}
            onUpdate={p => update(c.id, p)}
            onRemove={() => remove(c.id)} />
        ))}

        <div style={{ padding: '12px 16px', background: C + '04', borderTop: comites.length > 0 ? '1px solid var(--border-lo)' : 'none', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={add}
            style={{ background: C, color: '#fff', border: 'none', borderRadius: 9, padding: '8px 16px', cursor: 'pointer', fontFamily: 'Raleway, sans-serif', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
            <Plus size={13} /> Comité
          </button>
        </div>
      </div>

      {comites.length === 0 && (
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-lo)', padding: '8px 0' }}>
          Define los comités estratégicos y operativos para el gobierno del plan.
        </p>
      )}
    </div>
  )
}
