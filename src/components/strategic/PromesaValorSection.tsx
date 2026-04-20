import { useState } from 'react'
import { Plus, Trash2, ChevronDown } from 'lucide-react'
import { useStrategicStore } from '../../store/strategicStore'
import type { DecisionEstrategica, ModeloImpactado, PromesaDeValor } from '../../types/strategic'
import { COLORS } from './colors'

const C = COLORS.bac21
const C_LIGHT = C + '1E'
const C_BORDER = C + '40'

const MODELOS: { value: ModeloImpactado; label: string; color: string }[] = [
  { value: 'negocio',        label: 'Negocio',        color: '#5448A0' },
  { value: 'financiero',     label: 'Financiero',     color: '#1B7A5F' },
  { value: 'estrategico',    label: 'Estratégico',    color: COLORS.bac21 },
  { value: 'capacidades',    label: 'Capacidades',    color: '#2B6CB0' },
  { value: 'organizacional', label: 'Organizacional', color: '#7C3D9F' },
  { value: 'procesos',       label: 'Procesos',       color: '#B7791F' },
  { value: 'recursos',       label: 'Recursos',       color: '#B03040' },
  { value: 'indicadores',    label: 'Indicadores',    color: COLORS.bac18 },
]

function ModeloBadge({ modelo }: { modelo: ModeloImpactado }) {
  const m = MODELOS.find(x => x.value === modelo)
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', padding: '2px 8px',
      borderRadius: 20, background: `${m?.color}22`, color: m?.color, whiteSpace: 'nowrap',
    }}>
      {m?.label}
    </span>
  )
}

function ModeloSelect({ value, onChange }: { value: ModeloImpactado; onChange: (v: ModeloImpactado) => void }) {
  return (
    <div style={{ position: 'relative' }}>
      <select
        value={value}
        onChange={e => onChange(e.target.value as ModeloImpactado)}
        style={{
          appearance: 'none', width: '100%', padding: '5px 24px 5px 8px',
          background: 'var(--bg-surface)', border: '1px solid var(--border-md)',
          borderRadius: 7, color: 'var(--text-hi)', fontFamily: 'Raleway, sans-serif',
          fontSize: 11, outline: 'none', cursor: 'pointer',
        }}
      >
        {MODELOS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
      </select>
      <ChevronDown size={11} style={{
        position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
        pointerEvents: 'none', color: 'var(--text-lo)',
      }} />
    </div>
  )
}

// ── Decision row inside a PromesaDeValor ──────────────────────────────────────

function DecisionRow({ decision, onUpdate, onRemove, colTemplate }: {
  decision: DecisionEstrategica
  onUpdate: (p: Partial<DecisionEstrategica>) => void
  onRemove: () => void
  colTemplate: string
}) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: colTemplate,
      gap: 10, padding: '8px 16px', alignItems: 'start',
      borderBottom: '1px solid var(--border-lo)',
    }}>
      <input
        value={decision.nombre}
        onChange={e => onUpdate({ nombre: e.target.value })}
        placeholder="Nombre de la decisión…"
        style={{
          background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-lo)',
          color: 'var(--text-hi)', fontFamily: 'Raleway, sans-serif',
          fontSize: 12, fontWeight: 600, outline: 'none', padding: '2px 0',
        }}
        onFocus={e => (e.currentTarget.style.borderBottomColor = C)}
        onBlur={e => (e.currentTarget.style.borderBottomColor = 'var(--border-lo)')}
      />
      <ModeloSelect value={decision.modelo} onChange={v => onUpdate({ modelo: v })} />
      <textarea
        value={decision.descripcion}
        onChange={e => onUpdate({ descripcion: e.target.value })}
        placeholder="Descripción de la decisión estratégica…"
        rows={2}
        style={{
          resize: 'vertical', background: 'transparent', border: 'none',
          borderBottom: '1px solid var(--border-lo)',
          color: 'var(--text-md)', fontFamily: 'Raleway, sans-serif',
          fontSize: 11, lineHeight: 1.6, outline: 'none', padding: '2px 0',
        }}
        onFocus={e => (e.currentTarget.style.borderBottomColor = C)}
        onBlur={e => (e.currentTarget.style.borderBottomColor = 'var(--border-lo)')}
      />
      <button
        onClick={onRemove}
        style={{ color: '#F87171', background: 'none', border: 'none', cursor: 'pointer', paddingTop: 4 }}
      >
        <Trash2 size={11} />
      </button>
    </div>
  )
}

