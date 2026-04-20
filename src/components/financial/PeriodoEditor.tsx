import { useState } from 'react'
import { X, Plus, Trash2, Check } from 'lucide-react'
import type { PeriodoFinanciero, FlujoCaja } from '../../types/financial'
import { emptyIE } from '../../types/financial'

interface Props {
  initial?: PeriodoFinanciero
  onSave: (p: PeriodoFinanciero) => void
  onClose: () => void
}

function emptyFlujo(label: string): FlujoCaja {
  return { label, operacional: 0, inversion: 0, financiacion: 0 }
}

function newPeriodo(): PeriodoFinanciero {
  return {
    id: crypto.randomUUID(),
    label: String(new Date().getFullYear()),
    ie: emptyIE(),
    balance: { activoCorriente: 0, activoNoCorriente: 0, pasivoCorriente: 0, pasivoNoCorriente: 0, patrimonio: 0 },
    flujos: [emptyFlujo('T1'), emptyFlujo('T2'), emptyFlujo('T3'), emptyFlujo('T4')],
  }
}

function NumInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col gap-0.5">
      <label className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-xdim)', fontFamily: 'Raleway, sans-serif' }}>{label}</label>
      <input
        type="number" value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full px-2.5 py-1.5 rounded-lg text-[12px] outline-none"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-md)', color: 'var(--text-hi)', fontFamily: 'Raleway, sans-serif' }}
        onFocus={e => { e.currentTarget.style.borderColor = 'var(--border-hi)'; e.currentTarget.select() }}
        onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-md)')}
      />
    </div>
  )
}

export function PeriodoEditor({ initial, onSave, onClose }: Props) {
  const [periodo, setPeriodo] = useState<PeriodoFinanciero>(() => initial ?? newPeriodo())
  const [tab, setTab] = useState<'balance' | 'flujo'>('balance')

  const setLabel = (label: string) => setPeriodo(p => ({ ...p, label }))
  const setBalance = (key: keyof PeriodoFinanciero['balance'], v: number) =>
    setPeriodo(p => ({ ...p, balance: { ...p.balance, [key]: v } }))

  const addFlujo = () => setPeriodo(p => ({ ...p, flujos: [...p.flujos, emptyFlujo(`P${p.flujos.length + 1}`)] }))
  const setFlujo = (i: number, key: keyof FlujoCaja, v: string | number) =>
    setPeriodo(p => ({ ...p, flujos: p.flujos.map((f, idx) => idx === i ? { ...f, [key]: v } : f) }))
  const removeFlujo = (i: number) =>
    setPeriodo(p => ({ ...p, flujos: p.flujos.filter((_, idx) => idx !== i) }))

  const tabs = [
    { key: 'balance' as const, label: 'Balance General' },
    { key: 'flujo' as const, label: 'Flujo de Caja' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="rounded-2xl flex flex-col" style={{
        width: 520, maxHeight: '86vh', background: 'var(--bg-surface)',
        border: '1px solid var(--border-md)', boxShadow: 'var(--shadow-panel)',
      }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border-lo)' }}>
          <div className="flex items-center gap-3">
            <span className="text-[13px] font-bold" style={{ color: 'var(--text-hi)', fontFamily: 'Raleway, sans-serif' }}>
              {initial ? 'Editar período' : 'Nuevo período'}
            </span>
            <input value={periodo.label} onChange={e => setLabel(e.target.value)}
              className="px-2 py-0.5 rounded-lg text-[12px] outline-none w-20"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-md)', color: 'var(--text-hi)', fontFamily: 'Raleway, sans-serif' }}
              placeholder="Ej: 2024"
              onFocus={e => e.currentTarget.select()} />
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg"
            style={{ color: 'var(--text-dim)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            <X size={14} strokeWidth={2} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-5 gap-1 pt-3" style={{ borderBottom: '1px solid var(--border-lo)' }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="px-3 py-2 text-[11px] font-semibold rounded-t-lg transition-colors"
              style={{
                fontFamily: 'Raleway, sans-serif',
                color: tab === t.key ? '#34D399' : 'var(--text-dim)',
                borderBottom: tab === t.key ? '2px solid #34D399' : '2px solid transparent',
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4" style={{ minHeight: 0 }}>
          {tab === 'balance' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-xdim)', fontFamily: 'Raleway, sans-serif' }}>Activo</p>
                <div className="flex flex-col gap-2">
                  <NumInput label="Activo Corriente" value={periodo.balance.activoCorriente} onChange={v => setBalance('activoCorriente', v)} />
                  <NumInput label="Activo No Corriente" value={periodo.balance.activoNoCorriente} onChange={v => setBalance('activoNoCorriente', v)} />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-xdim)', fontFamily: 'Raleway, sans-serif' }}>Pasivo</p>
                <div className="flex flex-col gap-2">
                  <NumInput label="Pasivo Corriente" value={periodo.balance.pasivoCorriente} onChange={v => setBalance('pasivoCorriente', v)} />
                  <NumInput label="Pasivo No Corriente" value={periodo.balance.pasivoNoCorriente} onChange={v => setBalance('pasivoNoCorriente', v)} />
                </div>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-xdim)', fontFamily: 'Raleway, sans-serif' }}>Patrimonio</p>
                <NumInput label="Patrimonio" value={periodo.balance.patrimonio} onChange={v => setBalance('patrimonio', v)} />
              </div>
            </div>
          )}

          {tab === 'flujo' && (
            <div className="flex flex-col gap-3">
              {periodo.flujos.map((f, i) => (
                <div key={i} className="flex items-end gap-2">
                  <div className="flex flex-col gap-0.5 w-14">
                    <label className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-xdim)', fontFamily: 'Raleway, sans-serif' }}>Período</label>
                    <input value={f.label} onChange={e => setFlujo(i, 'label', e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg text-[11px] outline-none"
                      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-md)', color: 'var(--text-hi)', fontFamily: 'Raleway, sans-serif' }}
                    />
                  </div>
                  <div className="flex-1"><NumInput label="Operacional" value={f.operacional} onChange={v => setFlujo(i, 'operacional', v)} /></div>
                  <div className="flex-1"><NumInput label="Inversión" value={f.inversion} onChange={v => setFlujo(i, 'inversion', v)} /></div>
                  <div className="flex-1"><NumInput label="Financiación" value={f.financiacion} onChange={v => setFlujo(i, 'financiacion', v)} /></div>
                  <button onClick={() => removeFlujo(i)} className="w-7 h-7 flex items-center justify-center rounded-lg mb-0.5"
                    style={{ color: 'var(--text-dim)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#F87171')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}>
                    <Trash2 size={13} strokeWidth={1.8} />
                  </button>
                </div>
              ))}
              <button onClick={addFlujo} className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-2 rounded-lg self-start mt-1"
                style={{ color: '#34D399', border: '1px solid rgba(52,211,153,0.3)', fontFamily: 'Raleway, sans-serif' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(52,211,153,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <Plus size={12} strokeWidth={2.5} /> Agregar período
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-3" style={{ borderTop: '1px solid var(--border-lo)' }}>
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-[12px] font-semibold"
            style={{ background: 'var(--bg-card-hover)', color: 'var(--text-dim)', fontFamily: 'Raleway, sans-serif' }}>
            Cancelar
          </button>
          <button onClick={() => onSave(periodo)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold"
            style={{ background: 'linear-gradient(135deg, #1B7A5F, #2EA87E)', color: '#fff', fontFamily: 'Raleway, sans-serif' }}>
            <Check size={13} strokeWidth={2.5} /> Guardar período
          </button>
        </div>
      </div>
    </div>
  )
}
