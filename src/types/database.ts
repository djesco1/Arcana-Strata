export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      empresas: {
        Row: { id: string; nombre: string; descripcion: string | null; created_at: string }
        Insert: { id?: string; nombre: string; descripcion?: string | null; created_at?: string }
        Update: { id?: string; nombre?: string; descripcion?: string | null }
      }
      negocios: {
        Row: { id: string; empresa_id: string; nombre: string; descripcion: string | null; patron_id: number | null; created_at: string }
        Insert: { id?: string; empresa_id: string; nombre: string; descripcion?: string | null; patron_id?: number | null; created_at?: string }
        Update: { id?: string; empresa_id?: string; nombre?: string; descripcion?: string | null; patron_id?: number | null }
      }
      componentes: {
        Row: { id: string; negocio_id: string; nombre: string; descripcion: string | null; tipo: string }
        Insert: { id?: string; negocio_id: string; nombre: string; descripcion?: string | null; tipo: string }
        Update: { id?: string; negocio_id?: string; nombre?: string; descripcion?: string | null; tipo?: string }
      }
      canales: {
        Row: { id: string; negocio_id: string; nombre: string; tipo: string; descripcion: string | null; es_indirecto: boolean }
        Insert: { id?: string; negocio_id: string; nombre: string; tipo: string; descripcion?: string | null; es_indirecto?: boolean }
        Update: { id?: string; negocio_id?: string; nombre?: string; tipo?: string; descripcion?: string | null; es_indirecto?: boolean }
      }
      actores: {
        Row: { id: string; negocio_id: string; nombre: string; tipo: string; descripcion: string | null }
        Insert: { id?: string; negocio_id: string; nombre: string; tipo: string; descripcion?: string | null }
        Update: { id?: string; negocio_id?: string; nombre?: string; tipo?: string; descripcion?: string | null }
      }
      canvas_estados: {
        Row: { id: string; negocio_id: string; nodes: Json; edges: Json; updated_at: string }
        Insert: { id?: string; negocio_id: string; nodes: Json; edges: Json; updated_at?: string }
        Update: { id?: string; negocio_id?: string; nodes?: Json; edges?: Json; updated_at?: string }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
