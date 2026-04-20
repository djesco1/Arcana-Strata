import { useState } from 'react'
import { X, Pencil, Check } from 'lucide-react'
import type { Node } from '@xyflow/react'
import type { BACNodeData, CanalTipo, ActorTipo } from '../../types/bac'
import { CANAL_COLORS } from '../../constants/colors'

interface Props {
  node: Node | null
  onClose: () => void
  onUpdate: (id: string, data: Partial<BACNodeData>) => void
}

const CANAL_TIPOS: { value: CanalTipo; label: string; color: string }[] = [
  { value: 'R',  label: 'Relacionamiento',  color: '#2B6CB0' },
  { value: 'D',  label: 'Distribución',     color: '#1B7A5F' },
  { value: 'M',  label: 'Monetización',     color: '#C87A2F' },
  { value: 'A',  label: 'Aprovisionamiento',color: '#9B8FE4' },
  { value: 'T',  label: 'Transformación',   color: '#7E57C2' },
  { value: 'I',  label: 'Indirecto',        color: '#9E9E9E' },
  { value: 'RT', label: 'Retorno',          color: '#B03040' },
]

const ACTOR_TIPOS: { value: ActorTipo; label: string }[] = [
  { value: 'cliente',           label: 'Cliente' },
  { value: 'usuario',           label: 'Usuario' },
  { value: 'prospecto',         label: 'Prospecto' },
  { value: 'cliente_potencial', label: 'Cliente Potencial' },
  { value: 'otro',              label: 'Otro actor' },
]

const NODE_TYPE_COLORS: Record<string, string> = {
  negocio: '#5448A0', actor: '#2B6CB0', proveedor: '#1B7A5F',
  componente: '#7C3D9F', canal: '#C87A2F', actividad: '#7E57C2',
  servicio: '#1B7A5F', recurso: '#B03040',
}

export function PropertiesPanel({ node, onClose, onUpdate }: Props) {
  const [editing, setEditing] = useState(false)

  if (!node) return null

  const data = node.data as unknown as BACNodeData
  const accentColor = data.tipo === 'canal' && data.canalTipo
    ? CANAL_COLORS[data.canalTipo].border
    : NODE_TYPE_COLORS[data.tipo] || '#5448A0'

  return (
    <div
      className="absolute right-3 top-3 bottom-3 w-64 rounded-2xl flex flex-col overflow-hidden z-10"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid rgba(155,143,228,0.12)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
      }}
    >
      {/* Accent bar */}
      <div className="h-0.5 w-full flex-shrink-0" style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }} />

      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(155,143,228,0.08)' }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: accentColor }} />
          <span
            className="text-[10px] font-semibold uppercase tracking-widest truncate"
            style={{ color: accentColor }}
          >
            {data.tipo}
          </span>
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button
            onClick={() => setEditing(!editing)}
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: editing ? '#9B8FE4' : '#5448A0' }}
            title={editing ? 'Guardar' : 'Editar'}
          >
            {editing ? <Check size={13} strokeWidth={2} /> : <Pencil size={12} strokeWidth={1.8} />}
          </button>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
            style={{ color: '#5448A0' }}
          >
            <X size={14} strokeWidth={1.8} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Label */}
        <div>
          <Label>Nombre</Label>
          {editing ? (
            <input
              className="w-full bg-transparent border-b py-1 text-sm font-semibold outline-none"
              style={{ color: '#E8DFF5', borderColor: '#5448A0', fontFamily: 'Raleway, sans-serif' }}
              defaultValue={data.label}
              onBlur={(e) => onUpdate(node.id, { label: e.target.value })}
              autoFocus
            />
          ) : (
            <p
              className="text-sm font-semibold mt-1"
              style={{ color: '#E8DFF5', fontFamily: 'Raleway, sans-serif' }}
            >
              {data.label}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <Label>Descripción</Label>
          {editing ? (
            <textarea
              className="w-full bg-transparent border rounded-lg text-xs outline-none p-2 resize-none mt-1"
              style={{ color: '#9B8FE4', borderColor: 'rgba(84,72,160,0.25)', minHeight: 68, fontFamily: 'Raleway, sans-serif' }}
              defaultValue={data.descripcion || ''}
              onBlur={(e) => onUpdate(node.id, { descripcion: e.target.value })}
              placeholder="Sin descripción..."
            />
          ) : (
            <p className="text-xs mt-1 leading-relaxed" style={{ color: data.descripcion ? '#9B8FE4' : '#7060A8' }}>
              {data.descripcion || 'Sin descripción'}
            </p>
          )}
        </div>

        {/* Canal type */}
        {data.tipo === 'canal' && (
          <div>
            <Label>Tipo de Canal</Label>
            <div className="flex flex-col gap-1 mt-1">
              {CANAL_TIPOS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => editing && onUpdate(node.id, { canalTipo: t.value })}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-left transition-all"
                  style={{
                    background: data.canalTipo === t.value ? t.color + '20' : 'transparent',
                    color: data.canalTipo === t.value ? t.color : '#8878C0',
                    border: `1px solid ${data.canalTipo === t.value ? t.color + '40' : 'transparent'}`,
                    cursor: editing ? 'pointer' : 'default',
                  }}
                >
                  <span className="font-bold text-[10px] w-4">{t.value}</span>
                  <span style={{ fontFamily: 'Raleway, sans-serif' }}>{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actor type */}
        {data.tipo === 'actor' && (
          <div>
            <Label>Tipo de Actor</Label>
            <div className="flex flex-col gap-1 mt-1">
              {ACTOR_TIPOS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => editing && onUpdate(node.id, { actorTipo: t.value })}
                  className="px-2.5 py-1.5 rounded-lg text-xs text-left transition-all"
                  style={{
                    background: data.actorTipo === t.value ? '#2B6CB020' : 'transparent',
                    color: data.actorTipo === t.value ? '#2B6CB0' : '#8878C0',
                    border: `1px solid ${data.actorTipo === t.value ? '#2B6CB040' : 'transparent'}`,
                    cursor: editing ? 'pointer' : 'default',
                    fontFamily: 'Raleway, sans-serif',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Position */}
        <div>
          <Label>Posición</Label>
          <p className="text-[10px] font-mono mt-1" style={{ color: '#7060A8' }}>
            x {Math.round(node.position.x)}, y {Math.round(node.position.y)}
          </p>
        </div>
      </div>
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: '#7060A8' }}>
      {children}
    </p>
  )
}
