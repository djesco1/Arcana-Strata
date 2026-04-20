import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Pencil, ChevronRight, TrendingUp, Check, X } from 'lucide-react'
import { FinancialProvider, useFinancialStore } from '../store/financialStore'
import { Header } from '../components/layout/Header'
import { useAuth } from '../hooks/useAuth'
import { PyGLineaChart } from '../components/financial/PyGLineaChart'
import { ConsolidatedPyGChart } from '../components/financial/ConsolidatedPyGChart'
import { BalanceChart } from '../components/financial/BalanceChart'
import { CashFlowChart } from '../components/financial/CashFlowChart'
import { IndicatorsPanel } from '../components/financial/IndicatorsPanel'
import { BAC39Table } from '../components/financial/BAC39Table'
import type { Bac39Analysis } from '../types/financial'
import { PeriodoEditor } from '../components/financial/PeriodoEditor'
import { IngresosEgresosTable } from '../components/financial/IngresosEgresosTable'
import { calcIndicadores } from '../components/financial/utils'
import type { LineaNegocio, PeriodoFinanciero } from '../types/financial'
import { emptyIE } from '../types/financial'

type Tab = 'ie' | 'balance' | 'flujo' | 'indicadores' | 'bac39'

const C = '#1B7A5F'
const C_LIGHT = 'rgba(27,122,95,0.12)'

function newLinea(nombre: string): LineaNegocio {
  return { id: crypto.randomUUID(), nombre, periodos: [] }
}

function newPeriodo(label: string): PeriodoFinanciero {
  return {
    id: crypto.randomUUID(), label,
    ie: emptyIE(),
    balance: { activoCorriente: 0, activoNoCorriente: 0, pasivoCorriente: 0, pasivoNoCorriente: 0, patrimonio: 0 },
    flujos: [],
  }
}

