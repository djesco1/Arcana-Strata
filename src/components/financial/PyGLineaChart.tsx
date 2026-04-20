import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { IngresosEgresos } from '../../types/financial'
import { ieCalc } from '../../types/financial'
import { calcIE, fmt } from './utils'

interface Props { ie: IngresosEgresos }

const BARS = [
  { name: 'Ingresos',     color: '#9B8FE4' },
  { name: 'Costos',       color: '#F87171' },
  { name: 'Ut. Bruta',    color: '#6EE7B7' },
  { name: 'Gastos Op.',   color: '#F9A8D4' },
  { name: 'EBITDA',       color: '#34D399' },
  { name: 'Ing. No Op.',  color: '#93C5FD' },
  { name: 'Eg. No Op.',   color: '#FCA5A5' },
]

export function PyGLineaChart({ ie }: Props) {
  const p = calcIE(ie)

  const data = [
    { name: 'Ingresos',    valor: p.ingresos },
    { name: 'Costos',      valor: p.costos },
    { name: 'Ut. Bruta',   valor: p.utilidadBruta },
    { name: 'Gastos Op.',  valor: p.gastos },
    { name: 'EBITDA',      valor: p.ebitda },
    { name: 'Ing. No Op.', valor: ieCalc.ingresosNoOp(ie) },
    { name: 'Eg. No Op.',  valor: ieCalc.egresosNoOp(ie) },
  ]

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} barCategoryGap="25%">
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-lo)" />
        <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-dim)', fontFamily: 'Raleway' }} />
        <YAxis tick={{ fontSize: 10, fill: 'var(--text-dim)', fontFamily: 'Raleway' }} tickFormatter={v => fmt(v)} />
        <Tooltip
          formatter={(v: any) => v !== undefined ? [`$ ${fmt(v)}`, ''] : ['', '']}
          contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-md)', borderRadius: 8, fontSize: 11, fontFamily: 'Raleway' }}
        />
        <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
          {data.map((_, i) => <Cell key={i} fill={BARS[i]?.color ?? '#9B8FE4'} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
