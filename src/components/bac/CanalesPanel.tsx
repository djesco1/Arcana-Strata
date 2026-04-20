import { useState, useRef, useEffect } from 'react'
import { Plus, Trash2, ExternalLink, ChevronDown, ChevronRight, Zap } from 'lucide-react'
import { BACPanel } from './BACPanel'
import { useBACStore } from '../../store/bacStore'
import type { Canal, CanalTipo, CanalActividad, BACNodeData } from '../../types/bac'
import { CANAL_COLORS } from '../../constants/colors'

const TIPOS: CanalTipo[] = ['R', 'D', 'M', 'A', 'T', 'I']

interface Props {
  onClose: () => void
  onAddToCanvas: (data: BACNodeData) => void
}

export function CanalesPanel({ onClose, onAddToCanvas }: Props) {
  const { state, dispatch } = useBACStore()
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState<Partial<Canal>>({ tipo: 'D' })
  const [expanded, setExpanded] = useState<string | null>(null)
  const [addingAct, setAddingAct] = useState<string | null>(null)
  const [actForm, setActForm] = useState({ nombre: '', participantes: [] as string[], recursos: [] as string[] })
  const [openDrop, setOpenDrop] = useState<'participantes' | 'recursos' | null>(null)
  const addAreaRef = useRef<HTMLDivElement>(null)

  // Auto-save when clicking outside the add row area
  useEffect(() => {
    if (!addingAct) return
    const canal = state.canales.find(c => c.id === addingAct)
    if (!canal) return
    const handler = (e: MouseEvent) => {
      if (addAreaRef.current && !addAreaRef.current.contains(e.target as Node)) {
        if (actForm.nombre.trim() || actForm.participantes.length > 0 || actForm.recursos.length > 0) {
          handleAddActividad(canal)
        }
        setAddingAct(null)
        setOpenDrop(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [addingAct, actForm, state.canales])  // eslint-disable-line react-hooks/exhaustive-deps

  const participanteLabel = (idx: number) => `P${idx + 1}`
  const recursoLabel = (idx: number) => `R${idx + 1}`

  const toggleSel = (field: 'participantes' | 'recursos', label: string) => {
    setActForm(f => ({
      ...f,
      [field]: f[field].includes(label) ? f[field].filter(x => x !== label) : [...f[field], label],
    }))
  }

  const handleSave = () => {
    if (!form.nombre?.trim()) return
    const canal: Canal = {
      id: crypto.randomUUID(),
      negocio_id: 'demo',
      nombre: form.nombre,
      tipo: (form.tipo as CanalTipo) || 'D',
      descripcion: form.descripcion,
      es_indirecto: false,
      actividades: [],
    }
    dispatch({ type: 'ADD_CANAL', canal })
    setForm({ tipo: 'D' })
    setAdding(false)
  }

  const handleAddActividad = (canal: Canal) => {
    if (!actForm.nombre.trim() && actForm.participantes.length === 0 && actForm.recursos.length === 0) return
    const act: CanalActividad = {
      id: crypto.randomUUID(),
      nombre: actForm.nombre,
      id_participantes: actForm.participantes.join(', '),
      id_recursos: actForm.recursos.join(', '),
    }
    dispatch({ type: 'UPDATE_CANAL', canal: { ...canal, actividades: [...(canal.actividades ?? []), act] } })
    setActForm({ nombre: '', participantes: [], recursos: [] })
  }

  const handleDeleteActividad = (canal: Canal, actId: string) => {
    dispatch({ type: 'UPDATE_CANAL', canal: { ...canal, actividades: (canal.actividades ?? []).filter(a => a.id !== actId) } })
  }

  // Canal label: D1, R2, M1… (tipo + position among same-tipo canals)
  const canalLabel = (canal: Canal) => {
    const sameType = state.canales.filter(c => c.tipo === canal.tipo)
    const pos = sameType.findIndex(c => c.id === canal.id) + 1
    return `${canal.tipo}${pos}`
  }
  const actLabel = (canal: Canal, actIdx: number) => `${canalLabel(canal)}.${actIdx + 1}`

  return (
    <BACPanel title="Fichas de Canales" code="BAC-03" color="#C87A2F" onClose={onClose}>
      <div className="p-3 space-y-1.5">
        {state.canales.map((canal) => {
          const meta = CANAL_COLORS[canal.tipo]
          const isOpen = expanded === canal.id
          const actividades = canal.actividades ?? []

          return (
            <div key={canal.id} className="rounded-xl overflow-hidden"
              style={{ background: 'var(--bg-card)', border: `1px solid ${meta.border}25` }}>

              {/* Canal header */}
              <div className="flex items-center gap-2 px-3 py-2.5">
                <button onClick={() => setExpanded(isOpen ? null : canal.id)}
                  className="flex items-center gap-2 flex-1 min-w-0 text-left">
                  {isOpen
                    ? <ChevronDown size={12} style={{ color: meta.border, flexShrink: 0 }} />
                    : <ChevronRight size={12} style={{ color: meta.border, flexShrink: 0 }} />}
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: meta.border + '18' }}>
                    <Zap size={12} style={{ color: meta.border }} strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-black" style={{ color: meta.border, fontFamily: 'Raleway, sans-serif' }}>
                        {canalLabel(canal)}
                      </span>
                      <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-md)', fontFamily: 'Raleway, sans-serif' }}>
                        {canal.nombre}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: meta.border + '18', color: meta.border }}>
                        {canal.tipo} · {meta.label}
                      </span>
                      {actividades.length > 0 && (
                        <span className="text-[9px]" style={{ color: 'var(--text-xdim)', fontFamily: 'Raleway, sans-serif' }}>
                          {actividades.length} actividad{actividades.length !== 1 ? 'es' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <button onClick={() => onAddToCanvas({ label: canal.nombre, tipo: 'canal', canalTipo: canal.tipo, descripcion: canal.descripcion })}
                    className="w-6 h-6 flex items-center justify-center rounded" title="Añadir al canvas"
                    style={{ color: meta.border }}>
                    <ExternalLink size={11} strokeWidth={2} />
                  </button>
                  <button onClick={() => dispatch({ type: 'DELETE_CANAL', id: canal.id })}
                    className="w-6 h-6 flex items-center justify-center rounded"
                    style={{ color: '#B03040' }}>
                    <Trash2 size={11} strokeWidth={2} />
                  </button>
                </div>
              </div>

              {/* Expanded: descripción + tabla de actividades */}
              {isOpen && (
                <div style={{ borderTop: `1px solid ${meta.border}15` }}>
                  {canal.descripcion && (
                    <p className="px-4 pt-2 pb-1 text-[10px]"
                      style={{ color: 'var(--text-dim)', fontFamily: 'Raleway, sans-serif' }}>
                      {canal.descripcion}
                    </p>
                  )}

                  {/* Actividades table */}
                  <div className="px-3 pb-3" ref={addingAct === canal.id ? addAreaRef : undefined}>
                    <table className="w-full text-[10px] mt-2 border-collapse"
                      style={{ fontFamily: 'Raleway, sans-serif', border: `1px solid ${meta.border}20` }}>
                      <thead>
                        <tr style={{ background: meta.border + '12' }}>
                          <th className="px-2 py-1.5 text-left font-bold w-10" style={{ color: meta.border, border: `1px solid ${meta.border}15` }}>ID</th>
                          <th className="px-2 py-1.5 text-left font-bold" style={{ color: meta.border, border: `1px solid ${meta.border}15` }}>Nombre</th>
                          <th className="px-2 py-1.5 text-center font-bold w-24" style={{ color: meta.border, border: `1px solid ${meta.border}15` }}>Participantes</th>
                          <th className="px-2 py-1.5 text-center font-bold w-20" style={{ color: meta.border, border: `1px solid ${meta.border}15` }}>Recursos</th>
                        </tr>
                      </thead>
                      <tbody>
                        {actividades.map((a, ai) => (
                          <tr key={a.id} className="group" style={{ borderTop: `1px solid ${meta.border}10` }}>
                            <td className="px-2 py-1.5 font-black text-[9px] relative" style={{ color: meta.border, border: `1px solid ${meta.border}10` }}>
                              <span className="group-hover:invisible">{actLabel(canal, ai)}</span>
                              <button onClick={() => handleDeleteActividad(canal, a.id)}
                                className="absolute inset-0 w-full h-full items-center justify-center hidden group-hover:flex"
                                style={{ color: '#B03040' }}>
                                <Trash2 size={9} strokeWidth={2} />
                              </button>
                            </td>
                            <td className="px-2 py-1.5" style={{ color: 'var(--text-md)', border: `1px solid ${meta.border}10` }}>
                              {a.nombre || '—'}
                            </td>
                            <td className="px-2 py-1.5 text-center" style={{ color: 'var(--text-dim)', border: `1px solid ${meta.border}10` }}>
                              {a.id_participantes || '—'}
                            </td>
                            <td className="px-2 py-1.5 text-center" style={{ color: 'var(--text-dim)', border: `1px solid ${meta.border}10` }}>
                              {a.id_recursos || '—'}
                            </td>
                          </tr>
                        ))}

                        {/* Inline add row */}
                        {addingAct === canal.id ? (
                          <tr style={{ background: meta.border + '06', borderTop: `1px solid ${meta.border}15` }}>
                            <td className="px-2 py-1.5 font-black text-[9px]" style={{ color: meta.border, border: `1px solid ${meta.border}10` }}>
                              {actLabel(canal, actividades.length)}
                            </td>
                            <td className="px-2 py-1" style={{ border: `1px solid ${meta.border}10` }}>
                              <input className="w-full bg-transparent outline-none text-[10px]"
                                style={{ color: 'var(--text-md)', fontFamily: 'Raleway, sans-serif' }}
                                placeholder="Nombre…"
                                value={actForm.nombre}
                                onChange={e => setActForm({ ...actForm, nombre: e.target.value })}
                                onKeyDown={e => { if (e.key === 'Enter') { handleAddActividad(canal); setAddingAct(null) } }}
                                autoFocus />
                            </td>
                            {/* Participantes dropdown */}
                            <td className="px-1.5 py-1 relative" style={{ border: `1px solid ${meta.border}10` }}>
                              <button onClick={() => setOpenDrop(openDrop === 'participantes' ? null : 'participantes')}
                                className="w-full flex items-center justify-between gap-1 px-1.5 py-0.5 rounded text-[9px]"
                                style={{ border: `1px solid ${meta.border}25`, color: actForm.participantes.length ? '#9B8FE4' : 'var(--text-xdim)' }}>
                                <span className="truncate">{actForm.participantes.length ? actForm.participantes.join(', ') : 'Seleccionar…'}</span>
                                <ChevronDown size={8} strokeWidth={2} />
                              </button>
                              {openDrop === 'participantes' && state.participantes.length > 0 && (
                                <div className="absolute z-50 left-0 top-full mt-0.5 w-40 rounded-lg overflow-hidden shadow-xl"
                                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-md)' }}>
                                  {state.participantes.map((p, pi) => {
                                    const lbl = participanteLabel(pi)
                                    const sel = actForm.participantes.includes(lbl)
                                    return (
                                      <button key={p.id} onClick={() => toggleSel('participantes', lbl)}
                                        className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-[10px] transition-colors"
                                        style={{ background: sel ? '#9B8FE415' : 'transparent', color: sel ? '#9B8FE4' : 'var(--text-md)' }}
                                        onMouseEnter={e => { if (!sel) e.currentTarget.style.background = 'var(--bg-card-hover)' }}
                                        onMouseLeave={e => { if (!sel) e.currentTarget.style.background = 'transparent' }}>
                                        <span className="font-black text-[9px] w-6 flex-shrink-0" style={{ color: '#9B8FE4' }}>{lbl}</span>
                                        <span className="truncate">{p.nombre || p.rol || ''}</span>
                                      </button>
                                    )
                                  })}
                                </div>
                              )}
                            </td>
                            {/* Recursos dropdown */}
                            <td className="px-1.5 py-1 relative" style={{ border: `1px solid ${meta.border}10` }}>
                              <button onClick={() => setOpenDrop(openDrop === 'recursos' ? null : 'recursos')}
                                className="w-full flex items-center justify-between gap-1 px-1.5 py-0.5 rounded text-[9px]"
                                style={{ border: `1px solid ${meta.border}25`, color: actForm.recursos.length ? '#5B96D0' : 'var(--text-xdim)' }}>
                                <span className="truncate">{actForm.recursos.length ? actForm.recursos.join(', ') : 'Seleccionar…'}</span>
                                <ChevronDown size={8} strokeWidth={2} />
                              </button>
                              {openDrop === 'recursos' && state.recursos.length > 0 && (
                                <div className="absolute z-50 left-0 top-full mt-0.5 w-40 rounded-lg overflow-hidden shadow-xl"
                                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-md)' }}>
                                  {state.recursos.map((r, ri) => {
                                    const lbl = recursoLabel(ri)
                                    const sel = actForm.recursos.includes(lbl)
                                    return (
                                      <button key={r.id} onClick={() => toggleSel('recursos', lbl)}
                                        className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-[10px] transition-colors"
                                        style={{ background: sel ? '#2B6CB015' : 'transparent', color: sel ? '#5B96D0' : 'var(--text-md)' }}
                                        onMouseEnter={e => { if (!sel) e.currentTarget.style.background = 'var(--bg-card-hover)' }}
                                        onMouseLeave={e => { if (!sel) e.currentTarget.style.background = 'transparent' }}>
                                        <span className="font-black text-[9px] w-6 flex-shrink-0" style={{ color: '#5B96D0' }}>{lbl}</span>
                                        <span className="truncate">{r.nombre}</span>
                                      </button>
                                    )
                                  })}
                                </div>
                              )}
                            </td>
                          </tr>
                        ) : null}
                      </tbody>
                    </table>

                    {addingAct !== canal.id && (
                      <button onClick={() => { setAddingAct(canal.id); setActForm({ nombre: '', participantes: [], recursos: [] }); setOpenDrop(null) }}
                        className="flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded mt-2"
                        style={{ color: meta.border, border: `1px dashed ${meta.border}35`, fontFamily: 'Raleway, sans-serif' }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = meta.border + '70')}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = meta.border + '35')}>
                        <Plus size={10} strokeWidth={2.5} />
                        Nueva actividad
                      </button>
                    )}
                    {addingAct === canal.id && (
                      <button onClick={() => { setAddingAct(null); setOpenDrop(null) }}
                        className="text-[10px] mt-1 px-2 py-0.5 rounded"
                        style={{ color: 'var(--text-xdim)', fontFamily: 'Raleway, sans-serif' }}>
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {/* Add canal form */}
        {adding ? (
          <div className="rounded-xl p-3 mt-2 space-y-2"
            style={{ background: 'rgba(200,122,47,0.08)', border: '1px solid rgba(200,122,47,0.2)' }}>
            <input className="w-full bg-transparent border-b text-xs outline-none py-1"
              style={{ color: 'var(--text-md)', borderColor: 'rgba(200,122,47,0.3)', fontFamily: 'Raleway, sans-serif' }}
              placeholder="Nombre del canal…"
              value={form.nombre || ''} onChange={e => setForm({ ...form, nombre: e.target.value })} autoFocus
              onKeyDown={e => e.key === 'Enter' && handleSave()} />
            <input className="w-full bg-transparent border-b text-xs outline-none py-1"
              style={{ color: 'var(--text-dim)', borderColor: 'rgba(200,122,47,0.15)', fontFamily: 'Raleway, sans-serif' }}
              placeholder="Descripción del canal…"
              value={form.descripcion || ''} onChange={e => setForm({ ...form, descripcion: e.target.value })} />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {TIPOS.map(t => {
                const m = CANAL_COLORS[t]
                return (
                  <button key={t} onClick={() => setForm({ ...form, tipo: t })}
                    className="px-2 py-1 rounded-lg text-[10px] font-bold transition-all"
                    style={{
                      background: form.tipo === t ? m.border + '30' : m.border + '10',
                      color: form.tipo === t ? m.border : m.border + '88',
                      border: `1px solid ${form.tipo === t ? m.border + '50' : 'transparent'}`,
                    }}>
                    {t}
                  </button>
                )
              })}
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={handleSave} className="flex-1 py-1.5 rounded-lg text-xs font-semibold"
                style={{ background: '#C87A2F', color: '#fff' }}>
                Guardar
              </button>
              <button onClick={() => { setAdding(false); setForm({ tipo: 'D' }) }}
                className="flex-1 py-1.5 rounded-lg text-xs font-semibold"
                style={{ background: 'var(--bg-card-hover)', color: 'var(--text-dim)' }}>
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setAdding(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-colors mt-1"
            style={{ color: '#C87A2F', border: '1px dashed rgba(200,122,47,0.3)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#C87A2F88'; e.currentTarget.style.color = '#E89B57' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(200,122,47,0.3)'; e.currentTarget.style.color = '#C87A2F' }}>
            <Plus size={12} strokeWidth={2} />
            <span style={{ fontFamily: 'Raleway, sans-serif' }}>Nuevo canal</span>
          </button>
        )}
      </div>
    </BACPanel>
  )
}
