import { createContext, useContext, useReducer, useState, useEffect, useCallback, type ReactNode } from 'react'
import type {
  Actor, ServicioNegocio, Canal, Componente, Recurso, Escenario,
  Participante, Medio, CustomerJourney, EtapaJourney, AccionJourney,
} from '../types/bac'
import { useAuth } from '../hooks/useAuth'
import * as db from '../lib/db'

export type BACPanel =
  | 'bac01' | 'bac02' | 'bac03' | 'bac04'
  | 'bac05' | 'bac06' | 'bac08' | 'bac79'
  | 'bac80' | 'patterns' | null

interface BACState {
  activePanel: BACPanel
  actores: Actor[]
  servicios: ServicioNegocio[]
  canales: Canal[]
  componentes: Componente[]
  recursos: Recurso[]
  escenarios: Escenario[]
  participantes: Participante[]
  medios: Medio[]
  journeys: CustomerJourney[]
}

type BACAction =
  | { type: 'SET_PANEL'; panel: BACPanel }
  | { type: 'LOAD_ALL'; data: Partial<Omit<BACState, 'activePanel'>> }
  // Actores
  | { type: 'ADD_ACTOR'; actor: Actor }
  | { type: 'UPDATE_ACTOR'; actor: Actor }
  | { type: 'DELETE_ACTOR'; id: string }
  // Servicios
  | { type: 'ADD_SERVICIO'; servicio: ServicioNegocio }
  | { type: 'UPDATE_SERVICIO'; servicio: ServicioNegocio }
  | { type: 'DELETE_SERVICIO'; id: string }
  // Canales
  | { type: 'ADD_CANAL'; canal: Canal }
  | { type: 'UPDATE_CANAL'; canal: Canal }
  | { type: 'DELETE_CANAL'; id: string }
  // Componentes
  | { type: 'ADD_COMPONENTE'; componente: Componente }
  | { type: 'UPDATE_COMPONENTE'; componente: Componente }
  | { type: 'DELETE_COMPONENTE'; id: string }
  // Recursos
  | { type: 'ADD_RECURSO'; recurso: Recurso }
  | { type: 'DELETE_RECURSO'; id: string }
  // Escenarios
  | { type: 'ADD_ESCENARIO'; escenario: Escenario }
  | { type: 'UPDATE_ESCENARIO'; escenario: Escenario }
  | { type: 'DELETE_ESCENARIO'; id: string }
  // BAC-04 Participantes
  | { type: 'ADD_PARTICIPANTE'; participante: Participante }
  | { type: 'DELETE_PARTICIPANTE'; id: string }
  // BAC-79 Medios
  | { type: 'ADD_MEDIO'; medio: Medio }
  | { type: 'DELETE_MEDIO'; id: string }
  // BAC-80 Customer Journey
  | { type: 'ADD_JOURNEY'; journey: CustomerJourney }
  | { type: 'DELETE_JOURNEY'; id: string }
  | { type: 'UPDATE_JOURNEY'; journey: CustomerJourney }
  | { type: 'ADD_ETAPA'; journey_id: string; etapa: EtapaJourney }
  | { type: 'DELETE_ETAPA'; journey_id: string; etapa_id: string }
  | { type: 'UPDATE_ETAPA'; journey_id: string; etapa: EtapaJourney }
  | { type: 'ADD_ACCION'; journey_id: string; etapa_id: string; accion: AccionJourney }
  | { type: 'DELETE_ACCION'; journey_id: string; etapa_id: string; accion_id: string }
  | { type: 'TOGGLE_ACTIVIDAD'; journey_id: string; etapa_id: string; actividad_id: string }

const EMPTY: BACState = {
  activePanel: null,
  actores: [],
  servicios: [],
  canales: [],
  componentes: [],
  recursos: [],
  escenarios: [],
  participantes: [],
  medios: [],
  journeys: [],
}

function updateJourneyEtapas(
  journeys: CustomerJourney[],
  journey_id: string,
  updater: (etapas: EtapaJourney[]) => EtapaJourney[]
): CustomerJourney[] {
  return journeys.map(j =>
    j.id === journey_id ? { ...j, etapas: updater(j.etapas) } : j
  )
}

