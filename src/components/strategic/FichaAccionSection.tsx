import { useState } from 'react'
import { Plus, Trash2, ChevronDown, ChevronRight, AlertCircle } from 'lucide-react'
import { useStrategicStore } from '../../store/strategicStore'
import type { AccionEstrategica, AccionTactica } from '../../types/strategic'
import { COLORS } from './colors'

const C = COLORS.bac23
const C_LIGHT = C + '1E'
const C_BORDER = C + '40'

function TacticaRow({ tactica, onUpdate, onRemove }: {
  tactica: AccionTactica
  onUpdate: (p: Partial<AccionTactica>) => void
  onRemove: () => void
}) {
  const colTemplate = '1.5fr 2fr 1fr 90px 90px 24px'
  return (
    <div style={{ display: 'grid', gridTemplateColumns: colTemplate, gap: 8, padding: '7px 12px', alignItems: 'center', borderBottom: '1px solid var(--border-lo)' }}>
      {(['nombre', 'descripcion', 'responsable'] as const).map(f => (
        <input key={f} value={tactica[f]} onChange={e => onUpdate({ [f]: e.target.value })}
          placeholder={f === 'nombre' ? 'Nombre…' : f === 'descripcion' ? 'Descripción…' : 'Responsable…'}
          style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-lo)', color: 'var(--text-hi)', fontFamily: 'Raleway, sans-serif', fontSize: 11, fontWeight: f === 'nombre' ? 600 : 400, outline: 'none', padding: '2px 0' }}
          onFocus={e => (e.currentTarget.style.borderBottomColor = C)}
          onBlur={e => (e.currentTarget.style.borderBottomColor = 'var(--border-lo)')} />
      ))}
      {(['fechaInicio', 'fechaFin'] as const).map(f => (
        <input key={f} type="month" value={tactica[f]} onChange={e => onUpdate({ [f]: e.target.value })}
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-md)', borderRadius: 5, padding: '3px 5px', color: 'var(--text-hi)', fontFamily: 'Raleway, sans-serif', fontSize: 10, outline: 'none', colorScheme: 'dark' }}
          onFocus={e => (e.currentTarget.style.borderColor = C)} onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-md)')} />
      ))}
      <button onClick={onRemove} style={{ color: '#F87171', background: 'none', border: 'none', cursor: 'pointer' }}>
        <Trash2 size={11} />
      </button>
    </div>
  )
}

