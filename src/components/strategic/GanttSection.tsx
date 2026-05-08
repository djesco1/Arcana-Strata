import { AlertCircle } from 'lucide-react'
import { useStrategicStore } from '../../store/strategicStore'
import { STRATEGIC_COLORS as COLORS } from '../../constants/colors'

const C = COLORS.bac24

function monthsBetween(start: string, end: string): string[] {
  if (!start || !end) return []
  const [sy, sm] = start.split('-').map(Number)
  const [ey, em] = end.split('-').map(Number)
  const months: string[] = []
  let y = sy, m = sm
  while (y < ey || (y === ey && m <= em)) {
    months.push(`${y}-${String(m).padStart(2, '0')}`)
    m++; if (m > 12) { m = 1; y++ }
    if (months.length > 120) break // safety cap 10 years
  }
  return months
}

function formatMonth(ym: string): string {
  const [y, m] = ym.split('-')
  const names = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  return `${names[parseInt(m) - 1]} ${y.slice(2)}`
}

function isInRange(month: string, inicio: string, fin: string): boolean {
  if (!inicio || !fin) return false
  return month >= inicio && month <= fin
}

export function GanttSection() {
  const { state } = useStrategicStore()
  const acciones = state.ejecucion?.acciones ?? []
  const withDates = acciones.filter(a => a.fechaInicio && a.fechaFin && a.fechaInicio <= a.fechaFin)

  if (acciones.length === 0) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 18px', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: 12 }}>
      <AlertCircle size={15} style={{ color: '#F59E0B', flexShrink: 0 }} />
      <p style={{ fontSize: 12, color: '#F59E0B', lineHeight: 1.5 }}>Define acciones estratégicas con fechas en <strong>BAC-22</strong> para generar el Gantt.</p>
    </div>
  )

  if (withDates.length === 0) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 18px', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: 12 }}>
      <AlertCircle size={15} style={{ color: '#F59E0B', flexShrink: 0 }} />
      <p style={{ fontSize: 12, color: '#F59E0B', lineHeight: 1.5 }}>Asigna <strong>Fecha inicio</strong> y <strong>Fecha fin</strong> a las acciones en BAC-22 para ver el diagrama.</p>
    </div>
  )

  const allStarts = withDates.map(a => a.fechaInicio).sort()
  const allEnds = withDates.map(a => a.fechaFin).sort()
  const globalStart = allStarts[0]
  const globalEnd = allEnds[allEnds.length - 1]
  const months = monthsBetween(globalStart, globalEnd)

  // Group months into years for header
  const years: { label: string; count: number }[] = []
  for (const m of months) {
    const y = m.split('-')[0]
    const last = years[years.length - 1]
    if (last && last.label === y) last.count++
    else years.push({ label: y, count: 1 })
  }

  const LABEL_W = 120
  const CELL_W = 40
  const ROW_H = 36

  const totalW = LABEL_W + months.length * CELL_W

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-lo)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: totalW }}>

            {/* Year header */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-lo)' }}>
              <div style={{ width: LABEL_W, flexShrink: 0, background: C + '15', borderRight: '1px solid var(--border-lo)' }} />
              {years.map(yr => (
                <div key={yr.label}
                  style={{ width: yr.count * CELL_W, textAlign: 'center', padding: '5px 0', fontSize: 11, fontWeight: 700, color: C, background: C + '10', borderRight: '1px solid var(--border-lo)' }}>
                  {yr.label}
                </div>
              ))}
            </div>

            {/* Month header */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-lo)' }}>
              <div style={{ width: LABEL_W, flexShrink: 0, padding: '5px 10px', fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', color: C, textTransform: 'uppercase', background: C + '15', borderRight: '1px solid var(--border-lo)' }}>
                Acción
              </div>
              {months.map(m => (
                <div key={m} style={{ width: CELL_W, flexShrink: 0, textAlign: 'center', padding: '4px 0', fontSize: 9, color: 'var(--text-lo)', borderRight: '1px solid var(--border-lo)' }}>
                  {formatMonth(m)}
                </div>
              ))}
            </div>

            {/* Action rows */}
            {acciones.map((a, i) => {
              const code = `AE-${String(i + 1).padStart(2, '0')}`
              return (
                <div key={a.id} style={{ display: 'flex', borderBottom: '1px solid var(--border-lo)', height: ROW_H }}>
                  <div style={{ width: LABEL_W, flexShrink: 0, padding: '0 10px', display: 'flex', alignItems: 'center', gap: 6, borderRight: '1px solid var(--border-lo)', background: 'var(--bg-surface)' }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: C, fontFamily: 'monospace' }}>{code}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-md)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.nombre}</span>
                  </div>
                  {months.map(m => {
                    const active = isInRange(m, a.fechaInicio, a.fechaFin)
                    const isStart = m === a.fechaInicio
                    const isEnd = m === a.fechaFin
                    return (
                      <div key={m} style={{
                        width: CELL_W, flexShrink: 0, height: '100%', display: 'flex', alignItems: 'center',
                        borderRight: '1px solid var(--border-lo)',
                        background: active ? C + '30' : 'transparent',
                        borderLeft: isStart ? `2px solid ${C}` : undefined,
                        borderRightColor: isEnd ? C : undefined,
                      }} />
                    )
                  })}
                </div>
              )
            })}

            {/* Cost row */}
            <div style={{ display: 'flex', background: C + '06' }}>
              <div style={{ width: LABEL_W, flexShrink: 0, padding: '6px 10px', fontSize: 10, fontWeight: 700, color: 'var(--text-lo)', textTransform: 'uppercase', letterSpacing: '0.07em', borderRight: '1px solid var(--border-lo)' }}>
                Costo
              </div>
              {months.map(m => {
                const costoMes = acciones
                  .filter(a => isInRange(m, a.fechaInicio, a.fechaFin) && a.costo)
                  .map(a => a.costo)
                return (
                  <div key={m} style={{ width: CELL_W, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid var(--border-lo)' }}>
                    {costoMes.length > 0 && (
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: C, opacity: 0.7 }} />
                    )}
                  </div>
                )
              })}
            </div>

          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--text-lo)', paddingLeft: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 20, height: 10, background: C + '30', border: `1px solid ${C}`, borderRadius: 2 }} />
          Duración acción
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: C }} />
          Mes con costo
        </div>
      </div>
    </div>
  )
}
