// Balance General — stacked bar: Activo vs (Pasivo + Patrimonio)
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import type { BalanceGeneral } from '../../types/financial'
import { fmt } from './utils'

interface Props {
  balance: BalanceGeneral
}

export function BalanceChart({ balance }: Props) {
  const data = [
    {
      name: 'Activo',
      'A. Corriente': balance.activoCorriente,
      'A. No Corriente': balance.activoNoCorriente,
    },
    {
      name: 'Pasivo + Pat.',
      'P. Corriente': balance.pasivoCorriente,
      'P. No Corriente': balance.pasivoNoCorriente,
      Patrimonio: balance.patrimonio,
    },
  ]

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} barCategoryGap="40%">
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-md)" />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-dim)', fontFamily: 'Raleway, sans-serif' }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={fmt} tick={{ fontSize: 10, fill: 'var(--text-xdim)', fontFamily: 'Raleway, sans-serif' }} axisLine={false} tickLine={false} width={48} />
        <Tooltip
          contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-md)', borderRadius: 10, fontSize: 12, fontFamily: 'Raleway, sans-serif', color: 'var(--text-hi)' }}
          formatter={(v: any) => v !== undefined ? [fmt(v), ''] : ['', '']}
          cursor={{ fill: "var(--bg-card-hover)" }}
        />
        <Legend wrapperStyle={{ fontSize: 11, fontFamily: 'Raleway, sans-serif', paddingTop: 8, color: 'var(--text-dim)' }} />
        <Bar dataKey="A. Corriente" stackId="left" fill="#9B8FE4" radius={[0, 0, 0, 0]} />
        <Bar dataKey="A. No Corriente" stackId="left" fill="#6556B8" radius={[4, 4, 0, 0]} />
        <Bar dataKey="P. Corriente" stackId="right" fill="#F87171" radius={[0, 0, 0, 0]} />
        <Bar dataKey="P. No Corriente" stackId="right" fill="#DC2626" radius={[0, 0, 0, 0]} />
        <Bar dataKey="Patrimonio" stackId="right" fill="#34D399" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
