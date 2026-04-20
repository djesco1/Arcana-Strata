import { Calendar, Trash2, Plus, AlertCircle } from 'lucide-react'
import { useStrategicStore } from '../../store/strategicStore'
import type { CambioIndicador } from '../../types/strategic'
import { COLORS } from './colors'

const C = COLORS.bac19
const C_LIGHT = C + '1E'
const C_BORDER = C + '40'

export function SituacionObjetivoSection() {
  const { state, dispatch } = useStrategicStore()
  const { situacionObjetivo, indicadoresLogro } = state
  const rows = situacionObjetivo.indicadores

  const setRows = (next: CambioIndicador[]) =>
    dispatch({ type: 'UPDATE_SITUACION', patch: { indicadores: next } })

  const addIndicador = (idIndicador: string) => {
    if (rows.some(r => r.idIndicador === idIndicador)) return
    setRows([...rows, { idIndicador, valorInicial: '', valorObjetivo: '' }])
  }

  const removeRow = (idIndicador: string) =>
    setRows(rows.filter(r => r.idIndicador !== idIndicador))

  const updateRow = (idIndicador: string, field: 'valorInicial' | 'valorObjetivo', val: string) =>
    setRows(rows.map(r => r.idIndicador === idIndicador ? { ...r, [field]: val } : r))

  const available = indicadoresLogro.filter(ind => !rows.some(r => r.idIndicador === ind.id))

  const colTemplate = '60px 2fr 1fr 1fr 28px'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

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
          value={situacionObjetivo.fechaObjetivo}
          onChange={e => dispatch({ type: 'UPDATE_SITUACION', patch: { fechaObjetivo: e.target.value } })}
          style={{
            marginLeft: 'auto', background: 'var(--bg-surface)', border: '1px solid var(--border-md)',
            borderRadius: 8, padding: '6px 10px', color: 'var(--text-hi)',
            fontFamily: 'Raleway, sans-serif', fontSize: 12, outline: 'none', colorScheme: 'dark',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = C)}
          onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-md)')}
        />
      </div>

      {/* Warning if no indicators in BAC-18 */}
      {indicadoresLogro.length === 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
          background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)',
          borderRadius: 12,
        }}>
          <AlertCircle size={14} style={{ color: '#F59E0B', flexShrink: 0 }} />
          <p style={{ fontSize: 12, color: '#F59E0B', lineHeight: 1.5 }}>
            Primero define indicadores en <strong>BAC-18</strong> para poder referenciarlos aqui.
          </p>
        </div>
      )}

      {/* Table */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-lo)',
        borderRadius: 16, overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'grid', gridTemplateColumns: colTemplate,
          gap: 10, padding: '10px 16px',
          background: C_LIGHT, borderBottom: '1px solid var(--border-lo)',
        }}>
          {['ID', 'Indicador (ref BAC-18)', 'Valor inicial', 'Valor objetivo', ''].map((h, i) => (
            <span key={i} style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.09em',
              color: i === 0 ? C : 'var(--text-lo)', textTransform: 'uppercase',
            }}>{h}</span>
          ))}
        </div>

        {/* Rows */}
        {rows.map(row => {
          const ind = indicadoresLogro.find(x => x.id === row.idIndicador)
          return (
            <div key={row.idIndicador} style={{
              display: 'grid', gridTemplateColumns: colTemplate,
              gap: 10, padding: '10px 16px', alignItems: 'center',
              borderBottom: '1px solid var(--border-lo)',
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: C, fontFamily: 'monospace' }}>
                {ind
                  ? String(indicadoresLogro.indexOf(ind) + 1).padStart(2, '0')
                  : '??'}
              </span>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-hi)', marginBottom: 1 }}>
                  {ind?.nombre ?? <span style={{ color: 'var(--text-xdim)', fontStyle: 'italic' }}>Eliminado del catalogo</span>}
                </p>
                {ind?.instrumento && (
                  <p style={{ fontSize: 10, color: 'var(--text-lo)' }}>{ind.instrumento}</p>
                )}
              </div>
              {(['valorInicial', 'valorObjetivo'] as const).map(f => (
                <input
                  key={f}
                  value={row[f]}
                  onChange={e => updateRow(row.idIndicador, f, e.target.value)}
                  placeholder={f === 'valorInicial' ? 'Valor inicial…' : 'Valor objetivo…'}
                  style={{
                    background: 'var(--bg-surface)', border: '1px solid var(--border-md)',
                    borderRadius: 8, padding: '6px 10px',
                    color: f === 'valorObjetivo' ? 'var(--text-hi)' : 'var(--text-md)',
                    fontFamily: 'Raleway, sans-serif', fontSize: 12, outline: 'none',
                    fontWeight: f === 'valorObjetivo' ? 600 : 400,
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = C)}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-md)')}
                />
              ))}
              <button
                onClick={() => removeRow(row.idIndicador)}
                style={{ color: '#F87171', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <Trash2 size={12} />
              </button>
            </div>
          )
        })}

        {/* Add from BAC-18 */}
        {available.length > 0 && (
          <div style={{
            padding: '10px 16px', borderTop: rows.length > 0 ? '1px solid var(--border-lo)' : 'none',
            background: C + '06', display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <Plus size={13} style={{ color: C, flexShrink: 0 }} />
            <select
              value=""
              onChange={e => { if (e.target.value) addIndicador(e.target.value) }}
              style={{
                background: 'var(--bg-surface)', border: `1px dashed ${C_BORDER}`,
                borderRadius: 8, padding: '6px 10px', color: 'var(--text-lo)',
                fontFamily: 'Raleway, sans-serif', fontSize: 12, outline: 'none',
                cursor: 'pointer', flex: 1,
              }}
            >
              <option value="">Agregar indicador del catalogo BAC-18…</option>
              {available.map(ind => (
                <option key={ind.id} value={ind.id}>{ind.nombre}</option>
              ))}
            </select>
          </div>
        )}

        {rows.length === 0 && indicadoresLogro.length > 0 && (
          <div style={{ padding: '24px 16px', textAlign: 'center' }}>
            <p style={{ fontSize: 12, color: 'var(--text-lo)' }}>
              Usa el selector de arriba para agregar indicadores y definir sus valores objetivo.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
