import { useState } from 'react'
import { Maximize2, X } from 'lucide-react'
import { useStrategicStore } from '../../store/strategicStore'
import { STRATEGIC_COLORS as COLORS } from '../../constants/colors'
import type { StrategicState } from '../../types/strategic'

// ── Shared primitives ────────────────────────────────────────────────────────

function LevelLabel({ label, code, color }: { label: string; code: string; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
      <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 10, background: color + '20', color, letterSpacing: '0.06em' }}>
        {code}
      </span>
      <span style={{ fontSize: 10, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        {label}
      </span>
    </div>
  )
}

// SVG connector: 1 parent → N children using space-around percentages
function CascadeConnector({ count, color }: { count: number; color: string }) {
  if (count === 0) return <div style={{ height: 20 }} />
  const stroke = color + '70'
  if (count === 1) return (
    <div style={{ height: 20, display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: 1, height: '100%', background: stroke }} />
    </div>
  )
  const centers = Array.from({ length: count }, (_, i) => (2 * i + 1) / (2 * count) * 100)
  return (
    <div style={{ height: 24, position: 'relative' }}>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        viewBox="0 0 100 24" preserveAspectRatio="none">
        <line x1="50" y1="0" x2="50" y2="10" stroke={stroke} strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
        <line x1={centers[0]} y1="10" x2={centers[count - 1]} y2="10" stroke={stroke} strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
        {centers.map((cx, i) => (
          <line key={i} x1={cx} y1="10" x2={cx} y2="24" stroke={stroke} strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
    </div>
  )
}

// ── Full expanded map ─────────────────────────────────────────────────────────

function FullCard({ title, subtitle, content, color, empty }: {
  title: string; subtitle?: string; content?: string; color: string; empty?: boolean
}) {
  return (
    <div style={{
      background: 'var(--bg-surface)', borderRadius: 12,
      border: `1px solid ${color}25`, borderTop: `3px solid ${color}`,
      padding: '12px 14px', opacity: empty ? 0.45 : 1,
      minWidth: 0, flex: 1,
    }}>
      {subtitle && (
        <p style={{ fontSize: 9, fontWeight: 700, color, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 4 }}>
          {subtitle}
        </p>
      )}
      <p style={{ fontSize: 12, fontWeight: 700, color: empty ? 'var(--text-dim)' : 'var(--text-hi)', lineHeight: 1.4, marginBottom: content ? 6 : 0 }}>
        {title}
      </p>
      {content && (
        <p style={{ fontSize: 11, color: 'var(--text-lo)', lineHeight: 1.5 }}>
          {content.length > 90 ? content.slice(0, 90) + '…' : content}
        </p>
      )}
    </div>
  )
}

function ExpandedMap({ state, onClose }: { state: StrategicState; onClose: () => void }) {
  const m = state.motivacional
  const promesas = state.promesaValor ?? []
  const decisiones = promesas.flatMap(pv => (pv.decisiones ?? []).map(d => ({ ...d, intencion: pv.intencion })))
  const objetivos = state.objetivos.objetivos
  const fecha = state.objetivos.fechaObjetivo

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: 'var(--bg-base)', borderRadius: 20,
        border: '1px solid var(--border-md)', boxShadow: 'var(--shadow-panel)',
        width: '100%', maxWidth: 1140, maxHeight: '92vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 24px', borderBottom: '1px solid var(--border-lo)',
          display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
          background: 'var(--bg-surface)',
        }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-hi)', margin: 0 }}>
              Mapa Estratégico en Cascada
            </p>
            {fecha && (
              <p style={{ fontSize: 11, color: 'var(--text-lo)', marginTop: 2 }}>
                Horizonte: {new Date(fecha + 'T00:00:00').toLocaleDateString('es', { year: 'numeric', month: 'long' })}
              </p>
            )}
          </div>
          <button onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 4, borderRadius: 8, display: 'flex' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-hi)'; (e.currentTarget as HTMLElement).style.background = 'var(--bg-card-hover)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-dim)'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}
          >
            <X size={16} strokeWidth={1.8} />
          </button>
        </div>

        {/* Cascade content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '32px 48px' }}>

          {/* L1: Propósito */}
          <LevelLabel label="Propósito Superior" code="BAC-17" color={COLORS.bac17} />
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '52%' }}>
              <FullCard
                title={m.propositoSuperior || 'Propósito no definido'}
                subtitle="Para qué existimos"
                color={COLORS.bac17}
                empty={!m.propositoSuperior}
              />
            </div>
          </div>

          <CascadeConnector count={3} color={COLORS.bac17} />

          {/* L2: BHAG / Visión / Misión */}
          <LevelLabel label="Fundamentos Estratégicos" code="BAC-17" color={COLORS.bac17} />
          <div style={{ display: 'flex', gap: 16 }}>
            <FullCard title={m.objetivoRetador || 'BHAG no definido'} subtitle="Objetivo Retador" color={COLORS.bac17} empty={!m.objetivoRetador} />
            <FullCard title={m.vision || 'Visión no definida'} subtitle="Visión" color={COLORS.bac17} empty={!m.vision} />
            <FullCard title={m.mision || 'Misión no definida'} subtitle="Misión" color={COLORS.bac17} empty={!m.mision} />
          </div>

          {/* L3: Decisiones */}
          <CascadeConnector count={Math.max(1, Math.min(decisiones.length, 5))} color={COLORS.bac21} />
          <LevelLabel label="Promesa de Valor" code="BAC-21" color={COLORS.bac21} />
          {decisiones.length > 0
            ? (
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {decisiones.map(d => (
                  <div key={d.id} style={{ flex: '1 1 180px', minWidth: 150, maxWidth: 260 }}>
                    <FullCard title={d.nombre} subtitle={d.intencion || 'Decisión'} content={d.descripcion} color={COLORS.bac21} />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: '40%' }}>
                  <FullCard title="Sin decisiones estratégicas" color={COLORS.bac21} empty />
                </div>
              </div>
            )
          }

          {/* L4: Objetivos */}
          <CascadeConnector count={Math.max(1, Math.min(objetivos.length, 5))} color={COLORS.bac20} />
          <LevelLabel label="Objetivos Estratégicos" code="BAC-20" color={COLORS.bac20} />
          {objetivos.length > 0
            ? (
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {objetivos.map(obj => (
                  <div key={obj.id} style={{ flex: '1 1 200px', minWidth: 170 }}>
                    <div style={{
                      background: 'var(--bg-surface)', borderRadius: 12,
                      border: `1px solid ${COLORS.bac20}25`, borderTop: `3px solid ${COLORS.bac20}`,
                      padding: '12px 14px',
                    }}>
                      <p style={{ fontSize: 9, fontWeight: 700, color: COLORS.bac20, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
                        Objetivo
                      </p>
                      <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-hi)', marginBottom: 8, lineHeight: 1.4 }}>
                        {obj.nombre}
                      </p>
                      {obj.metas.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {obj.metas.map(meta => (
                            <span key={meta.id} style={{
                              fontSize: 10, padding: '2px 7px', borderRadius: 20,
                              background: COLORS.bac20 + '18', color: COLORS.bac20, fontWeight: 600,
                            }}>
                              {meta.nombre.length > 26 ? meta.nombre.slice(0, 26) + '…' : meta.nombre}
                            </span>
                          ))}
                        </div>
                      )}
                      {obj.metas.length === 0 && (
                        <p style={{ fontSize: 10, color: 'var(--text-xdim)', fontStyle: 'italic' }}>Sin metas</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: '40%' }}>
                  <FullCard title="Sin objetivos estratégicos" color={COLORS.bac20} empty />
                </div>
              </div>
            )
          }

          {/* Valores row */}
          {m.valores.length > 0 && (
            <div style={{ marginTop: 36, paddingTop: 24, borderTop: '1px solid var(--border-lo)' }}>
              <LevelLabel label="Valores y Principios" code="BAC-17" color={COLORS.bac17} />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {m.valores.map(v => (
                  <div key={v.id} style={{
                    background: COLORS.bac17 + '12', border: `1px solid ${COLORS.bac17}30`,
                    borderRadius: 10, padding: '8px 12px',
                  }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: COLORS.bac17, marginBottom: v.descripcion ? 2 : 0 }}>{v.nombre}</p>
                    {v.descripcion && <p style={{ fontSize: 10, color: 'var(--text-lo)', lineHeight: 1.4 }}>{v.descripcion}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Compact panel (right sidebar) ────────────────────────────────────────────

function MiniCard({ label, text, color }: { label: string; text: string; color: string }) {
  return (
    <div style={{ borderLeft: `2px solid ${color}60`, paddingLeft: 8, marginBottom: 4 }}>
      <p style={{ fontSize: 9, fontWeight: 700, color, marginBottom: 1, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
      <p style={{ fontSize: 10, color: 'var(--text-md)', lineHeight: 1.4 }}>
        {text.length > 62 ? text.slice(0, 62) + '…' : text}
      </p>
    </div>
  )
}


function LevelChip({ color, code, label }: { color: string; code: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 7 }}>
      <span style={{ fontSize: 8, fontWeight: 700, padding: '1px 5px', borderRadius: 8, background: color + '20', color, letterSpacing: '0.05em' }}>
        BAC-{code}
      </span>
      <span style={{ fontSize: 9, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
    </div>
  )
}

function CompactCascade({ state }: { state: StrategicState }) {
  const m = state.motivacional
  const promesas = state.promesaValor ?? []
  const decisiones = promesas.flatMap(pv => (pv.decisiones ?? []).map(d => ({ ...d, intencion: pv.intencion })))
  const objetivos = state.objetivos.objetivos

  const empty = (msg: string) => (
    <p style={{ fontSize: 10, color: 'var(--text-xdim)', fontStyle: 'italic', paddingLeft: 2, marginBottom: 4 }}>{msg}</p>
  )

  return (
    <div style={{ padding: '14px 14px', overflow: 'auto' }}>

      {/* Propósito */}
      <LevelChip color={COLORS.bac17} code="17" label="Propósito" />
      {m.propositoSuperior
        ? <MiniCard label="Para qué existimos" text={m.propositoSuperior} color={COLORS.bac17} />
        : empty('Sin propósito definido')
      }

      {/* Fundamentos */}
      <LevelChip color={COLORS.bac17} code="17" label="Fundamentos" />
      {(m.vision || m.mision || m.objetivoRetador)
        ? <>
            {m.objetivoRetador && <MiniCard label="BHAG" text={m.objetivoRetador} color={COLORS.bac17} />}
            {m.vision && <MiniCard label="Visión" text={m.vision} color={COLORS.bac17} />}
            {m.mision && <MiniCard label="Misión" text={m.mision} color={COLORS.bac17} />}
          </>
        : empty('Sin fundamentos definidos')
      }

      {/* Decisiones */}
      <LevelChip color={COLORS.bac21} code="21" label="Decisiones" />
      {decisiones.length > 0
        ? <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 4 }}>
            {decisiones.slice(0, 4).map(d => (
              <div key={d.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 5 }}>
                {d.intencion && (
                  <span style={{ fontSize: 8, fontWeight: 700, padding: '2px 4px', borderRadius: 5, background: COLORS.bac21 + '20', color: COLORS.bac21, flexShrink: 0, marginTop: 1 }}>
                    {d.intencion}
                  </span>
                )}
                <span style={{ fontSize: 10, color: 'var(--text-md)', lineHeight: 1.4 }}>
                  {d.nombre.length > 42 ? d.nombre.slice(0, 42) + '…' : d.nombre}
                </span>
              </div>
            ))}
            {decisiones.length > 4 && <span style={{ fontSize: 9, color: 'var(--text-lo)' }}>+{decisiones.length - 4} más</span>}
          </div>
        : empty('Sin decisiones estratégicas')
      }

      {/* Objetivos */}
      <LevelChip color={COLORS.bac20} code="20" label="Objetivos" />
      {objetivos.length > 0
        ? <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 4 }}>
            {objetivos.slice(0, 4).map(obj => (
              <div key={obj.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: COLORS.bac20, flexShrink: 0, marginTop: 4 }} />
                <div>
                  <p style={{ fontSize: 10, color: 'var(--text-md)', fontWeight: 600, lineHeight: 1.4 }}>
                    {obj.nombre.length > 46 ? obj.nombre.slice(0, 46) + '…' : obj.nombre}
                  </p>
                  {obj.metas.length > 0 && (
                    <p style={{ fontSize: 9, color: 'var(--text-lo)' }}>{obj.metas.length} {obj.metas.length === 1 ? 'meta' : 'metas'}</p>
                  )}
                </div>
              </div>
            ))}
            {objetivos.length > 4 && <span style={{ fontSize: 9, color: 'var(--text-lo)' }}>+{objetivos.length - 4} más</span>}
          </div>
        : empty('Sin objetivos definidos')
      }

      {/* Valores chips */}
      {m.valores.length > 0 && (
        <>
          <LevelChip color={COLORS.bac17} code="17" label="Valores" />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {m.valores.map(v => (
              <span key={v.id} style={{
                fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 12,
                background: COLORS.bac17 + '18', color: COLORS.bac17,
              }}>
                {v.nombre}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── Export ────────────────────────────────────────────────────────────────────

export function StrategicMap() {
  const { state } = useStrategicStore()
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <div style={{
        width: 240, flexShrink: 0, borderLeft: '1px solid var(--border-lo)',
        background: 'var(--bg-surface)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Panel header */}
        <div style={{
          padding: '12px 14px', borderBottom: '1px solid var(--border-lo)',
          display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
          background: 'var(--bg-surface)',
        }}>
          <span style={{ flex: 1, fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', color: 'var(--text-md)', textTransform: 'uppercase' }}>
            Mapa Estratégico
          </span>
          <button
            onClick={() => setExpanded(true)}
            title="Ver mapa completo"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-lo)', padding: 4, borderRadius: 6,
              display: 'flex', alignItems: 'center',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-hi)'; (e.currentTarget as HTMLElement).style.background = 'var(--bg-card-hover)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-lo)'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}
          >
            <Maximize2 size={13} strokeWidth={1.8} />
          </button>
        </div>

        <div style={{ flex: 1, overflow: 'auto' }}>
          <CompactCascade state={state} />
        </div>
      </div>

      {expanded && <ExpandedMap state={state} onClose={() => setExpanded(false)} />}
    </>
  )
}
