import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { LineaNegocio, PeriodoFinanciero, Bac39Analysis, Bac39RowAnalysis, Bac39Conclusion } from '../../types/financial'
import { ieCalc } from '../../types/financial'
import { calcIE, fmtCOP, pct } from './utils'

const safe = (n: number, d: number) => d === 0 ? 0 : n / d
const C_H = '#3B82F6', C_P = '#7C3AED', C_A = '#D97706'
const C_ING = '#1B7A5F', C_BAL = '#2563EB', C_RAT = '#7C3AED'

type Fmt = 'money' | 'ratio' | 'pct'
interface Def { id: string; label: string; fmt: Fmt; bold?: boolean; calc: (p: PeriodoFinanciero) => number }

const PYG: Def[] = [
  { id: 'I1',  label: 'Ingresos operacionales',    fmt: 'money', calc: p => ieCalc.ingresosOp(p.ie) },
  { id: 'I2',  label: 'Costos directos',            fmt: 'money', calc: p => ieCalc.costos(p.ie) },
  { id: 'I3',  label: 'Utilidad bruta',             fmt: 'money', bold: true, calc: p => calcIE(p.ie).utilidadBruta },
  { id: 'I4',  label: 'Gastos operativos',          fmt: 'money', calc: p => ieCalc.gastos(p.ie) },
  { id: 'I5',  label: 'EBITDA',                     fmt: 'money', bold: true, calc: p => calcIE(p.ie).ebitda },
  { id: 'I6',  label: 'Ingresos no operacionales',  fmt: 'money', calc: p => ieCalc.ingresosNoOp(p.ie) },
  { id: 'I7',  label: 'Egresos no operacionales',   fmt: 'money', calc: p => ieCalc.egresosNoOp(p.ie) },
  { id: 'I8',  label: 'UAI',                        fmt: 'money', bold: true, calc: p => calcIE(p.ie).utilidadAnteImpuestos },
  { id: 'I9',  label: 'Impuestos',                  fmt: 'money', calc: p => calcIE(p.ie).impuestos },
  { id: 'I10', label: 'Utilidad neta',              fmt: 'money', bold: true, calc: p => calcIE(p.ie).utilidadNeta },
]

const BAL: Def[] = [
  { id: 'I11', label: 'Activo no corriente',  fmt: 'money', calc: p => p.balance.activoNoCorriente },
  { id: 'I12', label: 'Activo corriente',     fmt: 'money', calc: p => p.balance.activoCorriente },
  { id: 'I17', label: 'Total activo',         fmt: 'money', bold: true, calc: p => p.balance.activoCorriente + p.balance.activoNoCorriente },
  { id: 'I13', label: 'Pasivo no corriente',  fmt: 'money', calc: p => p.balance.pasivoNoCorriente },
  { id: 'I14', label: 'Pasivo corriente',     fmt: 'money', calc: p => p.balance.pasivoCorriente },
  { id: 'I18', label: 'Total pasivo',         fmt: 'money', bold: true, calc: p => p.balance.pasivoCorriente + p.balance.pasivoNoCorriente },
  { id: 'I15', label: 'Patrimonio neto',      fmt: 'money', bold: true, calc: p => p.balance.patrimonio },
  { id: 'I16', label: 'Capital de trabajo',   fmt: 'money', calc: p => p.balance.activoCorriente - p.balance.pasivoCorriente },
]

const RATIOS: Def[] = [
  { id: 'I19', label: 'Razón corriente',           fmt: 'ratio', calc: p => safe(p.balance.activoCorriente, p.balance.pasivoCorriente) },
  { id: 'I20', label: 'Prueba ácida',              fmt: 'ratio', calc: p => safe(p.balance.activoCorriente, p.balance.pasivoCorriente) },
  { id: 'I21', label: 'Razón de endeudamiento',    fmt: 'pct',   calc: p => safe(p.balance.pasivoCorriente + p.balance.pasivoNoCorriente, p.balance.activoCorriente + p.balance.activoNoCorriente) * 100 },
  { id: 'I22', label: 'Apalancamiento financiero', fmt: 'ratio', calc: p => safe(p.balance.activoCorriente + p.balance.activoNoCorriente, p.balance.patrimonio) },
  { id: 'I23', label: 'Concentración',             fmt: 'ratio', calc: p => safe(p.balance.pasivoCorriente + p.balance.pasivoNoCorriente, p.balance.patrimonio) },
  { id: 'I24', label: 'ROA',                       fmt: 'pct',   calc: p => safe(calcIE(p.ie).utilidadNeta, p.balance.activoCorriente + p.balance.activoNoCorriente) * 100 },
  { id: 'I25', label: 'ROE',                       fmt: 'pct',   calc: p => safe(calcIE(p.ie).utilidadNeta, p.balance.patrimonio) * 100 },
]

