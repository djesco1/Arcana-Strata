import { useState } from 'react'
import { Plus, Trash2, ExternalLink, Settings } from 'lucide-react'
import { BACPanel } from './BACPanel'
import { useBACStore } from '../../store/bacStore'
import type { ServicioNegocio, ObjetoNegocioTipo, BACNodeData } from '../../types/bac'

const OBJETO_TIPOS: { value: ObjetoNegocioTipo; label: string }[] = [
  { value: 'producto_fisico',      label: 'Producto Físico' },
  { value: 'producto_digital',     label: 'Producto Digital' },
  { value: 'bien_fisico_durable',  label: 'Bien Físico Durable' },
  { value: 'servicio',             label: 'Servicio' },
  { value: 'resultado',            label: 'Resultado' },
  { value: 'recursos_humanos',     label: 'Recursos Humanos' },
  { value: 'informacion',          label: 'Información' },
  { value: 'dinero',               label: 'Dinero' },
  { value: 'bienes_intangibles',   label: 'Bienes Intangibles' },
  { value: 'plataforma',           label: 'Plataforma' },
]

interface Props {
  onClose: () => void
  onAddToCanvas: (data: BACNodeData) => void
}

export function ServiciosPanel({ onClose, onAddToCanvas }: Props) {
  const { state, dispatch } = useBACStore()
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState<Partial<ServicioNegocio>>({ objeto_tipo: 'servicio' })

  const servicioLabel = (s: ServicioNegocio) => `S${state.servicios.findIndex(x => x.id === s.id) + 1}`

  const handleSave = () => {
    if (!form.nombre?.trim()) return
    const servicio: ServicioNegocio = {
      id: crypto.randomUUID(),
      negocio_id: 'demo',
      nombre: form.nombre,
      descripcion: form.descripcion,
      objeto_tipo: form.objeto_tipo || 'servicio',
    }
    dispatch({ type: 'ADD_SERVICIO', servicio })
    setForm({ objeto_tipo: 'servicio' })
    setAdding(false)
  }

  return (
    <BACPanel title="Portafolio de Servicios" code="BAC-02" color="#1B7A5F" onClose={onClose}>
      <div className="p-3 space-y-1">
        {state.servicios.map((s) => (
          <div
            key={s.id}
            className="group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors"
            style={{ background: 'rgba(27,122,95,0.07)', border: '1px solid rgba(27,122,95,0.12)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(27,122,95,0.13)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(27,122,95,0.07)')}
          >
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(27,122,95,0.15)' }}
              >
                <Settings size={13} style={{ color: '#1B7A5F' }} strokeWidth={1.8} />
              </div>
              <span className="text-[9px] font-black" style={{ color: '#1B7A5F', fontFamily: 'Raleway, sans-serif' }}>
                {servicioLabel(s)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-md)', fontFamily: 'Raleway, sans-serif' }}>
                {s.nombre}
              </p>
              {s.objeto_tipo && (
                <span
                  className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full mt-0.5 inline-block"
                  style={{ background: 'rgba(27,122,95,0.2)', color: '#1B7A5F' }}
                >
                  {OBJETO_TIPOS.find(t => t.value === s.objeto_tipo)?.label || s.objeto_tipo}
                </span>
              )}
            </div>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onAddToCanvas({ label: s.nombre, tipo: 'servicio', descripcion: s.descripcion, objetoTipo: s.objeto_tipo })}
                className="w-6 h-6 flex items-center justify-center rounded"
                title="Añadir al canvas"
                style={{ color: '#1B7A5F' }}
              >
                <ExternalLink size={11} strokeWidth={2} />
              </button>
              <button
                onClick={() => dispatch({ type: 'DELETE_SERVICIO', id: s.id })}
                className="w-6 h-6 flex items-center justify-center rounded"
                style={{ color: '#B03040' }}
              >
                <Trash2 size={11} strokeWidth={2} />
              </button>
            </div>
          </div>
        ))}

        {adding ? (
          <div
            className="rounded-xl p-3 mt-2 space-y-2"
            style={{ background: 'rgba(27,122,95,0.07)', border: '1px solid rgba(27,122,95,0.2)' }}
          >
            <input
              className="w-full bg-transparent border-b text-xs outline-none py-1"
              style={{ color: 'var(--text-md)', borderColor: 'rgba(27,122,95,0.3)', fontFamily: 'Raleway, sans-serif' }}
              placeholder="Nombre del servicio..."
              value={form.nombre || ''}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              autoFocus
            />
            <select
              className="w-full bg-transparent text-[10px] outline-none py-1"
              style={{ color: '#9B8FE4', fontFamily: 'Raleway, sans-serif' }}
              value={form.objeto_tipo}
              onChange={(e) => setForm({ ...form, objeto_tipo: e.target.value as ObjetoNegocioTipo })}
            >
              {OBJETO_TIPOS.map((t) => (
                <option key={t.value} value={t.value} style={{ background: 'var(--bg-elevated)' }}>{t.label}</option>
              ))}
            </select>
            <div className="flex gap-2 pt-1">
              <button onClick={handleSave} className="flex-1 py-1.5 rounded-lg text-xs font-semibold" style={{ background: '#1B7A5F', color: '#fff' }}>
                Guardar
              </button>
              <button onClick={() => { setAdding(false); setForm({ objeto_tipo: 'servicio' }) }} className="flex-1 py-1.5 rounded-lg text-xs font-semibold" style={{ background: 'rgba(155,143,228,0.1)', color: '#9B8FE4' }}>
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs mt-1"
            style={{ color: '#1B7A5F', border: '1px dashed rgba(27,122,95,0.3)' }}
            onMouseEnter={(e) => { (e.currentTarget.style.borderColor = '#1B7A5F88'); (e.currentTarget.style.color = '#2EA07C') }}
            onMouseLeave={(e) => { (e.currentTarget.style.borderColor = 'rgba(27,122,95,0.3)'); (e.currentTarget.style.color = '#1B7A5F') }}
          >
            <Plus size={12} strokeWidth={2} />
            <span style={{ fontFamily: 'Raleway, sans-serif' }}>Nuevo servicio</span>
          </button>
        )}
      </div>
    </BACPanel>
  )
}
