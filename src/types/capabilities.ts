// ── Core capability hierarchy ──────────────────────────────────────────────

export type TipoCapacidad = 'misional' | 'estrategica' | 'funcionamiento'

export interface Capacidad {
  id: string
  nombre: string
  descripcion: string
  tipo: TipoCapacidad
  critica: boolean
}

export interface Subpaquete {
  id: string
  nombre: string
  capacidades: Capacidad[]
}

export interface Paquete {
  id: string
  nombre: string
  descripcion: string
  subpaquetes: Subpaquete[]
}

// ── BAC-32: Implementation (partial — processes model not yet built) ────────

export interface ImplementacionCapacidad {
  id: string
  idCapacidad: string
  responsables: string
  recursos: string
  notas: string
}

// ── BAC-34: Servicios de negocio vs. capacidades ───────────────────────────

export interface ServicioCapacidadMap {
  id: string
  idServicioNegocio: string
  nombreServicio: string
  idsCapacidades: string[]
}

// ── BAC-64: Servicios internos vs. capacidades ─────────────────────────────

export interface ServicioInternoCapacidadMap {
  id: string
  nombre: string
  descripcion: string
  idsCapacidades: string[]
}

// ── Module state ───────────────────────────────────────────────────────────

export interface CapabilityState {
  paquetes: Paquete[]
  implementaciones: ImplementacionCapacidad[]
  serviciosNegocio: ServicioCapacidadMap[]
  serviciosInternos: ServicioInternoCapacidadMap[]
}

export function emptyCapabilityState(): CapabilityState {
  return {
    paquetes: [],
    implementaciones: [],
    serviciosNegocio: [],
    serviciosInternos: [],
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

export function allCapacidades(paquetes: Paquete[]): Capacidad[] {
  return paquetes.flatMap(p => p.subpaquetes.flatMap(s => s.capacidades))
}
