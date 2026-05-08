import { useCapabilityStore } from '../../store/capabilitiesStore'
import type { TipoCapacidad } from '../../types/capabilities'
import { CAPABILITY_COLORS as COLORS } from '../../constants/colors'

const C = COLORS.bac33b

const tipoLabel: Record<TipoCapacidad, string> = {
  misional:       'Mis.',
  estrategica:    'Est.',
  funcionamiento: 'Fun.',
}
const tipoColor: Record<TipoCapacidad, string> = {
  misional:       COLORS.misional,
  estrategica:    COLORS.estrategica,
  funcionamiento: COLORS.funcionamiento,
}

const PKG_PALETTE = [
  { border: '#6D28D9', bg: '#6D28D908' },
  { border: '#0369A1', bg: '#0369A108' },
  { border: '#0F766E', bg: '#0F766E08' },
  { border: '#B45309', bg: '#B4530908' },
  { border: '#9D174D', bg: '#9D174D08' },
  { border: '#166534', bg: '#16653408' },
  { border: '#1E3A8A', bg: '#1E3A8A08' },
  { border: '#92400E', bg: '#92400E08' },
]

export function MapaCapacidadesSection() {
  const { state } = useCapabilityStore()
  const paquetes = state.paquetes

  if (paquetes.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 320, borderRadius: 16, border: `2px dashed ${C}40`, background: C + '06', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 32, opacity: 0.3 }}>⬡</div>
        <p style={{ fontSize: 13, color: 'var(--text-lo)', margin: 0 }}>Define paquetes y capacidades en BAC-31 para visualizar el mapa.</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {(['misional', 'estrategica', 'funcionamiento'] as TipoCapacidad[]).map(tipo => (
          <div key={tipo} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: tipoColor[tipo] }} />
            <span style={{ fontSize: 11, color: 'var(--text-md)' }}>{tipo.charAt(0).toUpperCase() + tipo.slice(1)}</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12, color: '#EF4444' }}>★</span>
          <span style={{ fontSize: 11, color: 'var(--text-md)' }}>Crítica</span>
        </div>
      </div>

      {/* Visual nested boxes */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18 }}>
        {paquetes.map((paq, pi) => {
          const palette = PKG_PALETTE[pi % PKG_PALETTE.length]
          const allCaps = paq.subpaquetes.flatMap(s => s.capacidades)
          return (
            <div key={paq.id} style={{
              border: `2px solid ${palette.border}50`,
              borderRadius: 18,
              background: palette.bg,
              padding: 16,
              minWidth: 280,
              flex: '1 1 320px',
              boxShadow: `0 0 0 1px ${palette.border}15`,
            }}>
              {/* Package header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: palette.border, fontFamily: 'monospace', background: palette.border + '18', padding: '1px 6px', borderRadius: 20 }}>
                      P-{String(pi + 1).padStart(2, '0')}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-hi)' }}>{paq.nombre || 'Sin nombre'}</span>
                  </div>
                  {paq.descripcion && (
                    <p style={{ fontSize: 11, color: 'var(--text-lo)', margin: 0, lineHeight: 1.4 }}>{paq.descripcion}</p>
                  )}
                </div>
                <span style={{ fontSize: 10, color: 'var(--text-xdim)', whiteSpace: 'nowrap', marginLeft: 8 }}>
                  {allCaps.length} cap.
                </span>
              </div>

              {/* Subpackages */}
              {paq.subpaquetes.length === 0 && (
                <p style={{ fontSize: 11, color: 'var(--text-xdim)', fontStyle: 'italic', padding: '8px 0' }}>Sin subpaquetes</p>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {paq.subpaquetes.map((sub, si) => (
                  <div key={sub.id} style={{
                    border: `1px solid ${palette.border}30`,
                    borderRadius: 12,
                    background: 'var(--bg-card)',
                    padding: '10px 12px',
                  }}>
                    {/* Subpackage header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <span style={{ fontSize: 9, fontWeight: 800, color: palette.border, fontFamily: 'monospace' }}>
                        S-{String(si + 1).padStart(2, '0')}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-hi)' }}>{sub.nombre || 'Sin nombre'}</span>
                      <span style={{ fontSize: 9, color: 'var(--text-xdim)', marginLeft: 'auto' }}>{sub.capacidades.length} cap.</span>
                    </div>

                    {/* Capacidad chips */}
                    {sub.capacidades.length === 0 && (
                      <p style={{ fontSize: 10, color: 'var(--text-xdim)', fontStyle: 'italic', margin: 0 }}>Sin capacidades</p>
                    )}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {sub.capacidades.map((cap, ci) => {
                        const tc = tipoColor[cap.tipo]
                        return (
                          <div key={cap.id} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            background: tc + '15',
                            border: `1px solid ${tc}35`,
                            borderRadius: 20,
                            padding: '3px 9px 3px 6px',
                            fontSize: 11,
                          }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: tc, flexShrink: 0 }} />
                            <span style={{ color: 'var(--text-hi)', fontWeight: 600, lineHeight: 1.3 }}>
                              {cap.nombre || `C-${String(ci + 1).padStart(2, '0')}`}
                            </span>
                            <span style={{ fontSize: 9, color: tc, fontWeight: 700 }}>{tipoLabel[cap.tipo]}</span>
                            {cap.critica && <span style={{ fontSize: 10, color: '#EF4444', lineHeight: 1 }}>★</span>}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
