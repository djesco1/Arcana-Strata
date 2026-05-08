import { useState, useEffect } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import { useCapabilityStore } from '../../store/capabilitiesStore'
import type { ServicioCapacidadMap } from '../../types/capabilities'
import { allCapacidades } from '../../types/capabilities'
import { CAPABILITY_COLORS as COLORS } from '../../constants/colors'
import { supabase } from '../../lib/supabase'

const C = COLORS.bac34
const C_LIGHT = C + '1E'

interface ServicioNegocio { id: string; nombre: string }

function emptyServicio(): ServicioCapacidadMap {
  return { id: crypto.randomUUID(), idServicioNegocio: '', nombreServicio: '', idsCapacidades: [] }
}

function ServicioRow({ item, index, caps, serviciosNegocio, onUpdate, onRemove }: {
  item: ServicioCapacidadMap
  index: number
  caps: ReturnType<typeof allCapacidades>
  serviciosNegocio: ServicioNegocio[]
  onUpdate: (p: Partial<ServicioCapacidadMap>) => void
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

  const handleSelectServicio = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const svc = serviciosNegocio.find(s => s.id === e.target.value)
    if (svc) onUpdate({ idServicioNegocio: svc.id, nombreServicio: svc.nombre })
    else onUpdate({ idServicioNegocio: '', nombreServicio: '' })
  }

  return (
    <div style={{ borderBottom: '1px solid var(--border-lo)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '54px 1.2fr 1.5fr 28px', gap: 10, padding: '9px 16px', alignItems: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: C, fontFamily: 'monospace' }}>
          SN-{String(index + 1).padStart(2, '0')}
        </span>

        <select value={item.idServicioNegocio} onChange={handleSelectServicio}
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-md)', borderRadius: 7, padding: '3px 6px', color: item.idServicioNegocio ? 'var(--text-hi)' : 'var(--text-xdim)', fontFamily: 'Raleway, sans-serif', fontSize: 11, fontWeight: item.idServicioNegocio ? 600 : 400, outline: 'none', cursor: 'pointer' }}
          onFocus={e => (e.currentTarget.style.borderColor = C)}
          onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-md)')}>
          <option value="">— Seleccionar servicio —</option>
          {serviciosNegocio.map(s => (
            <option key={s.id} value={s.id}>{s.nombre}</option>
          ))}
        </select>

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

export function ServiciosNegocioSection() {
  const { state, dispatch, workspaceId } = useCapabilityStore()
  const items = state.serviciosNegocio
  const caps = allCapacidades(state.paquetes)
  const [serviciosNegocio, setServiciosNegocio] = useState<ServicioNegocio[]>([])

  useEffect(() => {
    if (!workspaceId) return
    supabase
      .from('servicios_negocio')
      .select('id, nombre')
      .eq('workspace_id', workspaceId)
      .then(({ data }) => setServiciosNegocio(data ?? []))
  }, [workspaceId])

  const set = (list: ServicioCapacidadMap[]) => dispatch({ type: 'SET_SERVICIOS_NEGOCIO', items: list })
  const add = () => set([...items, emptyServicio()])
  const remove = (id: string) => set(items.filter(x => x.id !== id))
  const update = (id: string, patch: Partial<ServicioCapacidadMap>) =>
    set(items.map(x => x.id === id ? { ...x, ...patch } : x))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {serviciosNegocio.length === 0 && workspaceId && (
        <div style={{ padding: '10px 14px', borderRadius: 10, background: C + '0D', border: `1px solid ${C}30`, fontSize: 12, color: C }}>
          No hay servicios de negocio definidos. Agrégalos en el Modelo de Negocio primero.
        </div>
      )}

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-lo)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '54px 1.2fr 1.5fr 28px', gap: 10, padding: '10px 16px', background: C_LIGHT, borderBottom: '1px solid var(--border-lo)' }}>
          {['ID', 'Servicio de Negocio', 'Capacidades requeridas', ''].map((h, i) => (
            <span key={i} style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.09em', color: i === 0 ? C : 'var(--text-lo)', textTransform: 'uppercase' }}>{h}</span>
          ))}
        </div>

        {items.map((item, i) => (
          <ServicioRow key={item.id} item={item} index={i} caps={caps} serviciosNegocio={serviciosNegocio}
            onUpdate={p => update(item.id, p)}
            onRemove={() => remove(item.id)} />
        ))}

        <div style={{ padding: '12px 16px', background: C + '04', borderTop: items.length > 0 ? '1px solid var(--border-lo)' : 'none', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={add}
            style={{ background: C, color: '#fff', border: 'none', borderRadius: 9, padding: '8px 16px', cursor: 'pointer', fontFamily: 'Raleway, sans-serif', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
            <Plus size={13} /> Servicio
          </button>
        </div>
      </div>

      {items.length === 0 && (
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-lo)', padding: '8px 0' }}>
          Relaciona los servicios de negocio con las capacidades organizacionales que los soportan.
        </p>
      )}
    </div>
  )
}
