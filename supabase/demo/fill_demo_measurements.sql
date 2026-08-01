-- ═══════════════════════════════════════════════════════════════
--  DEMO — Rellenar campos faltantes de las mediciones de los clientes de la demo
--  (titotrainer) para que TODAS las gráficas tengan datos (≥2 puntos).
--  Solo completa lo que está vacío (coalesce); no pisa valores existentes.
--  Valores plausibles derivados de peso/grasa (varían por medición → tendencia).
--  Idempotente. Solo toca clientes de titotrainer.
--
--  NOTA: asume que las columnas de measurements son TEXT (así las usa la app).
--  Si diera error de tipo (columnas numeric), avisame y te paso la variante.
-- ═══════════════════════════════════════════════════════════════
update public.measurements m
set
  visceral_fat  = coalesce(nullif(m.visceral_fat, ''),  round((m.fat::numeric) * 0.45)::text),
  water         = coalesce(nullif(m.water, ''),         round(60 - (m.fat::numeric) * 0.3, 1)::text),
  protein       = coalesce(nullif(m.protein, ''),       round(18 - (m.fat::numeric) * 0.05, 1)::text),
  bone_mass     = coalesce(nullif(m.bone_mass, ''),     round((m.weight::numeric) * 0.045, 1)::text),
  bmi           = coalesce(nullif(m.bmi, ''),           round((m.weight::numeric) * 0.38, 1)::text),
  imc           = coalesce(nullif(m.imc, ''),           round((m.weight::numeric) * 0.38, 1)::text),
  metabolic_age = coalesce(nullif(m.metabolic_age, ''), round(28 + (m.fat::numeric) * 0.2)::text)
where m.client_id in (
        select id from public.users
        where organization_id = (select id from public.organizations where slug = 'titotrainer')
      )
  and m.weight ~ '^[0-9]+(\.[0-9]+)?$'
  and m.fat    ~ '^[0-9]+(\.[0-9]+)?$';

-- Verificación: todas las mediciones demo con sus campos completos.
select u.name, m.date, m.weight, m.fat, m.visceral_fat, m.water, m.protein,
       m.muscle_mass, m.bone_mass, m.bmi, m.metabolic_age
from public.measurements m
join public.users u on u.id = m.client_id
where u.organization_id = (select id from public.organizations where slug = 'titotrainer')
order by u.name, m.date;
