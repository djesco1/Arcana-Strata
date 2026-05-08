import { useState } from 'react'
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import { useCapabilityStore } from '../../store/capabilitiesStore'
import type { Paquete, Subpaquete, Capacidad, TipoCapacidad } from '../../types/capabilities'
import { CAPABILITY_COLORS as COLORS } from '../../constants/colors'

const C = COLORS.bac31
const C_LIGHT = C + '1E'

const TIPO_OPTS: { value: TipoCapacidad; label: string }[] = [
  { value: 'misional',       label: 'Misional' },
  { value: 'estrategica',    label: 'Estratégica' },
  { value: 'funcionamiento', label: 'Funcionamiento' },
]

const tipoColor: Record<TipoCapacidad, string> = {
  misional:       COLORS.misional,
  estrategica:    COLORS.estrategica,
  funcionamiento: COLORS.funcionamiento,
}

function emptyCapacidad(): Capacidad {
  return { id: crypto.randomUUID(), nombre: '', descripcion: '', tipo: 'misional', critica: false }
}
function emptySubpaquete(): Subpaquete {
  return { id: crypto.randomUUID(), nombre: '', capacidades: [] }
}
function emptyPaquete(): Paquete {
  return { id: crypto.randomUUID(), nombre: '', descripcion: '', subpaquetes: [] }
}

function CapacidadRow({ cap, index, onUpdate, onRemove }: {
  cap: Capacidad; index: number
  onUpdate: (p: Partial<Capacidad>) => void
  onRemove: () => void
}) {
  const tc = tipoColor[cap.tipo]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 1.2fr 110px 60px 28px', gap: 8, padding: '6px 12px', alignItems: 'center', borderBottom: '1px solid var(--border-lo)' }}>
      <span style={{ fontSize: 10, fontFamily: 'monospace', color: C }}>
        C-{String(index + 1).padStart(2, '0')}
      </span>
      <input value={cap.nombre} onChange={e => onUpdate({ nombre: e.target.value })} placeholder="Nombre…"
        style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-lo)', color: 'var(--text-hi)', fontFamily: 'Raleway, sans-serif', fontSize: 11, fontWeight: 600, outline: 'none', padding: '2px 0' }}
        onFocus={e => (e.currentTarget.style.borderBottomColor = C)}
        onBlur={e => (e.currentTarget.style.borderBottomColor = 'var(--border-lo)')} />
      <input value={cap.descripcion} onChange={e => onUpdate({ descripcion: e.target.value })} placeholder="Descripción…"
        style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-lo)', color: 'var(--text-md)', fontFamily: 'Raleway, sans-serif', fontSize: 11, outline: 'none', padding: '2px 0' }}
        onFocus={e => (e.currentTarget.style.borderBottomColor = C)}
        onBlur={e => (e.currentTarget.style.borderBottomColor = 'var(--border-lo)')} />
      <select value={cap.tipo} onChange={e => onUpdate({ tipo: e.target.value as TipoCapacidad })}
        style={{ background: tc + '18', border: `1px solid ${tc}40`, borderRadius: 20, padding: '2px 6px', color: tc, fontFamily: 'Raleway, sans-serif', fontSize: 10, fontWeight: 700, outline: 'none', cursor: 'pointer' }}>
        {TIPO_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 11, color: cap.critica ? '#EF4444' : 'var(--text-lo)', fontWeight: cap.critica ? 700 : 400, userSelect: 'none' }}>
        <input type="checkbox" checked={cap.critica} onChange={e => onUpdate({ critica: e.target.checked })} style={{ accentColor: '#EF4444' }} />
        Crítica
      </label>
      <button onClick={onRemove} style={{ color: '#F87171', background: 'none', border: 'none', cursor: 'pointer' }}>
        <Trash2 size={11} />
      </button>
    </div>
  )
}