function fv(v: number | null, fmt: Fmt): string {
  if (v === null) return '–'
  if (fmt === 'money') return `$ ${fmtCOP(v)}`
  if (fmt === 'pct') return pct(v)
  return v.toFixed(2)
}

function mergePeriodos(lineas: LineaNegocio[], label: string): PeriodoFinanciero | null {
  const ps = lineas.map(l => l.periodos.find(p => p.label === label)).filter(Boolean) as PeriodoFinanciero[]
  if (!ps.length) return null
  return {
    id: '_total_', label, flujos: [],
    balance: {
      activoCorriente:    ps.reduce((s, p) => s + p.balance.activoCorriente, 0),
      activoNoCorriente:  ps.reduce((s, p) => s + p.balance.activoNoCorriente, 0),
      pasivoCorriente:    ps.reduce((s, p) => s + p.balance.pasivoCorriente, 0),
      pasivoNoCorriente:  ps.reduce((s, p) => s + p.balance.pasivoNoCorriente, 0),
      patrimonio:         ps.reduce((s, p) => s + p.balance.patrimonio, 0),
    },
    ie: {
      ingresosOperacionales:   ps.flatMap(p => p.ie.ingresosOperacionales),
      ingresosNoOperacionales: ps.flatMap(p => p.ie.ingresosNoOperacionales),
      costosDirectos:          ps.flatMap(p => p.ie.costosDirectos),
      gastosOperativos:        ps.flatMap(p => p.ie.gastosOperativos),
      egresosNoOperacionales:  ps.flatMap(p => p.ie.egresosNoOperacionales),
      amortizacionDeuda:   ps.reduce((s, p) => s + p.ie.amortizacionDeuda, 0),
      interesesDeuda:      ps.reduce((s, p) => s + p.ie.interesesDeuda, 0),
      depreciacionActivos: ps.reduce((s, p) => s + p.ie.depreciacionActivos, 0),
      pagoImpuestos:       ps.reduce((s, p) => s + p.ie.pagoImpuestos, 0),
    },
  }
}

// ─── Column widths ─────────────────────────────────────────────────────────────
const W_ID = 44, W_IND = 162, W_LN = 100, W_P = 90, W_EV = 172, W_RG = 152, W_IN = 192
const borderLo = '1px solid var(--border-lo)'

// ─── Editable value cell ───────────────────────────────────────────────────────
interface EvcProps {
  calcValue: number | null
  fmt: Fmt
  bold?: boolean
  pres?: boolean
  ovKey: string
  overrides: Record<string, number>
  onOverride: (key: string, val: number | undefined) => void
}

