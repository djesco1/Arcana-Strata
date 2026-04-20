import { createContext, useContext, useReducer, useState, useEffect, useCallback, type ReactNode } from 'react'
import type {
  StrategicState, ComponenteMotivacional, PromesaDeValor,
  IndicadorLogro, SituacionObjetivo, ComponenteObjetivos,
  AccionEstrategica,
} from '../types/strategic'
import { emptyStrategicState } from '../types/strategic'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

export type StrategicAction =
  | { type: 'LOAD'; state: StrategicState }
  | { type: 'UPDATE_MOTIVACIONAL'; patch: Partial<ComponenteMotivacional> }
  | { type: 'SET_PROMESA_VALOR'; items: PromesaDeValor[] }
  | { type: 'SET_INDICADORES'; items: IndicadorLogro[] }
  | { type: 'UPDATE_SITUACION'; patch: Partial<SituacionObjetivo> }
  | { type: 'UPDATE_OBJETIVOS'; patch: Partial<ComponenteObjetivos> }
  | { type: 'SET_ACCIONES'; items: AccionEstrategica[] }

function reducer(state: StrategicState, action: StrategicAction): StrategicState {
  switch (action.type) {
    case 'LOAD':
      return { ...emptyStrategicState(), ...action.state }
    case 'UPDATE_MOTIVACIONAL':
      return { ...state, motivacional: { ...state.motivacional, ...action.patch } }
    case 'SET_PROMESA_VALOR':
      return { ...state, promesaValor: action.items }
    case 'SET_INDICADORES':
      return { ...state, indicadoresLogro: action.items }
    case 'UPDATE_SITUACION':
      return { ...state, situacionObjetivo: { ...state.situacionObjetivo, ...action.patch } }
    case 'UPDATE_OBJETIVOS':
      return { ...state, objetivos: { ...state.objetivos, ...action.patch } }
    case 'SET_ACCIONES':
      return { ...state, ejecucion: { ...state.ejecucion, acciones: action.items } }
    default:
      return state
  }
}

async function loadStrategic(wsId: string): Promise<StrategicState | null> {
  const { data } = await supabase
    .from('strategic_models')
    .select('data')
    .eq('workspace_id', wsId)
    .single()
  if (!data?.data) return null
  return data.data as StrategicState
}

async function saveStrategic(wsId: string, state: StrategicState) {
  await supabase.from('strategic_models').upsert(
    { workspace_id: wsId, data: state, updated_at: new Date().toISOString() },
    { onConflict: 'workspace_id' }
  )
}

interface StrategicContextValue {
  state: StrategicState
  dispatch: React.Dispatch<StrategicAction>
  workspaceId: string | null
  dbLoading: boolean
}

const StrategicContext = createContext<StrategicContextValue | null>(null)

export function StrategicProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [state, localDispatch] = useReducer(reducer, emptyStrategicState())
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
        const saved = await loadStrategic(ws.id)
        if (saved) localDispatch({ type: 'LOAD', state: saved })
      } catch (e) {
        console.warn('[StrategicProvider] bootstrap error:', e)
      } finally {
        setDbLoading(false)
      }
    }
    bootstrap()
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const dispatch = useCallback((action: StrategicAction) => {
    localDispatch(action)
  }, [])

  useEffect(() => {
    if (!workspaceId || dbLoading) return
    const timer = setTimeout(() => saveStrategic(workspaceId, state), 1000)
    return () => clearTimeout(timer)
  }, [state, workspaceId, dbLoading])

  return (
    <StrategicContext.Provider value={{ state, dispatch, workspaceId, dbLoading }}>
      {children}
    </StrategicContext.Provider>
  )
}

export function useStrategicStore() {
  const ctx = useContext(StrategicContext)
  if (!ctx) throw new Error('useStrategicStore must be used inside StrategicProvider')
  return ctx
}
