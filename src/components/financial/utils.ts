import type { PeriodoFinanciero, IngresosEgresos, IndicadoresFinancieros } from '../../types/financial'
import { ieCalc } from '../../types/financial'

export function calcIE(ie: IngresosEgresos) {
  const ingresos      = ieCalc.totalIngresos(ie)
  const costos        = ieCalc.costos(ie)
  const gastos        = ieCalc.gastos(ie)
  const ingresosNoOp  = ieCalc.ingresosNoOp(ie)
  const egresosNoOp   = ieCalc.egresosNoOp(ie)
  const utilidadBruta = ingresos - costos
  const ebitda        = utilidadBruta - gastos
  const utilidadAnteImpuestos = ebitda + ingresosNoOp - egresosNoOp
  const impuestos     = ie.pagoImpuestos > 0 ? ie.pagoImpuestos : Math.max(0, utilidadAnteImpuestos * 0.3)
  const utilidadNeta  = utilidadAnteImpuestos - impuestos
  return { ingresos, costos, gastos, utilidadBruta, ebitda, utilidadAnteImpuestos, impuestos, utilidadNeta }
}

export function calcIndicadores(periodo: PeriodoFinanciero): IndicadoresFinancieros {
  const p = calcIE(periodo.ie)
  const b = periodo.balance
  const totalActivo = b.activoCorriente + b.activoNoCorriente
  const totalPasivo = b.pasivoCorriente + b.pasivoNoCorriente
  const safe = (n: number, d: number) => d === 0 ? 0 : n / d

  return {
    utilidadBruta:         p.utilidadBruta,
    margenBruto:           safe(p.utilidadBruta, p.ingresos) * 100,
    ebitda:                p.ebitda,
    margenEbitda:          safe(p.ebitda, p.ingresos) * 100,
    utilidadOperacional:   p.ebitda,
    margenOperacional:     safe(p.ebitda, p.ingresos) * 100,
    utilidadAnteImpuestos: p.utilidadAnteImpuestos,
    impuestos:             p.impuestos,
    utilidadNeta:          p.utilidadNeta,
    margenNeto:            safe(p.utilidadNeta, p.ingresos) * 100,
    totalActivo,
    totalPasivo,
    totalPatrimonio:       b.patrimonio,
    relacionDeuda:         safe(totalPasivo, totalActivo) * 100,
    relacionPatrimonio:    safe(b.patrimonio, totalActivo) * 100,
    capitalTrabajo:        b.activoCorriente - b.pasivoCorriente,
    razonCorriente:        safe(b.activoCorriente, b.pasivoCorriente),
    roa:                   safe(p.utilidadNeta, totalActivo) * 100,
    roe:                   safe(p.utilidadNeta, b.patrimonio) * 100,
    rotacionActivos:       safe(p.ingresos, totalActivo),
    rotacionCartera:       0,
    endeudamiento:         safe(totalPasivo, totalActivo) * 100,
    cobertura:             0,
    evaSign:               safe(p.utilidadNeta, b.patrimonio) * 100 - 12,
  }
}

export function fmt(n: number, decimals = 0): string {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(decimals)}K`
  return n.toFixed(decimals)
}

export function pct(n: number): string {
  return `${n.toFixed(1)}%`
}

export function fmtCOP(n: number): string {
  if (n === 0) return '-'
  return new Intl.NumberFormat('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)
}
