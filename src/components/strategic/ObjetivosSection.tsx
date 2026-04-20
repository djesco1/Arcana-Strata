import { useState } from 'react'
import { Plus, Trash2, ChevronRight, ChevronDown, Flag, Calendar } from 'lucide-react'
import { useStrategicStore } from '../../store/strategicStore'
import type { ObjetivoEstrategico, MetaEstrategica, CambioIndicador } from '../../types/strategic'
import { COLORS } from './colors'

const C = COLORS.bac20
const C_LIGHT = C + '1E'
const C_BORDER = C + '40'

// ── Meta row (expandable, references BAC-18 indicators) ──────────────────────

function MetaRow({ meta, onUpdate, onRemove, onAddIndicador, onRemoveIndicador, onUpdateIndicador }: {
  meta: MetaEstrategica
  onUpdate: (patch: Partial<MetaEstrategica>) => void
  onRemove: () => void
  onAddIndicador: (ci: CambioIndicador) => void
  onRemoveIndicador: (id: string) => void
  onUpdateIndicador: (id: string, patch: Partial<CambioIndicador>) => void
}) {
  const { state } = useStrategicStore()
  const indicadores = state.indicadoresLogro
  const [expanded, setExpanded] = useState(false)

  const unselected = indicadores.filter(ind => !meta.indicadores.some(ci => ci.idIndicador === ind.id))

  return (
    <div style={{ marginBottom: 6 }}>
      {/* Meta header */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
          background: C + '0F', borderRadius: 10, cursor: 'pointer',
        }}
      >
        {expanded
          ? <ChevronDown size={13} style={{ color: C }} />
          : <ChevronRight size={13} style={{ color: C }} />
        }
        <input
          value={meta.nombre}
          onChange={e => { e.stopPropagation(); onUpdate({ nombre: e.target.value }) }}
          onClick={e => e.stopPropagation()}
          placeholder="Nombre de la meta…"
          style={{
            flex: 1, background: 'transparent', border: 'none',
            color: 'var(--text-hi)', fontFamily: 'Raleway, sans-serif',
            fontSize: 12, fontWeight: 600, outline: 'none',
          }}
        />
        <span style={{ fontSize: 10, color: 'var(--text-lo)' }}>{meta.indicadores.length} ind.</span>
        <button
          onClick={e => { e.stopPropagation(); onRemove() }}
          style={{ color: '#F87171', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <Trash2 size={11} />
        </button>
      </div>

      {/* Expanded: indicator assignments */}
      {expanded && (
        <div style={{ paddingLeft: 28, paddingTop: 8 }}>
          {/* Column headers */}
          {meta.indicadores.length > 0 && (
            <div style={{
              display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 24px',
              gap: 8, marginBottom: 4, paddingLeft: 2,
            }}>
              {['Indicador (BAC-18)', 'Valor inicial', 'Valor objetivo', ''].map((h, i) => (
                <span key={i} style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-lo)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</span>
              ))}
            </div>
          )}

          {/* Indicator rows */}
          {meta.indicadores.map(ci => {
            const ind = indicadores.find(x => x.id === ci.idIndicador)
            return (
              <div key={ci.idIndicador} style={{
                display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 24px',
                gap: 8, marginBottom: 5, alignItems: 'center',
              }}>
                <span style={{ fontSize: 11, color: ind ? 'var(--text-md)' : 'var(--text-xdim)', fontStyle: ind ? 'normal' : 'italic' }}>
                  {ind?.nombre ?? '(eliminado del catalogo)'}
                </span>
                {(['valorInicial', 'valorObjetivo'] as const).map(f => (
                  <input
                    key={f}
                    value={ci[f]}
                    onChange={e => onUpdateIndicador(ci.idIndicador, { [f]: e.target.value })}
                    placeholder={f === 'valorInicial' ? 'Inicial…' : 'Objetivo…'}
                    style={{
                      background: 'var(--bg-surface)', border: '1px solid var(--border-md)',
                      borderRadius: 6, padding: '4px 8px', color: 'var(--text-md)',
                      fontFamily: 'Raleway, sans-serif', fontSize: 11, outline: 'none',
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = C)}
                    onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-md)')}
                  />
                ))}
                <button
                  onClick={() => onRemoveIndicador(ci.idIndicador)}
                  style={{ color: '#F87171', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <Trash2 size={11} />
                </button>
              </div>
            )
          })}

          {/* Add indicator from BAC-18 */}
          {unselected.length > 0 && (
            <select
              value=""
              onChange={e => { if (e.target.value) onAddIndicador({ idIndicador: e.target.value, valorInicial: '', valorObjetivo: '' }) }}
              style={{
                background: 'var(--bg-surface)', border: '1px dashed var(--border-md)',
                borderRadius: 6, padding: '4px 8px', color: 'var(--text-lo)',
                fontFamily: 'Raleway, sans-serif', fontSize: 11, outline: 'none', cursor: 'pointer',
              }}
            >
              <option value="">+ Agregar indicador del catalogo…</option>
              {unselected.map(ind => (
                <option key={ind.id} value={ind.id}>{ind.nombre}</option>
              ))}
            </select>
          )}
          {unselected.length === 0 && indicadores.length === 0 && (
            <p style={{ fontSize: 10, color: 'var(--text-xdim)', fontStyle: 'italic' }}>
              Define indicadores en BAC-18 para asignarlos a esta meta.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ── Objetivo card ──────────────────────────────────────────────────────────────

function ObjetivoCard({ objetivo, onUpdate, onRemove }: {
  objetivo: ObjetivoEstrategico
  onUpdate: (patch: Partial<ObjetivoEstrategico>) => void
  onRemove: () => void
}) {
  const [expanded, setExpanded] = useState(true)
  const [nuevaMeta, setNuevaMeta] = useState('')

  const updateMetas = (metas: MetaEstrategica[]) => onUpdate({ metas })
  const addMeta = () => {
    if (!nuevaMeta.trim()) return
    updateMetas([...objetivo.metas, { id: crypto.randomUUID(), nombre: nuevaMeta.trim(), indicadores: [] }])
    setNuevaMeta('')
  }
  const updateMeta = (id: string, patch: Partial<MetaEstrategica>) =>
    updateMetas(objetivo.metas.map(m => m.id === id ? { ...m, ...patch } : m))
  const removeMeta = (id: string) =>
    updateMetas(objetivo.metas.filter(m => m.id !== id))
  const addIndicadorToMeta = (metaId: string, ci: CambioIndicador) => {
    const meta = objetivo.metas.find(m => m.id === metaId)
    if (meta) updateMeta(metaId, { indicadores: [...meta.indicadores, ci] })
  }
  const removeIndicadorFromMeta = (metaId: string, idInd: string) => {
    const meta = objetivo.metas.find(m => m.id === metaId)
    if (meta) updateMeta(metaId, { indicadores: meta.indicadores.filter(ci => ci.idIndicador !== idInd) })
  }
  const updateIndicadorInMeta = (metaId: string, idInd: string, patch: Partial<CambioIndicador>) => {
    const meta = objetivo.metas.find(m => m.id === metaId)
    if (meta) updateMeta(metaId, { indicadores: meta.indicadores.map(ci => ci.idIndicador === idInd ? { ...ci, ...patch } : ci) })
  }

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border-md)',
      borderRadius: 14, overflow: 'hidden', marginBottom: 14,
    }}>
      {/* Header */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px',
          cursor: 'pointer', background: C + '0D',
          borderBottom: expanded ? '1px solid var(--border-lo)' : 'none',
        }}
      >
        <Flag size={14} style={{ color: C, flexShrink: 0 }} />
        <input
          value={objetivo.nombre}
          onChange={e => { e.stopPropagation(); onUpdate({ nombre: e.target.value }) }}
          onClick={e => e.stopPropagation()}
          placeholder="Nombre del objetivo estrategico…"
          style={{
            flex: 1, background: 'transparent', border: 'none',
            color: 'var(--text-hi)', fontFamily: 'Raleway, sans-serif',
            fontSize: 14, fontWeight: 700, outline: 'none',
          }}
        />
        <span style={{ fontSize: 10, color: 'var(--text-lo)', flexShrink: 0 }}>
          {objetivo.metas.length} {objetivo.metas.length === 1 ? 'meta' : 'metas'}
        </span>
        {expanded
          ? <ChevronDown size={14} style={{ color: 'var(--text-lo)', flexShrink: 0 }} />
          : <ChevronRight size={14} style={{ color: 'var(--text-lo)', flexShrink: 0 }} />
        }
        <button
          onClick={e => { e.stopPropagation(); onRemove() }}
          style={{ color: '#F87171', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}
        >
          <Trash2 size={13} />
        </button>
      </div>

      {expanded && (
        <div style={{ padding: '14px 16px' }}>
          {objetivo.metas.map(meta => (
            <MetaRow
              key={meta.id}
              meta={meta}
              onUpdate={p => updateMeta(meta.id, p)}
              onRemove={() => removeMeta(meta.id)}
              onAddIndicador={ci => addIndicadorToMeta(meta.id, ci)}
              onRemoveIndicador={id => removeIndicadorFromMeta(meta.id, id)}
              onUpdateIndicador={(id, p) => updateIndicadorInMeta(meta.id, id, p)}
            />
          ))}
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <input
              value={nuevaMeta}
              onChange={e => setNuevaMeta(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addMeta()}
              placeholder="Nueva meta estrategica…"
              style={{
                flex: 1, background: 'var(--bg-surface)', border: '1px dashed var(--border-md)',
                borderRadius: 8, padding: '7px 10px', color: 'var(--text-hi)',
                fontFamily: 'Raleway, sans-serif', fontSize: 12, outline: 'none',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = C)}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-md)')}
            />
            <button
              onClick={addMeta}
              style={{
                background: C_LIGHT, color: C, border: `1px solid ${C_BORDER}`,
                borderRadius: 8, padding: '7px 12px', cursor: 'pointer',
                fontSize: 11, fontWeight: 600, fontFamily: 'Raleway, sans-serif',
                display: 'flex', alignItems: 'center', gap: 4,
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              <Plus size={12} /> Meta
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export function ObjetivosSection() {
  const { state, dispatch } = useStrategicStore()
  const { objetivos } = state
  const [nuevoObjetivo, setNuevoObjetivo] = useState('')

  const updateLista = (next: ObjetivoEstrategico[]) =>
    dispatch({ type: 'UPDATE_OBJETIVOS', patch: { objetivos: next } })

  const addObjetivo = () => {
    if (!nuevoObjetivo.trim()) return
    updateLista([...objetivos.objetivos, { id: crypto.randomUUID(), nombre: nuevoObjetivo.trim(), metas: [] }])
    setNuevoObjetivo('')
  }
  const updateObjetivo = (id: string, patch: Partial<ObjetivoEstrategico>) =>
    updateLista(objetivos.objetivos.map(o => o.id === id ? { ...o, ...patch } : o))
  const removeObjetivo = (id: string) =>
    updateLista(objetivos.objetivos.filter(o => o.id !== id))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Fecha objetivo */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'var(--bg-card)', border: '1px solid var(--border-lo)',
        borderRadius: 14, padding: '14px 20px',
      }}>
        <Calendar size={15} style={{ color: C, flexShrink: 0 }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-md)' }}>Fecha objetivo</span>
        <input
          type="date"
          value={objetivos.fechaObjetivo}
          onChange={e => dispatch({ type: 'UPDATE_OBJETIVOS', patch: { fechaObjetivo: e.target.value } })}
          style={{
            marginLeft: 'auto', background: 'var(--bg-surface)', border: '1px solid var(--border-md)',
            borderRadius: 8, padding: '6px 10px', color: 'var(--text-hi)',
            fontFamily: 'Raleway, sans-serif', fontSize: 12, outline: 'none', colorScheme: 'dark',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = C)}
          onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-md)')}
        />
      </div>

      {/* Objectives list */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Flag size={14} style={{ color: C }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-md)' }}>Objetivos Estrategicos</span>
          <span style={{ fontSize: 10, fontWeight: 700, background: C_LIGHT, color: C, padding: '2px 8px', borderRadius: 20 }}>
            {objetivos.objetivos.length}
          </span>
        </div>

        {objetivos.objetivos.map(obj => (
          <ObjetivoCard
            key={obj.id}
            objetivo={obj}
            onUpdate={p => updateObjetivo(obj.id, p)}
            onRemove={() => removeObjetivo(obj.id)}
          />
        ))}

        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={nuevoObjetivo}
            onChange={e => setNuevoObjetivo(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addObjetivo()}
            placeholder="Nuevo objetivo estrategico…"
            style={{
              flex: 1, background: 'var(--bg-surface)', border: `1px dashed ${C_BORDER}`,
              borderRadius: 10, padding: '10px 14px', color: 'var(--text-hi)',
              fontFamily: 'Raleway, sans-serif', fontSize: 13, outline: 'none',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = C)}
            onBlur={e => (e.currentTarget.style.borderColor = C_BORDER)}
          />
          <button
            onClick={addObjetivo}
            style={{
              background: C, color: '#fff', border: 'none', borderRadius: 10,
              padding: '10px 18px', cursor: 'pointer', fontFamily: 'Raleway, sans-serif',
              fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            <Plus size={14} /> Objetivo
          </button>
        </div>
      </div>
    </div>
  )
}