function reducer(state: BACState, action: BACAction): BACState {
  switch (action.type) {
    case 'SET_PANEL':  return { ...state, activePanel: action.panel }
    case 'LOAD_ALL':   return { ...state, ...action.data }

    case 'ADD_ACTOR':    return { ...state, actores: [...state.actores, action.actor] }
    case 'UPDATE_ACTOR': return { ...state, actores: state.actores.map(a => a.id === action.actor.id ? action.actor : a) }
    case 'DELETE_ACTOR': return { ...state, actores: state.actores.filter(a => a.id !== action.id) }

    case 'ADD_SERVICIO':    return { ...state, servicios: [...state.servicios, action.servicio] }
    case 'UPDATE_SERVICIO': return { ...state, servicios: state.servicios.map(s => s.id === action.servicio.id ? action.servicio : s) }
    case 'DELETE_SERVICIO': return { ...state, servicios: state.servicios.filter(s => s.id !== action.id) }

    case 'ADD_CANAL':    return { ...state, canales: [...state.canales, action.canal] }
    case 'UPDATE_CANAL': return { ...state, canales: state.canales.map(c => c.id === action.canal.id ? action.canal : c) }
    case 'DELETE_CANAL': return { ...state, canales: state.canales.filter(c => c.id !== action.id) }

    case 'ADD_COMPONENTE':    return { ...state, componentes: [...state.componentes, action.componente] }
    case 'UPDATE_COMPONENTE': return { ...state, componentes: state.componentes.map(c => c.id === action.componente.id ? action.componente : c) }
    case 'DELETE_COMPONENTE': return { ...state, componentes: state.componentes.filter(c => c.id !== action.id) }

    case 'ADD_RECURSO':    return { ...state, recursos: [...state.recursos, action.recurso] }
    case 'DELETE_RECURSO': return { ...state, recursos: state.recursos.filter(r => r.id !== action.id) }

    case 'ADD_ESCENARIO':    return { ...state, escenarios: [...state.escenarios, action.escenario] }
    case 'UPDATE_ESCENARIO': return { ...state, escenarios: state.escenarios.map(e => e.id === action.escenario.id ? action.escenario : e) }
    case 'DELETE_ESCENARIO': return { ...state, escenarios: state.escenarios.filter(e => e.id !== action.id) }

    case 'ADD_PARTICIPANTE':    return { ...state, participantes: [...state.participantes, action.participante] }
    case 'DELETE_PARTICIPANTE': return { ...state, participantes: state.participantes.filter(p => p.id !== action.id) }

    case 'ADD_MEDIO':    return { ...state, medios: [...state.medios, action.medio] }
    case 'DELETE_MEDIO': return { ...state, medios: state.medios.filter(m => m.id !== action.id) }

    case 'ADD_JOURNEY':    return { ...state, journeys: [...state.journeys, action.journey] }
    case 'DELETE_JOURNEY': return { ...state, journeys: state.journeys.filter(j => j.id !== action.id) }
    case 'UPDATE_JOURNEY': return { ...state, journeys: state.journeys.map(j => j.id === action.journey.id ? action.journey : j) }

    case 'ADD_ETAPA':
      return { ...state, journeys: updateJourneyEtapas(state.journeys, action.journey_id, es => [...es, action.etapa]) }
    case 'DELETE_ETAPA':
      return { ...state, journeys: updateJourneyEtapas(state.journeys, action.journey_id, es => es.filter(e => e.id !== action.etapa_id)) }
    case 'UPDATE_ETAPA':
      return { ...state, journeys: updateJourneyEtapas(state.journeys, action.journey_id, es => es.map(e => e.id === action.etapa.id ? action.etapa : e)) }
    case 'ADD_ACCION':
      return {
        ...state,
        journeys: updateJourneyEtapas(state.journeys, action.journey_id, es =>
          es.map(e => e.id === action.etapa_id ? { ...e, acciones: [...(e.acciones ?? []), action.accion] } : e)
        ),
      }
    case 'DELETE_ACCION':
      return {
        ...state,
        journeys: updateJourneyEtapas(state.journeys, action.journey_id, es =>
          es.map(e => e.id === action.etapa_id ? { ...e, acciones: (e.acciones ?? []).filter(a => a.id !== action.accion_id) } : e)
        ),
      }
    case 'TOGGLE_ACTIVIDAD':
      return {
        ...state,
        journeys: updateJourneyEtapas(state.journeys, action.journey_id, es =>
          es.map(e => {
            if (e.id !== action.etapa_id) return e
            const ids = e.actividad_ids ?? []
            return { ...e, actividad_ids: ids.includes(action.actividad_id) ? ids.filter(x => x !== action.actividad_id) : [...ids, action.actividad_id] }
          })
        ),
      }
    default: return state
  }
}

