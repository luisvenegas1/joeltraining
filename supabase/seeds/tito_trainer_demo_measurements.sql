-- ═══════════════════════════════════════════════════════════════
--  SEED (ADITIVO) — Mediciones realistas de la demo (titotrainer).
--  Da ~5 mediciones a cada cliente con COMPORTAMIENTOS DISTINTOS para que las
--  gráficas de progreso cuenten historias diferentes (no todas "bajando"):
--
--    Ana  (demo_c1) → Éxito: baja grasa y sube músculo de forma sostenida.
--    Beto (demo_c2) → Meseta: peso/grasa casi sin cambios (estancamiento real).
--    Caro (demo_c3) → Recaída: sube peso y grasa (se salió del plan).
--    Dani (demo_c4) → Volumen: sube peso y MUCHO músculo (bulk), grasa estable.
--    Eva  (demo_c5) → Progreso lento pero constante: baja grasa poco a poco.
--
--  Idempotente (ids fijos con prefijo demo_mm_ + on conflict do nothing).
--  SOLO toca titotrainer. NO se ejecuta solo. NO ejecutar en prod sin autorización.
--  Correr DESPUÉS de tito_trainer_demo.sql (necesita los clientes demo_c1..c5).
--  Luego correr fill_demo_measurements.sql para completar los campos derivados.
-- ═══════════════════════════════════════════════════════════════

do $$
declare demo uuid := (select id from public.organizations where slug = 'titotrainer');
begin
  if demo is null then
    raise exception 'Falta la organización titotrainer. Corré primero tito_trainer_demo.sql';
  end if;

  -- Fechas: 5 puntos a lo largo de ~4 meses. weight/fat/muscle_mass son TEXT.
  insert into public.measurements (id, client_id, date, weight, fat, muscle_mass, organization_id) values
    -- ── Ana (c1): ÉXITO. Grasa 31→23, músculo 22→27, peso 72→63.5 ──
    ('demo_mm_c1_1','demo_c1',(current_date-120),'72','31','22',demo),
    ('demo_mm_c1_2','demo_c1',(current_date-90), '70','30','23',demo),
    -- (demo_m1/m2/m3 del seed base cubren -60, -30, -2)

    -- ── Beto (c2): MESETA. Peso ~80, grasa ~24.5 sin moverse ──
    ('demo_mm_c2_1','demo_c2',(current_date-120),'80.5','25','33',demo),
    ('demo_mm_c2_2','demo_c2',(current_date-90), '80.2','24.8','33',demo),
    ('demo_mm_c2_3','demo_c2',(current_date-60), '80.4','24.9','32.8',demo),
    ('demo_mm_c2_4','demo_c2',(current_date-30), '80.1','24.7','33.1',demo),
    ('demo_mm_c2_5','demo_c2',(current_date-2),  '80.3','24.8','33',demo),

    -- ── Caro (c3): RECAÍDA. Peso 62→68, grasa 26→31, músculo baja 23→21.5 ──
    ('demo_mm_c3_1','demo_c3',(current_date-120),'62','26','23',demo),
    ('demo_mm_c3_2','demo_c3',(current_date-90), '63.5','27','22.7',demo),
    ('demo_mm_c3_3','demo_c3',(current_date-60), '65','28.5','22.2',demo),
    ('demo_mm_c3_4','demo_c3',(current_date-30), '66.8','30','21.8',demo),
    ('demo_mm_c3_5','demo_c3',(current_date-2),  '68','31','21.5',demo),

    -- ── Dani (c4): VOLUMEN. Peso 78→83, músculo 33→37, grasa ~21 estable ──
    ('demo_mm_c4_1','demo_c4',(current_date-120),'78','21','33',demo),
    ('demo_mm_c4_2','demo_c4',(current_date-90), '79.5','21.2','34',demo),
    ('demo_mm_c4_3','demo_c4',(current_date-70), '81','21.5','34.5',demo),
    -- (demo_m4/m5 del seed base cubren -40 y -5)

    -- ── Eva (c5): PROGRESO LENTO. Peso 74→70, grasa 30→26, músculo 24→25 ──
    ('demo_mm_c5_1','demo_c5',(current_date-120),'74','30','24',demo),
    ('demo_mm_c5_2','demo_c5',(current_date-90), '73','29','24.2',demo),
    ('demo_mm_c5_3','demo_c5',(current_date-60), '72','28','24.5',demo),
    ('demo_mm_c5_4','demo_c5',(current_date-30), '71','27','24.8',demo),
    ('demo_mm_c5_5','demo_c5',(current_date-2),  '70','26','25',demo)
  on conflict (id) do nothing;

  -- Segunda rutina para Eva (c5) ya existe en el seed base (demo_r3). Aseguramos
  -- que Beto (c2) tenga una rutina asignada para que la demo muestre variedad.
  update public.users set active_routine_id = 'demo_r3'
    where id = 'demo_c5' and active_routine_id is null;
end $$;

-- ── Verificación: conteo de mediciones por cliente demo ──
select u.name, count(m.*) as mediciones,
       min(m.date) as desde, max(m.date) as hasta
from public.users u
left join public.measurements m on m.client_id = u.id
where u.organization_id = (select id from public.organizations where slug = 'titotrainer')
group by u.name
order by u.name;
