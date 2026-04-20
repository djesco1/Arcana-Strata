import { useState } from 'react'
import { Plus, Trash2, ExternalLink, Users } from 'lucide-react'
import { BACPanel } from './BACPanel'
import { useBACStore } from '../../store/bacStore'
import type { Participante, BACNodeData } from '../../types/bac'
import { CANAL_COLORS } from '../../constants/colors'

interface Props {
  onClose: () => void
  onAddToCanvas: (nodes: BACNodeData[]) => void
}

export function ParticipantesPanel({ onClose, onAddToCanvas }: Props) {
  const { state, dispatch } = useBACStore()
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState<Partial<Participante>>({})

  const getCanal = (id: string) => state.canales.find(c => c.id === id)

  const displayName = (p: Participante) =>
    p.nombre?.trim() || state.actores.find(a => a.id === p.actor_id)?.nombre || 'Sin nombre'

  const participanteLabel = (p: Participante) => `P${state.participantes.findIndex(x => x.id === p.id) + 1}`

  const handleSave = () => {
    const nombre = form.nombre?.trim()
    if (!nombre || !form.canal_id) return
    const p: Participante = {
      id: crypto.randomUUID(),
      canal_id: form.canal_id,
      nombre,
      actor_id: undefined,
      rol: form.rol,
    }
    dispatch({ type: 'ADD_PARTICIPANTE', participante: p })
    setForm({})
    setAdding(false)
  }

  const handleAddToCanvas = (p: Participante) => {
    const canal = getCanal(p.canal_id)
    const nodes: BACNodeData[] = [
      { label: displayName(p), tipo: 'actor', descripcion: p.rol },
    ]
    if (canal) nodes.push({ label: canal.nombre, tipo: 'canal', canalTipo: canal.tipo })
    onAddToCanvas(nodes)
  }

  return (
    <BACPanel title="Participantes" code="BAC-04" color="#5448A0" onClose={onClose}>
      <div className="p-3 space-y-1">
        {state.participantes.map((p) => {
          const canal = getCanal(p.canal_id)
          const canalColor = canal ? CANAL_COLORS[canal.tipo].border : '#5448A0'
          return (
            <div key={p.id}
              className="group rounded-xl px-3 py-2.5 transition-colors"
              style={{ background: 'rgba(84,72,160,0.07)', border: '1px solid rgba(84,72,160,0.12)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(84,72,160,0.13)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(84,72,160,0.07)')}>
              <div className="flex items-start gap-2">
                <div className="flex flex-col items-center gap-1 flex-shrink-0 mt-0.5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(84,72,160,0.15)' }}>
                    <Users size={12} style={{ color: '#9B8FE4' }} strokeWidth={1.8} />
                  </div>
                  <span className="text-[9px] font-black" style={{ color: '#9B8FE4', fontFamily: 'Raleway, sans-serif' }}>
                    {participanteLabel(p)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-md)', fontFamily: 'Raleway, sans-serif' }}>
                    {displayName(p)}
                  </p>
                  {p.rol && (
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-dim)', fontFamily: 'Raleway, sans-serif' }}>
                      {p.rol}
                    </p>
                  )}
                  {canal && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full mt-1"
                      style={{ background: canalColor + '18', color: canalColor }}>
                      en {canal.nombre} · {canal.tipo}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleAddToCanvas(p)} title="Añadir al canvas"
                    className="w-6 h-6 flex items-center justify-center rounded"
                    style={{ color: '#9B8FE4' }}>
                    <ExternalLink size={11} strokeWidth={2} />
                  </button>
                  <button onClick={() => dispatch({ type: 'DELETE_PARTICIPANTE', id: p.id })}
                    className="w-6 h-6 flex items-center justify-center rounded"
                    style={{ color: '#B03040' }}>
                    <Trash2 size={11} strokeWidth={2} />
                  </button>
                </div>
              </div>
            </div>
          )
        })}

        {adding ? (
          <div className="rounded-xl p-3 mt-2 space-y-2"
            style={{ background: 'rgba(84,72,160,0.08)', border: '1px solid rgba(84,72,160,0.2)' }}>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--text-dim)', fontFamily: 'Raleway, sans-serif' }}>Nombre del participante</p>
              <input
                className="w-full bg-transparent border-b text-xs outline-none py-1"
                style={{ color: 'var(--text-md)', borderColor: 'rgba(84,72,160,0.3)', fontFamily: 'Raleway, sans-serif' }}
                placeholder="Ej. Juan Pérez, Gerente de compras…"
                value={form.nombre || ''}
                onChange={e => setForm({ ...form, nombre: e.target.value })}
                autoFocus />
            </div>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--text-dim)', fontFamily: 'Raleway, sans-serif' }}>Canal</p>
              <select
                className="w-full bg-transparent text-xs outline-none py-1 border-b"
                style={{ color: 'var(--text-md)', borderColor: 'rgba(84,72,160,0.25)', fontFamily: 'Raleway, sans-serif' }}
                value={form.canal_id || ''}
                onChange={e => setForm({ ...form, canal_id: e.target.value })}>
                <option value="" style={{ background: 'var(--bg-elevated)' }}>Seleccionar canal…</option>
                {state.canales.map(c => (
                  <option key={c.id} value={c.id} style={{ background: 'var(--bg-elevated)' }}>{c.nombre} ({c.tipo})</option>
                ))}
              </select>
            </div>
            <input
              className="w-full bg-transparent border-b text-xs outline-none py-1"
              style={{ color: 'var(--text-dim)', borderColor: 'rgba(84,72,160,0.2)', fontFamily: 'Raleway, sans-serif' }}
              placeholder="Rol (ej. Comprador, Aprobador…)"
              value={form.rol || ''}
              onChange={e => setForm({ ...form, rol: e.target.value })} />
            <div className="flex gap-2 pt-1">
              <button onClick={handleSave}
                disabled={!form.nombre?.trim() || !form.canal_id}
                className="flex-1 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-40"
                style={{ background: '#5448A0', color: '#fff' }}>
                Guardar
              </button>
              <button onClick={() => { setAdding(false); setForm({}) }}
                className="flex-1 py-1.5 rounded-lg text-xs font-semibold"
                style={{ background: 'var(--bg-card-hover)', color: 'var(--text-dim)' }}>
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setAdding(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs mt-1 transition-colors"
            style={{ color: '#9B8FE4', border: '1px dashed rgba(155,143,228,0.25)' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#9B8FE488')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(155,143,228,0.25)')}>
            <Plus size={12} strokeWidth={2} />
            <span style={{ fontFamily: 'Raleway, sans-serif' }}>Nueva participación</span>
          </button>
        )}
      </div>
    </BACPanel>
  )
}
