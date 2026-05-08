import type { PeriodoFinanciero, FinancialState, LineaNegocio, IngresosEgresos } from '../types/financial'
import { createModuleStore } from './createModuleStore'

export type FinancialAction =
  | { type: 'LOAD'; state: Partial<FinancialState> }
  | { type: 'SET_LINEA'; id: string }
  | { type: 'ADD_LINEA'; linea: LineaNegocio }
  | { type: 'UPDATE_LINEA_NOMBRE'; id: string; nombre: string }
  | { type: 'DELETE_LINEA'; id: string }
  | { type: 'SET_PERIODO'; id: string }
  | { type: 'ADD_PERIODO'; lineaId: string; periodo: PeriodoFinanciero }
  | { type: 'UPDATE_PERIODO'; lineaId: string; periodo: PeriodoFinanciero }
  | { type: 'DELETE_PERIODO'; lineaId: string; id: string }
  | { type: 'UPDATE_IE'; lineaId: string; periodoId: string; ie: IngresosEgresos }

const EMPTY: FinancialState = { lineas: [], activeLineaId: null, activePeriodoId: null }

function updLineas(lineas: LineaNegocio[], id: string, fn: (l: LineaNegocio) => LineaNegocio) {
  return lineas.map(l => l.id === id ? fn(l) : l)
}

function reducer(state: FinancialState, action: FinancialAction): FinancialState {
  switch (action.type) {
    case 'LOAD': {
      const lineas = (action.state.lineas ?? state.lineas).map(l => ({ ...l, periodos: l.periodos ?? [] }))
      return { ...state, ...action.state, lineas }
    }
    case 'SET_LINEA':
      return { ...state, activeLineaId: action.id, activePeriodoId: null }
    case 'ADD_LINEA':
      return { ...state, lineas: [...state.lineas, action.linea], activeLineaId: action.linea.id, activePeriodoId: null }
    case 'UPDATE_LINEA_NOMBRE':
      return { ...state, lineas: updLineas(state.lineas, action.id, l => ({ ...l, nombre: action.nombre })) }
    case 'DELETE_LINEA': {
      const remaining = state.lineas.filter(l => l.id !== action.id)
      return {
        ...state,
        lineas: remaining,
        activeLineaId: state.activeLineaId === action.id ? (remaining[0]?.id ?? null) : state.activeLineaId,
        activePeriodoId: state.activeLineaId === action.id ? null : state.activePeriodoId,
      }
    }
    case 'SET_PERIODO': return { ...state, activePeriodoId: action.id }
    case 'ADD_PERIODO': return {
      ...state,
      lineas: updLineas(state.lineas, action.lineaId, l => ({ ...l, periodos: [...l.periodos, action.periodo] })),
      activePeriodoId: action.periodo.id,
    }
    case 'UPDATE_PERIODO': return {
      ...state,
      lineas: updLineas(state.lineas, action.lineaId, l => ({
        ...l, periodos: l.periodos.map(p => p.id === action.periodo.id ? action.periodo : p),
      })),
    }
    case 'DELETE_PERIODO': return {
      ...state,
      lineas: updLineas(state.lineas, action.lineaId, l => ({ ...l, periodos: l.periodos.filter(p => p.id !== action.id) })),
      activePeriodoId: state.activePeriodoId === action.id ? null : state.activePeriodoId,
    }
    case 'UPDATE_IE': return {
      ...state,
      lineas: updLineas(state.lineas, action.lineaId, l => ({
        ...l, periodos: l.periodos.map(p => p.id === action.periodoId ? { ...p, ie: action.ie } : p),
      })),
    }
default: return state
  }
}

const { Provider: FinancialProvider, useStore: useFinancialStore } = createModuleStore(
  'financial_models',
  reducer,
  EMPTY,
  'Financial',
)

export { FinancialProvider, useFinancialStore }