function SubpaqueteBlock({ sub, subIndex, onUpdate, onRemove }: {
  sub: Subpaquete; subIndex: number
  onUpdate: (p: Partial<Subpaquete>) => void
  onRemove: () => void
}) {
  const [expanded, setExpanded] = useState(true)

  const addCap = () => onUpdate({ capacidades: [...sub.capacidades, emptyCapacidad()] })
  const removeCap = (id: string) => onUpdate({ capacidades: sub.capacidades.filter(c => c.id !== id) })
  const updateCap = (id: string, patch: Partial<Capacidad>) =>
    onUpdate({ capacidades: sub.capacidades.map(c => c.id === id ? { ...c, ...patch } : c) })

  return (
    <div style={{ marginLeft: 20, marginBottom: 6, border: `1px solid ${C}25`, borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', background: C + '0A', borderBottom: expanded ? `1px solid ${C}20` : 'none' }}>
        <button onClick={() => setExpanded(e => !e)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C, padding: 0 }}>
          {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </button>
        <span style={{ fontSize: 10, fontWeight: 800, color: C, fontFamily: 'monospace', flexShrink: 0 }}>
          S-{String(subIndex + 1).padStart(2, '0')}
        </span>
        <input value={sub.nombre} onChange={e => onUpdate({ nombre: e.target.value })} placeholder="Nombre del subpaquete…"
          style={{ flex: 1, background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-lo)', color: 'var(--text-hi)', fontFamily: 'Raleway, sans-serif', fontSize: 11, fontWeight: 600, outline: 'none', padding: '2px 0' }}
          onFocus={e => (e.currentTarget.style.borderBottomColor = C)}
          onBlur={e => (e.currentTarget.style.borderBottomColor = 'var(--border-lo)')} />
        <span style={{ fontSize: 10, color: 'var(--text-xdim)' }}>{sub.capacidades.length} cap.</span>
        <button onClick={onRemove} style={{ color: '#F87171', background: 'none', border: 'none', cursor: 'pointer' }}>
          <Trash2 size={11} />
        </button>
      </div>

      {expanded && (
        <>
          {sub.capacidades.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 1.2fr 110px 60px 28px', gap: 8, padding: '5px 12px', background: C + '06' }}>
              {['ID', 'Nombre', 'Descripción', 'Tipo', 'Crítica', ''].map((h, i) => (
                <span key={i} style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-lo)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</span>
              ))}
            </div>
          )}
          {sub.capacidades.map((cap, ci) => (
            <CapacidadRow key={cap.id} cap={cap} index={ci}
              onUpdate={p => updateCap(cap.id, p)}
              onRemove={() => removeCap(cap.id)} />
          ))}
          <div style={{ padding: '8px 12px', background: C + '04' }}>
            <button onClick={addCap}
              style={{ background: 'none', border: `1px dashed ${C}50`, borderRadius: 6, padding: '4px 10px', color: C, fontFamily: 'Raleway, sans-serif', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Plus size={11} /> Capacidad
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function PaqueteRow({ paquete, index, onUpdate, onRemove }: {
  paquete: Paquete; index: number
  onUpdate: (p: Partial<Paquete>) => void
  onRemove: () => void
}) {
  const [expanded, setExpanded] = useState(true)

  const addSub = () => onUpdate({ subpaquetes: [...paquete.subpaquetes, emptySubpaquete()] })
  const removeSub = (id: string) => onUpdate({ subpaquetes: paquete.subpaquetes.filter(s => s.id !== id) })
  const updateSub = (id: string, patch: Partial<Subpaquete>) =>
    onUpdate({ subpaquetes: paquete.subpaquetes.map(s => s.id === id ? { ...s, ...patch } : s) })

  const totalCaps = paquete.subpaquetes.reduce((s, sp) => s + sp.capacidades.length, 0)

  return (
    <div style={{ border: '1px solid var(--border-lo)', borderRadius: 14, overflow: 'hidden', marginBottom: 8 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '54px 1fr 1.5fr auto 28px', gap: 10, padding: '10px 16px', background: C_LIGHT, borderBottom: expanded ? '1px solid var(--border-lo)' : 'none', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button onClick={() => setExpanded(e => !e)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C, padding: 0 }}>
            {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          </button>
          <span style={{ fontSize: 11, fontWeight: 800, color: C, fontFamily: 'monospace' }}>
            P-{String(index + 1).padStart(2, '0')}
          </span>
        </div>
        <input value={paquete.nombre} onChange={e => onUpdate({ nombre: e.target.value })} placeholder="Nombre del paquete…"
          style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-lo)', color: 'var(--text-hi)', fontFamily: 'Raleway, sans-serif', fontSize: 12, fontWeight: 700, outline: 'none', padding: '3px 0' }}
          onFocus={e => (e.currentTarget.style.borderBottomColor = C)}
          onBlur={e => (e.currentTarget.style.borderBottomColor = 'var(--border-lo)')} />
        <input value={paquete.descripcion} onChange={e => onUpdate({ descripcion: e.target.value })} placeholder="Descripción…"
          style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-lo)', color: 'var(--text-md)', fontFamily: 'Raleway, sans-serif', fontSize: 11, outline: 'none', padding: '3px 0' }}
          onFocus={e => (e.currentTarget.style.borderBottomColor = C)}
          onBlur={e => (e.currentTarget.style.borderBottomColor = 'var(--border-lo)')} />
        <span style={{ fontSize: 10, color: 'var(--text-xdim)', whiteSpace: 'nowrap' }}>
          {paquete.subpaquetes.length} sub · {totalCaps} cap.
        </span>
        <button onClick={onRemove} style={{ color: '#F87171', background: 'none', border: 'none', cursor: 'pointer' }}>
          <Trash2 size={12} />
        </button>
      </div>

      {expanded && (
        <div style={{ padding: '12px 16px', background: 'var(--bg-card)' }}>
          {paquete.subpaquetes.map((sub, si) => (
            <SubpaqueteBlock key={sub.id} sub={sub} subIndex={si}
              onUpdate={p => updateSub(sub.id, p)}
              onRemove={() => removeSub(sub.id)} />
          ))}
          <button onClick={addSub}
            style={{ background: 'none', border: `1px dashed ${C}40`, borderRadius: 8, padding: '5px 12px', color: C, fontFamily: 'Raleway, sans-serif', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
            <Plus size={12} /> Subpaquete
          </button>
        </div>
      )}
    </div>
  )
}

export function CatalogoPaquetesSection() {
  const { state, dispatch } = useCapabilityStore()
  const paquetes = state.paquetes

  const set = (items: Paquete[]) => dispatch({ type: 'SET_PAQUETES', items })
  const add = () => set([...paquetes, emptyPaquete()])
  const remove = (id: string) => set(paquetes.filter(p => p.id !== id))
  const update = (id: string, patch: Partial<Paquete>) =>
    set(paquetes.map(p => p.id === id ? { ...p, ...patch } : p))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {paquetes.map((p, i) => (
        <PaqueteRow key={p.id} paquete={p} index={i}
          onUpdate={patch => update(p.id, patch)}
          onRemove={() => remove(p.id)} />
      ))}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
        <button onClick={add}
          style={{ background: C, color: '#fff', border: 'none', borderRadius: 9, padding: '8px 18px', cursor: 'pointer', fontFamily: 'Raleway, sans-serif', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
          <Plus size={13} /> Paquete
        </button>
      </div>

      {paquetes.length === 0 && (
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-lo)', padding: '12px 0' }}>
          Define los paquetes de capacidades con sus subpaquetes y capacidades individuales.
        </p>
      )}
    </div>
  )
}
