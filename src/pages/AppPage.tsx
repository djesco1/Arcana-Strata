import { useRef, useCallback, useState } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import { useNavigate } from 'react-router-dom'

import { BACProvider, useBACStore, type BACPanel } from '../store/bacStore'
import { Header } from '../components/layout/Header'
import { Sidebar } from '../components/layout/Sidebar'
import { BusinessCanvas, type BusinessCanvasRef } from '../components/canvas/BusinessCanvas'
import { PatternPicker } from '../components/canvas/PatternPicker'
import { ActoresPanel } from '../components/bac/ActoresPanel'
import { ServiciosPanel } from '../components/bac/ServiciosPanel'
import { CanalesPanel } from '../components/bac/CanalesPanel'
import { ComponentesPanel } from '../components/bac/ComponentesPanel'
import { EscenariosPanel } from '../components/bac/EscenariosPanel'
import { ParticipantesPanel } from '../components/bac/ParticipantesPanel'
import { RecursosPanel } from '../components/bac/RecursosPanel'
import { MediosPanel } from '../components/bac/MediosPanel'
import { CustomerJourneyPanel } from '../components/bac/CustomerJourneyPanel'
import { useAuth } from '../hooks/useAuth'
import type { BACNodeData, PatronNegocio } from '../types/bac'

function AppInner() {
  const { state, dispatch, dbLoading } = useBACStore()
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const canvasRef = useRef<BusinessCanvasRef | null>(null)
  const [saved, setSaved] = useState(false)

  const handlePanelToggle = useCallback((panel: BACPanel) => {
    dispatch({ type: 'SET_PANEL', panel: state.activePanel === panel ? null : panel })
  }, [dispatch, state.activePanel])

  const handleAddToCanvas = useCallback((data: BACNodeData) => {
    canvasRef.current?.addNodeFromBac(data)
  }, [])

  const handleAddMultipleToCanvas = useCallback((nodes: BACNodeData[]) => {
    nodes.forEach(data => canvasRef.current?.addNodeFromBac(data))
  }, [])

  const handleLoadPattern = useCallback((patron: PatronNegocio) => {
    canvasRef.current?.loadPattern(patron)
  }, [])

  const handleCanvasReady = useCallback((ref: BusinessCanvasRef) => {
    canvasRef.current = ref
  }, [])

  const closePanel = () => dispatch({ type: 'SET_PANEL', panel: null })

  const counts = {
    actores:       state.actores.length,
    servicios:     state.servicios.length,
    canales:       state.canales.length,
    componentes:   state.componentes.length,
    escenarios:    state.escenarios.length,
    participantes: state.participantes.length,
    recursos:      state.recursos.length,
    medios:        state.medios.length,
    journeys:      state.journeys.length,
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const handleSave = useCallback(() => {
    canvasRef.current?.save()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }, [])

  if (dbLoading) return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: 'var(--bg-base)' }}>
      <div className="auth-spin w-10 h-10 rounded-full" style={{ border: '2px solid rgba(155,143,228,0.15)', borderTopColor: '#9B8FE4' }} />
      <p style={{ color: '#5448A0', fontFamily: 'Raleway, sans-serif', fontSize: 13 }}>Cargando tu espacio…</p>
    </div>
  )

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-base)' }}>
      <Header
        projectName="Modelo de Negocio"
        onSignOut={handleSignOut}
        onSave={handleSave}
        saved={saved}
        onBackToDashboard={() => navigate('/app')}
      />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Sidebar activePanel={state.activePanel} onPanelToggle={handlePanelToggle} counts={counts} />

        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <ReactFlowProvider>
            <BusinessCanvas onCanvasReady={handleCanvasReady} />
          </ReactFlowProvider>

          {state.activePanel === 'bac01' && <ActoresPanel onClose={closePanel} onAddToCanvas={handleAddToCanvas} />}
          {state.activePanel === 'bac02' && <ServiciosPanel onClose={closePanel} onAddToCanvas={handleAddToCanvas} />}
          {state.activePanel === 'bac03' && <CanalesPanel onClose={closePanel} onAddToCanvas={handleAddToCanvas} />}
          {state.activePanel === 'bac04' && <ParticipantesPanel onClose={closePanel} onAddToCanvas={handleAddMultipleToCanvas} />}
          {state.activePanel === 'bac05' && <RecursosPanel onClose={closePanel} onAddToCanvas={handleAddToCanvas} />}
          {state.activePanel === 'bac06' && <ComponentesPanel onClose={closePanel} onAddToCanvas={handleAddToCanvas} />}
          {state.activePanel === 'bac08' && <EscenariosPanel onClose={closePanel} />}
          {state.activePanel === 'bac79' && <MediosPanel onClose={closePanel} onAddToCanvas={handleAddToCanvas} />}
          {state.activePanel === 'bac80' && <CustomerJourneyPanel onClose={closePanel} />}
          {state.activePanel === 'patterns' && <PatternPicker onSelectPattern={handleLoadPattern} onClose={closePanel} />}
        </div>
      </div>
    </div>
  )
}

export function AppPage() {
  return (
    <BACProvider>
      <AppInner />
    </BACProvider>
  )
}
