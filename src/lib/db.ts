import { supabase } from './supabase'
import type { Actor, ServicioNegocio, Canal, Componente, Recurso, Escenario, Participante, Medio, CustomerJourney } from '../types/bac'
import type { Node, Edge } from '@xyflow/react'

// ── Workspace ──────────────────────────────────────────────────────────────

export async function ensureWorkspace(userId: string): Promise<string> {
  const { data, error } = await supabase
    .from('workspaces')
    .upsert({ user_id: userId, nombre: 'Mi Empresa' }, { onConflict: 'user_id' })
    .select('id')
    .single()
  if (error) throw error
  return data.id as string
}

// ── Load all ───────────────────────────────────────────────────────────────

export async function loadAll(wsId: string) {
  const [a, s, c, co, r, e, p, m, j] = await Promise.all([
    supabase.from('actores').select('*').eq('workspace_id', wsId),
    supabase.from('servicios_negocio').select('*').eq('workspace_id', wsId),
    supabase.from('canales').select('*').eq('workspace_id', wsId),
    supabase.from('componentes').select('*').eq('workspace_id', wsId),
    supabase.from('recursos').select('*').eq('workspace_id', wsId),
    supabase.from('escenarios').select('*').eq('workspace_id', wsId),
    supabase.from('participantes').select('*').eq('workspace_id', wsId),
    supabase.from('medios').select('*').eq('workspace_id', wsId),
    supabase.from('customer_journeys').select('*').eq('workspace_id', wsId),
  ])

  return {
    actores: (a.data ?? []).map(row => ({
      id: row.id, negocio_id: wsId, nombre: row.nombre, tipo: row.tipo, descripcion: row.descripcion,
    })) as Actor[],

    servicios: (s.data ?? []).map(row => ({
      id: row.id, negocio_id: wsId, nombre: row.nombre, descripcion: row.descripcion, objeto_tipo: row.objeto_tipo,
    })) as ServicioNegocio[],

    canales: (c.data ?? []).map(row => ({
      id: row.id, negocio_id: wsId, nombre: row.nombre, tipo: row.tipo,
      descripcion: row.descripcion, es_indirecto: row.es_indirecto,
      actividades: row.actividades ?? [],
    })) as Canal[],

    componentes: (co.data ?? []).map(row => ({
      id: row.id, negocio_id: wsId, nombre: row.nombre, descripcion: row.descripcion, tipo: row.tipo,
    })) as Componente[],

    recursos: (r.data ?? []).map(row => ({
      id: row.id, negocio_id: wsId, nombre: row.nombre, tipo: row.tipo, descripcion: row.descripcion,
    })) as Recurso[],

    escenarios: (e.data ?? []).map(row => ({
      id: row.id, negocio_id: wsId, nombre: row.nombre, descripcion: row.descripcion,
      sucesos: row.sucesos ?? [],
    })) as Escenario[],

    participantes: (p.data ?? []).map(row => ({
      id: row.id, canal_id: row.canal_id, actor_id: row.actor_id ?? undefined,
      nombre: row.nombre ?? undefined, rol: row.rol,
    })) as Participante[],

    medios: (m.data ?? []).map(row => ({
      id: row.id, canal_id: row.canal_id, nombre: row.nombre, tipo: row.tipo, descripcion: row.descripcion,
    })) as Medio[],

    journeys: (j.data ?? []).map(row => ({
      id: row.id, negocio_id: wsId, nombre: row.nombre, descripcion: row.descripcion,
      actor_id: row.actor_id, etapas: row.etapas ?? [],
    })) as CustomerJourney[],
  }
}

// ── Generic delete ─────────────────────────────────────────────────────────

export async function deleteRow(table: string, wsId: string, id: string) {
  await supabase.from(table).delete().eq('workspace_id', wsId).eq('id', id)
}

// ── Upserts ────────────────────────────────────────────────────────────────

export async function upsertActor(wsId: string, x: Actor) {
  await supabase.from('actores').upsert(
    { id: x.id, workspace_id: wsId, nombre: x.nombre, tipo: x.tipo, descripcion: x.descripcion }
  )
}

export async function upsertServicio(wsId: string, x: ServicioNegocio) {
  await supabase.from('servicios_negocio').upsert(
    { id: x.id, workspace_id: wsId, nombre: x.nombre, descripcion: x.descripcion, objeto_tipo: x.objeto_tipo }
  )
}

export async function upsertCanal(wsId: string, x: Canal) {
  const { error } = await supabase.from('canales').upsert(
    { id: x.id, workspace_id: wsId, nombre: x.nombre, tipo: x.tipo, descripcion: x.descripcion, es_indirecto: x.es_indirecto, actividades: x.actividades ?? [] }
  )
  if (error) {
    console.warn('[upsertCanal] actividades column missing, retrying without it:', error.message)
    await supabase.from('canales').upsert(
      { id: x.id, workspace_id: wsId, nombre: x.nombre, tipo: x.tipo, descripcion: x.descripcion, es_indirecto: x.es_indirecto }
    )
  }
}