function EditValCell({ calcValue, fmt, bold, pres, ovKey, overrides, onOverride }: EvcProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft]     = useState('')
  const override    = overrides[ovKey]
  const displayVal  = override !== undefined ? override : calcValue
  const isOverridden = override !== undefined

  function commit(raw: string) {
    const trimmed = raw.trim()
    if (trimmed === '') {
      onOverride(ovKey, undefined)
    } else {
      const n = parseFloat(trimmed.replace(/[^0-9.,-]/g, '').replace(',', '.'))
      if (!isNaN(n)) onOverride(ovKey, n)
    }
    setEditing(false)
  }

  const baseStyle: React.CSSProperties = {
    width: W_P, minWidth: W_P, flexShrink: 0,
    borderLeft: borderLo,
    background: pres ? `${C_P}08` : undefined,
    fontSize: 10, fontFamily: 'Raleway, sans-serif',
    fontWeight: bold ? 700 : 400,
  }

  if (editing) {
    return (
      <div style={{ ...baseStyle, padding: '3px 6px', display: 'flex', alignItems: 'center', background: pres ? `${C_P}15` : 'var(--bg-card)', outline: `1px solid ${C_P}` }}>
        <input
          autoFocus
          type="text"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={e => commit(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') e.currentTarget.blur()
            if (e.key === 'Escape') { setEditing(false); setDraft('') }
          }}
          placeholder={calcValue !== null ? String(calcValue) : '0'}
          style={{ width: '100%', background: 'transparent', outline: 'none', fontSize: 10, color: 'var(--text-hi)', fontFamily: 'Raleway, sans-serif', textAlign: 'right' }}
        />
      </div>
    )
  }

  return (
    <div
      title="Clic para editar · Vacío = restaurar calculado"
      onClick={() => { setDraft(override !== undefined ? String(override) : calcValue !== null ? String(calcValue) : ''); setEditing(true) }}
      style={{
        ...baseStyle,
        padding: '5px 8px',
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
        color: displayVal !== null && displayVal < 0 ? '#F87171' : bold ? 'var(--text-hi)' : 'var(--text-md)',
        cursor: 'text',
        position: 'relative',
      }}
    >
      {isOverridden && (
        <span style={{ position: 'absolute', top: 3, left: 4, width: 4, height: 4, borderRadius: '50%', background: '#F59E0B' }} title="Valor editado manualmente" />
      )}
      {fv(displayVal, fmt)}
    </div>
  )
}

// ─── Analysis textarea cell ────────────────────────────────────────────────────
function AnaCell({ id, field, w, rows, onUpdRow }: { id: string; field: keyof Bac39RowAnalysis; w: number; rows: Record<string, Bac39RowAnalysis>; onUpdRow: (id: string, patch: Partial<Bac39RowAnalysis>) => void }) {
  return (
    <textarea rows={2}
      value={rows[id]?.[field] ?? ''}
      onChange={e => onUpdRow(id, { [field]: e.target.value })}
      placeholder="…"
      style={{
        width: w, minWidth: w, flexShrink: 0,
        borderLeft: `1px solid ${C_A}20`,
        background: `${C_A}04`,
        resize: 'none', outline: 'none',
        padding: '5px 8px',
        fontSize: 10, color: 'var(--text-hi)', fontFamily: 'Raleway, sans-serif',
        lineHeight: 1.4,
      }}
    />
  )
}

// ─── Main component ────────────────────────────────────────────────────────────
interface Props {
  lineas: LineaNegocio[]
  bac39: Bac39Analysis
  onUpdate: (b: Bac39Analysis) => void
}

