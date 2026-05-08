export interface Rubro {
  id: string
  nombre: string
  valor: number
}

export interface IngresosEgresos {
  ingresosOperacionales: Rubro[]
  ingresosNoOperacionales: Rubro[]
  costosDirectos: Rubro[]
  gastosOperativos: Rubro[]
  egresosNoOperacionales: Rubro[]
  amortizacionDeuda: number
  interesesDeuda: number
  depreciacionActivos: number
  pagoImpuestos: number
}

export function emptyIE(): IngresosEgresos {
  return {
    ingresosOperacionales: [],
    ingresosNoOperacionales: [],
    costosDirectos: [],
    gastosOperativos: [],
    egresosNoOperacionales: [],
    amortizacionDeuda: 0,
    interesesDeuda: 0,
    depreciacionActivos: 0,
    pagoImpuestos: 0,
  }
}

export interface BalanceGeneral {
  activoCorriente: number
  activoNoCorriente: number
  pasivoCorriente: number
  pasivoNoCorriente: number
  patrimonio: number
}

export interface FlujoCaja {
  label: string
  operacional: number
  inversion: number
  financiacion: number
}

export interface PeriodoFinanciero {
  id: string
  label: string
  ie: IngresosEgresos
  balance: BalanceGeneral
  flujos: FlujoCaja[]
}

export interface LineaNegocio {
  id: string
  nombre: string
  periodos: PeriodoFinanciero[]
}

export interface FinancialState {
  lineas: LineaNegocio[]
  activeLineaId: string | null
  activePeriodoId: string | null
}

export const ieCalc = {
  ingresosOp:   (ie: IngresosEgresos) => ie.ingresosOperacionales.reduce((s, r) => s + r.valor, 0),
  ingresosNoOp: (ie: IngresosEgresos) => ie.ingresosNoOperacionales.reduce((s, r) => s + r.valor, 0),
  totalIngresos:(ie: IngresosEgresos) => ie.ingresosOperacionales.reduce((s, r) => s + r.valor, 0) + ie.ingresosNoOperacionales.reduce((s, r) => s + r.valor, 0),
  costos:       (ie: IngresosEgresos) => ie.costosDirectos.reduce((s, r) => s + r.valor, 0),
  gastos:       (ie: IngresosEgresos) => ie.gastosOperativos.reduce((s, r) => s + r.valor, 0),
  egresosOp:    (ie: IngresosEgresos) => ie.costosDirectos.reduce((s, r) => s + r.valor, 0) + ie.gastosOperativos.reduce((s, r) => s + r.valor, 0),
  egresosNoOp:  (ie: IngresosEgresos) => ie.egresosNoOperacionales.reduce((s, r) => s + r.valor, 0),
  totalEgresos: (ie: IngresosEgresos) => ie.costosDirectos.reduce((s, r) => s + r.valor, 0) + ie.gastosOperativos.reduce((s, r) => s + r.valor, 0) + ie.egresosNoOperacionales.reduce((s, r) => s + r.valor, 0),
  itda:         (ie: IngresosEgresos) => ie.amortizacionDeuda + ie.interesesDeuda + ie.depreciacionActivos + ie.pagoImpuestos,
}

export interface IndicadoresFinancieros {
  utilidadBruta: number
  margenBruto: number
  ebitda: number
  margenEbitda: number
  utilidadOperacional: number
  margenOperacional: number
  utilidadAnteImpuestos: number
  impuestos: number
  utilidadNeta: number
  margenNeto: number
  totalActivo: number
  totalPasivo: number
  totalPatrimonio: number
  relacionDeuda: number
  relacionPatrimonio: number
  capitalTrabajo: number
  razonCorriente: number
  roa: number
  roe: number
  rotacionActivos: number
  rotacionCartera: number
  endeudamiento: number
  cobertura: number
  evaSign: number
}
