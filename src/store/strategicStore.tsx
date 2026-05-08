import type {
  StrategicState, ComponenteMotivacional, PromesaDeValor,
  IndicadorLogro, SituacionObjetivo, ComponenteObjetivos,
  AccionEstrategica, IndicadorEjecucion, EntradaTableroControl,
  RolFuncion, Comite, ProcesoSeguimiento,
} from '../types/strategic'
import { emptyStrategicState } from '../types/strategic'
import { createModuleStore } from './createModuleStore'

export type StrategicAction =
  | { type: 'LOAD'; state: StrategicState }
  | { type: 'UPDATE_MOTIVACIONAL'; patch: Partial<ComponenteMotivacional> }
  | { type: 'SET_PROMESA_VALOR'; items: PromesaDeValor[] }
  | { type: 'SET_INDICADORES'; items: IndicadorLogro[] }
  | { type: 'UPDATE_SITUACION'; patch: Partial<SituacionObjetivo> }
  | { type: 'UPDATE_OBJETIVOS'; patch: Partial<ComponenteObjetivos> }
  | { type: 'SET_ACCIONES'; items: AccionEstrategica[] }
  | { type: 'SET_IND_EJECUCION'; items: IndicadorEjecucion[] }
  | { type: 'SET_TABLERO'; items: EntradaTableroControl[] }
  | { type: 'SET_ROLES'; items: RolFuncion[] }
  | { type: 'SET_COMITES'; items: Comite[] }
  | { type: 'SET_PROCESOS'; items: ProcesoSeguimiento[] }

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
    case 'SET_IND_EJECUCION':
      return { ...state, medicion: { ...state.medicion, indicadoresEjecucion: action.items } }
    case 'SET_TABLERO':
      return { ...state, medicion: { ...state.medicion, tableroControl: action.items } }
    case 'SET_ROLES':
      return { ...state, medicion: { ...state.medicion, roles: action.items } }
    case 'SET_COMITES':
      return { ...state, medicion: { ...state.medicion, comites: action.items } }
    case 'SET_PROCESOS':
      return { ...state, medicion: { ...state.medicion, procesos: action.items } }
    default:
      return state
  }
}

const { Provider: StrategicProvider, useStore: useStrategicStore } = createModuleStore(
  'strategic_models',
  reducer,
  emptyStrategicState,
  'Strategic',
)

export { StrategicProvider, useStrategicStore }
