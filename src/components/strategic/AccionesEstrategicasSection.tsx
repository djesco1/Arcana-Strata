import { useState } from 'react'
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import { useStrategicStore } from '../../store/strategicStore'
import type { AccionEstrategica, IndicadorAporte } from '../../types/strategic'
import { COLORS } from './colors'

const C = COLORS.bac22
const C_LIGHT = C + '1E'
const C_BORDER = C + '40'

function emptyAccion(): AccionEstrategica {
  return {
    id: crypto.randomUUID(),
    nombre: '', descripcion: '', responsable: '',
    fechaInicio: '', fechaFin: '',
    indicadores: [], prerrequisitos: [],
    costo: '', idProyecto: '', accionesTacticas: [],
  }
}

function AccionRow({ accion, index, onUpdate, onRemove }: {
  accion: AccionEstrategica
  index: number
  onUpdate: (p: Partial<AccionEstrategica>) => void
  onRemove: () => void
}) {
  const { state } = useStrategicStore()
  const [expanded, setExpanded] = useState(false)
  const catalogoIndicadores = state.indicadoresLogro
  const unselected = catalogoIndicadores.filter(ind => !accion.indicadores.some(ai => ai.idIndicador === ind.id))
  const code = `AE-${String(index + 1).padStart(2, '0')}`

  const addIndicador = (idIndicador: string) => {
    onUpdate({ indicadores: [...(accion.indicadores ?? []), { idIndicador, aporte: '' }] })
  }
  const removeIndicador = (idIndicador: string) =>
    onUpdate({ indicadores: accion.indicadores.filter(ai => ai.idIndicador !== idIndicador) })
  const updateAporte = (idIndicador: string, aporte: string) =>
    onUpdate({ indicadores: accion.indicadores.map(ai => ai.idIndicador === idIndicador ? { ...ai, aporte } : ai) })

  const inp = (field: keyof AccionEstrategica, placeholder: string, width?: number) => (
    <input
      value={accion[field] as string}
      onChange={e => onUpdate({ [field]: e.target.value })}
      placeholder={placeholder}
      style={{
        width: width ? width : '100%', background: 'transparent', border: 'none',
        borderBottom: '1px solid var(--border-lo)', color: 'var(--text-hi)',
        fontFamily: 'Raleway, sans-serif', fontSize: 12,
        fontWeight: field === 'nombre' ? 600 : 400, outline: 'none', padding: '2px 0',
      }}
      onFocus={e => (e.currentTarget.style.borderBottomColor = C)}
      onBlur={e => (e.currentTarget.style.borderBottomColor = 'var(--border-lo)')}
    />
  )

  return (
    <div style={{ borderBottom: '1px solid var(--border-lo)' }}>
      {/* Main row */}
      <div style={{
        display: 'grid', gridTemplateColumns: '60px 1.5fr 2fr 1fr 100px 100px 80px 28px',
        gap: 10, padding: '9px 16px', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button onClick={() => setExpanded(e => !e)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C, padding: 0 }}>
            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
          <span style={{ fontSize: 11, fontWeight: 800, color: C, fontFamily: 'monospace' }}>{code}</span>
        </div>
        {inp('nombre', 'Nombre…')}
        {inp('descripcion', 'Descripción…')}
        {inp('responsable', 'Responsable…')}
        <input type="month" value={accion.fechaInicio} onChange={e => onUpdate({ fechaInicio: e.target.value })}
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-md)', borderRadius: 6, padding: '3px 6px', color: 'var(--text-hi)', fontFamily: 'Raleway, sans-serif', fontSize: 11, outline: 'none', colorScheme: 'dark' }}
          onFocus={e => (e.currentTarget.style.borderColor = C)} onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-md)')} />
        <input type="month" value={accion.fechaFin} onChange={e => onUpdate({ fechaFin: e.target.value })}
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-md)', borderRadius: 6, padding: '3px 6px', color: 'var(--text-hi)', fontFamily: 'Raleway, sans-serif', fontSize: 11, outline: 'none', colorScheme: 'dark' }}
          onFocus={e => (e.currentTarget.style.borderColor = C)} onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-md)')} />
        <span style={{ fontSize: 10, color: 'var(--text-lo)' }}>{(accion.indicadores ?? []).length} ind.</span>
        <button onClick={onRemove} style={{ color: '#F87171', background: 'none', border: 'none', cursor: 'pointer' }}>
          <Trash2 size={12} />
        </button>
      </div>

      {/* Expanded: indicators */}
      {expanded && (
        <div style={{ paddingLeft: 36, paddingRight: 16, paddingBottom: 12, background: C + '05' }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: C, textTransform: 'uppercase', marginBottom: 8 }}>
            Indicadores de logro (ref. BAC-18)
          </p>
          {(accion.indicadores ?? []).length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 24px', gap: 8, marginBottom: 6 }}>
              {['Indicador', 'Aporte esperado', ''].map((h, i) => (
                <span key={i} style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-lo)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</span>
              ))}
            </div>
          )}
          {(accion.indicadores ?? []).map(ai => {
            const ind = catalogoIndicadores.find(x => x.id === ai.idIndicador)
            return (
              <div key={ai.idIndicador} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 24px', gap: 8, marginBottom: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: ind ? 'var(--text-md)' : 'var(--text-xdim)', fontStyle: ind ? 'normal' : 'italic' }}>
                  {ind?.nombre ?? '(eliminado)'}
                </span>
                <input value={ai.aporte} onChange={e => updateAporte(ai.idIndicador, e.target.value)} placeholder="Aporte…"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-md)', borderRadius: 6, padding: '3px 8px', color: 'var(--text-md)', fontFamily: 'Raleway, sans-serif', fontSize: 11, outline: 'none' }}
                  onFocus={e => (e.currentTarget.style.borderColor = C)} onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-md)')} />
                <button onClick={() => removeIndicador(ai.idIndicador)} style={{ color: '#F87171', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <Trash2 size={11} />
                </button>
              </div>
            )
          })}
          {unselected.length > 0 && (
            <select value="" onChange={e => { if (e.target.value) addIndicador(e.target.value) }}
              style={{ background: 'var(--bg-surface)', border: `1px dashed ${C_BORDER}`, borderRadius: 6, padding: '4px 8px', color: 'var(--text-lo)', fontFamily: 'Raleway, sans-serif', fontSize: 11, outline: 'none', cursor: 'pointer' }}>
              <option value="">+ Agregar indicador del catálogo BAC-18…</option>
              {unselected.map(ind => <option key={ind.id} value={ind.id}>{ind.nombre}</option>)}
            </select>
          )}
          {catalogoIndicadores.length === 0 && (
            <p style={{ fontSize: 10, color: 'var(--text-xdim)', fontStyle: 'italic' }}>Define indicadores en BAC-18 para asignarlos.</p>
          )}
        </div>
      )}
    </div>
  )
}

