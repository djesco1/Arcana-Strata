import { memo } from 'react'
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import {
  Building2, User, Truck, Package, Zap, CreditCard, ShoppingCart,
  Settings, RotateCcw, Share2, Play, Wrench, Database
} from 'lucide-react'
import type { BACNodeData, CanalTipo } from '../../types/bac'
import { CANAL_COLORS } from '../../constants/colors'

type BACFlowNode = Node<BACNodeData>

const NODE_META: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  negocio:    { icon: Building2,    color: '#5448A0', bg: '#F0EEFB', label: 'Negocio' },
  actor:      { icon: User,         color: '#2B6CB0', bg: '#EBF3FB', label: 'Actor' },
  proveedor:  { icon: Truck,        color: '#1B7A5F', bg: '#E6F4F0', label: 'Proveedor' },
  componente: { icon: Database,     color: '#7C3D9F', bg: '#F5EDF9', label: 'Componente' },
  canal:      { icon: Zap,          color: '#C87A2F', bg: '#FBF3E6', label: 'Canal' },
  actividad:  { icon: Play,         color: '#7E57C2', bg: '#F0EEFB', label: 'Actividad' },
  servicio:   { icon: Settings,     color: '#1B7A5F', bg: '#E6F4F0', label: 'Servicio' },
  recurso:    { icon: Wrench,       color: '#B03040', bg: '#FBE9EB', label: 'Recurso' },
}

const CANAL_ICONS: Record<CanalTipo, React.ElementType> = {
  R:  User,
  D:  Package,
  M:  CreditCard,
  A:  ShoppingCart,
  T:  Settings,
  I:  Share2,
  RT: RotateCcw,
}

// All 4 positions — with ConnectionMode.Loose these act as both source & target
const HANDLE_POSITIONS = [
  { pos: Position.Top,    id: 'top' },
  { pos: Position.Right,  id: 'right' },
  { pos: Position.Bottom, id: 'bottom' },
  { pos: Position.Left,   id: 'left' },
]

function BACNode({ data, selected }: NodeProps<BACFlowNode>) {
  const isCanalTyped = data.tipo === 'canal' && data.canalTipo
  const canalMeta = isCanalTyped ? CANAL_COLORS[data.canalTipo!] : null
  const nodeMeta = NODE_META[data.tipo] || NODE_META.componente

  const color = isCanalTyped ? canalMeta!.border : nodeMeta.color
  const bg    = isCanalTyped ? canalMeta!.bg     : nodeMeta.bg
  const IconComponent = isCanalTyped ? (CANAL_ICONS[data.canalTipo!] || Zap) : nodeMeta.icon
  const typeLabel = isCanalTyped
    ? `Canal ${data.canalTipo} · ${canalMeta!.label}`
    : nodeMeta.label

  const handleStyle: React.CSSProperties = {
    width: 8, height: 8,
    background: color,
    border: `2px solid ${bg}`,
    opacity: 0.7,
    transition: 'opacity 0.15s, transform 0.15s',
  }

  return (
    <div
      className="bac-node"
      style={{
        background: bg,
        borderLeft: `3px solid ${color}`,
        borderTop: `1px solid ${color}22`,
        borderRight: `1px solid ${color}22`,
        borderBottom: `1px solid ${color}22`,
        borderRadius: '10px',
        minWidth: 168,
        maxWidth: 220,
        boxShadow: selected
          ? `0 0 0 2px ${color}55, 0 4px 20px ${color}20`
          : '0 1px 6px rgba(15,26,46,0.09)',
        transition: 'box-shadow 0.15s',
      }}
    >
      {HANDLE_POSITIONS.map(({ pos, id }) => (
        <Handle
          key={id}
          type="source"
          position={pos}
          id={id}
          style={handleStyle}
        />
      ))}

      <div className="px-3 pt-2.5 pb-2">
        <div className="flex items-start gap-2">
          <div
            className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-md mt-0.5"
            style={{ background: `${color}18` }}
          >
            <IconComponent size={13} style={{ color }} strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <div
              className="text-[12px] font-semibold leading-tight"
              style={{ color: '#2D1F6E', fontFamily: 'Raleway, sans-serif', letterSpacing: '-0.01em' }}
            >
              {data.label}
            </div>
            {data.descripcion && (
              <div className="text-[10px] mt-0.5 leading-tight line-clamp-2" style={{ color: '#6B5FA8' }}>
                {data.descripcion}
              </div>
            )}
          </div>
        </div>
        <div className="mt-2 text-[9px] font-semibold uppercase tracking-wider" style={{ color }}>
          {typeLabel}
        </div>
      </div>
    </div>
  )
}

export default memo(BACNode)
