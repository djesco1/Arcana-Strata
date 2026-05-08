import { Plus, Trash2 } from 'lucide-react'
import { useStrategicStore } from '../../store/strategicStore'
import type { EntradaTableroControl } from '../../types/strategic'
import { STRATEGIC_COLORS as COLORS } from '../../constants/colors'

const C = COLORS.bac27
const C_LIGHT = C + '1E'

const ESTADOS = ['bien', 'atrasado', 'en estado crítico']

function emptyEntrada(): EntradaTableroControl {
  return { id: crypto.randomUUID(), idAccion: '', idIndicador: '', valorActual: '', valorEsperado: '', estado: '' }
}

const estadoColor = (e: string) =>
  e === 'bien' ? '#16A34A' : e === 'atrasado' ? '#D97706' : e === 'en estado crítico' ? '#DC2626' : 'var(--text-hi)'

export function TableroControlSection() {
  const { state, dispatch } = useStrategicStore()
  const items = state.medicion.tableroControl
  const acciones = state.ejecucion?.acciones ?? []
  const indicadores = state.medicion.indicadoresEjecucion

  const setItems = (next: EntradaTableroControl[]) => dispatch({ type: 'SET_TABLERO', items: next })
  const add = () => setItems([...items, emptyEntrada()])
  const remove = (id: string) => setItems(items.filter(x => x.id !== id))
  const update = (id: string, patch: Partial<EntradaTableroControl>) =>
    setItems(items.map(x => x.id === id ? { ...x, ...patch } : x))

  const cols = ['ID Acción', 'ID Indicador', 'Valor actual', 'Valor esperado', 'Estado', '']
  const colTemplate = '1.5fr 1.5fr 1fr 1fr 130px 28px'

  const selStyle = { background: 'var(--bg-surface)', border: '1px solid var(--border-md)', borderRadius: 6, padding: '3px 6px', color: 'var(--text-hi)', fontFamily: 'Raleway, sans-serif', fontSize: 11, outline: 'none', cursor: 'pointer', width: '100%' }
  const inpStyle = { background: 'transparent', border: 'none', borderBottom: '1px solid var(--border-lo)', color: 'var(--text-md)', fontFamily: 'Raleway, sans-serif', fontSize: 12, outline: 'none', padding: '3px 0', width: '100%' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-lo)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: colTemplate, gap: 10, padding: '10px 16px', background: C_LIGHT, borderBottom: '1px solid var(--border-lo)' }}>
          {cols.map((h, i) => (
            <span key={i} style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.09em', color: i === 0 ? C : 'var(--text-lo)', textTransform: 'uppercase' }}>{h}</span>
          ))}
        </div>

        {items.map(item => (
          <div key={item.id} style={{ display: 'grid', gridTemplateColumns: colTemplate, gap: 10, padding: '9px 16px', alignItems: 'center', borderBottom: '1px solid var(--border-lo)' }}>
            <select value={item.idAccion} onChange={e => update(item.id, { idAccion: e.target.value })} style={selStyle}>
              <option value="">Acción…</option>
              {acciones.map((a, i) => (
                <option key={a.id} value={a.id}>{`AE-${String(i + 1).padStart(2, '0')} ${a.nombre}`}</option>
              ))}
            </select>
            <select value={item.idIndicador} onChange={e => update(item.id, { idIndicador: e.target.value })} style={selStyle}>
              <option value="">Indicador…</option>
              {indicadores.map((ind, i) => (
                <option key={ind.id} value={ind.id}>{`${String(i + 1).padStart(2, '0')} ${ind.nombre}`}</option>
              ))}
            </select>
            <input value={item.valorActual} onChange={e => update(item.id, { valorActual: e.target.value })}
              placeholder="Actual…" style={inpStyle}
              onFocus={e => (e.currentTarget.style.borderBottomColor = C)}
              onBlur={e => (e.currentTarget.style.borderBottomColor = 'var(--border-lo)')} />
            <input value={item.valorEsperado} onChange={e => update(item.id, { valorEsperado: e.target.value })}
              placeholder="Esperado…" style={inpStyle}
              onFocus={e => (e.currentTarget.style.borderBottomColor = C)}
              onBlur={e => (e.currentTarget.style.borderBottomColor = 'var(--border-lo)')} />
            <select value={item.estado} onChange={e => update(item.id, { estado: e.target.value })}
              style={{ ...selStyle, color: estadoColor(item.estado), fontWeight: item.estado ? 600 : 400 }}>
              <option value="">Estado…</option>
              {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
            <button onClick={() => remove(item.id)} style={{ color: '#F87171', background: 'none', border: 'none', cursor: 'pointer' }}>
              <Trash2 size={12} />
            </button>
          </div>
        ))}

        <div style={{ padding: '12px 16px', background: C + '04', borderTop: items.length > 0 ? '1px solid var(--border-lo)' : 'none', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={add}
            style={{ background: C, color: '#fff', border: 'none', borderRadius: 9, padding: '8px 16px', cursor: 'pointer', fontFamily: 'Raleway, sans-serif', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
            <Plus size={13} /> Entrada de control
          </button>
        </div>
      </div>

      {(acciones.length === 0 || indicadores.length === 0) && (
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-lo)', padding: '8px 0' }}>
          {acciones.length === 0
            ? 'Define acciones en BAC-22 para completar el tablero.'
            : 'Define indicadores de ejecución en BAC-26 para completar el tablero.'}
        </p>
      )}
    </div>
  )
}