// Compute what the updated journey will look like (needed for nested mutations
// because the local dispatch hasn't run yet when we fire the DB sync)
function computeUpdatedJourney(state: BACState, action: BACAction): CustomerJourney | null {
  if (!('journey_id' in action)) return null
  const j = state.journeys.find(j => j.id === action.journey_id)
  if (!j) return null

  switch (action.type) {
    case 'ADD_ETAPA':
      return { ...j, etapas: [...j.etapas, action.etapa] }
    case 'DELETE_ETAPA':
      return { ...j, etapas: j.etapas.filter(e => e.id !== action.etapa_id) }
    case 'UPDATE_ETAPA':
      return { ...j, etapas: j.etapas.map(e => e.id === action.etapa.id ? action.etapa : e) }
    case 'ADD_ACCION':
      return { ...j, etapas: j.etapas.map(e => e.id === action.etapa_id ? { ...e, acciones: [...(e.acciones ?? []), action.accion] } : e) }
    case 'DELETE_ACCION':
      return { ...j, etapas: j.etapas.map(e => e.id === action.etapa_id ? { ...e, acciones: (e.acciones ?? []).filter(a => a.id !== action.accion_id) } : e) }
    case 'TOGGLE_ACTIVIDAD': {
      const ids = j.etapas.find(e => e.id === action.etapa_id)?.actividad_ids ?? []
      return { ...j, etapas: j.etapas.map(e => e.id === action.etapa_id ? { ...e, actividad_ids: ids.includes(action.actividad_id) ? ids.filter(x => x !== action.actividad_id) : [...ids, action.actividad_id] } : e) }
    }
    default: return null
  }
}

interface BACContextValue {
  state: BACState
  dispatch: React.Dispatch<BACAction>
  workspaceId: string | null
  dbLoading: boolean
}

const BACContext = createContext<BACContextValue | null>(null)

export function BACProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [state, localDispatch] = useReducer(reducer, EMPTY)
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)
  const [dbLoading, setDbLoading] = useState(true)

  // Bootstrap: load all data when user is known
  useEffect(() => {
    if (!user) { setDbLoading(false); return }
    setDbLoading(true)
    db.ensureWorkspace(user.id)
      .then(wsId => {
        setWorkspaceId(wsId)
        return db.loadAll(wsId)
      })
      .then(data => {
        localDispatch({ type: 'LOAD_ALL', data })
        setDbLoading(false)
      })
      .catch(() => setDbLoading(false))
  }, [user?.id])  // eslint-disable-line react-hooks/exhaustive-deps

  // Synced dispatch: update local state + fire DB side-effect
  const dispatch = useCallback((action: BACAction) => {
    // DB sync (fire & forget — optimistic UI)
    if (workspaceId) {
      const wsId = workspaceId
      switch (action.type) {
        case 'ADD_ACTOR':
        case 'UPDATE_ACTOR':
          db.upsertActor(wsId, action.actor); break
        case 'DELETE_ACTOR':
          db.deleteRow('actores', wsId, action.id); break

        case 'ADD_SERVICIO':
        case 'UPDATE_SERVICIO':
          db.upsertServicio(wsId, action.servicio); break
        case 'DELETE_SERVICIO':
          db.deleteRow('servicios_negocio', wsId, action.id); break

        case 'ADD_CANAL':
        case 'UPDATE_CANAL':
          db.upsertCanal(wsId, action.canal); break
        case 'DELETE_CANAL':
          db.deleteRow('canales', wsId, action.id); break

        case 'ADD_COMPONENTE':
        case 'UPDATE_COMPONENTE':
          db.upsertComponente(wsId, action.componente); break
        case 'DELETE_COMPONENTE':
          db.deleteRow('componentes', wsId, action.id); break

        case 'ADD_RECURSO':
          db.upsertRecurso(wsId, action.recurso); break
        case 'DELETE_RECURSO':
          db.deleteRow('recursos', wsId, action.id); break

        case 'ADD_ESCENARIO':
        case 'UPDATE_ESCENARIO':
          db.upsertEscenario(wsId, action.escenario); break
        case 'DELETE_ESCENARIO':
          db.deleteRow('escenarios', wsId, action.id); break

        case 'ADD_PARTICIPANTE':
          db.upsertParticipante(wsId, action.participante); break
        case 'DELETE_PARTICIPANTE':
          db.deleteRow('participantes', wsId, action.id); break

        case 'ADD_MEDIO':
          db.upsertMedio(wsId, action.medio); break
        case 'DELETE_MEDIO':
          db.deleteRow('medios', wsId, action.id); break

        case 'ADD_JOURNEY':
          db.upsertJourney(wsId, action.journey); break
        case 'UPDATE_JOURNEY':
          db.upsertJourney(wsId, action.journey); break
        case 'DELETE_JOURNEY':
          db.deleteRow('customer_journeys', wsId, action.id); break

        // Nested journey mutations: compute new journey from current state
        case 'ADD_ETAPA':
        case 'DELETE_ETAPA':
        case 'UPDATE_ETAPA':
        case 'ADD_ACCION':
        case 'DELETE_ACCION':
        case 'TOGGLE_ACTIVIDAD': {
          const updated = computeUpdatedJourney(state, action)
          if (updated) db.upsertJourney(wsId, updated)
          break
        }
      }
    }

    localDispatch(action)
  }, [workspaceId, state])

  return (
    <BACContext.Provider value={{ state, dispatch, workspaceId, dbLoading }}>
      {children}
    </BACContext.Provider>
  )
}

export function useBACStore() {
  const ctx = useContext(BACContext)
  if (!ctx) throw new Error('useBACStore must be used inside BACProvider')
  return ctx
}
