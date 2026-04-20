// Flujo de Caja — grouped bar per period: Operacional / Inversión / Financiación
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import type { FlujoCaja } from '../../types/financial'
import { fmt } from './utils'

interface Props {
  flujos: FlujoCaja[]
}

export function CashFlowChart({ flujos }: Props) {
  if (flujos.length === 0) {
    return (
      <div className="flex items-center justify-center h-[260px] text-[12px]" style={{ color: 'var(--text-xdim)', fontFamily: 'Raleway, sans-serif' }}>
        Sin datos de flujo de caja
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={flujos} barCategoryGap="25%" barGap={3}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-md)" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-dim)', fontFamily: 'Raleway, sans-serif' }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={fmt} tick={{ fontSize: 10, fill: 'var(--text-xdim)', fontFamily: 'Raleway, sans-serif' }} axisLine={false} tickLine={false} width={48} />
        <ReferenceLine y={0} stroke="var(--border-md)" />
        <Tooltip
          contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-md)', borderRadius: 10, fontSize: 12, fontFamily: 'Raleway, sans-serif', color: 'var(--text-hi)' }}
          formatter={(v: number) => [fmt(v), '']}
          cursor={{ fill: "var(--bg-card-hover)" }}
        />
        <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'Raleway, sans-serif', paddingTop: 8, color: 'var(--text-dim)' }} />
        <Bar dataKey="operacional" name="Operacional" fill="#6EE7B7" radius={[3, 3, 0, 0]} />
        <Bar dataKey="inversion" name="Inversión" fill="#F9A8D4" radius={[3, 3, 0, 0]} />
        <Bar dataKey="financiacion" name="Financiación" fill="#93C5FD" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
