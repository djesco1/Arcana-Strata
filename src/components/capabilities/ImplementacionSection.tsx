import { Plus, Trash2 } from 'lucide-react'
import { useCapabilityStore } from '../../store/capabilitiesStore'
import type { ImplementacionCapacidad } from '../../types/capabilities'
import { allCapacidades } from '../../types/capabilities'
import { CAPABILITY_COLORS as COLORS } from '../../constants/colors'

const C = COLORS.bac32
const C_LIGHT = C + '1E'

function emptyImpl(): ImplementacionCapacidad {
  return { id: crypto.randomUUID(), idCapacidad: '', responsables: '', recursos: '', notas: '' }
}

function inp(value: string, onChange: (v: string) => void, placeholder: string, accent: string) {
  return (
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-lo)', color: 'var(--text-hi)', fontFamily: 'Raleway, sans-serif', fontSize: 11, outline: 'none', padding: '2px 0', width: '100%' }}
      onFocus={e => (e.currentTarget.style.borderBottomColor = accent)}
      onBlur={e => (e.currentTarget.style.borderBottomColor = 'var(--border-lo)')} />
  )
}

export function ImplementacionSection() {
  const { state, dispatch } = useCapabilityStore()
  const impls = state.implementaciones
  const caps = allCapacidades(state.paquetes)

  const set = (items: ImplementacionCapacidad[]) => dispatch({ type: 'SET_IMPLEMENTACIONES', items })
  const add = () => set([...impls, emptyImpl()])
  const remove = (id: string) => set(impls.filter(x => x.id !== id))
  const update = (id: string, patch: Partial<ImplementacionCapacidad>) =>
    set(impls.map(x => x.id === id ? { ...x, ...patch } : x))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {caps.length === 0 && (
        <div style={{ padding: '12px 16px', borderRadius: 10, background: C + '0D', border: `1px solid ${C}30`, fontSize: 12, color: C }}>
          Define primero las capacidades en BAC-31 para poder asignar implementaciones.
        </div>
      )}

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-lo)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '54px 1.5fr 1fr 1fr 1.2fr 28px', gap: 10, padding: '10px 16px', background: C_LIGHT, borderBottom: '1px solid var(--border-lo)' }}>
          {['ID', 'Capacidad', 'Responsables', 'Recursos', 'Notas', ''].map((h, i) => (
            <span key={i} style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.09em', color: i === 0 ? C : 'var(--text-lo)', textTransform: 'uppercase' }}>{h}</span>
          ))}
        </div>

        {impls.map((impl, i) => (
          <div key={impl.id} style={{ display: 'grid', gridTemplateColumns: '54px 1.5fr 1fr 1fr 1.2fr 28px', gap: 10, padding: '9px 16px', alignItems: 'center', borderBottom: '1px solid var(--border-lo)' }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: C, fontFamily: 'monospace' }}>
              I-{String(i + 1).padStart(2, '0')}
            </span>
            <select value={impl.idCapacidad} onChange={e => update(impl.id, { idCapacidad: e.target.value })}
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-md)', borderRadius: 7, padding: '3px 6px', color: impl.idCapacidad ? 'var(--text-hi)' : 'var(--text-xdim)', fontFamily: 'Raleway, sans-serif', fontSize: 11, outline: 'none', cursor: 'pointer' }}>
              <option value="">— Seleccionar capacidad —</option>
              {caps.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
            {inp(impl.responsables, v => update(impl.id, { responsables: v }), 'Responsables…', C)}
            {inp(impl.recursos, v => update(impl.id, { recursos: v }), 'Recursos necesarios…', C)}
            {inp(impl.notas, v => update(impl.id, { notas: v }), 'Notas…', C)}
            <button onClick={() => remove(impl.id)} style={{ color: '#F87171', background: 'none', border: 'none', cursor: 'pointer' }}>
              <Trash2 size={12} />
            </button>
          </div>
        ))}

        <div style={{ padding: '12px 16px', background: C + '04', borderTop: impls.length > 0 ? '1px solid var(--border-lo)' : 'none', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={add}
            style={{ background: C, color: '#fff', border: 'none', borderRadius: 9, padding: '8px 16px', cursor: 'pointer', fontFamily: 'Raleway, sans-serif', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
            <Plus size={13} /> Implementación
          </button>
        </div>
      </div>

      {impls.length === 0 && (
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-lo)', padding: '8px 0' }}>
          Asocia responsables y recursos a cada capacidad del catálogo.
        </p>
      )}

      <div style={{ padding: '10px 14px', borderRadius: 10, background: '#92400E12', border: '1px solid #92400E30', fontSize: 11, color: '#92400E' }}>
        <strong>Nota:</strong> La columna "Proceso de implementación" (ref. Modelo de Procesos) estará disponible cuando se desarrolle el Modelo de Procesos (BAC-48+).
      </div>
    </div>
  )
}
