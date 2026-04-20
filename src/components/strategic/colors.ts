export const COLORS = {
  bac17: '#9B59B6',  // Motivacional          — púrpura
  bac21: '#C87A2F',  // Promesa Valor         — ámbar
  bac18: '#1B7A5F',  // Indicadores (catálogo)— verde
  bac19: '#0891B2',  // Situación Objetivo    — cyan
  bac20: '#2B6CB0',  // Objetivos & Metas     — azul
  bac22: '#C53030',  // Acciones estratégicas — rojo
  bac23: '#B7791F',  // Ficha de acción       — ámbar oscuro
  bac24: '#6B46C1',  // Diagrama de Gantt     — violeta
  bac25: '#276749',  // Grafo dependencias    — verde oscuro
} as const

export function alpha(hex: string, a: number) {
  // Returns hex + 2-digit opacity suffix (0-255)
  const v = Math.round(a * 255).toString(16).padStart(2, '0')
  return hex + v
}
