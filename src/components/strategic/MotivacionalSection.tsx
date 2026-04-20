import { useState } from 'react'
import { Plus, Trash2, Target, Eye, Compass, Heart, Sparkles } from 'lucide-react'
import { useStrategicStore } from '../../store/strategicStore'
import type { ValorPrincipio } from '../../types/strategic'

import { COLORS } from './colors'

const ACCENT = COLORS.bac17
const ACCENT_LIGHT = COLORS.bac17 + '1E'
const ACCENT_BORDER = COLORS.bac17 + '40'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: ACCENT, textTransform: 'uppercase', marginBottom: 6 }}>
      {children}
    </p>
  )
}

function TextArea({
  value, onChange, placeholder, rows = 3,
}: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{
        width: '100%', resize: 'vertical', padding: '10px 12px',
        background: 'var(--bg-surface)', border: '1px solid var(--border-md)',
        borderRadius: 10, color: 'var(--text-hi)', fontFamily: 'Raleway, sans-serif',
        fontSize: 13, lineHeight: 1.6, outline: 'none',
        transition: 'border-color 0.15s',
      }}
      onFocus={e => (e.currentTarget.style.borderColor = ACCENT)}
      onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-md)')}
    />
  )
}

function FieldCard({
  icon: Icon, title, value, onChange, placeholder, rows,
}: {
  icon: React.ElementType; title: string
  value: string; onChange: (v: string) => void
  placeholder?: string; rows?: number
}) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border-lo)',
      borderRadius: 14, padding: '16px 18px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: ACCENT_LIGHT, flexShrink: 0,
        }}>
          <Icon size={14} style={{ color: ACCENT }} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-md)' }}>{title}</span>
      </div>
      <TextArea value={value} onChange={onChange} placeholder={placeholder} rows={rows} />
    </div>
  )
}

