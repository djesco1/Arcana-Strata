import type { CanalTipo, NodeTipo } from '../types/bac'

export const CAPABILITY_COLORS = {
  bac31: '#6D28D9',
  bac32: '#0369A1',
  bac33a: '#0F766E',
  bac33b: '#7C3AED',
  bac34: '#B45309',
  bac64: '#9D174D',
  misional:       '#0D9488',
  estrategica:    '#2563EB',
  funcionamiento: '#D97706',
} as const

export const STRATEGIC_COLORS = {
  bac17: '#9B59B6',
  bac21: '#C87A2F',
  bac18: '#1B7A5F',
  bac19: '#0891B2',
  bac20: '#2B6CB0',
  bac22: '#C53030',
  bac23: '#B7791F',
  bac24: '#6B46C1',
  bac25: '#276749',
  bac26: '#0D9488',
  bac27: '#1D4ED8',
  bac28: '#7C3AED',
  bac29: '#DB2777',
  bac30: '#4D7C0F',
} as const

export function alpha(hex: string, a: number) {
  const v = Math.round(a * 255).toString(16).padStart(2, '0')
  return hex + v
}

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
