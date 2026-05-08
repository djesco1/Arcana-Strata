// BAC-17: Componente Motivacional

export interface ValorPrincipio {
  id: string
  nombre: string
  descripcion: string
}

export interface ComponenteMotivacional {
  propositoSuperior: string
  objetivoRetador: string
  vision: string
  mision: string
  valores: ValorPrincipio[]
}

// BAC-21: Promesa de Valor

export type ModeloImpactado =
  | 'negocio' | 'financiero' | 'estrategico' | 'capacidades'
  | 'organizacional' | 'procesos' | 'recursos' | 'indicadores'

export interface DecisionEstrategica {
  id: string
  nombre: string
  modelo: ModeloImpactado
  descripcion: string
}

export interface PromesaDeValor {
  id: string
  intencion: string
  decisiones: DecisionEstrategica[]
}

// BAC-18: Catalogo de indicadores de logro

export interface IndicadorLogro {
  id: string
  nombre: string
  descripcion: string
  instrumento: string
}

// BAC-19: Ficha tecnica de la situacion objetivo

export interface CambioIndicador {
  idIndicador: string
  valorInicial: string
  valorObjetivo: string
}

export interface SituacionObjetivo {
  fechaObjetivo: string
  indicadores: CambioIndicador[]
}

// BAC-20: Clasificacion de objetivos y metas

export interface MetaEstrategica {
  id: string
  nombre: string
  indicadores: CambioIndicador[]
}

export interface ObjetivoEstrategico {
  id: string
  nombre: string
  metas: MetaEstrategica[]
}

export interface ComponenteObjetivos {
  fechaObjetivo: string
  objetivos: ObjetivoEstrategico[]
}

// BAC-22/23: Componente de Ejecucion

export interface IndicadorAporte {
  idIndicador: string
  aporte: string
}

export interface AccionTactica {
  id: string
  nombre: string
  descripcion: string
  responsable: string
  fechaInicio: string
  fechaFin: string
}

export interface AccionEstrategica {
  id: string
  nombre: string
  descripcion: string
  responsable: string
  fechaInicio: string  // YYYY-MM
  fechaFin: string     // YYYY-MM
  indicadores: IndicadorAporte[]
  prerrequisitos: string[]  // ids of other AccionEstrategica
  costo: string
  idProyecto: string
  accionesTacticas: AccionTactica[]
}

export interface ComponenteEjecucion {
  acciones: AccionEstrategica[]
}

// BAC-26: Catálogo de indicadores de ejecución

export interface IndicadorEjecucion {
  id: string
  nombre: string
  descripcion: string
}

// BAC-27: Tablero de control de la ejecución

export interface EntradaTableroControl {
  id: string
  idAccion: string
  idIndicador: string
  valorActual: string
  valorEsperado: string
  estado: string
}

// BAC-28: Catálogo de roles y funciones

export interface FuncionRol {
  id: string
  descripcion: string
}

export interface RolFuncion {
  id: string
  rol: string
  funciones: FuncionRol[]
}

// BAC-29: Catálogo de comités

export interface FuncionComite {
  id: string
  descripcion: string
}

export interface Comite {
  id: string
  nombre: string
  idRolesParticipantes: string[]
  funciones: FuncionComite[]
}

// BAC-30: Catálogo de procesos de seguimiento y gobierno

export interface ActividadProceso {
  id: string
  descripcion: string
}

export interface ProcesoSeguimiento {
  id: string
  nombre: string
  objetivo: string
  actividades: ActividadProceso[]
}

export interface ComponenteMedicion {
  indicadoresEjecucion: IndicadorEjecucion[]
  tableroControl: EntradaTableroControl[]
  roles: RolFuncion[]
  comites: Comite[]
  procesos: ProcesoSeguimiento[]
}

// Full state

export interface StrategicState {
  motivacional: ComponenteMotivacional
  promesaValor: PromesaDeValor[]
  indicadoresLogro: IndicadorLogro[]
  situacionObjetivo: SituacionObjetivo
  objetivos: ComponenteObjetivos
  ejecucion: ComponenteEjecucion
  medicion: ComponenteMedicion
}

// Factories

export function emptyStrategicState(): StrategicState {
  return {
    motivacional: {
      propositoSuperior: '',
      objetivoRetador: '',
      vision: '',
      mision: '',
      valores: [],
    },
    promesaValor: [] as PromesaDeValor[],
    indicadoresLogro: [],
    situacionObjetivo: {
      fechaObjetivo: '',
      indicadores: [],
    },
    objetivos: {
      fechaObjetivo: '',
      objetivos: [],
    },
    ejecucion: {
      acciones: [],
    },
    medicion: {
      indicadoresEjecucion: [],
      tableroControl: [],
      roles: [],
      comites: [],
      procesos: [],
    },
  }
}
