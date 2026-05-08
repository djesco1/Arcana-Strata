import type {
  CapabilityState, Paquete, ImplementacionCapacidad,
  ServicioCapacidadMap, ServicioInternoCapacidadMap,
} from '../types/capabilities'
import { emptyCapabilityState } from '../types/capabilities'
import { createModuleStore } from './createModuleStore'

export type CapabilityAction =
  | { type: 'LOAD'; state: CapabilityState }
  | { type: 'SET_PAQUETES'; items: Paquete[] }
  | { type: 'SET_IMPLEMENTACIONES'; items: ImplementacionCapacidad[] }
  | { type: 'SET_SERVICIOS_NEGOCIO'; items: ServicioCapacidadMap[] }
  | { type: 'SET_SERVICIOS_INTERNOS'; items: ServicioInternoCapacidadMap[] }

function reducer(state: CapabilityState, action: CapabilityAction): CapabilityState {
  switch (action.type) {
    case 'LOAD':
      return { ...emptyCapabilityState(), ...action.state }
    case 'SET_PAQUETES':
      return { ...state, paquetes: action.items }
    case 'SET_IMPLEMENTACIONES':
      return { ...state, implementaciones: action.items }
    case 'SET_SERVICIOS_NEGOCIO':
      return { ...state, serviciosNegocio: action.items }
    case 'SET_SERVICIOS_INTERNOS':
      return { ...state, serviciosInternos: action.items }
    default:
      return state
  }
}

const { Provider: CapabilityProvider, useStore: useCapabilityStore } = createModuleStore(
  'capability_models',
  reducer,
  emptyCapabilityState,
  'Capability',
)

export { CapabilityProvider, useCapabilityStore }