// ── PromesaDeValor block ──────────────────────────────────────────────────────

function PromesaBlock({ pv, index, onUpdate, onRemove, colTemplate }: {
  pv: PromesaDeValor
  index: number
  onUpdate: (p: Partial<PromesaDeValor>) => void
  onRemove: () => void
  colTemplate: string
}) {
  const [newNombre, setNewNombre] = useState('')

  const decisiones = pv.decisiones ?? []

  const updateDecision = (id: string, patch: Partial<DecisionEstrategica>) =>
    onUpdate({ decisiones: decisiones.map(d => d.id === id ? { ...d, ...patch } : d) })

  const removeDecision = (id: string) =>
    onUpdate({ decisiones: decisiones.filter(d => d.id !== id) })

  const addDecision = () => {
    if (!newNombre.trim()) return
    onUpdate({ decisiones: [...decisiones, { id: crypto.randomUUID(), nombre: newNombre.trim(), modelo: 'negocio', descripcion: '' }] })
    setNewNombre('')
  }

  const pvCode = `PV${String(index + 1).padStart(2, '0')}`

  return (
    <div style={{ display: 'contents' }}>
      {/* Intencion header row — spans full width */}
      <div style={{
        gridColumn: '1 / -1',
        display: 'grid', gridTemplateColumns: colTemplate,
        gap: 10, padding: '10px 16px',
        background: C + '0A', borderBottom: '1px solid var(--border-lo)',
        alignItems: 'center',
      }}>
        {/* ID */}
        <span style={{ fontSize: 11, fontWeight: 800, color: C, fontFamily: 'monospace' }}>{pvCode}</span>

        {/* Intención editable — spans Nombre + Modelo + Descripción columns */}
        <div style={{ gridColumn: '2 / 5', display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            value={pv.intencion}
            onChange={e => onUpdate({ intencion: e.target.value })}
            placeholder="Intención estratégica…"
            style={{
              flex: 1, background: 'transparent', border: 'none',
              color: 'var(--text-hi)', fontFamily: 'Raleway, sans-serif',
              fontSize: 13, fontWeight: 700, outline: 'none',
            }}
          />
          <button
            onClick={onRemove}
            style={{ color: '#F87171', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Decision rows */}
      {(pv.decisiones ?? []).map(d => (
        <div key={d.id} style={{ gridColumn: '1 / -1' }}>
          {/* ID blank + indented content */}
          <div style={{
            display: 'grid', gridTemplateColumns: colTemplate,
            gap: 10, padding: '8px 16px', alignItems: 'start',
            borderBottom: '1px solid var(--border-lo)',
          }}>
            <span />
            <input
              value={d.nombre}
              onChange={e => updateDecision(d.id, { nombre: e.target.value })}
              placeholder="Nombre de la decisión…"
              style={{
                background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-lo)',
                color: 'var(--text-hi)', fontFamily: 'Raleway, sans-serif',
                fontSize: 12, fontWeight: 600, outline: 'none', padding: '2px 0',
              }}
              onFocus={e => (e.currentTarget.style.borderBottomColor = C)}
              onBlur={e => (e.currentTarget.style.borderBottomColor = 'var(--border-lo)')}
            />
            <ModeloSelect value={d.modelo} onChange={v => updateDecision(d.id, { modelo: v })} />
            <textarea
              value={d.descripcion}
              onChange={e => updateDecision(d.id, { descripcion: e.target.value })}
              placeholder="Descripción…"
              rows={2}
              style={{
                resize: 'vertical', background: 'transparent', border: 'none',
                borderBottom: '1px solid var(--border-lo)',
                color: 'var(--text-md)', fontFamily: 'Raleway, sans-serif',
                fontSize: 11, lineHeight: 1.6, outline: 'none', padding: '2px 0',
              }}
              onFocus={e => (e.currentTarget.style.borderBottomColor = C)}
              onBlur={e => (e.currentTarget.style.borderBottomColor = 'var(--border-lo)')}
            />
            <button
              onClick={() => removeDecision(d.id)}
              style={{ color: '#F87171', background: 'none', border: 'none', cursor: 'pointer', paddingTop: 4 }}
            >
              <Trash2 size={11} />
            </button>
          </div>
        </div>
      ))}

      {/* Add decision row */}
      <div style={{ gridColumn: '1 / -1' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: colTemplate,
          gap: 10, padding: '7px 16px', alignItems: 'center',
          background: C + '05',
        }}>
          <span />
          <input
            value={newNombre}
            onChange={e => setNewNombre(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addDecision()}
            placeholder="+ Nueva decisión…"
            style={{
              background: 'var(--bg-surface)', border: `1px dashed ${C_BORDER}`,
              borderRadius: 7, padding: '5px 9px', color: 'var(--text-hi)',
              fontFamily: 'Raleway, sans-serif', fontSize: 12, outline: 'none',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = C)}
            onBlur={e => (e.currentTarget.style.borderColor = C_BORDER)}
          />
          <span />
          <span />
          <button
            onClick={addDecision}
            title="Agregar decisión"
            style={{
              background: C_LIGHT, color: C, border: `1px solid ${C_BORDER}`,
              borderRadius: 7, width: 26, height: 26,
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}
          >
            <Plus size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export function PromesaValorSection() {
  const { state, dispatch } = useStrategicStore()
  const items = state.promesaValor
  const [newIntencion, setNewIntencion] = useState('')

  const setItems = (next: PromesaDeValor[]) =>
    dispatch({ type: 'SET_PROMESA_VALOR', items: next })

  const addPV = () => {
    if (!newIntencion.trim()) return
    setItems([...items, { id: crypto.randomUUID(), intencion: newIntencion.trim(), decisiones: [] }])
    setNewIntencion('')
  }

  const updatePV = (id: string, patch: Partial<PromesaDeValor>) =>
    setItems(items.map(pv => pv.id === id ? { ...pv, ...patch } : pv))

  const removePV = (id: string) =>
    setItems(items.filter(pv => pv.id !== id))

  const colTemplate = '56px 1.2fr 110px 2fr 28px'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Table */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-lo)',
        borderRadius: 16, overflow: 'hidden',
      }}>
        {/* Column headers */}
        <div style={{
          display: 'grid', gridTemplateColumns: colTemplate,
          gap: 10, padding: '10px 16px',
          background: C_LIGHT, borderBottom: '1px solid var(--border-lo)',
        }}>
          {['ID', 'Intención / Nombre', 'Modelo', 'Descripción', ''].map((h, i) => (
            <span key={i} style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.09em',
              color: i === 0 ? C : 'var(--text-lo)', textTransform: 'uppercase',
            }}>{h}</span>
          ))}
        </div>

        {/* Promesas */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr' }}>
          {items.map((pv, i) => (
            <PromesaBlock
              key={pv.id}
              pv={pv}
              index={i}
              onUpdate={p => updatePV(pv.id, p)}
              onRemove={() => removePV(pv.id)}
              colTemplate={colTemplate}
            />
          ))}
        </div>

        {/* Add promesa row */}
        <div style={{
          display: 'flex', gap: 8, padding: '12px 16px',
          borderTop: items.length > 0 ? '1px solid var(--border-lo)' : 'none',
          background: C + '04',
        }}>
          <input
            value={newIntencion}
            onChange={e => setNewIntencion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addPV()}
            placeholder="Nueva intención estratégica (PV)…"
            style={{
              flex: 1, background: 'var(--bg-surface)', border: `1px dashed ${C_BORDER}`,
              borderRadius: 9, padding: '9px 13px', color: 'var(--text-hi)',
              fontFamily: 'Raleway, sans-serif', fontSize: 13, outline: 'none',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = C)}
            onBlur={e => (e.currentTarget.style.borderColor = C_BORDER)}
          />
          <button
            onClick={addPV}
            style={{
              background: C, color: '#fff', border: 'none', borderRadius: 9,
              padding: '9px 16px', cursor: 'pointer', fontFamily: 'Raleway, sans-serif',
              fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5,
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            <Plus size={13} /> Promesa
          </button>
        </div>
      </div>

      {items.length === 0 && (
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-lo)', padding: '8px 0' }}>
          Agrega una intención estratégica para comenzar a construir la promesa de valor.
        </p>
      )}
    </div>
  )
}
