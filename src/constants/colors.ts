import type { CanalTipo, NodeTipo } from '../types/bac'

export const ARCANA_COLORS = {
  abyssal: '#0F1A2E',
  midnight: '#1A1040',
  strata: '#5448A0',
  layer: '#9B8FE4',
  mist: '#E8DFF5',
  emerald: '#1B7A5F',
  amber: '#C87A2F',
  crimson: '#B03040',
  sapphire: '#2B6CB0',
  canvas: '#F7F4FC',
} as const

export const CANAL_COLORS: Record<CanalTipo, { bg: string; border: string; label: string }> = {
  R: { bg: '#EBF3FB', border: '#2B6CB0', label: 'Relacionamiento' },
  D: { bg: '#E6F4F0', border: '#1B7A5F', label: 'Distribución' },
  M: { bg: '#FBF3E6', border: '#C87A2F', label: 'Monetización' },
  A: { bg: '#F0EEFB', border: '#9B8FE4', label: 'Aprovisionamiento' },
  T: { bg: '#F5EEF8', border: '#7E57C2', label: 'Transformación' },
  I: { bg: '#F5F5F5', border: '#9E9E9E', label: 'Indirecto' },
  RT: { bg: '#FBE9EB', border: '#B03040', label: 'Retorno' },
}

export const NODE_COLORS: Record<NodeTipo, { bg: string; border: string; text: string; icon: string }> = {
  negocio: { bg: '#EDE9FB', border: '#5448A0', text: '#1A1040', icon: '🏢' },
  actor: { bg: '#EBF3FB', border: '#2B6CB0', text: '#0F1A2E', icon: '👤' },
  proveedor: { bg: '#E6F4F0', border: '#1B7A5F', text: '#0F1A2E', icon: '🤝' },
  componente: { bg: '#F0EEFB', border: '#9B8FE4', text: '#1A1040', icon: '📦' },
  canal: { bg: '#FBF3E6', border: '#C87A2F', text: '#0F1A2E', icon: '⚡' },
  actividad: { bg: '#F5F0FF', border: '#7E57C2', text: '#1A1040', icon: '▶' },
  servicio: { bg: '#E6F4F0', border: '#1B7A5F', text: '#0F1A2E', icon: '⚙' },
  recurso: { bg: '#FBE9EB', border: '#B03040', text: '#0F1A2E', icon: '🔧' },
  medio:   { bg: '#EBF3FB', border: '#2B6CB0', text: '#0F1A2E', icon: '📱' },
}
