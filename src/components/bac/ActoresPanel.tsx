import { useState } from 'react'
import { Plus, Trash2, ExternalLink, User } from 'lucide-react'
import { BACPanel } from './BACPanel'
import { useBACStore } from '../../store/bacStore'
import type { Actor, ActorTipo, BACNodeData } from '../../types/bac'

const TIPO_COLORS: Record<ActorTipo, string> = {
  cliente:           '#2B6CB0',
  usuario:           '#5448A0',
  prospecto:         '#9B8FE4',
  cliente_potencial: '#1B7A5F',
  otro:              'var(--text-dim)',
}

const TIPO_LABELS: Record<ActorTipo, string> = {
  cliente:           'Cliente',
  usuario:           'Usuario',
  prospecto:         'Prospecto',
  cliente_potencial: 'Cliente Potencial',
  otro:              'Otro actor',
}

interface Props {
  onClose: () => void
  onAddToCanvas: (data: BACNodeData) => void
}

export function ActoresPanel({ onClose, onAddToCanvas }: Props) {
  const { state, dispatch } = useBACStore()
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState<Partial<Actor>>({ tipo: 'cliente' })

  const handleSave = () => {
    if (!form.nombre?.trim()) return
    const actor: Actor = {
      id: crypto.randomUUID(),
      negocio_id: 'demo',
      nombre: form.nombre,
      tipo: (form.tipo as ActorTipo) || 'cliente',
      descripcion: form.descripcion,
    }
    dispatch({ type: 'ADD_ACTOR', actor })
    setForm({ tipo: 'cliente' })
    setAdding(false)
  }

  return (
    <BACPanel title="Catálogo de Actores" code="BAC-01" color="#2B6CB0" onClose={onClose}>
      <div className="p-3 space-y-1">
        {/* Actors list */}
        {state.actores.map((actor) => (
          <div
            key={actor.id}
            className="group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors"
            style={{ background: 'rgba(43,108,176,0.06)', border: '1px solid rgba(43,108,176,0.1)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(43,108,176,0.12)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(43,108,176,0.06)')}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: TIPO_COLORS[actor.tipo] + '18' }}
            >
              <User size={14} style={{ color: TIPO_COLORS[actor.tipo] }} strokeWidth={1.8} />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-xs font-semibold truncate"
                style={{ color: 'var(--text-md)', fontFamily: 'Raleway, sans-serif' }}
              >
                {actor.nombre}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                  style={{ background: TIPO_COLORS[actor.tipo] + '20', color: TIPO_COLORS[actor.tipo] }}
                >
                  {TIPO_LABELS[actor.tipo]}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onAddToCanvas({ label: actor.nombre, tipo: 'actor', actorTipo: actor.tipo, descripcion: actor.descripcion })}
                className="w-6 h-6 flex items-center justify-center rounded"
                title="Añadir al canvas"
                style={{ color: '#2B6CB0' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#9B8FE4')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#2B6CB0')}
              >
                <ExternalLink size={11} strokeWidth={2} />
              </button>
              <button
                onClick={() => dispatch({ type: 'DELETE_ACTOR', id: actor.id })}
                className="w-6 h-6 flex items-center justify-center rounded"
                style={{ color: '#B03040' }}
              >
                <Trash2 size={11} strokeWidth={2} />
              </button>
            </div>
          </div>
        ))}

        {/* New actor form */}
        {adding ? (
          <div
            className="rounded-xl p-3 mt-2 space-y-2"
            style={{ background: 'rgba(84,72,160,0.08)', border: '1px solid rgba(84,72,160,0.2)' }}
          >
            <input
              className="w-full bg-transparent border-b text-xs outline-none py-1"
              style={{ color: 'var(--text-md)', borderColor: 'rgba(84,72,160,0.3)', fontFamily: 'Raleway, sans-serif' }}
              placeholder="Nombre del actor..."
              value={form.nombre || ''}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              autoFocus
            />
            <input
              className="w-full bg-transparent border-b text-xs outline-none py-1"
              style={{ color: '#9B8FE4', borderColor: 'rgba(84,72,160,0.2)', fontFamily: 'Raleway, sans-serif' }}
              placeholder="Descripción (opcional)"
              value={form.descripcion || ''}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            />
            <select
              className="w-full bg-transparent text-[10px] outline-none py-1"
              style={{ color: '#9B8FE4', fontFamily: 'Raleway, sans-serif' }}
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value as ActorTipo })}
            >
              {Object.entries(TIPO_LABELS).map(([v, l]) => (
                <option key={v} value={v} style={{ background: 'var(--bg-elevated)' }}>{l}</option>
              ))}
            </select>
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleSave}
                className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                style={{ background: '#2B6CB0', color: '#fff' }}
              >
                Guardar
              </button>
              <button
                onClick={() => { setAdding(false); setForm({ tipo: 'cliente' }) }}
                className="flex-1 py-1.5 rounded-lg text-xs font-semibold"
                style={{ background: 'rgba(155,143,228,0.1)', color: '#9B8FE4' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-colors mt-1"
            style={{ color: '#5448A0', border: '1px dashed rgba(84,72,160,0.3)' }}
            onMouseEnter={(e) => { (e.currentTarget.style.borderColor = '#9B8FE4'); (e.currentTarget.style.color = '#9B8FE4') }}
            onMouseLeave={(e) => { (e.currentTarget.style.borderColor = 'rgba(84,72,160,0.3)'); (e.currentTarget.style.color = '#5448A0') }}
          >
            <Plus size={12} strokeWidth={2} />
            <span style={{ fontFamily: 'Raleway, sans-serif' }}>Nuevo actor</span>
          </button>
        )}
      </div>
    </BACPanel>
  )
}