function FinancialContent() {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const { state, dispatch, dbLoading } = useFinancialStore()
  const [activeTab, setActiveTab] = useState<Tab>('ie')
  const [showEditor, setShowEditor] = useState(false)
  const [editingPeriodo, setEditingPeriodo] = useState<PeriodoFinanciero | undefined>()
  const [addingLinea, setAddingLinea] = useState(false)
  const [lineaForm, setLineaForm] = useState('')
  const [editingLineaId, setEditingLineaId] = useState<string | null>(null)
  const [editingLineaNombre, setEditingLineaNombre] = useState('')

  const lineas = state.lineas ?? []
  const activeLinea = lineas.find(l => l.id === state.activeLineaId) ?? lineas[0] ?? null
  const activePeriodo = activeLinea?.periodos?.find(p => p.id === state.activePeriodoId) ?? activeLinea?.periodos?.[0] ?? null

  const tabs: { key: Tab; label: string }[] = [
    { key: 'ie', label: 'Ingresos & Egresos' },
    { key: 'balance', label: 'Balance General' },
    { key: 'flujo', label: 'Flujo de Caja' },
    { key: 'indicadores', label: 'Indicadores' },
    { key: 'bac39', label: 'Análisis Horizontal' },
  ]

  function handleSavePeriodo(p: PeriodoFinanciero) {
    if (!activeLinea) return
    if (editingPeriodo) dispatch({ type: 'UPDATE_PERIODO', lineaId: activeLinea.id, periodo: p })
    else dispatch({ type: 'ADD_PERIODO', lineaId: activeLinea.id, periodo: p })
    setShowEditor(false); setEditingPeriodo(undefined)
  }

  function handleAddLinea() {
    if (!lineaForm.trim()) return
    dispatch({ type: 'ADD_LINEA', linea: newLinea(lineaForm.trim()) })
    setLineaForm(''); setAddingLinea(false)
  }

  function handleQuickAddPeriodo() {
    if (!activeLinea) return
    const year = new Date().getFullYear()
    const existing = activeLinea.periodos.map(p => p.label)
    let label = String(year)
    let i = 1
    while (existing.includes(label)) label = `${year}-${++i}`
    dispatch({ type: 'ADD_PERIODO', lineaId: activeLinea.id, periodo: newPeriodo(label) })
  }

  const indicators = activePeriodo ? calcIndicadores(activePeriodo) : null
  const emptyBac39: Bac39Analysis = { rows: {}, conclusiones: [] }
  const bac39 = state.bac39 ?? emptyBac39

  if (dbLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="auth-spin w-8 h-8 rounded-full mx-auto mb-3" style={{ border: `2px solid rgba(27,122,95,0.3)`, borderTopColor: C }} />
          <p style={{ color: C, fontFamily: 'Raleway', fontSize: 12 }}>Cargando modelo financiero…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen" style={{ background: 'var(--bg-base)' }}>
      <Header projectName="Modelo Financiero" onSignOut={signOut} onBackToDashboard={() => navigate('/app')} />

      <div className="flex flex-1 overflow-hidden">
        {/* ── Sidebar ───────────────────────────────────────────────── */}
        <aside className="flex flex-col py-3 px-2 flex-shrink-0"
          style={{ width: 180, background: 'var(--bg-surface)', borderRight: '1px solid var(--border-lo)', overflowY: 'auto' }}>

          {/* Líneas de negocio */}
          <div className="flex items-center justify-between px-2 mb-1.5">
            <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--text-xdim)', fontFamily: 'Raleway, sans-serif' }}>Líneas de negocio</span>
            <button onClick={() => setAddingLinea(!addingLinea)} className="w-5 h-5 flex items-center justify-center rounded"
              style={{ color: C }}
              onMouseEnter={e => (e.currentTarget.style.background = C_LIGHT)}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              title="Nueva línea">
              <Plus size={11} strokeWidth={2.5} />
            </button>
          </div>

          {addingLinea && (
            <div className="flex gap-1 px-1 mb-2">
              <input autoFocus className="flex-1 px-2 py-1 rounded-lg text-[11px] outline-none"
                style={{ background: 'var(--bg-card)', border: `1px solid ${C}40`, color: 'var(--text-hi)', fontFamily: 'Raleway, sans-serif' }}
                placeholder="Nombre…" value={lineaForm}
                onChange={e => setLineaForm(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddLinea(); if (e.key === 'Escape') { setAddingLinea(false); setLineaForm('') } }} />
              <button onClick={handleAddLinea} className="w-6 h-6 flex items-center justify-center rounded" style={{ background: C, color: '#fff' }}>
                <Check size={10} strokeWidth={3} />
              </button>
            </div>
          )}

          {state.lineas.length === 0 && !addingLinea && (
            <button onClick={() => setAddingLinea(true)}
              className="flex flex-col items-center gap-2 py-5 rounded-xl mx-1 mb-2"
              style={{ border: '1px dashed var(--border-md)', color: 'var(--text-xdim)', fontFamily: 'Raleway, sans-serif' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = C)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-md)')}>
              <TrendingUp size={16} strokeWidth={1.5} />
              <span className="text-[10px]">Nueva línea</span>
            </button>
          )}

          {lineas.map(linea => {
            const isActive = linea.id === (activeLinea?.id ?? '')
            return (
              <div key={linea.id} className="mb-1">
                {/* Línea header */}
                <div className="group flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer"
                  style={{
                    background: isActive ? C_LIGHT : 'transparent',
                    border: isActive ? `1px solid ${C}30` : '1px solid transparent',
                  }}
                  onClick={() => dispatch({ type: 'SET_LINEA', id: linea.id })}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-card-hover)' }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}>
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <ChevronRight size={9} strokeWidth={2.5} style={{ color: isActive ? C : 'var(--text-xdim)', flexShrink: 0 }} />
                    {editingLineaId === linea.id ? (
                      <input autoFocus className="flex-1 bg-transparent outline-none text-[11px] font-semibold"
                        style={{ color: 'var(--text-hi)', fontFamily: 'Raleway, sans-serif' }}
                        value={editingLineaNombre}
                        onChange={e => setEditingLineaNombre(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') { dispatch({ type: 'UPDATE_LINEA_NOMBRE', id: linea.id, nombre: editingLineaNombre }); setEditingLineaId(null) }
                          if (e.key === 'Escape') setEditingLineaId(null)
                        }}
                        onBlur={() => { dispatch({ type: 'UPDATE_LINEA_NOMBRE', id: linea.id, nombre: editingLineaNombre }); setEditingLineaId(null) }}
                        onClick={e => e.stopPropagation()} />
                    ) : (
                      <span className="text-[11px] font-semibold truncate" style={{ color: isActive ? C : 'var(--text-md)', fontFamily: 'Raleway, sans-serif' }}>
                        {linea.nombre}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button onClick={e => { e.stopPropagation(); setEditingLineaId(linea.id); setEditingLineaNombre(linea.nombre) }}
                      className="w-4 h-4 flex items-center justify-center rounded"
                      style={{ color: 'var(--text-dim)' }}
                      onMouseEnter={e => (e.currentTarget.style.color = C)}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}>
                      <Pencil size={9} strokeWidth={2} />
                    </button>
                    <button onClick={e => { e.stopPropagation(); dispatch({ type: 'DELETE_LINEA', id: linea.id }) }}
                      className="w-4 h-4 flex items-center justify-center rounded"
                      style={{ color: 'var(--text-dim)' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#F87171')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}>
                      <X size={9} strokeWidth={2} />
                    </button>
                  </div>
                </div>

                {/* Períodos under active línea */}
                {isActive && (
                  <div className="ml-4 mt-0.5 flex flex-col gap-0.5">
                    {(linea.periodos ?? []).map(p => {
                      const isPeriodoActive = p.id === (activePeriodo?.id ?? '')
                      return (
                        <div key={p.id}
                          className="group flex items-center justify-between px-2 py-1 rounded-md cursor-pointer"
                          style={{
                            background: isPeriodoActive ? C_LIGHT : 'transparent',
                            border: isPeriodoActive ? `1px solid ${C}20` : '1px solid transparent',
                          }}
                          onClick={() => dispatch({ type: 'SET_PERIODO', id: p.id })}
                          onMouseEnter={e => { if (!isPeriodoActive) e.currentTarget.style.background = 'var(--bg-card-hover)' }}
                          onMouseLeave={e => { if (!isPeriodoActive) e.currentTarget.style.background = 'transparent' }}>
                          <span className="text-[11px] font-medium" style={{ color: isPeriodoActive ? C : 'var(--text-md)', fontFamily: 'Raleway, sans-serif' }}>
                            {p.label}
                          </span>
                          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={e => { e.stopPropagation(); setEditingPeriodo(p); setShowEditor(true) }}
                              className="w-4 h-4 flex items-center justify-center rounded"
                              style={{ color: 'var(--text-dim)' }}
                              onMouseEnter={e => (e.currentTarget.style.color = C)}
                              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}>
                              <Pencil size={8} strokeWidth={2} />
                            </button>
                            <button onClick={e => { e.stopPropagation(); dispatch({ type: 'DELETE_PERIODO', lineaId: linea.id, id: p.id }) }}
                              className="w-4 h-4 flex items-center justify-center rounded"
                              style={{ color: 'var(--text-dim)' }}
                              onMouseEnter={e => (e.currentTarget.style.color = '#F87171')}
                              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}>
                              <X size={8} strokeWidth={2} />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                    <button onClick={handleQuickAddPeriodo}
                      className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold"
                      style={{ color: C, fontFamily: 'Raleway, sans-serif', opacity: 0.6 }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '0.6')}>
                      <Plus size={9} strokeWidth={2.5} /> Período
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </aside>

        {/* ── Main ──────────────────────────────────────────────────── */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center gap-0.5 px-5 pt-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-lo)' }}>
            {tabs.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className="px-4 py-2 text-[11px] font-semibold transition-colors"
                style={{
                  fontFamily: 'Raleway, sans-serif',
                  color: activeTab === t.key ? C : 'var(--text-dim)',
                  borderBottom: activeTab === t.key ? `2px solid ${C}` : '2px solid transparent',
                }}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {!activeLinea ? (
              <div className="flex flex-col items-center justify-center h-full gap-4" style={{ color: 'var(--text-xdim)' }}>
                <TrendingUp size={40} strokeWidth={1} style={{ color: C }} />
                <p className="text-[13px]" style={{ fontFamily: 'Raleway, sans-serif' }}>Crea una línea de negocio para comenzar.</p>
                <button onClick={() => setAddingLinea(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold"
                  style={{ background: `linear-gradient(135deg, ${C}, #2EA87E)`, color: '#fff', fontFamily: 'Raleway, sans-serif' }}>
                  <Plus size={13} strokeWidth={2.5} /> Nueva línea de negocio
                </button>
              </div>
            ) : !activePeriodo ? (
              <div className="flex flex-col items-center justify-center h-full gap-4" style={{ color: 'var(--text-xdim)' }}>
                <TrendingUp size={36} strokeWidth={1} style={{ color: C }} />
                <p className="text-[13px]" style={{ fontFamily: 'Raleway, sans-serif' }}>
                  Línea: <span style={{ color: C, fontWeight: 700 }}>{activeLinea.nombre}</span> — sin períodos.
                </p>
                <button onClick={handleQuickAddPeriodo}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold"
                  style={{ background: `linear-gradient(135deg, ${C}, #2EA87E)`, color: '#fff', fontFamily: 'Raleway, sans-serif' }}>
                  <Plus size={13} strokeWidth={2.5} /> Agregar período
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-6 max-w-5xl mx-auto">

                {/* Title */}
                <div className="flex items-center gap-3">
                  <h2 className="text-[15px] font-bold" style={{ color: 'var(--text-hi)', fontFamily: 'Raleway, sans-serif' }}>
                    <span style={{ color: C }}>{activeLinea.nombre}</span>
                    <span style={{ color: 'var(--text-dim)' }}> · </span>
                    {activePeriodo.label}
                  </h2>
                </div>

                {/* ── Ingresos & Egresos (inline editable table) ── */}
                {activeTab === 'ie' && (
                  <ChartCard title="Ingresos & Egresos" subtitle="Edita los rubros directamente en la tabla — los totales se calculan automáticamente">
                    <IngresosEgresosTable
                      ie={activePeriodo.ie}
                      onChange={ie => dispatch({ type: 'UPDATE_IE', lineaId: activeLinea.id, periodoId: activePeriodo.id, ie })}
                    />
                  </ChartCard>
                )}

                {activeTab === 'ie' && (
                  <div className="grid grid-cols-2 gap-6">
                    <ChartCard title="Resumen I&E" subtitle="Vista gráfica de ingresos, costos y utilidades">
                      <PyGLineaChart ie={activePeriodo.ie} />
                    </ChartCard>
                    <ChartCard title="Cascada de Resultados" subtitle="De ingresos a utilidad neta">
                      <ConsolidatedPyGChart periodo={activePeriodo} />
                    </ChartCard>
                  </div>
                )}

                {activeTab === 'balance' && (
                  <>
                    <ChartCard title="Balance General" subtitle="Edita los valores directamente — el gráfico se actualiza en tiempo real">
                      <div className="grid grid-cols-2 gap-6 mb-6">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: C, fontFamily: 'Raleway, sans-serif' }}>Activo</p>
                          <div className="flex flex-col gap-2">
                            {([
                              { key: 'activoCorriente', label: 'Activo Corriente' },
                              { key: 'activoNoCorriente', label: 'Activo No Corriente' },
                            ] as { key: keyof typeof activePeriodo.balance; label: string }[]).map(({ key, label }) => (
                              <BalanceField key={key} label={label} value={activePeriodo.balance[key]}
                                onChange={v => dispatch({ type: 'UPDATE_PERIODO', lineaId: activeLinea.id, periodo: { ...activePeriodo, balance: { ...activePeriodo.balance, [key]: v } } })} />
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#B03040', fontFamily: 'Raleway, sans-serif' }}>Pasivo</p>
                          <div className="flex flex-col gap-2">
                            {([
                              { key: 'pasivoCorriente', label: 'Pasivo Corriente' },
                              { key: 'pasivoNoCorriente', label: 'Pasivo No Corriente' },
                            ] as { key: keyof typeof activePeriodo.balance; label: string }[]).map(({ key, label }) => (
                              <BalanceField key={key} label={label} value={activePeriodo.balance[key]}
                                onChange={v => dispatch({ type: 'UPDATE_PERIODO', lineaId: activeLinea.id, periodo: { ...activePeriodo, balance: { ...activePeriodo.balance, [key]: v } } })} />
                            ))}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#9B8FE4', fontFamily: 'Raleway, sans-serif' }}>Patrimonio</p>
                          <BalanceField label="Patrimonio" value={activePeriodo.balance.patrimonio}
                            onChange={v => dispatch({ type: 'UPDATE_PERIODO', lineaId: activeLinea.id, periodo: { ...activePeriodo, balance: { ...activePeriodo.balance, patrimonio: v } } })} />
                        </div>
                      </div>
                      <BalanceChart balance={activePeriodo.balance} />
                    </ChartCard>
                  </>
                )}

                {activeTab === 'flujo' && (
                  <ChartCard title="Flujo de Caja" subtitle="Agrega intervalos (ej: T1, T2, T3, T4) dentro del período activo — el gráfico se actualiza en tiempo real">
                    <div className="flex flex-col gap-2 mb-6">
                      {/* Column headers */}
                      {activePeriodo.flujos.length > 0 && (
                        <div className="grid gap-2 mb-1" style={{ gridTemplateColumns: '80px 1fr 1fr 1fr 28px' }}>
                          {['Intervalo', 'Operacional', 'Inversión', 'Financiación', ''].map((h, i) => (
                            <span key={i} className="text-[9px] font-bold uppercase tracking-widest px-1" style={{ color: 'var(--text-xdim)', fontFamily: 'Raleway, sans-serif' }}>{h}</span>
                          ))}
                        </div>
                      )}
                      {activePeriodo.flujos.map((f, i) => {
                        const updFlujo = (patch: Partial<typeof f>) => {
                          const flujos = activePeriodo.flujos.map((x, idx) => idx === i ? { ...x, ...patch } : x)
                          dispatch({ type: 'UPDATE_PERIODO', lineaId: activeLinea.id, periodo: { ...activePeriodo, flujos } })
                        }
                        const delFlujo = () => {
                          const flujos = activePeriodo.flujos.filter((_, idx) => idx !== i)
                          dispatch({ type: 'UPDATE_PERIODO', lineaId: activeLinea.id, periodo: { ...activePeriodo, flujos } })
                        }
                        return (
                          <div key={i} className="grid gap-2 items-center" style={{ gridTemplateColumns: '80px 1fr 1fr 1fr 28px' }}>
                            <input value={f.label} onChange={e => updFlujo({ label: e.target.value })}
                              className="px-2 py-1.5 rounded-lg text-[11px] outline-none text-center"
                              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-md)', color: 'var(--text-hi)', fontFamily: 'Raleway, sans-serif' }}
                              onFocus={e => { e.currentTarget.style.borderColor = 'var(--border-hi)'; e.currentTarget.select() }}
                              onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-md)')} />
                            {(['operacional', 'inversion', 'financiacion'] as const).map(field => (
                              <div key={field} className="flex items-center gap-1 px-2 py-1.5 rounded-lg" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-md)' }}>
                                <span className="text-[9px]" style={{ color: 'var(--text-xdim)' }}>$</span>
                                <input type="number" value={f[field] || ''} placeholder="0"
                                  onChange={e => updFlujo({ [field]: Number(e.target.value) || 0 })}
                                  className="flex-1 bg-transparent outline-none text-[11px] text-right"
                                  style={{ color: 'var(--text-hi)', fontFamily: 'Raleway, sans-serif' }}
                                  onFocus={e => { e.currentTarget.parentElement!.style.borderColor = 'var(--border-hi)'; e.currentTarget.select() }}
                                  onBlur={e => (e.currentTarget.parentElement!.style.borderColor = 'var(--border-md)')} />
                              </div>
                            ))}
                            <button onClick={delFlujo} className="w-7 h-7 flex items-center justify-center rounded-lg"
                              style={{ color: 'var(--text-dim)' }}
                              onMouseEnter={e => (e.currentTarget.style.color = '#F87171')}
                              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}>
                              <X size={13} strokeWidth={1.8} />
                            </button>
                          </div>
                        )
                      })}
                      <button
                        onClick={() => {
                          const flujos = [...activePeriodo.flujos, { label: `P${activePeriodo.flujos.length + 1}`, operacional: 0, inversion: 0, financiacion: 0 }]
                          dispatch({ type: 'UPDATE_PERIODO', lineaId: activeLinea.id, periodo: { ...activePeriodo, flujos } })
                        }}
                        className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-2 rounded-lg self-start mt-1"
                        style={{ color: C, border: `1px solid ${C}40`, fontFamily: 'Raleway, sans-serif' }}
                        onMouseEnter={e => (e.currentTarget.style.background = C_LIGHT)}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <Plus size={12} strokeWidth={2.5} /> Agregar intervalo
                      </button>
                    </div>
                    <CashFlowChart flujos={activePeriodo.flujos} />
                  </ChartCard>
                )}

                {activeTab === 'indicadores' && indicators && (
                  <ChartCard title="Indicadores Financieros" subtitle="Calculados automáticamente sobre el período activo">
                    <IndicatorsPanel ind={indicators} />
                  </ChartCard>
                )}

                {activeTab === 'bac39' && (
                  <ChartCard title="Análisis Horizontal" badge="BAC-39" subtitle="Los 25 indicadores financieros a través del tiempo, por línea de negocio, con análisis e interpretación">
                    <BAC39Table
                      lineas={lineas}
                      bac39={bac39}
                      onUpdate={b => dispatch({ type: 'UPDATE_BAC39', bac39: b })}
                    />
                  </ChartCard>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {showEditor && (
        <PeriodoEditor
          initial={editingPeriodo}
          onSave={handleSavePeriodo}
          onClose={() => { setShowEditor(false); setEditingPeriodo(undefined) }}
        />
      )}
    </div>
  )
}

function BalanceField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col gap-0.5">
      <label className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-xdim)', fontFamily: 'Raleway, sans-serif' }}>{label}</label>
      <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-md)' }}>
        <span className="text-[10px]" style={{ color: 'var(--text-xdim)' }}>$</span>
        <input
          type="number" value={value || ''}
          placeholder="0"
          onChange={e => onChange(Number(e.target.value) || 0)}
          className="flex-1 bg-transparent outline-none text-[12px]"
          style={{ color: 'var(--text-hi)', fontFamily: 'Raleway, sans-serif' }}
          onFocus={e => { e.currentTarget.parentElement!.style.borderColor = 'var(--border-hi)'; e.currentTarget.select() }}
          onBlur={e => (e.currentTarget.parentElement!.style.borderColor = 'var(--border-md)')}
        />
      </div>
    </div>
  )
}

function ChartCard({ title, subtitle, badge = 'BAC-55', children }: { title: string; subtitle: string; badge?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-lo)' }}>
      <div className="flex items-center gap-2 mb-0.5">
        <span className="text-[9px] font-black px-1.5 py-0.5 rounded tracking-widest"
          style={{ background: 'rgba(27,122,95,0.15)', color: C, border: '1px solid rgba(27,122,95,0.25)', fontFamily: 'Raleway, sans-serif' }}>
          {badge}
        </span>
        <p className="text-[13px] font-bold" style={{ color: 'var(--text-hi)', fontFamily: 'Raleway, sans-serif' }}>{title}</p>
      </div>
      <p className="text-[11px] mb-4" style={{ color: 'var(--text-xdim)', fontFamily: 'Raleway, sans-serif' }}>{subtitle}</p>
      {children}
    </div>
  )
}

export function FinancialPage() {
  return (
    <FinancialProvider>
      <FinancialContent />
    </FinancialProvider>
  )
}