export function AccionesEstrategicasSection() {
  const { state, dispatch } = useStrategicStore()
  const acciones = state.ejecucion?.acciones ?? []

  const setAcciones = (items: AccionEstrategica[]) => dispatch({ type: 'SET_ACCIONES', items })
  const addAccion = () => setAcciones([...acciones, emptyAccion()])
  const removeAccion = (id: string) => setAcciones(acciones.filter(a => a.id !== id))
  const updateAccion = (id: string, patch: Partial<AccionEstrategica>) =>
    setAcciones(acciones.map(a => a.id === id ? { ...a, ...patch } : a))

  const cols = ['ID', 'Nombre', 'Descripción', 'Responsable', 'F. Inicio', 'F. Fin', 'Indicadores', '']
  const colTemplate = '60px 1.5fr 2fr 1fr 100px 100px 80px 28px'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-lo)', borderRadius: 16, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: colTemplate, gap: 10, padding: '10px 16px', background: C_LIGHT, borderBottom: '1px solid var(--border-lo)' }}>
          {cols.map((h, i) => (
            <span key={i} style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.09em', color: i === 0 ? C : 'var(--text-lo)', textTransform: 'uppercase' }}>{h}</span>
          ))}
        </div>

        {/* Rows */}
        {acciones.map((a, i) => (
          <AccionRow key={a.id} accion={a} index={i}
            onUpdate={p => updateAccion(a.id, p)}
            onRemove={() => removeAccion(a.id)} />
        ))}

        {/* Add */}
        <div style={{ padding: '12px 16px', background: C + '04', borderTop: acciones.length > 0 ? '1px solid var(--border-lo)' : 'none', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={addAccion}
            style={{ background: C, color: '#fff', border: 'none', borderRadius: 9, padding: '8px 16px', cursor: 'pointer', fontFamily: 'Raleway, sans-serif', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
            <Plus size={13} /> Acción estratégica
          </button>
        </div>
      </div>

      {acciones.length === 0 && (
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-lo)', padding: '8px 0' }}>
          Agrega acciones estratégicas para definir el plan de ejecución.
        </p>
      )}
    </div>
  )
}
