-- Arcana Strata — Full Schema v2
-- Run this in Supabase SQL Editor on a fresh project

create extension if not exists "uuid-ossp";

-- Enums
create type canal_tipo    as enum ('R', 'D', 'M', 'A', 'T', 'I', 'RT');
create type actor_tipo    as enum ('cliente', 'usuario', 'prospecto', 'cliente_potencial', 'otro');
create type objeto_negocio_tipo as enum (
  'producto_fisico', 'producto_digital', 'bien_fisico_durable', 'servicio',
  'resultado', 'recursos_humanos', 'informacion', 'dinero', 'bienes_intangibles', 'plataforma'
);
create type componente_tipo as enum ('valor', 'dinero', 'informacion');
create type recurso_tipo   as enum ('humano', 'tecnologico', 'fisico', 'financiero', 'intangible');
create type medio_tipo     as enum ('digital', 'fisico', 'hibrido');

-- ─────────────────────────────────────────────
-- Workspace: one per user, auto-created on login
-- ─────────────────────────────────────────────
create table workspaces (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references auth.users(id) on delete cascade not null unique,
  nombre     text not null default 'Mi Empresa',
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────
-- BAC entities — all scoped to workspace_id
-- ─────────────────────────────────────────────
create table actores (
  id           uuid primary key default uuid_generate_v4(),
  workspace_id uuid references workspaces(id) on delete cascade not null,
  nombre       text not null,
  tipo         actor_tipo not null default 'cliente',
  descripcion  text
);

create table servicios_negocio (
  id           uuid primary key default uuid_generate_v4(),
  workspace_id uuid references workspaces(id) on delete cascade not null,
  nombre       text not null,
  descripcion  text,
  objeto_tipo  objeto_negocio_tipo not null default 'servicio'
);

create table canales (
  id           uuid primary key default uuid_generate_v4(),
  workspace_id uuid references workspaces(id) on delete cascade not null,
  nombre       text not null,
  tipo         canal_tipo not null,
  descripcion  text,
  es_indirecto boolean default false,
  actividades  jsonb not null default '[]'
);

create table componentes (
  id           uuid primary key default uuid_generate_v4(),
  workspace_id uuid references workspaces(id) on delete cascade not null,
  nombre       text not null,
  descripcion  text,
  tipo         componente_tipo not null default 'valor'
);

create table recursos (
  id           uuid primary key default uuid_generate_v4(),
  workspace_id uuid references workspaces(id) on delete cascade not null,
  nombre       text not null,
  tipo         recurso_tipo not null default 'tecnologico',
  descripcion  text
);

create table escenarios (
  id           uuid primary key default uuid_generate_v4(),
  workspace_id uuid references workspaces(id) on delete cascade not null,
  nombre       text not null,
  descripcion  text
);

-- BAC-04: Participantes (actor en canal)
create table participantes (
  id           uuid primary key default uuid_generate_v4(),
  workspace_id uuid references workspaces(id) on delete cascade not null,
  canal_id     uuid not null,
  actor_id     uuid,            -- optional: referencia a BAC-01
  nombre       text,            -- nombre libre si no se referencia un actor
  rol          text
);

-- BAC-79: Medios de Canal
create table medios (
  id           uuid primary key default uuid_generate_v4(),
  workspace_id uuid references workspaces(id) on delete cascade not null,
  canal_id     uuid not null,
  nombre       text not null,
  tipo         medio_tipo not null default 'digital',
  descripcion  text
);

-- BAC-80: Customer Journeys (etapas + interacciones stored as JSONB)
create table customer_journeys (
  id           uuid primary key default uuid_generate_v4(),
  workspace_id uuid references workspaces(id) on delete cascade not null,
  nombre       text not null,
  descripcion  text,
  actor_id     uuid,
  etapas       jsonb not null default '[]'
);

-- Financial model: one per workspace (JSON blob)
create table financial_models (
  workspace_id uuid primary key references workspaces(id) on delete cascade,
  data         jsonb not null default '{}',
  updated_at   timestamptz default now()
);

-- Canvas state: one per workspace
create table canvas_estados (
  workspace_id uuid primary key references workspaces(id) on delete cascade,
  nodes        jsonb not null default '[]',
  edges        jsonb not null default '[]',
  updated_at   timestamptz default now()
);

-- ─────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────
alter table workspaces        enable row level security;
alter table actores           enable row level security;
alter table servicios_negocio enable row level security;
alter table canales           enable row level security;
alter table componentes       enable row level security;
alter table recursos          enable row level security;
alter table escenarios        enable row level security;
alter table participantes     enable row level security;
alter table medios            enable row level security;
alter table customer_journeys enable row level security;
alter table canvas_estados    enable row level security;
alter table financial_models  enable row level security;

-- Helper: current user owns the workspace
create or replace function owns_workspace(ws_id uuid)
returns boolean language sql security definer as $$
  select exists (select 1 from workspaces where id = ws_id and user_id = auth.uid())
$$;

-- Workspaces: own row only
create policy "workspace_own" on workspaces
  for all using (user_id = auth.uid());

-- All entity tables: data belongs to user's workspace
create policy "actores_own"   on actores           for all using (owns_workspace(workspace_id));
create policy "servicios_own" on servicios_negocio for all using (owns_workspace(workspace_id));
create policy "canales_own"   on canales           for all using (owns_workspace(workspace_id));
create policy "componentes_own" on componentes     for all using (owns_workspace(workspace_id));
create policy "recursos_own"  on recursos          for all using (owns_workspace(workspace_id));
create policy "escenarios_own" on escenarios       for all using (owns_workspace(workspace_id));
create policy "participantes_own" on participantes for all using (owns_workspace(workspace_id));
create policy "medios_own"    on medios            for all using (owns_workspace(workspace_id));
create policy "journeys_own"  on customer_journeys for all using (owns_workspace(workspace_id));
create policy "canvas_own"    on canvas_estados    for all using (owns_workspace(workspace_id));
create policy "financial_own" on financial_models  for all using (owns_workspace(workspace_id));

-- Strategic model: one per workspace (JSON blob)
create table strategic_models (
  workspace_id uuid primary key references workspaces(id) on delete cascade,
  data         jsonb not null default '{}',
  updated_at   timestamptz default now()
);
alter table strategic_models enable row level security;
create policy "strategic_own" on strategic_models for all using (owns_workspace(workspace_id));
