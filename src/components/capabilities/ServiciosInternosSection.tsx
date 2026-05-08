import { useState } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import { useCapabilityStore } from '../../store/capabilitiesStore'
import type { ServicioInternoCapacidadMap } from '../../types/capabilities'
import { allCapacidades } from '../../types/capabilities'
import { CAPABILITY_COLORS as COLORS } from '../../constants/colors'

const C = COLORS.bac64
const C_LIGHT = C + '1E'

function emptyServicioInterno(): ServicioInternoCapacidadMap {
  return { id: crypto.randomUUID(), nombre: '', descripcion: '', idsCapacidades: [] }
}

function ServicioInternoRow({ item, index, caps, onUpdate, onRemove }: {
  item: ServicioInternoCapacidadMap
  index: number
  caps: ReturnType<typeof allCapacidades>
  onUpdate: (p: Partial<ServicioInternoCapacidadMap>) => void
  onRemove: () => void
}) {
  const [showPicker, setShowPicker] = useState(false)
  const selected = item.idsCapacidades
  const unselected = caps.filter(c => !selected.includes(c.id))

  const toggle = (id: string) => {
    onUpdate({ idsCapacidades: selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id] })
  }

  const tipoColor: Record<string, string> = {
    misional: COLORS.misional, estrategica: COLORS.estrategica, funcionamiento: COLORS.funcionamiento,
  }

  return (
    <div style={{ borderBottom: '1px solid var(--border-lo)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '54px 1fr 1fr 1.5fr 28px', gap: 10, padding: '9px 16px', alignItems: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: C, fontFamily: 'monospace' }}>
          SI-{String(index + 1).padStart(2, '0')}
        </span>
        <input value={item.nombre} onChange={e => onUpdate({ nombre: e.target.value })} placeholder="Nombre servicio interno…"
          style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-lo)', color: 'var(--text-hi)', fontFamily: 'Raleway, sans-serif', fontSize: 11, fontWeight: 600, outline: 'none', padding: '2px 0' }}
          onFocus={e => (e.currentTarget.style.borderBottomColor = C)}
          onBlur={e => (e.currentTarget.style.borderBottomColor = 'var(--border-lo)')} />
        <input value={item.descripcion} onChange={e => onUpdate({ descripcion: e.target.value })} placeholder="Descripción…"
          style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-lo)', color: 'var(--text-md)', fontFamily: 'Raleway, sans-serif', fontSize: 11, outline: 'none', padding: '2px 0' }}
          onFocus={e => (e.currentTarget.style.borderBottomColor = C)}
          onBlur={e => (e.currentTarget.style.borderBottomColor = 'var(--border-lo)')} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
          {selected.map(cid => {
            const cap = caps.find(c => c.id === cid)
            const tc = cap ? tipoColor[cap.tipo] : C
            return (
              <div key={cid} style={{ display: 'flex', alignItems: 'center', gap: 3, background: tc + '18', border: `1px solid ${tc}35`, borderRadius: 20, padding: '2px 7px', fontSize: 10, color: tc, fontWeight: 600 }}>
                {cap?.nombre ?? '(eliminada)'}
                <button onClick={() => toggle(cid)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: tc, padding: 0, display: 'flex' }}>
                  <X size={9} />
                </button>
              </div>
            )
          })}
          {unselected.length > 0 && (
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowPicker(v => !v)}
                style={{ background: 'none', border: `1px dashed ${C}50`, borderRadius: 20, padding: '2px 8px', color: C, fontFamily: 'Raleway, sans-serif', fontSize: 10, cursor: 'pointer' }}>
                + Capacidad
              </button>
              {showPicker && (
                <div style={{ position: 'absolute', top: 24, left: 0, zIndex: 40, background: 'var(--bg-card)', border: '1px solid var(--border-md)', borderRadius: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', padding: 6, minWidth: 200, maxHeight: 220, overflowY: 'auto' }}>
                  {unselected.map(cap => {
                    const tc = tipoColor[cap.tipo]
                    return (
                      <button key={cap.id} onClick={() => { toggle(cap.id); setShowPicker(false) }}
                        style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '5px 8px', borderRadius: 6, cursor: 'pointer', color: 'var(--text-hi)', fontFamily: 'Raleway, sans-serif', fontSize: 11 }}
                        onMouseEnter={e => (e.currentTarget.style.background = tc + '14')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                        <span style={{ color: tc, fontWeight: 700, marginRight: 6 }}>●</span>
                        {cap.nombre}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}
          {caps.length === 0 && (
            <span style={{ fontSize: 10, color: 'var(--text-xdim)', fontStyle: 'italic' }}>Define capacidades en BAC-31.</span>
          )}
        </div>
        <button onClick={onRemove} style={{ color: '#F87171', background: 'none', border: 'none', cursor: 'pointer' }}>
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  )
}

export function ServiciosInternosSection() {
  const { state, dispatch } = useCapabilityStore()
  const items = state.serviciosInternos
  const caps = allCapacidades(state.paquetes)

  const set = (list: ServicioInternoCapacidadMap[]) => dispatch({ type: 'SET_SERVICIOS_INTERNOS', items: list })
  const add = () => set([...items, emptyServicioInterno()])
  const remove = (id: string) => set(items.filter(x => x.id !== id))
  const update = (id: string, patch: Partial<ServicioInternoCapacidadMap>) =>
    set(items.map(x => x.id === id ? { ...x, ...patch } : x))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-lo)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '54px 1fr 1fr 1.5fr 28px', gap: 10, padding: '10px 16px', background: C_LIGHT, borderBottom: '1px solid var(--border-lo)' }}>
          {['ID', 'Servicio Interno', 'Descripción', 'Capacidades requeridas', ''].map((h, i) => (
            <span key={i} style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.09em', color: i === 0 ? C : 'var(--text-lo)', textTransform: 'uppercase' }}>{h}</span>
          ))}
        </div>

        {items.map((item, i) => (
          <ServicioInternoRow key={item.id} item={item} index={i} caps={caps}
            onUpdate={p => update(item.id, p)}
            onRemove={() => remove(item.id)} />
        ))}

        <div style={{ padding: '12px 16px', background: C + '04', borderTop: items.length > 0 ? '1px solid var(--border-lo)' : 'none', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={add}
            style={{ background: C, color: '#fff', border: 'none', borderRadius: 9, padding: '8px 16px', cursor: 'pointer', fontFamily: 'Raleway, sans-serif', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
            <Plus size={13} /> Servicio Interno
          </button>
        </div>
      </div>

      {items.length === 0 && (
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-lo)', padding: '8px 0' }}>
          Relaciona los servicios internos de la organización con las capacidades que los soportan.
        </p>
      )}
    </div>
  )
}
