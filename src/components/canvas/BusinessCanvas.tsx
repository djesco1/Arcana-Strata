import { useCallback, useState, useRef, useEffect } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  ConnectionMode,
  addEdge,
  reconnectEdge,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
  type OnSelectionChangeParams,
  type ReactFlowInstance,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import BACNode from './BACNode'
import { Toolbar, type ToolMode } from './Toolbar'
import { PropertiesPanel } from './PropertiesPanel'
import { EdgePanel } from './EdgePanel'
import { useBACStore } from '../../store/bacStore'
import * as db from '../../lib/db'
import type { BACNodeData, PatronNegocio } from '../../types/bac'

type BACFlowNode = Node<BACNodeData>

const nodeTypes: NodeTypes = { bacNode: BACNode as unknown as NodeTypes[string] }

const WELCOME_NODE: BACFlowNode = {
  id: 'welcome',
  type: 'bacNode',
  position: { x: 320, y: 220 },
  data: { label: 'Mi Negocio', tipo: 'negocio', descripcion: 'Punto de partida de tu modelo' },
}

let nodeIdCounter = 100

// ── Auto-layout: columnar grouping by node type ───────────────────────────────
const TYPE_COL: Record<string, number> = {
  negocio: 0,
  proveedor: 1,
  actor: 2,
  servicio: 3,
  componente: 3,
  actividad: 4,
  canal: 5,
  recurso: 6,
}
const COL_W = 260, ROW_H = 150, PAD = 80

function autoLayout(nodes: BACFlowNode[]): BACFlowNode[] {
  const cols = new Map<number, BACFlowNode[]>()

  nodes.forEach(n => {
    const col = TYPE_COL[n.data.tipo] ?? 3
    cols.set(col, [...(cols.get(col) ?? []), n])
  })

  const sortedCols = Array.from(cols.entries()).sort(([a], [b]) => a - b)

  const result: BACFlowNode[] = []
  sortedCols.forEach(([, group], colIdx) => {
    const startY = PAD + Math.max(0, (3 - group.length) * ROW_H / 2)
    group.forEach((n, row) => {
      result.push({ ...n, position: { x: colIdx * COL_W + PAD, y: startY + row * ROW_H } })
    })
  })

  return result
}

const MAX_HISTORY = 50

export interface BusinessCanvasRef {
  addNodeFromBac: (data: BACNodeData) => void
  loadPattern: (patron: PatronNegocio) => void
  save: () => void
}

interface Props {
  onCanvasReady?: (ref: BusinessCanvasRef) => void
}