export async function upsertComponente(wsId: string, x: Componente) {
  await supabase.from('componentes').upsert(
    { id: x.id, workspace_id: wsId, nombre: x.nombre, descripcion: x.descripcion, tipo: x.tipo }
  )
}

export async function upsertRecurso(wsId: string, x: Recurso) {
  await supabase.from('recursos').upsert(
    { id: x.id, workspace_id: wsId, nombre: x.nombre, tipo: x.tipo, descripcion: x.descripcion }
  )
}

export async function upsertEscenario(wsId: string, x: Escenario) {
  const { error } = await supabase.from('escenarios').upsert(
    { id: x.id, workspace_id: wsId, nombre: x.nombre, descripcion: x.descripcion, sucesos: x.sucesos ?? [] }
  )
  if (error) {
    console.warn('[upsertEscenario] sucesos column missing, retrying without it:', error.message)
    await supabase.from('escenarios').upsert(
      { id: x.id, workspace_id: wsId, nombre: x.nombre, descripcion: x.descripcion }
    )
  }
}

export async function upsertParticipante(wsId: string, x: Participante) {
  const { error } = await supabase.from('participantes').upsert(
    { id: x.id, workspace_id: wsId, canal_id: x.canal_id, actor_id: x.actor_id ?? null, nombre: x.nombre ?? null, rol: x.rol }
  )
  if (error) {
    console.warn('[upsertParticipante] schema mismatch, retrying legacy format:', error.message)
    await supabase.from('participantes').upsert(
      { id: x.id, workspace_id: wsId, canal_id: x.canal_id, actor_id: x.actor_id ?? x.id, rol: x.rol }
    )
  }
}

export async function upsertMedio(wsId: string, x: Medio) {
  await supabase.from('medios').upsert(
    { id: x.id, workspace_id: wsId, canal_id: x.canal_id, nombre: x.nombre, tipo: x.tipo, descripcion: x.descripcion }
  )
}

export async function upsertJourney(wsId: string, x: CustomerJourney) {
  await supabase.from('customer_journeys').upsert(
    { id: x.id, workspace_id: wsId, nombre: x.nombre, descripcion: x.descripcion, actor_id: x.actor_id, etapas: x.etapas }
  )
}

// ── Dashboard counts ───────────────────────────────────────────────────────

export interface WorkspaceCounts {
  actores: number
  servicios: number
  canales: number
  componentes: number
  recursos: number
  escenarios: number
  participantes: number
  medios: number
  journeys: number
  canvasNodes: number
  financialLineas: number
  financialPeriodos: number
  financialIngresos: number
  financialUtilidadNeta: number
  strategicObjetivos: number
  strategicDecisiones: number
  strategicIndicadores: number
  strategicAcciones: number
  capPaquetes: number
  capTotal: number
  capCriticas: number
  capServicios: number
}

