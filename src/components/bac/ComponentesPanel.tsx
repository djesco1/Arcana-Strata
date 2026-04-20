import { useState } from 'react'
import { Plus, Trash2, ExternalLink, Database } from 'lucide-react'
import { BACPanel } from './BACPanel'
import { useBACStore } from '../../store/bacStore'
import type { Componente, BACNodeData } from '../../types/bac'

const TIPO_META = {
  valor:       { label: 'Valor',       color: '#7C3D9F' },
  dinero:      { label: 'Dinero',      color: '#C87A2F' },
  informacion: { label: 'Información', color: '#2B6CB0' },
}

interface Props {
  onClose: () => void
  onAddToCanvas: (data: BACNodeData) => void
}

export function ComponentesPanel({ onClose, onAddToCanvas }: Props) {
  const { state, dispatch } = useBACStore()
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState<Partial<Componente>>({ tipo: 'valor' })

  const handleSave = () => {
    if (!form.nombre?.trim()) return
    const comp: Componente = {
      id: crypto.randomUUID(),
      negocio_id: 'demo',
      nombre: form.nombre,
      tipo: (form.tipo as Componente['tipo']) || 'valor',
      descripcion: form.descripcion,
    }
    dispatch({ type: 'ADD_COMPONENTE', componente: comp })
    setForm({ tipo: 'valor' })
    setAdding(false)
  }

  return (
    <BACPanel title="Componentes" code="BAC-06" color="#7C3D9F" onClose={onClose}>
      <div className="p-3 space-y-1">
        {state.componentes.map((c) => {
          const meta = TIPO_META[c.tipo]
          return (
            <div
              key={c.id}
              className="group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors"
              style={{ background: meta.color + '10', border: `1px solid ${meta.color}22` }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = meta.color + '44')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = meta.color + '22')}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: meta.color + '18' }}
              >
                <Database size={13} style={{ color: meta.color }} strokeWidth={1.8} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-md)', fontFamily: 'Raleway, sans-serif' }}>
                  {c.nombre}
                </p>
                <span
                  className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full mt-0.5 inline-block"
                  style={{ background: meta.color + '20', color: meta.color }}
                >
                  {meta.label}
                </span>
              </div>
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onAddToCanvas({ label: c.nombre, tipo: 'componente', descripcion: c.descripcion })}
                  className="w-6 h-6 flex items-center justify-center rounded"
                  title="Añadir al canvas"
                  style={{ color: meta.color }}
                >
                  <ExternalLink size={11} strokeWidth={2} />
                </button>
                <button
                  onClick={() => dispatch({ type: 'DELETE_COMPONENTE', id: c.id })}
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
            style={{ background: 'rgba(124,61,159,0.08)', border: '1px solid rgba(124,61,159,0.2)' }}
          >
            <input
              className="w-full bg-transparent border-b text-xs outline-none py-1"
              style={{ color: 'var(--text-md)', borderColor: 'rgba(124,61,159,0.3)', fontFamily: 'Raleway, sans-serif' }}
              placeholder="Nombre del componente..."
              value={form.nombre || ''}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              autoFocus
            />
            <div className="flex gap-2 pt-1">
              {Object.entries(TIPO_META).map(([v, m]) => (
                <button
                  key={v}
                  onClick={() => setForm({ ...form, tipo: v as Componente['tipo'] })}
                  className="flex-1 py-1.5 rounded-lg text-[10px] font-semibold transition-all"
                  style={{
                    background: form.tipo === v ? m.color + '25' : 'transparent',
                    color: form.tipo === v ? m.color : 'var(--text-dim)',
                    border: `1px solid ${form.tipo === v ? m.color + '40' : 'rgba(155,143,228,0.1)'}`,
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={handleSave} className="flex-1 py-1.5 rounded-lg text-xs font-semibold" style={{ background: '#7C3D9F', color: '#fff' }}>
                Guardar
              </button>
              <button onClick={() => { setAdding(false); setForm({ tipo: 'valor' }) }} className="flex-1 py-1.5 rounded-lg text-xs font-semibold" style={{ background: 'rgba(155,143,228,0.1)', color: '#9B8FE4' }}>
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs mt-1"
            style={{ color: '#7C3D9F', border: '1px dashed rgba(124,61,159,0.3)' }}
            onMouseEnter={(e) => { (e.currentTarget.style.borderColor = '#9B8FE488'); (e.currentTarget.style.color = '#9B8FE4') }}
            onMouseLeave={(e) => { (e.currentTarget.style.borderColor = 'rgba(124,61,159,0.3)'); (e.currentTarget.style.color = '#7C3D9F') }}
          >
            <Plus size={12} strokeWidth={2} />
            <span style={{ fontFamily: 'Raleway, sans-serif' }}>Nuevo componente</span>
          </button>
        )}
      </div>
    </BACPanel>
  )
}
