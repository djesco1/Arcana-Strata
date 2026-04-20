import { createContext, useContext, useReducer, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { PeriodoFinanciero, FinancialState, LineaNegocio, IngresosEgresos, Bac39Analysis } from '../types/financial'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

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
  | { type: 'UPDATE_BAC39'; bac39: Bac39Analysis }

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

    case 'UPDATE_BAC39': return { ...state, bac39: action.bac39 }

    default: return state
  }
}

async function loadFinancial(wsId: string): Promise<Partial<FinancialState>> {
  const { data } = await supabase.from('financial_models').select('data').eq('workspace_id', wsId).single()
  if (!data?.data) return {}
  return data.data as Partial<FinancialState>
}

async function saveFinancial(wsId: string, state: FinancialState) {
  await supabase.from('financial_models').upsert(
    { workspace_id: wsId, data: state, updated_at: new Date().toISOString() },
    { onConflict: 'workspace_id' }
  )
}

interface FinancialContextValue {
  state: FinancialState
  dispatch: React.Dispatch<FinancialAction>
  workspaceId: string | null
  dbLoading: boolean
}

const FinancialContext = createContext<FinancialContextValue | null>(null)

export function FinancialProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [state, localDispatch] = useReducer(reducer, EMPTY)
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)
  const [dbLoading, setDbLoading] = useState(true)

  useEffect(() => {
    if (!user) { setDbLoading(false); return }
    setDbLoading(true)
    async function bootstrap() {
      try {
        const { data: ws } = await supabase.from('workspaces').select('id').eq('user_id', user!.id).single()
        if (!ws) return
        setWorkspaceId(ws.id)
        const saved = await loadFinancial(ws.id)
        if (saved && saved.lineas) localDispatch({ type: 'LOAD', state: saved })
      } catch (e) {
        console.warn('[FinancialProvider] bootstrap error:', e)
      } finally {
        setDbLoading(false)
      }
    }
    bootstrap()
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const dispatch = useCallback((action: FinancialAction) => {
    localDispatch(action)
  }, [])

  useEffect(() => {
    if (!workspaceId || dbLoading) return
    const timer = setTimeout(() => saveFinancial(workspaceId, state), 1000)
    return () => clearTimeout(timer)
  }, [state, workspaceId, dbLoading])

  return (
    <FinancialContext.Provider value={{ state, dispatch, workspaceId, dbLoading }}>
      {children}
    </FinancialContext.Provider>
  )
}

export function useFinancialStore() {
  const ctx = useContext(FinancialContext)
  if (!ctx) throw new Error('useFinancialStore must be used inside FinancialProvider')
  return ctx
}
