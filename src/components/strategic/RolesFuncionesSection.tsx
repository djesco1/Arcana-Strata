import { useState } from 'react'
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import { useStrategicStore } from '../../store/strategicStore'
import type { RolFuncion } from '../../types/strategic'
import { STRATEGIC_COLORS as COLORS } from '../../constants/colors'

const C = COLORS.bac28
const C_LIGHT = C + '1E'

function emptyRol(): RolFuncion {
  return { id: crypto.randomUUID(), rol: '', funciones: [] }
}

function RolRow({ rol, index, onUpdate, onRemove }: {
  rol: RolFuncion
  index: number
  onUpdate: (p: Partial<RolFuncion>) => void
  onRemove: () => void
}) {
  const [expanded, setExpanded] = useState(false)

  const addFuncion = () =>
    onUpdate({ funciones: [...rol.funciones, { id: crypto.randomUUID(), descripcion: '' }] })

  const removeFuncion = (id: string) =>
    onUpdate({ funciones: rol.funciones.filter(f => f.id !== id) })

  const updateFuncion = (id: string, descripcion: string) =>
    onUpdate({ funciones: rol.funciones.map(f => f.id === id ? { ...f, descripcion } : f) })

  return (
    <div style={{ borderBottom: '1px solid var(--border-lo)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 28px', gap: 10, padding: '9px 16px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button onClick={() => setExpanded(e => !e)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C, padding: 0 }}>
            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
          <span style={{ fontSize: 11, fontWeight: 800, color: C, fontFamily: 'monospace' }}>
            R-{String(index + 1).padStart(2, '0')}
          </span>
        </div>
        <input value={rol.rol} onChange={e => onUpdate({ rol: e.target.value })} placeholder="Nombre del rol…"
          style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-lo)', color: 'var(--text-hi)', fontFamily: 'Raleway, sans-serif', fontSize: 12, fontWeight: 600, outline: 'none', padding: '3px 0' }}
          onFocus={e => (e.currentTarget.style.borderBottomColor = C)}
          onBlur={e => (e.currentTarget.style.borderBottomColor = 'var(--border-lo)')} />
        <button onClick={onRemove} style={{ color: '#F87171', background: 'none', border: 'none', cursor: 'pointer' }}>
          <Trash2 size={12} />
        </button>
      </div>

      {expanded && (
        <div style={{ paddingLeft: 36, paddingRight: 16, paddingBottom: 12, background: C + '05' }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: C, textTransform: 'uppercase', marginBottom: 8 }}>Funciones</p>
          {rol.funciones.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 24px', gap: 8, marginBottom: 6 }}>
              {['ID', 'Descripción', ''].map((h, i) => (
                <span key={i} style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-lo)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</span>
              ))}
            </div>
          )}
          {rol.funciones.map((fn, fi) => (
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

export function RolesFuncionesSection() {
  const { state, dispatch } = useStrategicStore()
  const roles = state.medicion.roles

  const setRoles = (items: RolFuncion[]) => dispatch({ type: 'SET_ROLES', items })
  const add = () => setRoles([...roles, emptyRol()])
  const remove = (id: string) => setRoles(roles.filter(r => r.id !== id))
  const update = (id: string, patch: Partial<RolFuncion>) =>
    setRoles(roles.map(r => r.id === id ? { ...r, ...patch } : r))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-lo)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 28px', gap: 10, padding: '10px 16px', background: C_LIGHT, borderBottom: '1px solid var(--border-lo)' }}>
          {['ID', 'Rol', ''].map((h, i) => (
            <span key={i} style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.09em', color: i === 0 ? C : 'var(--text-lo)', textTransform: 'uppercase' }}>{h}</span>
          ))}
        </div>

        {roles.map((r, i) => (
          <RolRow key={r.id} rol={r} index={i}
            onUpdate={p => update(r.id, p)}
            onRemove={() => remove(r.id)} />
        ))}

        <div style={{ padding: '12px 16px', background: C + '04', borderTop: roles.length > 0 ? '1px solid var(--border-lo)' : 'none', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={add}
            style={{ background: C, color: '#fff', border: 'none', borderRadius: 9, padding: '8px 16px', cursor: 'pointer', fontFamily: 'Raleway, sans-serif', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
            <Plus size={13} /> Rol
          </button>
        </div>
      </div>

      {roles.length === 0 && (
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-lo)', padding: '8px 0' }}>
          Define los roles responsables del seguimiento estratégico.
        </p>
      )}
    </div>
  )
}
