import { Plus, Trash2 } from 'lucide-react'
import type { IngresosEgresos, Rubro } from '../../types/financial'
import { ieCalc } from '../../types/financial'
import { fmtCOP } from './utils'

const C_ING = '#1B7A5F'
const C_EG  = '#B03040'
const C_ITDA = '#9B8FE4'

interface Props {
  ie: IngresosEgresos
  onChange: (ie: IngresosEgresos) => void
}

function updList(list: Rubro[], id: string, patch: Partial<Rubro>): Rubro[] {
  return list.map(r => r.id === id ? { ...r, ...patch } : r)
}
function addRubro(list: Rubro[]): Rubro[] {
  return [...list, { id: crypto.randomUUID(), nombre: '', valor: 0 }]
}
function delRubro(list: Rubro[], id: string): Rubro[] {
  return list.filter(r => r.id !== id)
}

// ── Shared row components ──────────────────────────────────────────────────────

function RubroRowUI({ rubro, onUpdate, onDelete }: {
  rubro: Rubro
  onUpdate: (patch: Partial<Rubro>) => void
  onDelete: () => void
}) {
  return (
    <div className="group flex items-center" style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
      <div className="flex-1 px-3 py-1.5">
        <input
          className="w-full bg-transparent outline-none text-[10px]"
          style={{ color: 'var(--text-md)', fontFamily: 'Raleway, sans-serif' }}
          value={rubro.nombre}
          placeholder="Nombre del rubro…"
          onChange={e => onUpdate({ nombre: e.target.value })}
        />
      </div>
      <div className="flex items-center gap-1 px-3 py-1.5" style={{ minWidth: 110, borderLeft: '1px solid rgba(0,0,0,0.05)' }}>
        <span className="text-[9px]" style={{ color: 'var(--text-xdim)' }}>$</span>
        <input
          type="number"
          className="flex-1 bg-transparent outline-none text-[10px] text-right"
          style={{ color: 'var(--text-md)', fontFamily: 'Raleway, sans-serif' }}
          value={rubro.valor || ''}
          placeholder="-"
          onChange={e => onUpdate({ valor: Number(e.target.value) || 0 })}
        />
        <button onClick={onDelete} className="opacity-0 group-hover:opacity-100 transition-opacity ml-1" style={{ color: '#F87171' }}>
          <Trash2 size={9} strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}

function AddRubroBtn({ color, onClick }: { color: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-1 px-3 py-1 text-[9px] font-semibold"
      style={{ color, opacity: 0.65 }}
      onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
      onMouseLeave={e => (e.currentTarget.style.opacity = '0.65')}>
      <Plus size={9} strokeWidth={2.5} /> Agregar rubro
    </button>
  )
}

function TotalRowUI({ label, value, color, bold }: { label: string; value: number; color: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between px-3 py-1.5"
      style={{ background: bold ? `${color}12` : `${color}07`, borderTop: `1px solid ${color}20` }}>
      <span className="text-[9px]" style={{ color, fontWeight: bold ? 700 : 600, fontFamily: 'Raleway, sans-serif' }}>{label}</span>
      <span className="text-[10px]" style={{ color, fontWeight: bold ? 700 : 600, fontFamily: 'Raleway, sans-serif' }}>
        $ {fmtCOP(value)}
      </span>
    </div>
  )
}

function GrandTotalUI({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5"
      style={{ background: `${color}15`, borderTop: `2px solid ${color}30` }}>
      <span className="text-[10px] font-black uppercase tracking-widest" style={{ color, fontFamily: 'Raleway, sans-serif' }}>{label}</span>
      <span className="text-[12px] font-black" style={{ color, fontFamily: 'Raleway, sans-serif' }}>$ {fmtCOP(value)}</span>
    </div>
  )
}

function SectionBlock({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${color}20` }}>
      <div className="px-3 py-2" style={{ background: `${color}10` }}>
        <span className="text-[9px] font-black uppercase tracking-widest" style={{ color, fontFamily: 'Raleway, sans-serif' }}>{title}</span>
      </div>
      {children}
    </div>
  )
}

function SubSection({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div style={{ borderBottom: `1px solid ${color}10` }}>
      <div className="px-3 py-1.5" style={{ background: `${color}06` }}>
        <span className="text-[9px] font-semibold" style={{ color, fontFamily: 'Raleway, sans-serif' }}>{title}</span>
      </div>
      {/* Column header */}
      <div className="flex items-center" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', background: 'rgba(0,0,0,0.02)' }}>
        <div className="flex-1 px-3 py-1 text-[8px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-xdim)' }}>Rubro</div>
        <div className="px-3 py-1 text-[8px] font-bold uppercase tracking-wider text-right" style={{ color: 'var(--text-xdim)', minWidth: 110 }}>Valor</div>
      </div>
      {children}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function IngresosEgresosTable({ ie, onChange }: Props) {
  const upd = (key: keyof IngresosEgresos, val: Rubro[] | number) =>
    onChange({ ...ie, [key]: val })

  const updRubro = (field: keyof IngresosEgresos, id: string, patch: Partial<Rubro>) =>
    upd(field, updList(ie[field] as Rubro[], id, patch))

  return (
    <div className="flex flex-col gap-4">

      {/* ══ INGRESOS ══════════════════════════════════════════════════════════ */}
      <SectionBlock title="Ingresos" color={C_ING}>

        <SubSection title="Ingresos operacionales" color={C_ING}>
          {ie.ingresosOperacionales.map(r => (
            <RubroRowUI key={r.id} rubro={r}
              onUpdate={patch => updRubro('ingresosOperacionales', r.id, patch)}
              onDelete={() => upd('ingresosOperacionales', delRubro(ie.ingresosOperacionales, r.id))} />
          ))}
          <AddRubroBtn color={C_ING} onClick={() => upd('ingresosOperacionales', addRubro(ie.ingresosOperacionales))} />
          <TotalRowUI label="Total ingresos operacionales" value={ieCalc.ingresosOp(ie)} color={C_ING} />
        </SubSection>

        <SubSection title="Ingresos no operacionales" color={C_ING}>
          {ie.ingresosNoOperacionales.map(r => (
            <RubroRowUI key={r.id} rubro={r}
              onUpdate={patch => updRubro('ingresosNoOperacionales', r.id, patch)}
              onDelete={() => upd('ingresosNoOperacionales', delRubro(ie.ingresosNoOperacionales, r.id))} />
          ))}
          <AddRubroBtn color={C_ING} onClick={() => upd('ingresosNoOperacionales', addRubro(ie.ingresosNoOperacionales))} />
          <TotalRowUI label="Total ingresos no operacionales" value={ieCalc.ingresosNoOp(ie)} color={C_ING} />
        </SubSection>

        <GrandTotalUI label="Total ingresos" value={ieCalc.totalIngresos(ie)} color={C_ING} />
      </SectionBlock>

      {/* ══ EGRESOS ═══════════════════════════════════════════════════════════ */}
      <SectionBlock title="Egresos" color={C_EG}>

        {/* Egresos operacionales */}
        <div style={{ borderBottom: `1px solid ${C_EG}10` }}>
          <div className="px-3 py-1.5" style={{ background: `${C_EG}06` }}>
            <span className="text-[9px] font-semibold" style={{ color: C_EG, fontFamily: 'Raleway, sans-serif' }}>Egresos operacionales</span>
          </div>

          <SubSection title="Costos directos" color={C_EG}>
            {ie.costosDirectos.map(r => (
              <RubroRowUI key={r.id} rubro={r}
                onUpdate={patch => updRubro('costosDirectos', r.id, patch)}
                onDelete={() => upd('costosDirectos', delRubro(ie.costosDirectos, r.id))} />
            ))}
            <AddRubroBtn color={C_EG} onClick={() => upd('costosDirectos', addRubro(ie.costosDirectos))} />
            <TotalRowUI label="Total costos" value={ieCalc.costos(ie)} color={C_EG} />
          </SubSection>

          <SubSection title="Gastos operativos" color={C_EG}>
            {ie.gastosOperativos.map(r => (
              <RubroRowUI key={r.id} rubro={r}
                onUpdate={patch => updRubro('gastosOperativos', r.id, patch)}
                onDelete={() => upd('gastosOperativos', delRubro(ie.gastosOperativos, r.id))} />
            ))}
            <AddRubroBtn color={C_EG} onClick={() => upd('gastosOperativos', addRubro(ie.gastosOperativos))} />
            <TotalRowUI label="Total gastos" value={ieCalc.gastos(ie)} color={C_EG} />
          </SubSection>

          <TotalRowUI label="Total egresos operacionales" value={ieCalc.egresosOp(ie)} color={C_EG} bold />
        </div>

        <SubSection title="Egresos no operacionales" color={C_EG}>
          {ie.egresosNoOperacionales.map(r => (
            <RubroRowUI key={r.id} rubro={r}
              onUpdate={patch => updRubro('egresosNoOperacionales', r.id, patch)}
              onDelete={() => upd('egresosNoOperacionales', delRubro(ie.egresosNoOperacionales, r.id))} />
          ))}
          <AddRubroBtn color={C_EG} onClick={() => upd('egresosNoOperacionales', addRubro(ie.egresosNoOperacionales))} />
          <TotalRowUI label="Total egresos no operacionales" value={ieCalc.egresosNoOp(ie)} color={C_EG} />
        </SubSection>

        <GrandTotalUI label="Total egresos" value={ieCalc.totalEgresos(ie)} color={C_EG} />
      </SectionBlock>

      {/* ══ ITDA ══════════════════════════════════════════════════════════════ */}
      <SectionBlock title="ITDA" color={C_ITDA}>
        <div style={{ background: 'rgba(0,0,0,0.02)' }}>
          {[
            { key: 'amortizacionDeuda' as const, label: 'Amortización de deuda' },
            { key: 'interesesDeuda' as const,    label: 'Intereses de deuda' },
            { key: 'depreciacionActivos' as const, label: 'Depreciación de activos' },
            { key: 'pagoImpuestos' as const,     label: 'Pago de impuestos' },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center" style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
              <div className="flex-1 px-3 py-1.5 text-[10px]" style={{ color: 'var(--text-md)', fontFamily: 'Raleway, sans-serif' }}>{label}</div>
              <div className="flex items-center gap-1 px-3 py-1.5" style={{ minWidth: 110, borderLeft: '1px solid rgba(0,0,0,0.05)' }}>
                <span className="text-[9px]" style={{ color: 'var(--text-xdim)' }}>$</span>
                <input
                  type="number"
                  className="flex-1 bg-transparent outline-none text-[10px] text-right"
                  style={{ color: 'var(--text-md)', fontFamily: 'Raleway, sans-serif' }}
                  value={ie[key] || ''}
                  placeholder="-"
                  onChange={e => onChange({ ...ie, [key]: Number(e.target.value) || 0 })}
                />
              </div>
            </div>
          ))}
        </div>
        <TotalRowUI label="Total ITDA" value={ieCalc.itda(ie)} color={C_ITDA} bold />
      </SectionBlock>

    </div>
  )
}
