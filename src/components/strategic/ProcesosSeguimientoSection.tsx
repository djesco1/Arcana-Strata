import { useState } from 'react'
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import { useStrategicStore } from '../../store/strategicStore'
import type { ProcesoSeguimiento } from '../../types/strategic'
import { STRATEGIC_COLORS as COLORS } from '../../constants/colors'

const C = COLORS.bac30
const C_LIGHT = C + '1E'

function emptyProceso(): ProcesoSeguimiento {
  return { id: crypto.randomUUID(), nombre: '', objetivo: '', actividades: [] }
}

function ProcesoRow({ proceso, index, onUpdate, onRemove }: {
  proceso: ProcesoSeguimiento
  index: number
  onUpdate: (p: Partial<ProcesoSeguimiento>) => void
  onRemove: () => void
}) {
  const [expanded, setExpanded] = useState(false)

  const addActividad = () =>
    onUpdate({ actividades: [...proceso.actividades, { id: crypto.randomUUID(), descripcion: '' }] })

  const removeActividad = (id: string) =>
    onUpdate({ actividades: proceso.actividades.filter(a => a.id !== id) })

  const updateActividad = (id: string, descripcion: string) =>
    onUpdate({ actividades: proceso.actividades.map(a => a.id === id ? { ...a, descripcion } : a) })

  const inp = (field: 'nombre' | 'objetivo', placeholder: string) => (
    <input value={proceso[field]} onChange={e => onUpdate({ [field]: e.target.value })} placeholder={placeholder}
      style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-lo)', color: 'var(--text-hi)', fontFamily: 'Raleway, sans-serif', fontSize: 12, fontWeight: field === 'nombre' ? 600 : 400, outline: 'none', padding: '3px 0', width: '100%' }}
      onFocus={e => (e.currentTarget.style.borderBottomColor = C)}
      onBlur={e => (e.currentTarget.style.borderBottomColor = 'var(--border-lo)')} />
  )

  return (
    <div style={{ borderBottom: '1px solid var(--border-lo)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1.5fr 28px', gap: 10, padding: '9px 16px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button onClick={() => setExpanded(e => !e)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C, padding: 0 }}>
            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
          <span style={{ fontSize: 11, fontWeight: 800, color: C, fontFamily: 'monospace' }}>
            P-{String(index + 1).padStart(2, '0')}
          </span>
        </div>
        {inp('nombre', 'Nombre del proceso…')}
        {inp('objetivo', 'Objetivo del proceso…')}
        <button onClick={onRemove} style={{ color: '#F87171', background: 'none', border: 'none', cursor: 'pointer' }}>
          <Trash2 size={12} />
        </button>
      </div>

      {expanded && (
        <div style={{ paddingLeft: 36, paddingRight: 16, paddingBottom: 12, background: C + '05' }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: C, textTransform: 'uppercase', marginBottom: 8 }}>Actividades</p>
          {proceso.actividades.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 24px', gap: 8, marginBottom: 6 }}>
              {['ID', 'Descripción', ''].map((h, i) => (
                <span key={i} style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-lo)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</span>
              ))}
            </div>
          )}
          {proceso.actividades.map((act, ai) => (
            <div key={act.id} style={{ display: 'grid', gridTemplateColumns: '50px 1fr 24px', gap: 8, marginBottom: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 10, fontFamily: 'monospace', color: C }}>A-{String(ai + 1).padStart(2, '0')}</span>
              <input value={act.descripcion} onChange={e => updateActividad(act.id, e.target.value)} placeholder="Descripción de la actividad…"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-md)', borderRadius: 6, padding: '3px 8px', color: 'var(--text-md)', fontFamily: 'Raleway, sans-serif', fontSize: 11, outline: 'none' }}
                onFocus={e => (e.currentTarget.style.borderColor = C)}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-md)')} />
              <button onClick={() => removeActividad(act.id)} style={{ color: '#F87171', background: 'none', border: 'none', cursor: 'pointer' }}>
                <Trash2 size={11} />
              </button>
            </div>
          ))}
          <button onClick={addActividad}
            style={{ background: 'none', border: `1px dashed ${C}50`, borderRadius: 6, padding: '4px 10px', color: C, fontFamily: 'Raleway, sans-serif', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Plus size={11} /> Actividad
          </button>
        </div>
      )}
    </div>
  )
}

export function ProcesosSeguimientoSection() {
  const { state, dispatch } = useStrategicStore()
  const procesos = state.medicion.procesos

  const setProcesos = (items: ProcesoSeguimiento[]) => dispatch({ type: 'SET_PROCESOS', items })
  const add = () => setProcesos([...procesos, emptyProceso()])
  const remove = (id: string) => setProcesos(procesos.filter(p => p.id !== id))
  const update = (id: string, patch: Partial<ProcesoSeguimiento>) =>
    setProcesos(procesos.map(p => p.id === id ? { ...p, ...patch } : p))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-lo)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1.5fr 28px', gap: 10, padding: '10px 16px', background: C_LIGHT, borderBottom: '1px solid var(--border-lo)' }}>
          {['ID', 'Nombre', 'Objetivo', ''].map((h, i) => (
            <span key={i} style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.09em', color: i === 0 ? C : 'var(--text-lo)', textTransform: 'uppercase' }}>{h}</span>
          ))}
        </div>

        {procesos.map((p, i) => (
          <ProcesoRow key={p.id} proceso={p} index={i}
            onUpdate={patch => update(p.id, patch)}
            onRemove={() => remove(p.id)} />
        ))}

        <div style={{ padding: '12px 16px', background: C + '04', borderTop: procesos.length > 0 ? '1px solid var(--border-lo)' : 'none', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={add}
            style={{ background: C, color: '#fff', border: 'none', borderRadius: 9, padding: '8px 16px', cursor: 'pointer', fontFamily: 'Raleway, sans-serif', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
            <Plus size={13} /> Proceso
          </button>
        </div>
      </div>

      {procesos.length === 0 && (
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-lo)', padding: '8px 0' }}>
          Define los procesos de seguimiento y gobierno del plan estratégico.
        </p>
      )}
    </div>
  )
}
