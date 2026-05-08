import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useStrategicStore } from '../../store/strategicStore'
import type { IndicadorEjecucion } from '../../types/strategic'
import { STRATEGIC_COLORS as COLORS } from '../../constants/colors'

const C = COLORS.bac26
const C_LIGHT = C + '1E'

export function CatalogoIndEjecucionSection() {
  const { state, dispatch } = useStrategicStore()
  const items = state.medicion.indicadoresEjecucion
  const [draft, setDraft] = useState({ nombre: '', descripcion: '' })

  const setItems = (next: IndicadorEjecucion[]) =>
    dispatch({ type: 'SET_IND_EJECUCION', items: next })

  const add = () => {
    if (!draft.nombre.trim()) return
    setItems([...items, { id: crypto.randomUUID(), ...draft, nombre: draft.nombre.trim() }])
    setDraft({ nombre: '', descripcion: '' })
  }

  const remove = (id: string) => setItems(items.filter(x => x.id !== id))

  const update = (id: string, field: keyof IndicadorEjecucion, val: string) =>
    setItems(items.map(x => x.id === id ? { ...x, [field]: val } : x))

  const cols = ['ID', 'Nombre indicador', 'Descripción', '']
  const colTemplate = '60px 1fr 2fr 28px'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-lo)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: colTemplate, gap: 10, padding: '10px 16px', background: C_LIGHT, borderBottom: '1px solid var(--border-lo)' }}>
          {cols.map((h, i) => (
            <span key={i} style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.09em', color: i === 0 ? C : 'var(--text-lo)', textTransform: 'uppercase' }}>{h}</span>
          ))}
        </div>

        {items.map((item, i) => (
          <div key={item.id} style={{ display: 'grid', gridTemplateColumns: colTemplate, gap: 10, padding: '9px 16px', alignItems: 'center', borderBottom: i < items.length - 1 ? '1px solid var(--border-lo)' : 'none' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C, fontFamily: 'monospace' }}>
              {String(i + 1).padStart(2, '0')}
            </span>
            {(['nombre', 'descripcion'] as const).map(f => (
              <input key={f} value={item[f]} onChange={e => update(item.id, f, e.target.value)}
                style={{ background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-lo)', color: f === 'nombre' ? 'var(--text-hi)' : 'var(--text-md)', fontFamily: 'Raleway, sans-serif', fontSize: 12, fontWeight: f === 'nombre' ? 600 : 400, outline: 'none', padding: '3px 0' }}
                onFocus={e => (e.currentTarget.style.borderBottomColor = C)}
                onBlur={e => (e.currentTarget.style.borderBottomColor = 'var(--border-lo)')} />
            ))}
            <button onClick={() => remove(item.id)} style={{ color: '#F87171', background: 'none', border: 'none', cursor: 'pointer' }}>
              <Trash2 size={12} />
            </button>
          </div>
        ))}

        <div style={{ display: 'grid', gridTemplateColumns: colTemplate, gap: 10, padding: '10px 16px', alignItems: 'center', background: C + '08', borderTop: items.length > 0 ? '1px solid var(--border-lo)' : 'none' }}>
          <span style={{ fontSize: 10, color: 'var(--text-xdim)', fontFamily: 'monospace' }}>
            {String(items.length + 1).padStart(2, '0')}
          </span>
          {(['nombre', 'descripcion'] as const).map((f, i) => (
            <input key={f} value={draft[f]}
              onChange={e => setDraft(d => ({ ...d, [f]: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && add()}
              placeholder={['Nombre del indicador…', 'Descripción…'][i]}
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-md)', borderRadius: 8, padding: '6px 10px', color: 'var(--text-hi)', fontFamily: 'Raleway, sans-serif', fontSize: 12, outline: 'none' }}
              onFocus={e => (e.currentTarget.style.borderColor = C)}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-md)')} />
          ))}
          <button onClick={add} title="Agregar indicador"
            style={{ background: C, color: '#fff', border: 'none', borderRadius: 8, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
            <Plus size={14} />
          </button>
        </div>
      </div>

      {items.length === 0 && (
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-lo)', padding: '16px 0' }}>
          El catálogo está vacío. Agrega indicadores para referenciarlos en el tablero de control BAC-27.
        </p>
      )}
    </div>
  )
}