export function BusinessCanvas({ onCanvasReady }: Props) {
  const { workspaceId } = useBACStore()
  const [nodes, setNodes, onNodesChange] = useNodesState<BACFlowNode>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [mode, setMode] = useState<ToolMode>('select' as ToolMode)
  const [selectedNode, setSelectedNode] = useState<BACFlowNode | null>(null)
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null)
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const rfInstance = useRef<ReactFlowInstance<BACFlowNode, Edge> | null>(null)
  const canvasReady = useRef(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── History for Ctrl+Z ────────────────────────────────────────────
  const history = useRef<{ nodes: BACFlowNode[]; edges: Edge[] }[]>([])
  const historyPointer = useRef(-1)
  const isUndoing = useRef(false)
  const nodesRef = useRef<BACFlowNode[]>([])
  const edgesRef = useRef<Edge[]>([])

  // Keep refs in sync
  useEffect(() => { nodesRef.current = nodes }, [nodes])
  useEffect(() => { edgesRef.current = edges }, [edges])

  const pushSnapshot = useCallback(() => {
    if (isUndoing.current) return
    const snap = {
      nodes: nodesRef.current.map(n => ({ ...n })),
      edges: edgesRef.current.map(e => ({ ...e })),
    }
    // Drop any forward history after current pointer
    history.current = history.current.slice(0, historyPointer.current + 1)
    history.current.push(snap)
    if (history.current.length > MAX_HISTORY) history.current.shift()
    historyPointer.current = history.current.length - 1
  }, [])

  const undo = useCallback(() => {
    if (historyPointer.current <= 0) return
    historyPointer.current -= 1
    const snap = history.current[historyPointer.current]
    isUndoing.current = true
    setNodes(snap.nodes)
    setEdges(snap.edges)
    setSelectedEdge(null)
    setSelectedNode(null)
    isUndoing.current = false
    scheduleSave()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Stable ref so keyboard listener never goes stale
  const undoFnRef = useRef(undo)
  useEffect(() => { undoFnRef.current = undo }, [undo])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undoFnRef.current()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (!workspaceId) return
    db.loadCanvas(workspaceId).then(data => {
      if (data && data.nodes.length > 0) {
        setNodes(data.nodes as BACFlowNode[])
        setEdges(data.edges)
      } else {
        setNodes([WELCOME_NODE])
      }
      canvasReady.current = true
      // Push initial snapshot so undo can't go before loaded state
      setTimeout(() => {
        pushSnapshot()
        rfInstance.current?.fitView({ padding: 0.15, duration: 400 })
      }, 80)
    })
  }, [workspaceId]) // eslint-disable-line react-hooks/exhaustive-deps

  const scheduleSave = useCallback(() => {
    if (!workspaceId || !canvasReady.current) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      if (!rfInstance.current) return
      const { nodes: n, edges: e } = rfInstance.current.toObject()
      db.saveCanvas(workspaceId, n, e)
    }, 1500)
  }, [workspaceId])

  const onConnect = useCallback(
    (connection: Connection) => {
      pushSnapshot()
      setEdges(eds => addEdge({ ...connection, type: 'smoothstep' }, eds))
      scheduleSave()
    },
    [setEdges, scheduleSave, pushSnapshot]
  )

  const onReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      pushSnapshot()
      setEdges(eds => reconnectEdge(oldEdge, newConnection, eds))
      scheduleSave()
    },
    [setEdges, scheduleSave, pushSnapshot]
  )

  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge)
    setSelectedNode(null)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedEdge(null)
  }, [])

  const handleUpdateEdge = useCallback((id: string, patch: Partial<Edge>) => {
    pushSnapshot()
    setEdges(eds => eds.map(e => e.id === id ? { ...e, ...patch } : e))
    setSelectedEdge(prev => prev?.id === id ? { ...prev, ...patch } : prev)
    scheduleSave()
  }, [setEdges, scheduleSave, pushSnapshot])

  const handleDeleteEdge = useCallback((id: string) => {
    pushSnapshot()
    setEdges(eds => eds.filter(e => e.id !== id))
    scheduleSave()
  }, [setEdges, scheduleSave, pushSnapshot])

  const onSelectionChange = useCallback(({ nodes: selNodes }: OnSelectionChangeParams) => {
    setSelectedNode(selNodes.length === 1 ? (selNodes[0] as BACFlowNode) : null)
    if (selNodes.length > 0) setSelectedEdge(null)
  }, [])

  const addNodeAtCenter = useCallback((data: BACNodeData) => {
    pushSnapshot()
    const id = `node-${++nodeIdCounter}`
    const center = rfInstance.current
      ? rfInstance.current.screenToFlowPosition({
          x: (reactFlowWrapper.current?.clientWidth || 800) / 2,
          y: (reactFlowWrapper.current?.clientHeight || 600) / 2,
        })
      : { x: 300 + Math.random() * 200, y: 200 + Math.random() * 200 }

    const newNode: BACFlowNode = {
      id,
      type: 'bacNode',
      position: { x: center.x + (Math.random() - 0.5) * 80, y: center.y + (Math.random() - 0.5) * 80 },
      data,
    }
    setNodes(nds => [...nds, newNode])
    scheduleSave()
    return newNode
  }, [setNodes, scheduleSave, pushSnapshot])

  const forceSave = useCallback(() => {
    if (!workspaceId || !rfInstance.current) return
    const { nodes: n, edges: e } = rfInstance.current.toObject()
    db.saveCanvas(workspaceId, n, e)
  }, [workspaceId])

  const handleDeleteSelected = useCallback(() => {
    pushSnapshot()
    setNodes(nds => nds.filter(n => !n.selected))
    setEdges(eds => eds.filter(e => !e.selected))
    setSelectedNode(null)
    setSelectedEdge(null)
    scheduleSave()
  }, [setNodes, setEdges, scheduleSave, pushSnapshot])

  const handleFitView = useCallback(() => {
    rfInstance.current?.fitView({ padding: 0.12, duration: 400 })
  }, [])

  const handleAutoLayout = useCallback(() => {
    pushSnapshot()
    setNodes(nds => autoLayout(nds))
    setTimeout(() => {
      rfInstance.current?.fitView({ padding: 0.15, duration: 500 })
      scheduleSave()
    }, 50)
  }, [setNodes, scheduleSave, pushSnapshot])

  const handleLoadPattern = useCallback((patron: PatronNegocio) => {
    pushSnapshot()
    const SCALE = 2.2
    const offset = { x: 200 + Math.random() * 600, y: 200 + Math.random() * 400 }
    const patternNodes: BACFlowNode[] = patron.nodes.map(n => ({
      ...n,
      id: `p${patron.id}-${n.id}`,
      position: { x: n.position.x * SCALE + offset.x, y: n.position.y * SCALE + offset.y },
      type: 'bacNode',
    }))
    const patternEdges: Edge[] = patron.edges.map(e => ({
      ...e,
      id: `p${patron.id}-${e.id}`,
      source: `p${patron.id}-${e.source}`,
      target: `p${patron.id}-${e.target}`,
      type: 'default',
    }))
    setNodes(nds => [...nds, ...patternNodes])
    setEdges(eds => [...eds, ...patternEdges])
    setTimeout(() => {
      rfInstance.current?.fitView({ padding: 0.12, duration: 500 })
      scheduleSave()
    }, 50)
  }, [setNodes, setEdges, scheduleSave, pushSnapshot])

  const handleUpdateNode = useCallback((id: string, data: Partial<BACNodeData>) => {
    pushSnapshot()
    setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, ...data } } : n))
    setSelectedNode(prev => prev?.id === id ? { ...prev, data: { ...prev.data, ...data } } : prev)
    scheduleSave()
  }, [setNodes, scheduleSave, pushSnapshot])

  const handleInit = useCallback((instance: ReactFlowInstance<BACFlowNode, Edge>) => {
    rfInstance.current = instance
    if (onCanvasReady) {
      onCanvasReady({
        addNodeFromBac: addNodeAtCenter,
        loadPattern: handleLoadPattern,
        save: forceSave,
      })
    }
  }, [onCanvasReady, addNodeAtCenter, handleLoadPattern, forceSave])

  const handleNodesChange: typeof onNodesChange = useCallback((changes) => {
    onNodesChange(changes)
    const hasMoved = changes.some(c => c.type === 'position' && !c.dragging)
    if (hasMoved) scheduleSave()
  }, [onNodesChange, scheduleSave])

  return (
    <div ref={reactFlowWrapper} className="w-full h-full relative">
      <ReactFlow<BACFlowNode, Edge>
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onReconnect={onReconnect}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        onSelectionChange={onSelectionChange}
        onInit={handleInit}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView={false}
        snapToGrid
        snapGrid={[20, 20]}
        deleteKeyCode="Delete"
        style={{ background: '#F7F4FC' }}
        defaultEdgeOptions={{
          type: 'smoothstep',
          style: { stroke: '#9B8FE4', strokeWidth: 1.8 },
          markerEnd: { type: 'arrowclosed' as const, color: '#9B8FE4' },
        }}
        connectionLineStyle={{ stroke: '#9B8FE4', strokeWidth: 1.8 }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#D4CCE8" />
        <Controls style={{ bottom: 16, left: 16 }} showInteractive={false} />
        <MiniMap
          style={{ bottom: 16, right: selectedNode ? 276 : 16, background: '#0F1A2E' }}
          nodeColor={n => {
            const d = n.data as BACNodeData
            const MAP: Record<string, string> = {
              negocio: '#5448A0', actor: '#2B6CB0', proveedor: '#1B7A5F',
              componente: '#7C3D9F', actividad: '#7E57C2', recurso: '#B03040', canal: '#C87A2F',
            }
            return MAP[d.tipo] || '#5448A0'
          }}
          maskColor="rgba(10,13,30,0.65)"
        />
      </ReactFlow>

      <Toolbar
        mode={mode}
        onModeChange={setMode}
        onDeleteSelected={handleDeleteSelected}
        onFitView={handleFitView}
        onAutoLayout={handleAutoLayout}
      />

      <PropertiesPanel
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
        onUpdate={handleUpdateNode}
      />

      {selectedEdge && (
        <EdgePanel
          edge={selectedEdge}
          onUpdate={handleUpdateEdge}
          onDelete={handleDeleteEdge}
          onClose={() => setSelectedEdge(null)}
        />
      )}
    </div>
  )
}
