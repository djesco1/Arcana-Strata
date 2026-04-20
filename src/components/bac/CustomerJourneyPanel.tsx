import { useState } from 'react'
import { Plus, Trash2, ChevronDown, ChevronRight, X, Zap, Users, Smartphone } from 'lucide-react'
import { useBACStore } from '../../store/bacStore'
import type { CustomerJourney, EtapaJourney, AccionJourney, Canal } from '../../types/bac'

const COLOR = '#9B8FE4'
const ETAPA_COLORS = ['#2B6CB0', '#5448A0', '#1B7A5F', '#C87A2F', '#B03040', '#9B8FE4']

interface Props { onClose: () => void }

export function CustomerJourneyPanel({ onClose }: Props) {
  const { state, dispatch } = useBACStore()

  const [selectedId, setSelectedId] = useState<string | null>(state.journeys[0]?.id ?? null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [addingJourney, setAddingJourney] = useState(false)
  const [journeyServicioId, setJourneyServicioId] = useState('')
  const [addingEtapa, setAddingEtapa] = useState(false)
  const [etapaForm, setEtapaForm] = useState({ nombre: '', resultado: '' })
  const [addingAcc, setAddingAcc] = useState<string | null>(null) // etapa_id
  const [accForm, setAccForm] = useState({ nombre: '', actor_id: '', medio_id: '' })
  const [openActDrop, setOpenActDrop] = useState<string | null>(null) // etapa_id

  const journey = state.journeys.find(j => j.id === selectedId)

  // ── helpers ──────────────────────────────────────────────────────────────
  const servicioIdx = (id?: string) => id ? state.servicios.findIndex(s => s.id === id) + 1 : 0
  const etapaLabel = (j: CustomerJourney, etapa: EtapaJourney) => {
    const si = servicioIdx(j.servicio_id)
    const ei = j.etapas.findIndex(e => e.id === etapa.id) + 1
    return `S${si}.${ei}`
  }
  const accionLabel = (j: CustomerJourney, etapa: EtapaJourney, ai: number) => {
    const si = servicioIdx(j.servicio_id)
    const ei = j.etapas.findIndex(e => e.id === etapa.id) + 1
    return `Ac${si}.${ei}.${ai + 1}`
  }
  const canalLabel = (canal: Canal) => {
    const sameType = state.canales.filter(c => c.tipo === canal.tipo)
    const pos = sameType.findIndex(c => c.id === canal.id) + 1
    return `${canal.tipo}${pos}`
  }
  const allActividades = state.canales.flatMap((c, _ci) =>
    (c.actividades ?? []).map((a, ai) => ({
      ...a, canal: c, label: `${canalLabel(c)}.${ai + 1}`,
    }))
  )

  // ── handlers ─────────────────────────────────────────────────────────────
  const handleAddJourney = () => {
    if (!journeyServicioId) return
    const s = state.servicios.find(s => s.id === journeyServicioId)
    if (!s) return
    const j: CustomerJourney = {
      id: crypto.randomUUID(), negocio_id: 'demo',
      servicio_id: journeyServicioId, nombre: s.nombre, etapas: [],
    }
    dispatch({ type: 'ADD_JOURNEY', journey: j })
    setSelectedId(j.id)
    setJourneyServicioId(''); setAddingJourney(false)
  }

  const handleAddEtapa = () => {
    if (!etapaForm.nombre.trim() || !selectedId) return
    const etapa: EtapaJourney = {
      id: crypto.randomUUID(), journey_id: selectedId,
      nombre: etapaForm.nombre, resultado: etapaForm.resultado,
      orden: (journey?.etapas.length ?? 0) + 1,
      acciones: [], actividad_ids: [],
    }
    dispatch({ type: 'ADD_ETAPA', journey_id: selectedId, etapa })
    setExpanded(prev => new Set([...prev, etapa.id]))
    setEtapaForm({ nombre: '', resultado: '' }); setAddingEtapa(false)
  }

  const handleAddAccion = (etapa_id: string) => {
    if (!accForm.nombre.trim() || !selectedId) return
    const accion: AccionJourney = {
      id: crypto.randomUUID(), nombre: accForm.nombre,
      actor_id: accForm.actor_id || undefined,
      medio_id: accForm.medio_id || undefined,
    }
    dispatch({ type: 'ADD_ACCION', journey_id: selectedId, etapa_id, accion })
    setAccForm({ nombre: '', actor_id: '', medio_id: '' }); setAddingAcc(null)
  }

  const toggle = (id: string) => setExpanded(prev => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n
  })

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="absolute left-14 top-3 bottom-3 z-20 flex flex-col rounded-2xl overflow-hidden"
      style={{ width: 400, background: 'var(--bg-surface)', border: `1px solid ${COLOR}18`, boxShadow: '0 8px 60px rgba(0,0,0,0.35)' }}>

      {/* Accent bar */}
      <div className="h-0.5 w-full flex-shrink-0" style={{ background: `linear-gradient(90deg, ${COLOR}, #2B6CB0, transparent)` }} />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ borderBottom: `1px solid ${COLOR}10` }}>
        <div className="flex items-center gap-2.5">
          <span className="text-[9px] font-black px-1.5 py-0.5 rounded" style={{ background: COLOR + '22', color: COLOR }}>BAC-80</span>
          <span className="text-sm font-semibold" style={{ color: 'var(--text-hi)', fontFamily: 'Raleway, sans-serif' }}>Customer Journey</span>
        </div>
        <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg" style={{ color: COLOR }}>
          <X size={14} strokeWidth={1.8} />
        </button>
      </div>

      {/* Journey tabs */}
      <div className="px-3 py-2 flex-shrink-0 flex items-center gap-1.5" style={{ borderBottom: `1px solid ${COLOR}08` }}>
        <div className="flex-1 flex gap-1 overflow-x-auto">
          {state.journeys.map(j => {
            const si = servicioIdx(j.servicio_id)
            const isSel = j.id === selectedId
            return (
              <div key={j.id} className="group flex-shrink-0 flex items-center rounded-lg transition-all"
                style={{ background: isSel ? COLOR + '20' : 'transparent', border: `1px solid ${isSel ? COLOR + '40' : 'transparent'}` }}>
                <button onClick={() => setSelectedId(j.id)}
                  className="px-2.5 py-1 text-[10px] font-semibold whitespace-nowrap"
                  style={{ color: isSel ? 'var(--text-hi)' : 'var(--text-dim)', fontFamily: 'Raleway, sans-serif' }}>
                  {si > 0 ? `S${si}` : ''} {j.nombre}
                </button>
                <button onClick={() => {
                  dispatch({ type: 'DELETE_JOURNEY', id: j.id })
                  if (isSel) setSelectedId(state.journeys.find(x => x.id !== j.id)?.id ?? null)
                }} className="w-4 h-4 mr-1 items-center justify-center rounded hidden group-hover:flex" style={{ color: '#B03040' }}>
                  <X size={9} strokeWidth={2.5} />
                </button>
              </div>
            )
          })}
        </div>
        <button onClick={() => setAddingJourney(!addingJourney)} title="Nuevo journey"
          className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0"
          style={{ color: COLOR, background: addingJourney ? COLOR + '18' : 'transparent' }}>
          <Plus size={13} strokeWidth={2} />
        </button>
      </div>

      {/* New journey form */}
      {addingJourney && (
        <div className="px-3 py-2.5 flex-shrink-0 space-y-2" style={{ borderBottom: `1px solid ${COLOR}08`, background: COLOR + '08' }}>
          <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-xdim)', fontFamily: 'Raleway, sans-serif' }}>Servicio (BAC-02)</p>
          <select className="w-full bg-transparent text-xs outline-none py-1 border-b"
            style={{ color: 'var(--text-md)', borderColor: COLOR + '30', fontFamily: 'Raleway, sans-serif' }}
            value={journeyServicioId} onChange={e => setJourneyServicioId(e.target.value)}>
            <option value="" style={{ background: 'var(--bg-elevated)' }}>Seleccionar servicio…</option>
            {state.servicios.map((s, i) => (
              <option key={s.id} value={s.id} style={{ background: 'var(--bg-elevated)' }}>S{i + 1} · {s.nombre}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button onClick={handleAddJourney} disabled={!journeyServicioId}
              className="flex-1 py-1 rounded-lg text-[11px] font-semibold disabled:opacity-40"
              style={{ background: '#5448A0', color: '#fff' }}>Crear</button>
            <button onClick={() => { setAddingJourney(false); setJourneyServicioId('') }}
              className="flex-1 py-1 rounded-lg text-[11px] font-semibold"
              style={{ background: COLOR + '18', color: COLOR }}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {!journey ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs" style={{ color: 'var(--text-xdim)' }}>Selecciona o crea un journey</p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {/* Service info */}
            {journey.servicio_id && (() => {
              const s = state.servicios.find(x => x.id === journey.servicio_id)
              const si = servicioIdx(journey.servicio_id)
              return s ? (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-1"
                  style={{ background: '#1B7A5F12', border: '1px solid #1B7A5F20' }}>
                  <span className="text-[9px] font-black" style={{ color: '#1B7A5F' }}>S{si}</span>
                  <span className="text-xs font-semibold flex-1" style={{ color: 'var(--text-md)', fontFamily: 'Raleway, sans-serif' }}>{s.nombre}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: '#1B7A5F18', color: '#1B7A5F' }}>{s.objeto_tipo}</span>
                </div>
              ) : null
            })()}

            {/* Etapas */}
            {journey.etapas.sort((a, b) => a.orden - b.orden).map((etapa, ei) => {
              const color = ETAPA_COLORS[ei % ETAPA_COLORS.length]
              const isOpen = expanded.has(etapa.id)
              const acciones = etapa.acciones ?? []
              const actIds = etapa.actividad_ids ?? []

              return (
                <div key={etapa.id} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${color}25` }}>
                  {/* Etapa header */}
                  <div className="flex items-center gap-2 px-3 py-2 cursor-pointer select-none"
                    style={{ background: color + '12' }} onClick={() => toggle(etapa.id)}>
                    {isOpen ? <ChevronDown size={11} style={{ color }} /> : <ChevronRight size={11} style={{ color }} />}
                    <span className="text-[9px] font-black flex-shrink-0" style={{ color, fontFamily: 'Raleway, sans-serif' }}>
                      {etapaLabel(journey, etapa)}
                    </span>
                    <span className="flex-1 text-xs font-semibold truncate" style={{ color: 'var(--text-md)', fontFamily: 'Raleway, sans-serif' }}>
                      {etapa.nombre}
                    </span>
                    {etapa.resultado && !isOpen && (
                      <span className="text-[9px] truncate max-w-[100px]" style={{ color: 'var(--text-xdim)' }}>{etapa.resultado}</span>
                    )}
                    <button onClick={e => { e.stopPropagation(); dispatch({ type: 'DELETE_ETAPA', journey_id: journey.id, etapa_id: etapa.id }) }}
                      className="w-5 h-5 flex items-center justify-center rounded opacity-50 hover:opacity-100 flex-shrink-0"
                      style={{ color: '#B03040' }}>
                      <Trash2 size={9} strokeWidth={2} />
                    </button>
                  </div>

                  {/* Etapa body */}
                  {isOpen && (
                    <div className="px-3 pt-2 pb-3 space-y-3" style={{ background: color + '05' }}>
                      {/* Resultado */}
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-xdim)', fontFamily: 'Raleway, sans-serif' }}>Resultado</p>
                        <input className="w-full bg-transparent border-b text-[11px] outline-none py-0.5"
                          style={{ color: 'var(--text-md)', borderColor: color + '30', fontFamily: 'Raleway, sans-serif' }}
                          placeholder="¿Qué resultado produce esta etapa?"
                          value={etapa.resultado}
                          onChange={e => dispatch({ type: 'UPDATE_ETAPA', journey_id: journey.id, etapa: { ...etapa, resultado: e.target.value } })} />
                      </div>

                      {/* Acciones */}
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-xdim)', fontFamily: 'Raleway, sans-serif' }}>
                          Acciones · {acciones.length}
                        </p>
                        {(acciones.length > 0 || addingAcc === etapa.id) && (
                          <table className="w-full text-[10px] border-collapse mb-1.5"
                            style={{ fontFamily: 'Raleway, sans-serif', border: `1px solid ${color}15` }}>
                            <thead>
                              <tr style={{ background: color + '10' }}>
                                <th className="px-2 py-1 text-left font-bold w-14" style={{ color, border: `1px solid ${color}12` }}>ID</th>
                                <th className="px-2 py-1 text-left font-bold" style={{ color, border: `1px solid ${color}12` }}>Nombre</th>
                                <th className="px-2 py-1 text-center font-bold w-20" style={{ color, border: `1px solid ${color}12` }}>Actor</th>
                                <th className="px-2 py-1 text-center font-bold w-20" style={{ color, border: `1px solid ${color}12` }}>Medio</th>
                              </tr>
                            </thead>
                            <tbody>
                              {acciones.map((ac, ai) => {
                                const actor = state.actores.find(a => a.id === ac.actor_id)
                                const medio = state.medios.find(m => m.id === ac.medio_id)
                                return (
                                  <tr key={ac.id} className="group" style={{ borderTop: `1px solid ${color}08` }}>
                                    <td className="px-2 py-1 font-black text-[9px] relative" style={{ color, border: `1px solid ${color}08` }}>
                                      <span className="group-hover:invisible">{accionLabel(journey, etapa, ai)}</span>
                                      <button onClick={() => dispatch({ type: 'DELETE_ACCION', journey_id: journey.id, etapa_id: etapa.id, accion_id: ac.id })}
                                        className="absolute inset-0 w-full h-full items-center justify-center hidden group-hover:flex"
                                        style={{ color: '#B03040' }}>
                                        <Trash2 size={8} strokeWidth={2} />
                                      </button>
                                    </td>
                                    <td className="px-2 py-1" style={{ color: 'var(--text-md)', border: `1px solid ${color}08` }}>{ac.nombre}</td>
                                    <td className="px-2 py-1 text-center text-[9px]" style={{ color: 'var(--text-dim)', border: `1px solid ${color}08` }}>{actor?.nombre || '—'}</td>
                                    <td className="px-2 py-1 text-center text-[9px]" style={{ color: 'var(--text-dim)', border: `1px solid ${color}08` }}>{medio?.nombre || '—'}</td>
                                  </tr>
                                )
                              })}
                              {addingAcc === etapa.id && (
                                <tr style={{ background: color + '06', borderTop: `1px solid ${color}15` }}>
                                  <td className="px-2 py-1 font-black text-[9px]" style={{ color, border: `1px solid ${color}08` }}>
                                    {accionLabel(journey, etapa, acciones.length)}
                                  </td>
                                  <td className="px-2 py-1" style={{ border: `1px solid ${color}08` }}>
                                    <input className="w-full bg-transparent outline-none text-[10px]"
                                      style={{ color: 'var(--text-md)', fontFamily: 'Raleway, sans-serif' }}
                                      placeholder="Nombre…" value={accForm.nombre}
                                      onChange={e => setAccForm({ ...accForm, nombre: e.target.value })}
                                      onKeyDown={e => { if (e.key === 'Enter') handleAddAccion(etapa.id) }}
                                      autoFocus />
                                  </td>
                                  <td className="px-1 py-1" style={{ border: `1px solid ${color}08` }}>
                                    <select className="w-full bg-transparent outline-none text-[9px]"
                                      style={{ color: accForm.actor_id ? 'var(--text-md)' : 'var(--text-xdim)', fontFamily: 'Raleway, sans-serif' }}
                                      value={accForm.actor_id}
                                      onChange={e => setAccForm({ ...accForm, actor_id: e.target.value })}>
                                      <option value="" style={{ background: 'var(--bg-elevated)' }}>—</option>
                                      {state.actores.map(a => (
                                        <option key={a.id} value={a.id} style={{ background: 'var(--bg-elevated)' }}>{a.nombre}</option>
                                      ))}
                                    </select>
                                  </td>
                                  <td className="px-1 py-1" style={{ border: `1px solid ${color}08` }}>
                                    <select className="w-full bg-transparent outline-none text-[9px]"
                                      style={{ color: accForm.medio_id ? 'var(--text-md)' : 'var(--text-xdim)', fontFamily: 'Raleway, sans-serif' }}
                                      value={accForm.medio_id}
                                      onChange={e => setAccForm({ ...accForm, medio_id: e.target.value })}>
                                      <option value="" style={{ background: 'var(--bg-elevated)' }}>—</option>
                                      {state.medios.map(m => (
                                        <option key={m.id} value={m.id} style={{ background: 'var(--bg-elevated)' }}>{m.nombre}</option>
                                      ))}
                                    </select>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        )}
                        {addingAcc === etapa.id ? (
                          <button onClick={() => setAddingAcc(null)} className="text-[9px] px-2 py-0.5 rounded"
                            style={{ color: 'var(--text-xdim)', fontFamily: 'Raleway, sans-serif' }}>Cancelar</button>
                        ) : (
                          <button onClick={() => { setAddingAcc(etapa.id); setAccForm({ nombre: '', actor_id: '', medio_id: '' }) }}
                            className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded"
                            style={{ color, border: `1px dashed ${color}35`, fontFamily: 'Raleway, sans-serif' }}
                            onMouseEnter={e => (e.currentTarget.style.borderColor = color + '70')}
                            onMouseLeave={e => (e.currentTarget.style.borderColor = color + '35')}>
                            <Plus size={9} strokeWidth={2.5} /> Nueva acción
                          </button>
                        )}
                      </div>

                      {/* Actividades BAC-03 */}
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-xdim)', fontFamily: 'Raleway, sans-serif' }}>
                          Actividades BAC-03 · {actIds.length}
                        </p>
                        {actIds.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-1.5">
                            {actIds.map(aid => {
                              const item = allActividades.find(a => a.id === aid)
                              if (!item) return null
                              return (
                                <span key={aid} className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                                  style={{ background: color + '18', color }}>
                                  {item.label}
                                  <button onClick={() => dispatch({ type: 'TOGGLE_ACTIVIDAD', journey_id: journey.id, etapa_id: etapa.id, actividad_id: aid })}
                                    className="opacity-60 hover:opacity-100" style={{ color: '#B03040' }}>
                                    <X size={8} strokeWidth={2.5} />
                                  </button>
                                </span>
                              )
                            })}
                          </div>
                        )}
                        {/* Actividades dropdown */}
                        {allActividades.length > 0 && (
                          <div className="relative">
                            <button onClick={() => setOpenActDrop(openActDrop === etapa.id ? null : etapa.id)}
                              className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded"
                              style={{ color, border: `1px dashed ${color}35`, fontFamily: 'Raleway, sans-serif' }}
                              onMouseEnter={e => (e.currentTarget.style.borderColor = color + '70')}
                              onMouseLeave={e => (e.currentTarget.style.borderColor = color + '35')}>
                              <Zap size={9} strokeWidth={2.5} /> Añadir actividad
                            </button>
                            {openActDrop === etapa.id && (
                              <div className="absolute z-50 left-0 top-full mt-1 w-56 rounded-xl overflow-hidden shadow-xl"
                                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-md)' }}>
                                <div className="max-h-48 overflow-y-auto">
                                  {state.canales.map((c, _ci) => {
                                    const acts = c.actividades ?? []
                                    if (acts.length === 0) return null
                                    return (
                                      <div key={c.id}>
                                        <p className="px-3 py-1 text-[8px] font-black uppercase tracking-widest"
                                          style={{ color: 'var(--text-xdim)', background: 'var(--bg-surface)' }}>
                                          {canalLabel(c)} · {c.nombre}
                                        </p>
                                        {acts.map((a, ai) => {
                                          const lbl = `${canalLabel(c)}.${ai + 1}`
                                          const sel = actIds.includes(a.id)
                                          return (
                                            <button key={a.id}
                                              onClick={() => dispatch({ type: 'TOGGLE_ACTIVIDAD', journey_id: journey.id, etapa_id: etapa.id, actividad_id: a.id })}
                                              className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-[10px] transition-colors"
                                              style={{ background: sel ? color + '15' : 'transparent', color: sel ? color : 'var(--text-md)' }}
                                              onMouseEnter={e => { if (!sel) e.currentTarget.style.background = 'var(--bg-card-hover)' }}
                                              onMouseLeave={e => { if (!sel) e.currentTarget.style.background = 'transparent' }}>
                                              <span className="font-black text-[9px] w-8 flex-shrink-0" style={{ color }}>{lbl}</span>
                                              <span className="truncate">{a.nombre || '—'}</span>
                                            </button>
                                          )
                                        })}
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        {allActividades.length === 0 && (
                          <p className="text-[9px]" style={{ color: 'var(--text-xdim)', fontFamily: 'Raleway, sans-serif' }}>
                            Sin actividades en BAC-03
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            {/* Add etapa */}
            {addingEtapa ? (
              <div className="rounded-xl p-3 space-y-2" style={{ background: COLOR + '08', border: `1px solid ${COLOR}20` }}>
                <input className="w-full bg-transparent border-b text-xs outline-none py-1"
                  style={{ color: 'var(--text-md)', borderColor: COLOR + '30', fontFamily: 'Raleway, sans-serif' }}
                  placeholder="Nombre de la etapa…"
                  value={etapaForm.nombre} onChange={e => setEtapaForm({ ...etapaForm, nombre: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && handleAddEtapa()} autoFocus />
                <input className="w-full bg-transparent border-b text-xs outline-none py-1"
                  style={{ color: 'var(--text-dim)', borderColor: COLOR + '15', fontFamily: 'Raleway, sans-serif' }}
                  placeholder="Resultado esperado…"
                  value={etapaForm.resultado} onChange={e => setEtapaForm({ ...etapaForm, resultado: e.target.value })} />
                <div className="flex gap-2">
                  <button onClick={handleAddEtapa} disabled={!etapaForm.nombre.trim()}
                    className="flex-1 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-40"
                    style={{ background: '#5448A0', color: '#fff' }}>Añadir etapa</button>
                  <button onClick={() => { setAddingEtapa(false); setEtapaForm({ nombre: '', resultado: '' }) }}
                    className="flex-1 py-1.5 rounded-lg text-xs font-semibold"
                    style={{ background: COLOR + '18', color: COLOR }}>Cancelar</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAddingEtapa(true)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
                style={{ color: COLOR, border: `1px dashed ${COLOR}25` }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = COLOR + '55')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = COLOR + '25')}>
                <Plus size={12} strokeWidth={2} />
                <span style={{ fontFamily: 'Raleway, sans-serif' }}>Nueva etapa</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