export function MotivacionalSection() {
  const { state, dispatch } = useStrategicStore()
  const m = state.motivacional
  const [nuevoValor, setNuevoValor] = useState({ nombre: '', descripcion: '' })

  const patch = (p: Partial<typeof m>) =>
    dispatch({ type: 'UPDATE_MOTIVACIONAL', patch: p })

  const addValor = () => {
    if (!nuevoValor.nombre.trim()) return
    const v: ValorPrincipio = {
      id: crypto.randomUUID(),
      nombre: nuevoValor.nombre.trim(),
      descripcion: nuevoValor.descripcion.trim(),
    }
    patch({ valores: [...m.valores, v] })
    setNuevoValor({ nombre: '', descripcion: '' })
  }

  const removeValor = (id: string) =>
    patch({ valores: m.valores.filter(v => v.id !== id) })

  const updateValor = (id: string, field: 'nombre' | 'descripcion', val: string) =>
    patch({ valores: m.valores.map(v => v.id === id ? { ...v, [field]: val } : v) })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Hero: Propósito Superior */}
      <div style={{
        background: `linear-gradient(135deg, rgba(180,83,9,0.08) 0%, rgba(180,83,9,0.03) 100%)`,
        border: `1px solid ${ACCENT_BORDER}`,
        borderRadius: 18, padding: '24px 28px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, background: ACCENT_LIGHT,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sparkles size={18} style={{ color: ACCENT }} />
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: ACCENT, textTransform: 'uppercase', marginBottom: 2 }}>
              Propósito Superior
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-lo)' }}>¿Para qué existe la organización más allá del lucro?</p>
          </div>
        </div>
        <textarea
          value={m.propositoSuperior}
          onChange={e => patch({ propositoSuperior: e.target.value })}
          placeholder="Describe el propósito que trasciende lo económico y da sentido a la organización…"
          rows={3}
          style={{
            width: '100%', resize: 'vertical', padding: '12px 14px',
            background: 'var(--bg-surface)', borderRadius: 12,
            border: `1px solid ${ACCENT_BORDER}`,
            color: 'var(--text-hi)', fontFamily: 'Raleway, sans-serif',
            fontSize: 14, lineHeight: 1.7, outline: 'none',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = ACCENT)}
          onBlur={e => (e.currentTarget.style.borderColor = ACCENT_BORDER)}
        />
      </div>

      {/* 3-column: BHAG, Visión, Misión */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        <FieldCard
          icon={Target}
          title="Objetivo Retador (BHAG)"
          value={m.objetivoRetador}
          onChange={v => patch({ objetivoRetador: v })}
          placeholder="Un objetivo audaz, cuantificable y a largo plazo…"
        />
        <FieldCard
          icon={Eye}
          title="Visión"
          value={m.vision}
          onChange={v => patch({ vision: v })}
          placeholder="¿Cómo se ve la organización en el futuro ideal?"
        />
        <FieldCard
          icon={Compass}
          title="Misión"
          value={m.mision}
          onChange={v => patch({ mision: v })}
          placeholder="¿Qué hace, para quién y cómo lo hace?"
        />
      </div>

      {/* Valores y Principios */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-lo)',
        borderRadius: 16, overflow: 'hidden',
      }}>
        <div style={{
          padding: '14px 20px', borderBottom: '1px solid var(--border-lo)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <Heart size={15} style={{ color: ACCENT }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-md)' }}>Valores y Principios</span>
          <span style={{
            marginLeft: 'auto', fontSize: 10, fontWeight: 700,
            background: ACCENT_LIGHT, color: ACCENT,
            padding: '2px 8px', borderRadius: 20,
          }}>
            {m.valores.length}
          </span>
        </div>

        {/* Existing values */}
        {m.valores.length > 0 && (
          <div style={{ padding: '8px 0' }}>
            {m.valores.map((v, i) => (
              <div
                key={v.id}
                style={{
                  display: 'grid', gridTemplateColumns: '1fr 2fr auto',
                  gap: 12, padding: '10px 20px', alignItems: 'start',
                  borderBottom: i < m.valores.length - 1 ? '1px solid var(--border-lo)' : 'none',
                }}
              >
                <input
                  value={v.nombre}
                  onChange={e => updateValor(v.id, 'nombre', e.target.value)}
                  placeholder="Nombre del valor"
                  style={{
                    background: 'var(--bg-surface)', border: '1px solid var(--border-md)',
                    borderRadius: 8, padding: '7px 10px', color: 'var(--text-hi)',
                    fontFamily: 'Raleway, sans-serif', fontSize: 12, outline: 'none', fontWeight: 600,
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = ACCENT)}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-md)')}
                />
                <input
                  value={v.descripcion}
                  onChange={e => updateValor(v.id, 'descripcion', e.target.value)}
                  placeholder="Descripción del valor o principio"
                  style={{
                    background: 'var(--bg-surface)', border: '1px solid var(--border-md)',
                    borderRadius: 8, padding: '7px 10px', color: 'var(--text-md)',
                    fontFamily: 'Raleway, sans-serif', fontSize: 12, outline: 'none',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = ACCENT)}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-md)')}
                />
                <button
                  onClick={() => removeValor(v.id)}
                  style={{ color: '#F87171', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.6')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add new */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 2fr auto',
          gap: 12, padding: '14px 20px',
          borderTop: m.valores.length > 0 ? '1px solid var(--border-lo)' : 'none',
          background: 'rgba(180,83,9,0.03)',
        }}>
          <input
            value={nuevoValor.nombre}
            onChange={e => setNuevoValor(p => ({ ...p, nombre: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && addValor()}
            placeholder="Nuevo valor…"
            style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border-md)',
              borderRadius: 8, padding: '7px 10px', color: 'var(--text-hi)',
              fontFamily: 'Raleway, sans-serif', fontSize: 12, outline: 'none',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = ACCENT)}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-md)')}
          />
          <input
            value={nuevoValor.descripcion}
            onChange={e => setNuevoValor(p => ({ ...p, descripcion: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && addValor()}
            placeholder="Descripción…"
            style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border-md)',
              borderRadius: 8, padding: '7px 10px', color: 'var(--text-md)',
              fontFamily: 'Raleway, sans-serif', fontSize: 12, outline: 'none',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = ACCENT)}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-md)')}
          />
          <button
            onClick={addValor}
            style={{
              background: ACCENT, color: '#fff', border: 'none', borderRadius: 8,
              padding: '7px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 11, fontWeight: 600, fontFamily: 'Raleway, sans-serif',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            <Plus size={12} /> Agregar
          </button>
        </div>
      </div>

      <SectionLabel>
        {/* invisible spacer so layout doesn't collapse */}
        &nbsp;
      </SectionLabel>
    </div>
  )
}