export async function loadWorkspaceCounts(wsId: string): Promise<WorkspaceCounts> {
  const [a, s, c, co, r, e, p, m, j, canvas] = await Promise.all([
    supabase.from('actores').select('*', { count: 'exact', head: true }).eq('workspace_id', wsId),
    supabase.from('servicios_negocio').select('*', { count: 'exact', head: true }).eq('workspace_id', wsId),
    supabase.from('canales').select('*', { count: 'exact', head: true }).eq('workspace_id', wsId),
    supabase.from('componentes').select('*', { count: 'exact', head: true }).eq('workspace_id', wsId),
    supabase.from('recursos').select('*', { count: 'exact', head: true }).eq('workspace_id', wsId),
    supabase.from('escenarios').select('*', { count: 'exact', head: true }).eq('workspace_id', wsId),
    supabase.from('participantes').select('*', { count: 'exact', head: true }).eq('workspace_id', wsId),
    supabase.from('medios').select('*', { count: 'exact', head: true }).eq('workspace_id', wsId),
    supabase.from('customer_journeys').select('*', { count: 'exact', head: true }).eq('workspace_id', wsId),
    supabase.from('canvas_estados').select('nodes').eq('workspace_id', wsId).single(),
  ])
  const nodes = canvas.data?.nodes
  const canvasNodes = Array.isArray(nodes) ? nodes.length : 0

  // Financial model counts — new structure: lineas[].periodos[].ie
  type FinRubro = { valor?: number }
  type FinIE = {
    ingresosOperacionales?: FinRubro[]; ingresosNoOperacionales?: FinRubro[]
    costosDirectos?: FinRubro[]; gastosOperativos?: FinRubro[]; egresosNoOperacionales?: FinRubro[]
    pagoImpuestos?: number
  }
  type FinPeriodo = { ie?: FinIE }
  type FinLinea = { periodos?: FinPeriodo[] }
  const { data: fin } = await supabase.from('financial_models').select('data').eq('workspace_id', wsId).single()
  const lineas: FinLinea[] = (fin?.data as { lineas?: FinLinea[] } | null)?.lineas ?? []

  const sum = (arr?: FinRubro[]) => (arr ?? []).reduce((s, r) => s + (Number(r.valor) || 0), 0)

  const financialLineas   = lineas.length
  const financialPeriodos = lineas.reduce((s, l) => s + (l.periodos?.length ?? 0), 0)

  // Ingresos = sum of (ingOp + ingNoOp) from the last period of every linea
  const financialIngresos = lineas.reduce((s, l) => {
    const last = l.periodos?.[l.periodos.length - 1]?.ie
    return s + sum(last?.ingresosOperacionales) + sum(last?.ingresosNoOperacionales)
  }, 0)

  // Ut. Neta = last period of last linea, matching calcIE formula
  const lastIE = lineas[lineas.length - 1]?.periodos?.slice(-1)[0]?.ie
  const financialUtilidadNeta = lastIE ? (() => {
    const ingOp   = sum(lastIE.ingresosOperacionales)
    const ingNoOp = sum(lastIE.ingresosNoOperacionales)
    const costos  = sum(lastIE.costosDirectos)
    const gastos  = sum(lastIE.gastosOperativos)
    const egNoOp  = sum(lastIE.egresosNoOperacionales)
    const ingresos     = ingOp + ingNoOp
    const utilBruta    = ingresos - costos
    const ebitda       = utilBruta - gastos
    const uai          = ebitda + ingNoOp - egNoOp
    const impuestos    = (lastIE.pagoImpuestos ?? 0) > 0 ? (lastIE.pagoImpuestos ?? 0) : Math.max(0, uai * 0.3)
    return uai - impuestos
  })() : 0

  type StrategicData = { objetivos?: { objetivos?: unknown[] }; promesaValor?: unknown[]; indicadoresLogro?: unknown[]; ejecucion?: { acciones?: unknown[] } }
  const { data: strat } = await supabase.from('strategic_models').select('data').eq('workspace_id', wsId).single()
  const sd = strat?.data as StrategicData | null
  const strategicObjetivos   = sd?.objetivos?.objetivos?.length ?? 0
  const strategicDecisiones  = sd?.promesaValor?.length ?? 0
  const strategicIndicadores = sd?.indicadoresLogro?.length ?? 0
  const strategicAcciones    = sd?.ejecucion?.acciones?.length ?? 0

  type CapSub = { capacidades?: { critica?: boolean }[] }
  type CapPaq = { subpaquetes?: CapSub[] }
  type CapData = { paquetes?: CapPaq[]; serviciosNegocio?: unknown[]; serviciosInternos?: unknown[] }
  const { data: capRaw } = await supabase.from('capability_models').select('data').eq('workspace_id', wsId).single()
  const cd = capRaw?.data as CapData | null
  const capPaquetes = cd?.paquetes?.length ?? 0
  const capAllCaps = (cd?.paquetes ?? []).flatMap(p => (p.subpaquetes ?? []).flatMap(s => s.capacidades ?? []))
  const capTotal   = capAllCaps.length
  const capCriticas = capAllCaps.filter(c => c.critica).length
  const capServicios = (cd?.serviciosNegocio?.length ?? 0) + (cd?.serviciosInternos?.length ?? 0)

  return {
    actores: a.count ?? 0,
    servicios: s.count ?? 0,
    canales: c.count ?? 0,
    componentes: co.count ?? 0,
    recursos: r.count ?? 0,
    escenarios: e.count ?? 0,
    participantes: p.count ?? 0,
    medios: m.count ?? 0,
    journeys: j.count ?? 0,
    canvasNodes,
    financialLineas,
    financialPeriodos,
    financialIngresos,
    financialUtilidadNeta,
    strategicObjetivos,
    strategicDecisiones,
    strategicIndicadores,
    strategicAcciones,
    capPaquetes,
    capTotal,
    capCriticas,
    capServicios,
  }
}

// ── Canvas ─────────────────────────────────────────────────────────────────

export async function saveCanvas(wsId: string, nodes: Node[], edges: Edge[]) {
  await supabase.from('canvas_estados').upsert(
    { workspace_id: wsId, nodes, edges, updated_at: new Date().toISOString() },
    { onConflict: 'workspace_id' }
  )
}

export async function loadCanvas(wsId: string): Promise<{ nodes: Node[]; edges: Edge[] } | null> {
  const { data } = await supabase
    .from('canvas_estados')
    .select('nodes, edges')
    .eq('workspace_id', wsId)
    .single()
  if (!data) return null
  return { nodes: data.nodes as Node[], edges: data.edges as Edge[] }
}