function AccionFichaCard({ accion, index, allAcciones, onUpdate }: {
  accion: AccionEstrategica
  index: number
  allAcciones: AccionEstrategica[]
  onUpdate: (p: Partial<AccionEstrategica>) => void
}) {
  const { state } = useStrategicStore()
  const [expanded, setExpanded] = useState(false)
  const [newTactica, setNewTactica] = useState('')
  const code = `AE-${String(index + 1).padStart(2, '0')}`

  const tacticas = accion.accionesTacticas ?? []
  const prerrequisitos = accion.prerrequisitos ?? []

  const addTactica = () => {
    if (!newTactica.trim()) return
    onUpdate({ accionesTacticas: [...tacticas, { id: crypto.randomUUID(), nombre: newTactica.trim(), descripcion: '', responsable: '', fechaInicio: '', fechaFin: '' }] })
    setNewTactica('')
  }
  const updateTactica = (id: string, p: Partial<AccionTactica>) =>
    onUpdate({ accionesTacticas: tacticas.map(t => t.id === id ? { ...t, ...p } : t) })
  const removeTactica = (id: string) =>
    onUpdate({ accionesTacticas: tacticas.filter(t => t.id !== id) })

  const togglePrerrequisito = (id: string) => {
    const next = prerrequisitos.includes(id)
      ? prerrequisitos.filter(p => p !== id)
      : [...prerrequisitos, id]
    onUpdate({ prerrequisitos: next })
  }

  const otrasAcciones = allAcciones.filter(a => a.id !== accion.id)

  const labelStyle: React.CSSProperties = {
    fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
    color: 'var(--text-lo)', textTransform: 'uppercase', marginBottom: 5,
  }
  const fieldStyle: React.CSSProperties = {
    background: 'var(--bg-surface)', border: '1px solid var(--border-md)',
    borderRadius: 7, padding: '6px 10px', color: 'var(--text-hi)',
    fontFamily: 'Raleway, sans-serif', fontSize: 12, outline: 'none', width: '100%',
  }

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-lo)', borderRadius: 14, overflow: 'hidden', marginBottom: 12 }}>
      {/* Header */}
      <div onClick={() => setExpanded(e => !e)} style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
        cursor: 'pointer', background: C + '0D', borderBottom: expanded ? '1px solid var(--border-lo)' : 'none',
      }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: C, fontFamily: 'monospace', flexShrink: 0 }}>{code}</span>
        <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: 'var(--text-hi)' }}>
          {accion.nombre || <span style={{ color: 'var(--text-xdim)', fontStyle: 'italic', fontWeight: 400 }}>Sin nombre</span>}
        </span>
        <span style={{ fontSize: 10, color: 'var(--text-lo)' }}>{tacticas.length} tácticas · {prerrequisitos.length} prereq.</span>
        {expanded ? <ChevronDown size={14} style={{ color: 'var(--text-lo)', flexShrink: 0 }} /> : <ChevronRight size={14} style={{ color: 'var(--text-lo)', flexShrink: 0 }} />}
      </div>

      {expanded && (
        <div style={{ padding: '16px' }}>
          {/* Top info grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 20 }}>
            <div>
              <p style={labelStyle}>Costo estimado</p>
              <input value={accion.costo} onChange={e => onUpdate({ costo: e.target.value })} placeholder="Ej: $50,000"
                style={fieldStyle}
                onFocus={e => (e.currentTarget.style.borderColor = C)} onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-md)')} />
            </div>
            <div>
              <p style={labelStyle}>ID del proyecto</p>
              <input value={accion.idProyecto} onChange={e => onUpdate({ idProyecto: e.target.value })} placeholder="Ej: PROJ-01"
                style={fieldStyle}
                onFocus={e => (e.currentTarget.style.borderColor = C)} onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-md)')} />
            </div>
            <div>
              <p style={labelStyle}>Indicadores de ejecución (BAC-18)</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {(accion.indicadores ?? []).map(ai => {
                  const ind = state.indicadoresLogro.find(x => x.id === ai.idIndicador)
                  return (
                    <span key={ai.idIndicador} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: C + '20', color: C, fontWeight: 600 }}>
                      {ind?.nombre ?? '??'}
                    </span>
                  )
                })}
                {(accion.indicadores ?? []).length === 0 && <span style={{ fontSize: 10, color: 'var(--text-xdim)', fontStyle: 'italic' }}>Ninguno (ver BAC-22)</span>}
              </div>
            </div>
          </div>

          {/* Prerrequisitos */}
          <div style={{ marginBottom: 20 }}>
            <p style={labelStyle}>Acciones prerrequisito</p>
            {otrasAcciones.length === 0
              ? <p style={{ fontSize: 11, color: 'var(--text-xdim)', fontStyle: 'italic' }}>No hay otras acciones definidas.</p>
              : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {otrasAcciones.map((a, i) => {
                    const aCode = `AE-${String(i < index ? i + 1 : i + 2).padStart(2, '0')}`
                    const isSelected = prerrequisitos.includes(a.id)
                    return (
                      <button key={a.id} onClick={() => togglePrerrequisito(a.id)}
                        style={{
                          fontSize: 11, padding: '4px 10px', borderRadius: 20, cursor: 'pointer', fontFamily: 'Raleway, sans-serif', fontWeight: 600,
                          background: isSelected ? C + '25' : 'var(--bg-surface)',
                          color: isSelected ? C : 'var(--text-lo)',
                          border: isSelected ? `1px solid ${C_BORDER}` : '1px solid var(--border-md)',
                        }}>
                        {aCode} {a.nombre ? `· ${a.nombre.slice(0, 20)}${a.nombre.length > 20 ? '…' : ''}` : ''}
                      </button>
                    )
                  })}
                </div>
              )
            }
          </div>

          {/* Acciones tácticas */}
          <div>
            <p style={labelStyle}>Acciones tácticas</p>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-lo)', borderRadius: 10, overflow: 'hidden', marginBottom: 8 }}>
              {tacticas.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 1fr 90px 90px 24px', gap: 8, padding: '7px 12px', background: C + '0A', borderBottom: '1px solid var(--border-lo)' }}>
                  {['Nombre', 'Descripción', 'Responsable', 'F. Inicio', 'F. Fin', ''].map((h, i) => (
                    <span key={i} style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-lo)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</span>
                  ))}
                </div>
              )}
              {tacticas.map(t => (
                <TacticaRow key={t.id} tactica={t}
                  onUpdate={p => updateTactica(t.id, p)}
                  onRemove={() => removeTactica(t.id)} />
              ))}
              <div style={{ display: 'flex', gap: 8, padding: '8px 12px', background: C + '04' }}>
                <input value={newTactica} onChange={e => setNewTactica(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTactica()}
                  placeholder="Nueva acción táctica…"
                  style={{ flex: 1, background: 'var(--bg-surface)', border: `1px dashed ${C_BORDER}`, borderRadius: 7, padding: '5px 9px', color: 'var(--text-hi)', fontFamily: 'Raleway, sans-serif', fontSize: 12, outline: 'none' }}
                  onFocus={e => (e.currentTarget.style.borderColor = C)} onBlur={e => (e.currentTarget.style.borderColor = C_BORDER)} />
                <button onClick={addTactica}
                  style={{ background: C_LIGHT, color: C, border: `1px solid ${C_BORDER}`, borderRadius: 7, padding: '5px 10px', cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: 'Raleway, sans-serif', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Plus size={12} /> Táctica
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function FichaAccionSection() {
  const { state } = useStrategicStore()
  const { dispatch } = useStrategicStore()
  const acciones = state.ejecucion?.acciones ?? []

  const updateAccion = (id: string, patch: Partial<AccionEstrategica>) =>
    dispatch({ type: 'SET_ACCIONES', items: acciones.map(a => a.id === id ? { ...a, ...patch } : a) })

  if (acciones.length === 0) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 18px', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: 12 }}>
      <AlertCircle size={15} style={{ color: '#F59E0B', flexShrink: 0 }} />
      <p style={{ fontSize: 12, color: '#F59E0B', lineHeight: 1.5 }}>
        Primero define acciones estratégicas en <strong>BAC-22</strong> para ver sus fichas aquí.
      </p>
    </div>
  )

  return (
    <div>
      {acciones.map((a, i) => (
        <AccionFichaCard key={a.id} accion={a} index={i} allAcciones={acciones}
          onUpdate={p => updateAccion(a.id, p)} />
      ))}
    </div>
  )
}
