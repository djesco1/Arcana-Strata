import { useState } from 'react'
import { Plus, Trash2, ExternalLink, Smartphone, MapPin, Layers } from 'lucide-react'
import { BACPanel } from './BACPanel'
import { useBACStore } from '../../store/bacStore'
import type { Medio, MedioTipo, BACNodeData } from '../../types/bac'
import { CANAL_COLORS } from '../../constants/colors'

const TIPO_META: Record<MedioTipo, { label: string; color: string; icon: React.ElementType }> = {
  digital: { label: 'Digital', color: '#2B6CB0', icon: Smartphone },
  fisico:  { label: 'Físico',  color: '#1B7A5F', icon: MapPin },
  hibrido: { label: 'Híbrido', color: '#9B8FE4', icon: Layers },
}

interface Props {
  onClose: () => void
  onAddToCanvas: (data: BACNodeData) => void
}

export function MediosPanel({ onClose, onAddToCanvas }: Props) {
  const { state, dispatch } = useBACStore()
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState<Partial<Medio>>({ tipo: 'digital' })

  // Group medios by canal
  const mediosByCanal = state.canales.map(canal => ({
    canal,
    medios: state.medios.filter(m => m.canal_id === canal.id),
  })).filter(g => g.medios.length > 0)

  const sinCanal = state.medios.filter(m => !state.canales.find(c => c.id === m.canal_id))

  const handleSave = () => {
    if (!form.nombre?.trim() || !form.canal_id) return
    dispatch({
      type: 'ADD_MEDIO',
      medio: {
        id: crypto.randomUUID(),
        canal_id: form.canal_id,
        nombre: form.nombre,
        tipo: form.tipo || 'digital',
        descripcion: form.descripcion,
      },
    })
    setForm({ tipo: 'digital' })
    setAdding(false)
  }

  const MedioRow = ({ medio }: { medio: Medio }) => {
    const meta = TIPO_META[medio.tipo]
    const Icon = meta.icon
    return (
      <div
        className="group flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors"
        style={{ background: meta.color + '08' }}
        onMouseEnter={(e) => (e.currentTarget.style.background = meta.color + '14')}
        onMouseLeave={(e) => (e.currentTarget.style.background = meta.color + '08')}
      >
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
          style={{ background: meta.color + '1A' }}
        >
          <Icon size={11} style={{ color: meta.color }} strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold truncate" style={{ color: 'var(--text-md)', fontFamily: 'Raleway, sans-serif' }}>
            {medio.nombre}
          </p>
          <span
            className="text-[9px] font-semibold"
            style={{ color: meta.color }}
          >
            {meta.label}
          </span>
        </div>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onAddToCanvas({ label: medio.nombre, tipo: 'actividad', descripcion: `Medio ${medio.tipo}: ${medio.nombre}` })}
            title="Añadir al canvas"
            className="w-5 h-5 flex items-center justify-center rounded"
            style={{ color: meta.color }}
          >
            <ExternalLink size={10} strokeWidth={2} />
          </button>
          <button
            onClick={() => dispatch({ type: 'DELETE_MEDIO', id: medio.id })}
            className="w-5 h-5 flex items-center justify-center rounded"
            style={{ color: '#B03040' }}
          >
            <Trash2 size={10} strokeWidth={2} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <BACPanel title="Medios de Canal" code="BAC-79" color="#C87A2F" onClose={onClose}>
      <div className="p-3 space-y-3">
        {/* Grouped by canal */}
        {mediosByCanal.map(({ canal, medios }) => {
          const canalMeta = CANAL_COLORS[canal.tipo]
          return (
            <div key={canal.id}>
              <div className="flex items-center gap-2 mb-1.5 px-0.5">
                <div className="h-px flex-1" style={{ background: canalMeta.border + '30' }} />
                <span
                  className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: canalMeta.border + '18', color: canalMeta.border }}
                >
                  {canal.nombre} · {canal.tipo}
                </span>
                <div className="h-px flex-1" style={{ background: canalMeta.border + '30' }} />
              </div>
              <div className="space-y-0.5">
                {medios.map(m => <MedioRow key={m.id} medio={m} />)}
              </div>
            </div>
          )
        })}

        {sinCanal.length > 0 && sinCanal.map(m => <MedioRow key={m.id} medio={m} />)}

        {state.medios.length === 0 && (
          <p className="text-xs text-center py-4" style={{ color: '#7060A8' }}>
            No hay medios registrados aún.
          </p>
        )}

        {/* Add form */}
        {adding ? (
          <div
            className="rounded-xl p-3 space-y-2"
            style={{ background: 'rgba(200,122,47,0.08)', border: '1px solid rgba(200,122,47,0.2)' }}
          >
            <input
              className="w-full bg-transparent border-b text-xs outline-none py-1"
              style={{ color: 'var(--text-md)', borderColor: 'rgba(200,122,47,0.3)', fontFamily: 'Raleway, sans-serif' }}
              placeholder="Nombre del medio (ej. App Móvil)…"
              value={form.nombre || ''}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              autoFocus
            />
            <select
              className="w-full bg-transparent text-xs outline-none py-1 border-b"
              style={{ color: 'var(--text-md)', borderColor: 'rgba(200,122,47,0.2)', fontFamily: 'Raleway, sans-serif' }}
              value={form.canal_id || ''}
              onChange={(e) => setForm({ ...form, canal_id: e.target.value })}
            >
              <option value="" style={{ background: 'var(--bg-elevated)' }}>Seleccionar canal…</option>
              {state.canales.map(c => (
                <option key={c.id} value={c.id} style={{ background: 'var(--bg-elevated)' }}>{c.nombre} ({c.tipo})</option>
              ))}
            </select>
            <div className="flex gap-1.5">
              {(Object.entries(TIPO_META) as [MedioTipo, typeof TIPO_META[MedioTipo]][]).map(([v, m]) => (
                <button
                  key={v}
                  onClick={() => setForm({ ...form, tipo: v })}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-semibold transition-all"
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
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleSave}
                disabled={!form.nombre || !form.canal_id}
                className="flex-1 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-40"
                style={{ background: '#C87A2F', color: '#fff' }}
              >
                Guardar
              </button>
              <button
                onClick={() => { setAdding(false); setForm({ tipo: 'digital' }) }}
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
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
            style={{ color: '#C87A2F', border: '1px dashed rgba(200,122,47,0.3)' }}
            onMouseEnter={(e) => { (e.currentTarget.style.borderColor = '#C87A2F88'); (e.currentTarget.style.color = '#E89B57') }}
            onMouseLeave={(e) => { (e.currentTarget.style.borderColor = 'rgba(200,122,47,0.3)'); (e.currentTarget.style.color = '#C87A2F') }}
          >
            <Plus size={12} strokeWidth={2} />
            <span style={{ fontFamily: 'Raleway, sans-serif' }}>Nuevo medio</span>
          </button>
        )}
      </div>
    </BACPanel>
  )
}
