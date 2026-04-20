// BAC Metamodel — Business Architecture Construction (Dr. Jorge Villalobos)

export type CanalTipo = 'R' | 'D' | 'M' | 'A' | 'T' | 'I' | 'RT'
export type ActorTipo = 'cliente' | 'usuario' | 'prospecto' | 'cliente_potencial' | 'otro'
export type ObjetoNegocioTipo =
  | 'producto_fisico'
  | 'producto_digital'
  | 'bien_fisico_durable'
  | 'servicio'
  | 'resultado'
  | 'recursos_humanos'
  | 'informacion'
  | 'dinero'
  | 'bienes_intangibles'
  | 'plataforma'

export type NodeTipo = 'negocio' | 'actor' | 'proveedor' | 'componente' | 'canal' | 'actividad' | 'servicio' | 'recurso' | 'medio'
export type MedioTipo = 'digital' | 'fisico' | 'hibrido'
export type RecursoTipo = 'humano' | 'tecnologico' | 'fisico' | 'financiero' | 'intangible'

export interface Empresa {
  id: string
  nombre: string
  descripcion?: string
  created_at: string
}

export interface Negocio {
  id: string
  empresa_id: string
  nombre: string
  descripcion?: string
  patron_id?: number
  created_at: string
}

export interface Componente {
  id: string
  negocio_id: string
  nombre: string
  descripcion?: string
  tipo: 'valor' | 'dinero' | 'informacion'
}

export interface CanalActividad {
  id: string
  nombre: string
  id_participantes: string
  id_recursos: string
}

export interface Canal {
  id: string
  negocio_id: string
  nombre: string
  tipo: CanalTipo
  descripcion?: string
  es_indirecto: boolean
  actividades?: CanalActividad[]
}

export interface Actividad {
  id: string
  canal_id: string
  nombre: string
  descripcion?: string
  orden: number
}

export interface Actor {
  id: string
  negocio_id: string
  nombre: string
  tipo: ActorTipo
  descripcion?: string
}

export interface ServicioNegocio {
  id: string
  negocio_id: string
  nombre: string
  descripcion?: string
  objeto_tipo: ObjetoNegocioTipo
}

export interface ObjetoNegocio {
  id: string
  nombre: string
  tipo: ObjetoNegocioTipo
  descripcion?: string
}

// BAC-04
export interface Participante {
  id: string
  canal_id: string
  actor_id?: string   // optional – puede ser nombre libre
  nombre?: string     // nombre libre si no se referencia un actor
  rol?: string
}

// BAC-05
export interface Recurso {
  id: string
  negocio_id: string
  nombre: string
  tipo: RecursoTipo
  descripcion?: string
}

export interface SucesoEscenario {
  id: string
  orden: number
  canal_id?: string       // BAC-03 canal (shown as D1, A2...)
  ejecutor?: string       // free text: Tienda, Proveedor, Cliente...
  actividad_id?: string   // BAC-03 CanalActividad.id
  descripcion?: string    // free text if not a BAC-03/BAC-80 reference
}

export interface Escenario {
  id: string
  negocio_id: string
  nombre: string
  descripcion?: string
  sucesos: SucesoEscenario[]
}

export interface PasoEscenario {
  id: string
  escenario_id: string
  actor_id?: string
  canal_id?: string
  descripcion: string
  orden: number
}

// BAC-79
export interface Medio {
  id: string
  canal_id: string
  nombre: string
  tipo: MedioTipo
  descripcion?: string
}

// BAC-80
export interface AccionJourney {
  id: string
  nombre: string
  actor_id?: string   // BAC-01
  medio_id?: string   // BAC-79
}

export interface EtapaJourney {
  id: string
  journey_id: string
  nombre: string
  resultado: string
  orden: number
  acciones: AccionJourney[]
  actividad_ids: string[]   // CanalActividad.id refs from BAC-03
}

export interface CustomerJourney {
  id: string
  negocio_id: string
  servicio_id?: string   // BAC-02 reference
  nombre: string
  descripcion?: string
  actor_id?: string
  etapas: EtapaJourney[]
}

// Canvas node data
export interface BACNodeData {
  label: string
  tipo: NodeTipo
  descripcion?: string
  canalTipo?: CanalTipo
  actorTipo?: ActorTipo
  objetoTipo?: ObjetoNegocioTipo
  medioTipo?: MedioTipo
  color?: string
  [key: string]: unknown
}

// Pattern definition
export interface PatronNegocio {
  id: number
  nombre: string
  descripcion: string
  categoria: string
  ejemplo: string
  nodes: import('@xyflow/react').Node<BACNodeData>[]
  edges: import('@xyflow/react').Edge[]
}
