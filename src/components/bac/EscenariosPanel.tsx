import { useState, useRef, useEffect } from 'react'
import { Plus, Trash2, X, BookOpen, ChevronDown } from 'lucide-react'
import { useBACStore } from '../../store/bacStore'
import type { Escenario, SucesoEscenario, Canal } from '../../types/bac'

const COLOR = '#9B8FE4'

interface Props { onClose: () => void }

export function EscenariosPanel({ onClose }: Props) {
  const { state, dispatch } = useBACStore()

  const [selectedId, setSelectedId] = useState<string | null>(state.escenarios[0]?.id ?? null)
  const [addingEsc, setAddingEsc] = useState(false)
  const [escForm, setEscForm] = useState('')
  const [addingRow, setAddingRow] = useState(false)
  const [rowForm, setRowForm] = useState<Partial<SucesoEscenario>>({})
  const [descMode, setDescMode] = useState<'select' | 'libre'>('select')
  const [openDescDrop, setOpenDescDrop] = useState(false)
  const addAreaRef = useRef<HTMLDivElement>(null)

  const escenario = state.escenarios.find(e => e.id === selectedId)
  const sucesos = escenario?.sucesos ?? []

  // ── helpers ───────────────────────────────────────────────────────────────
  const canalLabel = (canal: Canal) => {
    const sameType = state.canales.filter(c => c.tipo === canal.tipo)
    const pos = sameType.findIndex(c => c.id === canal.id) + 1
    return `${canal.tipo}${pos}`
  }

  // All canal actividades with their labels
  const allActividades = state.canales.flatMap(c =>
    (c.actividades ?? []).map((a, ai) => ({
      ...a, canal: c,
      label: `${canalLabel(c)}.${ai + 1}`,
    }))
  )

  // All BAC-80 acciones flattened
  const allAcciones = state.journeys.flatMap(j => {
    const si = state.servicios.findIndex(s => s.id === j.servicio_id) + 1
    return j.etapas.flatMap((etapa, ei) =>
      (etapa.acciones ?? []).map((ac, ai) => ({
        ...ac,
        label: `Ac${si}.${ei + 1}.${ai + 1}`,
        journey: j, etapa,
      }))
    )
  })

  const descDisplay = (s: SucesoEscenario) => {
    if (s.actividad_id) {
      const item = allActividades.find(a => a.id === s.actividad_id)
      if (item) return `${item.label} ${item.nombre || ''}`.trim()
      // check BAC-80 acciones
      const ac = allAcciones.find(a => a.id === s.actividad_id)
      if (ac) return `${ac.label} ${ac.nombre}`.trim()
    }
    return s.descripcion || '—'
  }

  // ── auto-save on click outside ────────────────────────────────────────────
  useEffect(() => {
    if (!addingRow || !escenario) return
    const handler = (e: MouseEvent) => {
      if (addAreaRef.current && !addAreaRef.current.contains(e.target as Node)) {
        commitRow()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [addingRow, rowForm, escenario]) // eslint-disable-line react-hooks/exhaustive-deps

  const commitRow = () => {
    if (!escenario) return
    const hasContent = rowForm.canal_id || rowForm.ejecutor?.trim() || rowForm.actividad_id || rowForm.descripcion?.trim()
    if (hasContent) {
      const suceso: SucesoEscenario = {
        id: crypto.randomUUID(),
        orden: sucesos.length + 1,
        canal_id: rowForm.canal_id,
        ejecutor: rowForm.ejecutor?.trim() || undefined,
        actividad_id: rowForm.actividad_id,
        descripcion: rowForm.descripcion?.trim() || undefined,
      }
      dispatch({ type: 'UPDATE_ESCENARIO', escenario: { ...escenario, sucesos: [...sucesos, suceso] } })
    }
    setRowForm({}); setDescMode('select'); setOpenDescDrop(false); setAddingRow(false)
  }

  const deleteSuceso = (id: string) => {
    if (!escenario) return
    const updated = sucesos.filter(s => s.id !== id).map((s, i) => ({ ...s, orden: i + 1 }))
    dispatch({ type: 'UPDATE_ESCENARIO', escenario: { ...escenario, sucesos: updated } })
  }

  const handleAddEscenario = () => {
    if (!escForm.trim()) return
    const e: Escenario = { id: crypto.randomUUID(), negocio_id: 'demo', nombre: escForm, sucesos: [] }
    dispatch({ type: 'ADD_ESCENARIO', escenario: e })
    setSelectedId(e.id); setEscForm(''); setAddingEsc(false)
  }

  const selectedDescLabel = () => {
    if (!rowForm.actividad_id) return null
    const act = allActividades.find(a => a.id === rowForm.actividad_id)
    if (act) return act.label
    const ac = allAcciones.find(a => a.id === rowForm.actividad_id)
    if (ac) return ac.label
    return null
  }

  return (
    <div className="absolute left-14 top-3 bottom-3 z-20 flex flex-col rounded-2xl overflow-hidden"
      style={{ width: 500, background: 'var(--bg-surface)', border: `1px solid ${COLOR}18`, boxShadow: '0 8px 60px rgba(0,0,0,0.35)' }}>

      {/* Accent */}
      <div className="h-0.5 w-full flex-shrink-0" style={{ background: `linear-gradient(90deg, ${COLOR}, #5448A0, transparent)` }} />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ borderBottom: `1px solid ${COLOR}10` }}>
        <div className="flex items-center gap-2.5">
          <span className="text-[9px] font-black px-1.5 py-0.5 rounded" style={{ background: COLOR + '22', color: COLOR }}>BAC-08</span>
          <span className="text-sm font-semibold" style={{ color: 'var(--text-hi)', fontFamily: 'Raleway, sans-serif' }}>Escenarios de Negocio</span>
        </div>
        <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg" style={{ color: COLOR }}>
          <X size={14} strokeWidth={1.8} />
        </button>
      </div>

      {/* Escenario tabs */}
      <div className="px-3 py-2 flex-shrink-0 flex items-center gap-1.5" style={{ borderBottom: `1px solid ${COLOR}08` }}>
        <div className="flex-1 flex gap-1 overflow-x-auto">
          {state.escenarios.map(e => {
            const isSel = e.id === selectedId
            return (
              <div key={e.id} className="group flex-shrink-0 flex items-center rounded-lg transition-all"
                style={{ background: isSel ? COLOR + '20' : 'transparent', border: `1px solid ${isSel ? COLOR + '40' : 'transparent'}` }}>
                <button onClick={() => setSelectedId(e.id)}
                  className="px-2.5 py-1 text-[10px] font-semibold whitespace-nowrap"
                  style={{ color: isSel ? 'var(--text-hi)' : 'var(--text-dim)', fontFamily: 'Raleway, sans-serif' }}>
                  {e.nombre}
                </button>
                <button onClick={() => {
                  dispatch({ type: 'DELETE_ESCENARIO', id: e.id })
                  if (isSel) setSelectedId(state.escenarios.find(x => x.id !== e.id)?.id ?? null)
                }} className="w-4 h-4 mr-1 items-center justify-center rounded hidden group-hover:flex" style={{ color: '#B03040' }}>
                  <X size={9} strokeWidth={2.5} />
                </button>
              </div>
            )
          })}
        </div>
        <button onClick={() => setAddingEsc(!addingEsc)} title="Nuevo escenario"
          className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0"
          style={{ color: COLOR, background: addingEsc ? COLOR + '18' : 'transparent' }}>
          <Plus size={13} strokeWidth={2} />
        </button>
      </div>

      {/* New escenario form */}
      {addingEsc && (
        <div className="px-3 py-2 flex-shrink-0 flex gap-2 items-center" style={{ borderBottom: `1px solid ${COLOR}08`, background: COLOR + '08' }}>
          <BookOpen size={11} style={{ color: COLOR }} />
          <input className="flex-1 bg-transparent text-xs outline-none"
            style={{ color: 'var(--text-md)', fontFamily: 'Raleway, sans-serif' }}
            placeholder="Nombre del escenario…" value={escForm}
            onChange={e => setEscForm(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddEscenario()} autoFocus />
          <button onClick={handleAddEscenario} disabled={!escForm.trim()}
            className="px-3 py-1 rounded-lg text-[10px] font-semibold disabled:opacity-40"
            style={{ background: '#5448A0', color: '#fff' }}>Crear</button>
          <button onClick={() => { setAddingEsc(false); setEscForm('') }}
            className="px-2 py-1 rounded-lg text-[10px]" style={{ color: 'var(--text-dim)' }}>×</button>
        </div>
      )}

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {!escenario ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs" style={{ color: 'var(--text-xdim)' }}>Selecciona o crea un escenario</p>
          </div>
        ) : (
          <div className="p-3">
            <p className="text-[10px] font-bold mb-2.5" style={{ color: 'var(--text-dim)', fontFamily: 'Raleway, sans-serif' }}>
              Escenario: <span style={{ color: 'var(--text-md)' }}>{escenario.nombre}</span>
            </p>

            <div ref={addAreaRef}>
              <table className="w-full border-collapse text-[10px]"
                style={{ fontFamily: 'Raleway, sans-serif', border: `1px solid ${COLOR}20` }}>
                <thead>
                  <tr style={{ background: COLOR + '12' }}>
                    <th className="px-2 py-1.5 text-center font-bold w-8" style={{ color: COLOR, border: `1px solid ${COLOR}15` }}>#</th>
                    <th className="px-2 py-1.5 text-left font-bold w-16" style={{ color: COLOR, border: `1px solid ${COLOR}15` }}>Canal</th>
                    <th className="px-2 py-1.5 text-left font-bold w-28" style={{ color: COLOR, border: `1px solid ${COLOR}15` }}>Ejecutor</th>
                    <th className="px-2 py-1.5 text-left font-bold" style={{ color: COLOR, border: `1px solid ${COLOR}15` }}>Actividad / Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {sucesos.map(s => {
                    const canal = state.canales.find(c => c.id === s.canal_id)
                    return (
                      <tr key={s.id} className="group" style={{ borderTop: `1px solid ${COLOR}08` }}>
                        <td className="px-2 py-1.5 text-center font-bold text-[9px] relative" style={{ color: COLOR, border: `1px solid ${COLOR}08` }}>
                          <span className="group-hover:invisible">{s.orden}</span>
                          <button onClick={() => deleteSuceso(s.id)}
                            className="absolute inset-0 w-full h-full items-center justify-center hidden group-hover:flex"
                            style={{ color: '#B03040' }}>
                            <Trash2 size={8} strokeWidth={2} />
                          </button>
                        </td>
                        <td className="px-2 py-1.5 font-bold text-[9px]" style={{ color: COLOR, border: `1px solid ${COLOR}08` }}>
                          {canal ? canalLabel(canal) : '—'}
                        </td>
                        <td className="px-2 py-1.5" style={{ color: 'var(--text-dim)', border: `1px solid ${COLOR}08` }}>
                          {s.ejecutor || '—'}
                        </td>
                        <td className="px-2 py-1.5" style={{ color: 'var(--text-md)', border: `1px solid ${COLOR}08` }}>
                          {descDisplay(s)}
                        </td>
                      </tr>
                    )
                  })}

                  {/* Inline add row */}
                  {addingRow && (
                    <tr style={{ background: COLOR + '06', borderTop: `1px solid ${COLOR}15` }}>
                      {/* # */}
                      <td className="px-2 py-1.5 text-center font-bold text-[9px]" style={{ color: COLOR, border: `1px solid ${COLOR}08` }}>
                        {sucesos.length + 1}
                      </td>
                      {/* Canal */}
                      <td className="px-1 py-1" style={{ border: `1px solid ${COLOR}08` }}>
                        <select className="w-full bg-transparent outline-none text-[9px]"
                          style={{ color: rowForm.canal_id ? 'var(--text-md)' : 'var(--text-xdim)', fontFamily: 'Raleway, sans-serif' }}
                          value={rowForm.canal_id ?? ''}
                          onChange={e => setRowForm({ ...rowForm, canal_id: e.target.value || undefined })}>
                          <option value="" style={{ background: 'var(--bg-elevated)' }}>—</option>
                          {state.canales.map(c => (
                            <option key={c.id} value={c.id} style={{ background: 'var(--bg-elevated)' }}>
                              {canalLabel(c)} · {c.nombre}
                            </option>
                          ))}
                        </select>
                      </td>
                      {/* Ejecutor */}
                      <td className="px-2 py-1" style={{ border: `1px solid ${COLOR}08` }}>
                        <input className="w-full bg-transparent outline-none text-[9px]"
                          style={{ color: 'var(--text-md)', fontFamily: 'Raleway, sans-serif' }}
                          placeholder="Tienda, Proveedor…"
                          value={rowForm.ejecutor ?? ''}
                          onChange={e => setRowForm({ ...rowForm, ejecutor: e.target.value })}
                          autoFocus />
                      </td>
                      {/* Actividad/Acción */}
                      <td className="px-1 py-1 relative" style={{ border: `1px solid ${COLOR}08` }}>
                        {descMode === 'libre' ? (
                          <input className="w-full bg-transparent outline-none text-[9px]"
                            style={{ color: 'var(--text-md)', fontFamily: 'Raleway, sans-serif' }}
                            placeholder="Descripción libre…"
                            value={rowForm.descripcion ?? ''}
                            onChange={e => setRowForm({ ...rowForm, descripcion: e.target.value, actividad_id: undefined })}
                            onKeyDown={e => { if (e.key === 'Enter') commitRow() }} />
                        ) : (
                          <button onClick={() => setOpenDescDrop(!openDescDrop)}
                            className="w-full flex items-center justify-between gap-1 px-1.5 py-0.5 rounded text-[9px]"
                            style={{ border: `1px solid ${COLOR}25`, color: rowForm.actividad_id ? 'var(--text-md)' : 'var(--text-xdim)' }}>
                            <span className="truncate">{selectedDescLabel() ?? 'Seleccionar…'}</span>
                            <ChevronDown size={8} strokeWidth={2} />
                          </button>
                        )}
                        {/* Dropdown */}
                        {openDescDrop && descMode === 'select' && (
                          <div className="absolute z-50 right-0 top-full mt-0.5 w-64 rounded-xl overflow-hidden shadow-xl"
                            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-md)' }}>
                            <div className="max-h-56 overflow-y-auto">
                              {/* BAC-03 actividades */}
                              {allActividades.length > 0 && (
                                <>
                                  <p className="px-3 py-1 text-[8px] font-black uppercase tracking-widest"
                                    style={{ background: 'var(--bg-surface)', color: '#C87A2F' }}>BAC-03 Actividades</p>
                                  {state.canales.map(c => {
                                    const acts = c.actividades ?? []
                                    if (!acts.length) return null
                                    return (
                                      <div key={c.id}>
                                        <p className="px-3 py-0.5 text-[8px] font-bold" style={{ color: 'var(--text-xdim)' }}>
                                          {canalLabel(c)} · {c.nombre}
                                        </p>
                                        {acts.map((a, ai) => {
                                          const lbl = `${canalLabel(c)}.${ai + 1}`
                                          return (
                                            <button key={a.id}
                                              onClick={() => { setRowForm({ ...rowForm, actividad_id: a.id, descripcion: undefined }); setOpenDescDrop(false) }}
                                              className="w-full flex items-center gap-2 px-4 py-1.5 text-left text-[9px] transition-colors"
                                              style={{ color: 'var(--text-md)' }}
                                              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                                              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                                              <span className="font-black w-8 flex-shrink-0" style={{ color: '#C87A2F' }}>{lbl}</span>
                                              <span className="truncate">{a.nombre || '—'}</span>
                                            </button>
                                          )
                                        })}
                                      </div>
                                    )
                                  })}
                                </>
                              )}
                              {/* BAC-80 acciones */}
                              {allAcciones.length > 0 && (
                                <>
                                  <p className="px-3 py-1 text-[8px] font-black uppercase tracking-widest"
                                    style={{ background: 'var(--bg-surface)', color: '#9B8FE4' }}>BAC-80 Acciones</p>
                                  {allAcciones.map(ac => (
                                    <button key={ac.id}
                                      onClick={() => { setRowForm({ ...rowForm, actividad_id: ac.id, descripcion: undefined }); setOpenDescDrop(false) }}
                                      className="w-full flex items-center gap-2 px-4 py-1.5 text-left text-[9px] transition-colors"
                                      style={{ color: 'var(--text-md)' }}
                                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                                      <span className="font-black w-12 flex-shrink-0" style={{ color: '#9B8FE4' }}>{ac.label}</span>
                                      <span className="truncate">{ac.nombre}</span>
                                    </button>
                                  ))}
                                </>
                              )}
                              {/* Libre */}
                              <button
                                onClick={() => { setDescMode('libre'); setOpenDescDrop(false); setRowForm({ ...rowForm, actividad_id: undefined }) }}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-[9px] transition-colors"
                                style={{ borderTop: '1px solid var(--border-lo)', color: 'var(--text-dim)' }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                                Texto libre…
                              </button>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {!addingRow ? (
                <button onClick={() => { setAddingRow(true); setRowForm({}); setDescMode('select') }}
                  className="flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded mt-2"
                  style={{ color: COLOR, border: `1px dashed ${COLOR}35`, fontFamily: 'Raleway, sans-serif' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = COLOR + '70')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = COLOR + '35')}>
                  <Plus size={10} strokeWidth={2.5} /> Nuevo suceso
                </button>
              ) : (
                <button onClick={() => { setAddingRow(false); setRowForm({}) }}
                  className="text-[9px] mt-1 px-2 py-0.5 rounded"
                  style={{ color: 'var(--text-xdim)', fontFamily: 'Raleway, sans-serif' }}>Cancelar</button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
