-- ═══════════════════════════════════════════════════════════════
--  JOEL TRAINING — Migración: Catálogos editables (listas)
--  Correr UNA SOLA VEZ en Supabase → SQL Editor → New query → Run
--  (elegí "Run without RLS" para mantener consistencia con el resto)
-- ═══════════════════════════════════════════════════════════════

-- Listas editables desde la app: equipo, superficie, grupos musculares,
-- tipos/modalidades/formatos de plan. Cada opción es una fila.
create table if not exists public.catalogs (
  id          text primary key,
  category    text not null,   -- equipment | surface | muscle_group | plan_type | plan_modality | plan_format
  label       text not null,
  sort_order  int default 0
);

create index if not exists catalogs_category_idx
  on public.catalogs (category);

alter table public.catalogs disable row level security;
