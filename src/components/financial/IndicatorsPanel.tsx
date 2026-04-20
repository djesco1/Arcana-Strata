// KPI cards for main financial indicators (I1–I25)
import type { IndicadoresFinancieros } from '../../types/financial'
import { fmt, pct } from './utils'

interface Props {
  ind: IndicadoresFinancieros
}

interface KPI {
  id: string
  label: string
  value: string
  positive?: boolean
  group: string
}

export function IndicatorsPanel({ ind }: Props) {
  const kpis: KPI[] = [
    // P&G
    { id: 'I1', label: 'Utilidad Bruta', value: fmt(ind.utilidadBruta), group: 'pyg', positive: ind.utilidadBruta >= 0 },
    { id: 'I2', label: 'Margen Bruto', value: pct(ind.margenBruto), group: 'pyg', positive: ind.margenBruto >= 0 },
    { id: 'I3', label: 'EBITDA', value: fmt(ind.ebitda), group: 'pyg', positive: ind.ebitda >= 0 },
    { id: 'I4', label: '% EBITDA', value: pct(ind.margenEbitda), group: 'pyg', positive: ind.margenEbitda >= 0 },
    { id: 'I6', label: 'Ut. Operacional', value: fmt(ind.utilidadOperacional), group: 'pyg', positive: ind.utilidadOperacional >= 0 },
    { id: 'I7', label: 'Margen Op.', value: pct(ind.margenOperacional), group: 'pyg', positive: ind.margenOperacional >= 0 },
    { id: 'I10', label: 'Ut. Neta', value: fmt(ind.utilidadNeta), group: 'pyg', positive: ind.utilidadNeta >= 0 },
    { id: 'I11', label: 'Margen Neto', value: pct(ind.margenNeto), group: 'pyg', positive: ind.margenNeto >= 0 },
    // Balance
    { id: 'I12', label: 'Total Activo', value: fmt(ind.totalActivo), group: 'balance', positive: true },
    { id: 'I13', label: 'Total Pasivo', value: fmt(ind.totalPasivo), group: 'balance', positive: true },
    { id: 'I14', label: 'Patrimonio', value: fmt(ind.totalPatrimonio), group: 'balance', positive: ind.totalPatrimonio >= 0 },
    { id: 'I15', label: 'Rel. Deuda', value: pct(ind.relacionDeuda), group: 'balance', positive: ind.relacionDeuda <= 60 },
    { id: 'I17', label: 'Capital Trabajo', value: fmt(ind.capitalTrabajo), group: 'balance', positive: ind.capitalTrabajo >= 0 },
    { id: 'I18', label: 'Razón Corriente', value: ind.razonCorriente.toFixed(2), group: 'balance', positive: ind.razonCorriente >= 1 },
    // Rentabilidad
    { id: 'I19', label: 'ROA', value: pct(ind.roa), group: 'rent', positive: ind.roa >= 0 },
    { id: 'I20', label: 'ROE', value: pct(ind.roe), group: 'rent', positive: ind.roe >= 0 },
    { id: 'I21', label: 'Rot. Activos', value: ind.rotacionActivos.toFixed(2), group: 'rent', positive: ind.rotacionActivos >= 1 },
    { id: 'I23', label: 'Endeudamiento', value: pct(ind.endeudamiento), group: 'rent', positive: ind.endeudamiento <= 60 },
    { id: 'I25', label: 'EVA (aprox)', value: pct(ind.evaSign), group: 'rent', positive: ind.evaSign >= 0 },
  ]

  const groups = [
    { key: 'pyg', label: 'I&E' },
    { key: 'balance', label: 'Balance' },
    { key: 'rent', label: 'Rentabilidad' },
  ]

  return (
    <div className="flex flex-col gap-5">
      {groups.map(g => (
        <div key={g.key}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-xdim)', fontFamily: 'Raleway, sans-serif' }}>{g.label}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {kpis.filter(k => k.group === g.key).map(k => (
              <div key={k.id} className="rounded-xl px-3 py-2.5 flex flex-col gap-0.5"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-lo)' }}>
                <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-xdim)', fontFamily: 'Raleway, sans-serif' }}>{k.id}</span>
                <span className="text-[17px] font-bold leading-none" style={{ color: k.positive ? '#34D399' : '#F87171', fontFamily: 'Raleway, sans-serif' }}>{k.value}</span>
                <span className="text-[10px]" style={{ color: 'var(--text-dim)', fontFamily: 'Raleway, sans-serif' }}>{k.label}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
