import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { PeriodoFinanciero } from '../../types/financial'
import { calcIE, fmt } from './utils'

interface Props { periodo: PeriodoFinanciero }

export function ConsolidatedPyGChart({ periodo }: Props) {
  const p = calcIE(periodo.ie)

  const data = [
    { name: 'Ingresos',    value: p.ingresos,              color: '#9B8FE4' },
    { name: 'Costos',      value: p.costos,                color: '#F87171' },
    { name: 'Ut. Bruta',   value: p.utilidadBruta,         color: '#6EE7B7' },
    { name: 'Gastos Op.',  value: p.gastos,                color: '#F9A8D4' },
    { name: 'EBITDA',      value: p.ebitda,                color: '#34D399' },
    { name: 'UAI',         value: p.utilidadAnteImpuestos, color: '#A5F3FC' },
    { name: 'Impuestos',   value: p.impuestos,             color: '#FDBA74' },
    { name: 'Ut. Neta',    value: p.utilidadNeta,          color: '#4ADE80' },
  ]

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} barCategoryGap="20%">
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-md)" />
        <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-dim)', fontFamily: 'Raleway, sans-serif' }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={fmt} tick={{ fontSize: 10, fill: 'var(--text-xdim)', fontFamily: 'Raleway, sans-serif' }} axisLine={false} tickLine={false} width={52} />
        <Tooltip
          contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-md)', borderRadius: 10, fontSize: 12, fontFamily: 'Raleway, sans-serif', color: 'var(--text-hi)' }}
          formatter={(v: any) => v !== undefined ? [fmt(v), 'Valor'] : ['', 'Valor']}
          cursor={{ fill: 'var(--bg-card-hover)' }}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} fillOpacity={entry.value < 0 ? 0.5 : 0.9} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
