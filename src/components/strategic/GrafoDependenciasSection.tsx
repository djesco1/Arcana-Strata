import { useMemo, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { useStrategicStore } from '../../store/strategicStore'
import type { AccionEstrategica } from '../../types/strategic'
import { COLORS } from './colors'

const C = COLORS.bac25

// ── Topological layering ──────────────────────────────────────────────────────

function buildLayers(acciones: AccionEstrategica[]): AccionEstrategica[][] {
  const idToIdx = new Map(acciones.map((a, i) => [a.id, i]))
  const inDegree = new Array(acciones.length).fill(0)
  const adj: number[][] = acciones.map(() => [])

  for (let i = 0; i < acciones.length; i++) {
    for (const preId of (acciones[i].prerrequisitos ?? [])) {
      const j = idToIdx.get(preId)
      if (j !== undefined) { adj[j].push(i); inDegree[i]++ }
    }
  }

  const layers: AccionEstrategica[][] = []
  let remaining = [...acciones.map((_, i) => i)]

  while (remaining.length > 0) {
    const layer = remaining.filter(i => inDegree[i] === 0)
    if (layer.length === 0) { layers.push(remaining.map(i => acciones[i])); break } // cycle guard
    layers.push(layer.map(i => acciones[i]))
    const layerSet = new Set(layer)
    for (const i of layer) {
      for (const j of adj[i]) inDegree[j]--
    }
    remaining = remaining.filter(i => !layerSet.has(i))
  }
  return layers
}

// ── SVG graph ─────────────────────────────────────────────────────────────────

const NODE_W = 90
const NODE_H = 44
const COL_GAP = 80
const ROW_GAP = 24

export function GrafoDependenciasSection() {
  const { state } = useStrategicStore()
  const acciones = state.ejecucion?.acciones ?? []
  const [hovered, setHovered] = useState<string | null>(null)

  const { positions, edges, svgW, svgH } = useMemo(() => {
    if (acciones.length === 0) return { positions: new Map(), edges: [], svgW: 0, svgH: 0 }

    const layers = buildLayers(acciones)
    const positions = new Map<string, { x: number; y: number }>()
    const PAD = 20

    let maxRows = 0
    layers.forEach(l => { if (l.length > maxRows) maxRows = l.length })

    layers.forEach((layer, col) => {
      const totalH = layer.length * NODE_H + (layer.length - 1) * ROW_GAP
      const startY = PAD + (maxRows * (NODE_H + ROW_GAP) - totalH) / 2
      layer.forEach((a, row) => {
        positions.set(a.id, {
          x: PAD + col * (NODE_W + COL_GAP),
          y: startY + row * (NODE_H + ROW_GAP),
        })
      })
    })

    const svgW = PAD * 2 + layers.length * NODE_W + (layers.length - 1) * COL_GAP
    const svgH = PAD * 2 + maxRows * NODE_H + (maxRows - 1) * ROW_GAP

    const edges: { from: string; to: string }[] = []
    for (const a of acciones) {
      for (const preId of (a.prerrequisitos ?? [])) {
        if (positions.has(preId)) edges.push({ from: preId, to: a.id })
      }
    }

    return { positions, edges, svgW, svgH }
  }, [acciones])

  if (acciones.length === 0) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 18px', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: 12 }}>
      <AlertCircle size={15} style={{ color: '#F59E0B', flexShrink: 0 }} />
      <p style={{ fontSize: 12, color: '#F59E0B', lineHeight: 1.5 }}>Define acciones en <strong>BAC-22</strong> y prerrequisitos en <strong>BAC-23</strong> para ver el grafo.</p>
    </div>
  )

  const hasDeps = edges.length > 0

  const accionIndex = new Map(acciones.map((a, i) => [a.id, i]))
  const getCode = (id: string) => `AE-${String((accionIndex.get(id) ?? 0) + 1).padStart(2, '0')}`

  const isHighlighted = (id: string) => {
    if (!hovered) return false
    const a = acciones.find(x => x.id === id)
    if (!a) return false
    if (id === hovered) return true
    if ((a.prerrequisitos ?? []).includes(hovered)) return true
    const ha = acciones.find(x => x.id === hovered)
    if (ha && (ha.prerrequisitos ?? []).includes(id)) return true
    return false
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {!hasDeps && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: C + '10', border: `1px solid ${C}30`, borderRadius: 10 }}>
          <AlertCircle size={14} style={{ color: C, flexShrink: 0 }} />
          <p style={{ fontSize: 12, color: C, lineHeight: 1.5 }}>
            Aún no hay dependencias definidas. Ve a <strong>BAC-23</strong> y asigna prerrequisitos a las acciones para ver las conexiones.
          </p>
        </div>
      )}

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-lo)', borderRadius: 16, overflow: 'auto' }}>
        <svg width={Math.max(svgW, 400)} height={Math.max(svgH, 200)} style={{ display: 'block' }}>
          <defs>
            <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill={C} opacity="0.7" />
            </marker>
            <marker id="arrowhead-dim" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="var(--border-md)" />
            </marker>
          </defs>

          {/* Edges */}
          {edges.map(({ from, to }) => {
            const fp = positions.get(from)!
            const tp = positions.get(to)!
            const x1 = fp.x + NODE_W
            const y1 = fp.y + NODE_H / 2
            const x2 = tp.x
            const y2 = tp.y + NODE_H / 2
            const mx = (x1 + x2) / 2
            const active = hovered ? (from === hovered || to === hovered) : false
            return (
              <path key={`${from}-${to}`}
                d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`}
                fill="none"
                stroke={active ? C : 'var(--border-md)'}
                strokeWidth={active ? 2 : 1.5}
                strokeDasharray={active ? undefined : '4 2'}
                markerEnd={active ? 'url(#arrowhead)' : 'url(#arrowhead-dim)'}
                opacity={hovered && !active ? 0.3 : 1}
              />
            )
          })}

          {/* Nodes */}
          {acciones.map((a) => {
            const pos = positions.get(a.id)
            if (!pos) return null
            const code = getCode(a.id)
            const active = isHighlighted(a.id)
            const isSelf = hovered === a.id

            return (
              <g key={a.id}
                onMouseEnter={() => setHovered(a.id)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: 'pointer' }}>
                <rect
                  x={pos.x} y={pos.y} width={NODE_W} height={NODE_H} rx={10}
                  fill={isSelf ? C + '30' : active ? C + '18' : 'var(--bg-surface)'}
                  stroke={active ? C : 'var(--border-md)'}
                  strokeWidth={isSelf ? 2 : 1}
                />
                <text x={pos.x + NODE_W / 2} y={pos.y + 15} textAnchor="middle"
                  style={{ fill: C, fontSize: 10, fontWeight: 700, fontFamily: 'monospace' }}>
                  {code}
                </text>
                <foreignObject x={pos.x + 4} y={pos.y + 20} width={NODE_W - 8} height={NODE_H - 22}>
                  <div style={{ fontSize: 10, color: 'var(--text-md)', textAlign: 'center', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {a.nombre || '—'}
                  </div>
                </foreignObject>
              </g>
            )
          })}
        </svg>
      </div>

      <p style={{ fontSize: 11, color: 'var(--text-lo)', paddingLeft: 4 }}>
        Pasa el cursor sobre un nodo para resaltar sus dependencias. Define prerrequisitos en BAC-23.
      </p>
    </div>
  )
}
