import { useCapabilityStore } from '../../store/capabilitiesStore'
import type { TipoCapacidad } from '../../types/capabilities'
import { CAPABILITY_COLORS as COLORS } from '../../constants/colors'

const C = COLORS.bac33a
const C_LIGHT = C + '1E'

const tipoLabel: Record<TipoCapacidad, string> = {
  misional:       'Misional',
  estrategica:    'Estratégica',
  funcionamiento: 'Funcionamiento',
}
const tipoColor: Record<TipoCapacidad, string> = {
  misional:       COLORS.misional,
  estrategica:    COLORS.estrategica,
  funcionamiento: COLORS.funcionamiento,
}

export function ClasificacionSection() {
  const { state } = useCapabilityStore()
  const paquetes = state.paquetes

  const totalCaps = paquetes.flatMap(p => p.subpaquetes.flatMap(s => s.capacidades))
  const totalCriticas = totalCaps.filter(c => c.critica).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Summary row */}
      <div style={{ display: 'flex', gap: 10 }}>
        {(['misional', 'estrategica', 'funcionamiento'] as TipoCapacidad[]).map(tipo => {
          const count = totalCaps.filter(c => c.tipo === tipo).length
          const tc = tipoColor[tipo]
          return (
            <div key={tipo} style={{ flex: 1, borderRadius: 12, padding: '12px 16px', background: tc + '12', border: `1px solid ${tc}30` }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: tc }}>{count}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: tc, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>{tipoLabel[tipo]}</div>
            </div>
          )
        })}
        <div style={{ flex: 1, borderRadius: 12, padding: '12px 16px', background: '#EF444412', border: '1px solid #EF444430' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#EF4444' }}>{totalCriticas}</div>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>Críticas</div>
        </div>
      </div>

      {/* Hierarchical table */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-lo)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '80px 130px 130px 1fr 110px 60px', gap: 0, padding: '10px 16px', background: C_LIGHT, borderBottom: '1px solid var(--border-lo)' }}>
          {['Paquete', 'Subpaquete', 'ID Cap.', 'Capacidad', 'Tipo', 'Crítica'].map((h, i) => (
            <span key={i} style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.09em', color: i === 0 ? C : 'var(--text-lo)', textTransform: 'uppercase', paddingRight: 12 }}>{h}</span>
          ))}
        </div>

        {paquetes.length === 0 && (
          <div style={{ padding: '24px 16px', textAlign: 'center', fontSize: 12, color: 'var(--text-lo)' }}>
            Define paquetes y capacidades en BAC-31 para visualizar la clasificación.
          </div>
        )}

        {paquetes.map((paq, pi) => {
          const rows = paq.subpaquetes.flatMap((sub, si) =>
            sub.capacidades.map((cap, ci) => ({ paq, pi, sub, si, cap, ci }))
          )
          if (rows.length === 0) {
            return (
              <div key={paq.id} style={{ display: 'grid', gridTemplateColumns: '80px 130px 130px 1fr 110px 60px', gap: 0, padding: '8px 16px', borderBottom: '1px solid var(--border-lo)', alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: C, fontFamily: 'monospace', paddingRight: 12 }}>P-{String(pi + 1).padStart(2, '0')}</span>
                <span style={{ fontSize: 11, color: 'var(--text-hi)', fontWeight: 600, paddingRight: 12 }}>{paq.nombre || '—'}</span>
                <span style={{ fontSize: 11, color: 'var(--text-xdim)', fontStyle: 'italic', gridColumn: 'span 4' }}>Sin capacidades</span>
              </div>
            )
          }

          return rows.map(({ sub, si, cap, ci }, rowIdx) => {
            const isFirstOfPaq = rowIdx === 0
            const isFirstOfSub = ci === 0
            const tc = tipoColor[cap.tipo]
            return (
              <div key={cap.id} style={{ display: 'grid', gridTemplateColumns: '80px 130px 130px 1fr 110px 60px', gap: 0, padding: '7px 16px', borderBottom: '1px solid var(--border-lo)', alignItems: 'center', background: pi % 2 === 0 ? 'transparent' : C + '04' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: isFirstOfPaq ? C : 'transparent', fontFamily: 'monospace', paddingRight: 12 }}>
                  {isFirstOfPaq ? `P-${String(pi + 1).padStart(2, '0')}` : ''}
                </span>
                <span style={{ fontSize: 11, color: isFirstOfSub ? 'var(--text-hi)' : 'transparent', fontWeight: 600, paddingRight: 12 }}>
                  {isFirstOfSub ? (sub.nombre || '—') : ''}
                </span>
                <span style={{ fontSize: 10, color: 'var(--text-md)', fontFamily: 'monospace', paddingRight: 12 }}>
                  P{pi + 1}.{si + 1}.{ci + 1}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-hi)', paddingRight: 12 }}>{cap.nombre || '—'}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: tc, background: tc + '18', border: `1px solid ${tc}30`, borderRadius: 20, padding: '2px 8px', display: 'inline-block', paddingRight: 12 }}>
                  {tipoLabel[cap.tipo]}
                </span>
                <span style={{ fontSize: 12, color: cap.critica ? '#EF4444' : 'var(--text-xdim)', fontWeight: 700 }}>
                  {cap.critica ? '★' : '—'}
                </span>
              </div>
            )
          })
        })}
      </div>
    </div>
  )
}
