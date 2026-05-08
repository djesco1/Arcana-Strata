import { createContext, useContext, useReducer, useState, useEffect, useCallback, type ReactNode, type Reducer } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

interface ModuleContextValue<S, A> {
  state: S
  dispatch: React.Dispatch<A>
  workspaceId: string | null
  dbLoading: boolean
}

export function createModuleStore<S, A extends { type: string }>(
  table: string,
  reducer: Reducer<S, A>,
  emptyState: S | (() => S),
  displayName: string,
) {
  const Context = createContext<ModuleContextValue<S, A> | null>(null)

  function init(): S {
    return typeof emptyState === 'function' ? (emptyState as () => S)() : emptyState
  }

  async function load(wsId: string): Promise<S | null> {
    const { data } = await supabase.from(table).select('data').eq('workspace_id', wsId).single()
    if (!data?.data) return null
    return data.data as S
  }

  async function save(wsId: string, state: S) {
    await supabase.from(table).upsert(
      { workspace_id: wsId, data: state, updated_at: new Date().toISOString() },
      { onConflict: 'workspace_id' }
    )
  }

  function Provider({ children }: { children: ReactNode }) {
    const { user } = useAuth()
    const [state, localDispatch] = useReducer(reducer, init())
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
          const saved = await load(ws.id)
          if (saved) localDispatch({ type: 'LOAD', state: saved } as unknown as A)
        } catch (e) {
          console.warn(`[${displayName}Provider] bootstrap error:`, e)
        } finally {
          setDbLoading(false)
        }
      }
      bootstrap()
    }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

    const dispatch = useCallback((action: A) => localDispatch(action), [])

    useEffect(() => {
      if (!workspaceId || dbLoading) return
      const timer = setTimeout(() => save(workspaceId, state), 1000)
      return () => clearTimeout(timer)
    }, [state, workspaceId, dbLoading])

    return <Context.Provider value={{ state, dispatch, workspaceId, dbLoading }}>{children}</Context.Provider>
  }

  function useStore() {
    const ctx = useContext(Context)
    if (!ctx) throw new Error(`use${displayName}Store must be used inside ${displayName}Provider`)
    return ctx
  }

  return { Provider, useStore }
}
