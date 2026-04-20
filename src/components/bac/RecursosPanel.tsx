import { useState } from 'react'
import { Plus, Trash2, ExternalLink, Users, Cpu, Box, DollarSign, Star } from 'lucide-react'
import { BACPanel } from './BACPanel'
import { useBACStore } from '../../store/bacStore'
import type { Recurso, RecursoTipo, BACNodeData } from '../../types/bac'

const TIPO_META: Record<RecursoTipo, { label: string; color: string; icon: React.ElementType }> = {
  humano:      { label: 'Humano',      color: '#2B6CB0', icon: Users },
  tecnologico: { label: 'Tecnológico', color: '#5448A0', icon: Cpu },
  fisico:      { label: 'Físico',      color: '#1B7A5F', icon: Box },
  financiero:  { label: 'Financiero',  color: '#C87A2F', icon: DollarSign },
  intangible:  { label: 'Intangible',  color: '#9B8FE4', icon: Star },
}

interface Props {
  onClose: () => void
  onAddToCanvas: (data: BACNodeData) => void
}

export function RecursosPanel({ onClose, onAddToCanvas }: Props) {
  const { state, dispatch } = useBACStore()
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState<Partial<Recurso>>({ tipo: 'humano' })

  const recursoLabel = (r: Recurso) => `R${state.recursos.findIndex(x => x.id === r.id) + 1}`

  const handleSave = () => {
    if (!form.nombre?.trim()) return
    dispatch({
      type: 'ADD_RECURSO',
      recurso: {
        id: crypto.randomUUID(),
        negocio_id: 'demo',
        nombre: form.nombre,
        tipo: form.tipo || 'humano',
        descripcion: form.descripcion,
      },
    })
    setForm({ tipo: 'humano' })
    setAdding(false)
  }

  return (
    <BACPanel title="Catálogo de Recursos" code="BAC-05" color="#2B6CB0" onClose={onClose}>
      <div className="p-3 space-y-1">
        {state.recursos.map((r) => {
          const meta = TIPO_META[r.tipo]
          const Icon = meta.icon
          return (
            <div
              key={r.id}
              className="group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors"
              style={{ background: meta.color + '0D', border: `1px solid ${meta.color}20` }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = meta.color + '40')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = meta.color + '20')}
            >
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: meta.color + '18' }}
                >
                  <Icon size={13} style={{ color: meta.color }} strokeWidth={1.8} />
                </div>
                <span className="text-[9px] font-black" style={{ color: meta.color, fontFamily: 'Raleway, sans-serif' }}>
                  {recursoLabel(r)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-md)', fontFamily: 'Raleway, sans-serif' }}>
                  {r.nombre}
                </p>
                <span
                  className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full mt-0.5 inline-block"
                  style={{ background: meta.color + '18', color: meta.color }}
                >
                  {meta.label}
                </span>
              </div>
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onAddToCanvas({ label: r.nombre, tipo: 'recurso', descripcion: r.descripcion })}
                  title="Añadir al canvas"
                  className="w-6 h-6 flex items-center justify-center rounded"
                  style={{ color: meta.color }}
                >
                  <ExternalLink size={11} strokeWidth={2} />
                </button>
                <button
                  onClick={() => dispatch({ type: 'DELETE_RECURSO', id: r.id })}
                  className="w-6 h-6 flex items-center justify-center rounded"
                  style={{ color: '#B03040' }}
                >
                  <Trash2 size={11} strokeWidth={2} />
                </button>
              </div>
            </div>
          )
        })}

        {adding ? (
          <div
            className="rounded-xl p-3 mt-2 space-y-2"
            style={{ background: 'rgba(43,108,176,0.08)', border: '1px solid rgba(43,108,176,0.2)' }}
          >
            <input
              className="w-full bg-transparent border-b text-xs outline-none py-1"
              style={{ color: 'var(--text-md)', borderColor: 'rgba(43,108,176,0.3)', fontFamily: 'Raleway, sans-serif' }}
              placeholder="Nombre del recurso…"
              value={form.nombre || ''}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              autoFocus
            />
            <input
              className="w-full bg-transparent border-b text-xs outline-none py-1"
              style={{ color: 'var(--text-dim)', borderColor: 'rgba(43,108,176,0.15)', fontFamily: 'Raleway, sans-serif' }}
              placeholder="Descripción (opcional)"
              value={form.descripcion || ''}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {(Object.entries(TIPO_META) as [RecursoTipo, typeof TIPO_META[RecursoTipo]][]).map(([v, m]) => (
                <button
                  key={v}
                  onClick={() => setForm({ ...form, tipo: v })}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-semibold transition-all"
                  style={{
                    background: form.tipo === v ? m.color + '22' : 'transparent',
                    color: form.tipo === v ? m.color : 'var(--text-dim)',
                    border: `1px solid ${form.tipo === v ? m.color + '40' : 'rgba(155,143,228,0.1)'}`,
                  }}
                >
                  <m.icon size={10} strokeWidth={2} />
                  {m.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={handleSave} className="flex-1 py-1.5 rounded-lg text-xs font-semibold" style={{ background: '#2B6CB0', color: '#fff' }}>
                Guardar
              </button>
              <button onClick={() => { setAdding(false); setForm({ tipo: 'humano' }) }} className="flex-1 py-1.5 rounded-lg text-xs font-semibold" style={{ background: 'rgba(155,143,228,0.1)', color: '#9B8FE4' }}>
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs mt-1"
            style={{ color: '#2B6CB0', border: '1px dashed rgba(43,108,176,0.3)' }}
            onMouseEnter={(e) => { (e.currentTarget.style.borderColor = '#2B6CB088'); (e.currentTarget.style.color = '#5B96D0') }}
            onMouseLeave={(e) => { (e.currentTarget.style.borderColor = 'rgba(43,108,176,0.3)'); (e.currentTarget.style.color = '#2B6CB0') }}
          >
            <Plus size={12} strokeWidth={2} />
            <span style={{ fontFamily: 'Raleway, sans-serif' }}>Nuevo recurso</span>
          </button>
        )}
      </div>
    </BACPanel>
  )
}
