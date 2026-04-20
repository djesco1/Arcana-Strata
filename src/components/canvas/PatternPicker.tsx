import { useState } from 'react'
import { Search, ChevronRight } from 'lucide-react'
import { PATRONES } from '../../constants/patterns'
import type { PatronNegocio } from '../../types/bac'

const CATEGORIA_COLORS: Record<string, string> = {
  'Distribución':  '#1B7A5F',
  'Activos':       '#9B8FE4',
  'Transformación':'#7E57C2',
  'Plataforma':    '#5448A0',
  'Financiero':    '#C87A2F',
  'Digital':       '#2B6CB0',
  'Servicios':     '#1B7A5F',
  'Red':           '#B03040',
  'Público':       '#5448A0',
  'Sostenibilidad':'#1B7A5F',
}

interface Props {
  onSelectPattern: (patron: PatronNegocio) => void
  onClose: () => void
}

export function PatternPicker({ onSelectPattern, onClose }: Props) {
  const [search, setSearch] = useState('')
  const [hoveredId, setHoveredId] = useState<number | null>(null)

  const filtered = PATRONES.filter(
    (p) =>
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.categoria.toLowerCase().includes(search.toLowerCase()) ||
      p.ejemplo.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div
      className="absolute left-14 top-3 bottom-3 z-20 flex flex-col rounded-2xl overflow-hidden"
      style={{
        width: 300,
        background: 'var(--bg-surface)',
        border: '1px solid rgba(155,143,228,0.12)',
        boxShadow: '0 8px 60px rgba(0,0,0,0.4)',
      }}
    >
      {/* Accent bar */}
      <div className="h-0.5 w-full flex-shrink-0" style={{ background: 'linear-gradient(90deg, #9B8FE4, transparent)' }} />

      {/* Header */}
      <div
        className="px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(155,143,228,0.08)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded" style={{ background: '#9B8FE422', color: '#9B8FE4' }}>
              P1–P20
            </span>
            <span className="text-sm font-semibold" style={{ color: '#E8DFF5', fontFamily: 'Raleway, sans-serif' }}>
              Patrones BAC
            </span>
          </div>
          <button onClick={onClose} className="text-xs" style={{ color: '#5448A0' }}>✕</button>
        </div>
        <div
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
          style={{ background: 'rgba(84,72,160,0.1)', border: '1px solid rgba(84,72,160,0.2)' }}
        >
          <Search size={11} style={{ color: '#5448A0' }} />
          <input
            className="flex-1 bg-transparent text-xs outline-none"
            style={{ color: '#D4CCF0', fontFamily: 'Raleway, sans-serif' }}
            placeholder="Buscar patrón..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2">
        {filtered.map((patron) => {
          const catColor = CATEGORIA_COLORS[patron.categoria] || '#5448A0'
          return (
            <button
              key={patron.id}
              onClick={() => { onSelectPattern(patron); onClose() }}
              onMouseEnter={() => setHoveredId(patron.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="w-full text-left px-3 py-2.5 rounded-xl mb-0.5 flex items-center gap-3 transition-colors group"
              style={{ background: hoveredId === patron.id ? 'rgba(84,72,160,0.12)' : 'transparent' }}
            >
              <div
                className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 text-[10px] font-black"
                style={{ background: catColor + '18', color: catColor }}
              >
                P{patron.id}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-[11px] font-semibold leading-tight"
                  style={{ color: '#E8DFF5', fontFamily: 'Raleway, sans-serif' }}
                >
                  {patron.nombre.replace(`P${patron.id} – `, '')}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                    style={{ background: catColor + '18', color: catColor }}
                  >
                    {patron.categoria}
                  </span>
                  <span className="text-[9px] truncate" style={{ color: '#8878C0' }}>
                    {patron.ejemplo}
                  </span>
                </div>
              </div>
              <ChevronRight
                size={12}
                style={{ color: hoveredId === patron.id ? '#9B8FE4' : '#3D3580', flexShrink: 0 }}
              />
            </button>
          )
        })}
        {filtered.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-xs" style={{ color: '#3D3580' }}>Sin resultados para "{search}"</p>
          </div>
        )}
      </div>
    </div>
  )
}