export function BAC39Table({ lineas, bac39, onUpdate }: Props) {
  const allLabels = Array.from(new Set(lineas.flatMap(l => l.periodos.map(p => p.label)))).sort()
  const multi = lineas.length > 1
  const nP = allLabels.length
  const presLabel = allLabels[nP - 1]
  const overrides = bac39.overrides ?? {}

  if (nP === 0) return (
    <div className="flex items-center justify-center py-16 text-[12px]"
      style={{ color: 'var(--text-xdim)', fontFamily: 'Raleway, sans-serif' }}>
      Agrega períodos a las líneas de negocio para ver el análisis horizontal.
    </div>
  )

  const totalW = W_ID + W_IND + (multi ? W_LN : 0) + nP * W_P + W_EV + W_RG + W_IN
  const nHist  = nP - 1

  function setOverride(key: string, val: number | undefined) {
    const next = { ...overrides }
    if (val === undefined) delete next[key]
    else next[key] = val
    onUpdate({ ...bac39, overrides: next })
  }

  function updRow(id: string, patch: Partial<Bac39RowAnalysis>) {
    const cur = bac39.rows[id] ?? { evolucion: '', rangos: '', interpretacion: '' }
    onUpdate({ ...bac39, rows: { ...bac39.rows, [id]: { ...cur, ...patch } } })
  }

  function updConc(i: number, patch: Partial<Bac39Conclusion>) {
    onUpdate({ ...bac39, conclusiones: bac39.conclusiones.map((c, idx) => idx === i ? { ...c, ...patch } : c) })
  }

  function evc(calcValue: number | null, fmt: Fmt, bold: boolean | undefined, pres: boolean, ovKey: string) {
    return <EditValCell calcValue={calcValue} fmt={fmt} bold={bold} pres={pres} ovKey={ovKey} overrides={overrides} onOverride={setOverride} />
  }

  // ── Render one indicator group ───────────────────────────────────────────────
  function renderGroup(def: Def, perLinea: boolean) {
    const rowBg = def.bold ? 'rgba(0,0,0,0.035)' : undefined

    if (!perLinea || !multi) {
      return (
        <div key={def.id} className="flex items-stretch" style={{ borderBottom: borderLo, background: rowBg }}>
          <div style={{ width: W_ID, minWidth: W_ID, flexShrink: 0, padding: '5px 8px', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#9B8FE4', fontFamily: 'Raleway, sans-serif' }}>{def.id}</span>
          </div>
          <div style={{ width: W_IND, minWidth: W_IND, flexShrink: 0, padding: '5px 8px', display: 'flex', alignItems: 'center', borderLeft: borderLo }}>
            <span style={{ fontSize: 10, fontWeight: def.bold ? 700 : 400, color: 'var(--text-hi)', fontFamily: 'Raleway, sans-serif' }}>{def.label}</span>
          </div>
          {multi && <div style={{ width: W_LN, minWidth: W_LN, flexShrink: 0, borderLeft: borderLo }} />}
          {allLabels.map(lbl => {
            const m = mergePeriodos(lineas, lbl)
            return <span key={lbl}>{evc(m ? def.calc(m) : null, def.fmt, def.bold, lbl === presLabel, `${def.id}|_total_|${lbl}`)}</span>
          })}
          <AnaCell id={def.id} field="evolucion"      w={W_EV} rows={bac39.rows} onUpdRow={updRow} />
          <AnaCell id={def.id} field="rangos"         w={W_RG} rows={bac39.rows} onUpdRow={updRow} />
          <AnaCell id={def.id} field="interpretacion" w={W_IN} rows={bac39.rows} onUpdRow={updRow} />
        </div>
      )
    }

    return (
      <div key={def.id} style={{ borderBottom: borderLo }}>
        {lineas.map((ln, li) => (
          <div key={ln.id} className="flex items-stretch" style={{ background: li % 2 === 0 ? 'rgba(0,0,0,0.015)' : undefined }}>
            {li === 0 ? (
              <>
                <div style={{ width: W_ID, minWidth: W_ID, flexShrink: 0, padding: '5px 8px', display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#9B8FE4', fontFamily: 'Raleway, sans-serif' }}>{def.id}</span>
                </div>
                <div style={{ width: W_IND, minWidth: W_IND, flexShrink: 0, padding: '5px 8px', display: 'flex', alignItems: 'center', borderLeft: borderLo }}>
                  <span style={{ fontSize: 10, fontWeight: def.bold ? 700 : 400, color: 'var(--text-hi)', fontFamily: 'Raleway, sans-serif' }}>{def.label}</span>
                </div>
              </>
            ) : (
              <div style={{ width: W_ID + W_IND, minWidth: W_ID + W_IND, flexShrink: 0 }} />
            )}
            <div style={{ width: W_LN, minWidth: W_LN, flexShrink: 0, padding: '5px 8px', display: 'flex', alignItems: 'center', borderLeft: borderLo }}>
              <span style={{ fontSize: 9, color: 'var(--text-dim)', fontFamily: 'Raleway, sans-serif' }} className="truncate">{ln.nombre}</span>
            </div>
            {allLabels.map(lbl => {
              const p = ln.periodos.find(pp => pp.label === lbl)
              return <span key={lbl}>{evc(p ? def.calc(p) : null, def.fmt, false, lbl === presLabel, `${def.id}|${ln.id}|${lbl}`)}</span>
            })}
            {li === 0 ? (
              <>
                <AnaCell id={def.id} field="evolucion"      w={W_EV} rows={bac39.rows} onUpdRow={updRow} />
                <AnaCell id={def.id} field="rangos"         w={W_RG} rows={bac39.rows} onUpdRow={updRow} />
                <AnaCell id={def.id} field="interpretacion" w={W_IN} rows={bac39.rows} onUpdRow={updRow} />
              </>
            ) : (
              <div style={{ width: W_EV + W_RG + W_IN, flexShrink: 0 }} />
            )}
          </div>
        ))}
        {/* Total row */}
        <div className="flex items-stretch" style={{ background: 'rgba(0,0,0,0.04)' }}>
          <div style={{ width: W_ID + W_IND, minWidth: W_ID + W_IND, flexShrink: 0 }} />
          <div style={{ width: W_LN, minWidth: W_LN, flexShrink: 0, padding: '5px 8px', display: 'flex', alignItems: 'center', borderLeft: borderLo }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-md)', fontFamily: 'Raleway, sans-serif' }}>Total</span>
          </div>
          {allLabels.map(lbl => {
            const m = mergePeriodos(lineas, lbl)
            return <span key={lbl}>{evc(m ? def.calc(m) : null, def.fmt, true, lbl === presLabel, `${def.id}|_total_|${lbl}`)}</span>
          })}
          <div style={{ width: W_EV + W_RG + W_IN, flexShrink: 0 }} />
        </div>
      </div>
    )
  }

  function SectionHead({ title, color }: { title: string; color: string }) {
    return (
      <div className="flex items-center px-3 py-2" style={{ background: `${color}10`, borderBottom: `1px solid ${color}25` }}>
        <span style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color, fontFamily: 'Raleway, sans-serif' }}>{title}</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">

      {/* ── Leyenda overrides ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-[10px]" style={{ color: 'var(--text-xdim)', fontFamily: 'Raleway, sans-serif' }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F59E0B', display: 'inline-block', flexShrink: 0 }} />
        Celdas con punto naranja = valor editado manualmente. Clic en cualquier celda para editar; borra el contenido para restaurar el valor calculado.
      </div>

      {/* ── Main table ────────────────────────────────────────────────────── */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-lo)' }}>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: totalW }}>

            {/* Header row 1: group spans */}
            <div className="flex" style={{ background: 'var(--bg-card)', borderBottom: borderLo }}>
              <div style={{ width: W_ID + W_IND + (multi ? W_LN : 0), flexShrink: 0 }} />
              {nHist > 0 && (
                <div style={{ width: nHist * W_P, flexShrink: 0, borderLeft: `2px solid ${C_H}`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px 0' }}>
                  <span style={{ fontSize: 8, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: C_H, fontFamily: 'Raleway, sans-serif' }}>Histórico</span>
                </div>
              )}
              <div style={{ width: W_P, flexShrink: 0, borderLeft: `2px solid ${C_P}`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px 0' }}>
                <span style={{ fontSize: 8, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: C_P, fontFamily: 'Raleway, sans-serif' }}>Presupuesto</span>
              </div>
              <div style={{ width: W_EV + W_RG + W_IN, flexShrink: 0, borderLeft: `2px solid ${C_A}`, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px 0' }}>
                <span style={{ fontSize: 8, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: C_A, fontFamily: 'Raleway, sans-serif' }}>Análisis e interpretación</span>
              </div>
            </div>

            {/* Header row 2: column labels */}
            <div className="flex" style={{ background: 'var(--bg-card)', borderBottom: '2px solid var(--border-md)' }}>
              {[{ w: W_ID, label: 'ID' }, { w: W_IND, label: 'Indicador' }, ...(multi ? [{ w: W_LN, label: 'Línea' }] : [])].map((h, i) => (
                <div key={h.label} style={{ width: h.w, minWidth: h.w, flexShrink: 0, borderLeft: i === 0 ? undefined : borderLo, padding: '6px 8px', display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-xdim)', fontFamily: 'Raleway, sans-serif' }}>{h.label}</span>
                </div>
              ))}
              {allLabels.map((lbl, i) => (
                <div key={lbl} style={{ width: W_P, minWidth: W_P, flexShrink: 0, borderLeft: `1px solid ${i === nP - 1 ? C_P : C_H}40`, padding: '6px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: i === nP - 1 ? C_P : C_H, fontFamily: 'Raleway, sans-serif' }}>{lbl}</span>
                </div>
              ))}
              {[{ w: W_EV, label: 'Evolución del indicador' }, { w: W_RG, label: 'Rangos en la industria' }, { w: W_IN, label: 'Interpretación' }].map(h => (
                <div key={h.label} style={{ width: h.w, minWidth: h.w, flexShrink: 0, borderLeft: `1px solid ${C_A}30`, padding: '6px 8px', display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: C_A, fontFamily: 'Raleway, sans-serif' }}>{h.label}</span>
                </div>
              ))}
            </div>

            <SectionHead title="Ingresos & Egresos — I1 a I10" color={C_ING} />
            {PYG.map(d => renderGroup(d, true))}

            <SectionHead title="Balance General — I11 a I18" color={C_BAL} />
            {BAL.map(d => renderGroup(d, true))}

            <SectionHead title="Liquidez, Solvencia & Rentabilidad — I19 a I25" color={C_RAT} />
            {RATIOS.map(d => renderGroup(d, false))}
          </div>
        </div>
      </div>

      {/* ── Conclusiones ──────────────────────────────────────────────────── */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-lo)' }}>
        <div className="flex items-center justify-between px-4 py-2.5" style={{ background: `${C_A}10`, borderBottom: `1px solid ${C_A}25` }}>
          <span style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: C_A, fontFamily: 'Raleway, sans-serif' }}>Conclusiones e hipótesis</span>
          <button onClick={() => onUpdate({ ...bac39, conclusiones: [...bac39.conclusiones, { id: '', conclusion: '', justificacion: '' }] })}
            className="flex items-center gap-1 px-2 py-1 rounded text-[9px] font-semibold"
            style={{ color: C_A, border: `1px solid ${C_A}40`, fontFamily: 'Raleway, sans-serif' }}
            onMouseEnter={e => (e.currentTarget.style.background = `${C_A}15`)}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            <Plus size={9} strokeWidth={2.5} /> Agregar
          </button>
        </div>
        <div className="grid" style={{ gridTemplateColumns: '64px 1fr 1fr 32px', borderBottom: '1px solid var(--border-md)', background: 'var(--bg-card)' }}>
          {['ID', 'Conclusión | Hipótesis', 'Justificación | Evidencia', ''].map((h, i) => (
            <div key={i} style={{ padding: '6px 12px' }}>
              <span style={{ fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-xdim)', fontFamily: 'Raleway, sans-serif' }}>{h}</span>
            </div>
          ))}
        </div>
        {bac39.conclusiones.length === 0 && (
          <div className="py-8 text-center" style={{ fontSize: 11, color: 'var(--text-xdim)', fontFamily: 'Raleway, sans-serif' }}>
            Sin conclusiones aún — agrega la primera con el botón de arriba.
          </div>
        )}
        {bac39.conclusiones.map((c, i) => (
          <div key={i} className="grid items-start" style={{ gridTemplateColumns: '64px 1fr 1fr 32px', borderBottom: '1px solid var(--border-lo)' }}>
            <input value={c.id} onChange={e => updConc(i, { id: e.target.value })} placeholder="ID…"
              className="bg-transparent outline-none"
              style={{ padding: '8px 12px', fontSize: 11, fontWeight: 700, color: '#9B8FE4', fontFamily: 'Raleway, sans-serif', borderRight: '1px solid var(--border-lo)' }} />
            <textarea value={c.conclusion} onChange={e => updConc(i, { conclusion: e.target.value })}
              placeholder="Conclusión o hipótesis sobre el negocio…" rows={3} className="bg-transparent outline-none"
              style={{ resize: 'none', padding: '8px 12px', fontSize: 11, color: 'var(--text-hi)', fontFamily: 'Raleway, sans-serif', borderRight: '1px solid var(--border-lo)' }} />
            <textarea value={c.justificacion} onChange={e => updConc(i, { justificacion: e.target.value })}
              placeholder="Justificación o evidencia que soporta la conclusión…" rows={3} className="bg-transparent outline-none"
              style={{ resize: 'none', padding: '8px 12px', fontSize: 11, color: 'var(--text-hi)', fontFamily: 'Raleway, sans-serif' }} />
            <button onClick={() => onUpdate({ ...bac39, conclusiones: bac39.conclusiones.filter((_, idx) => idx !== i) })}
              className="flex items-center justify-center mt-2 mx-auto w-6 h-6 rounded"
              style={{ color: 'var(--text-dim)' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#F87171')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}>
              <Trash2 size={12} strokeWidth={1.8} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
