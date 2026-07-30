-- ═══════════════════════════════════════════════════════════════
--  SEED — Tito Trainer Demo (SOLO datos ficticios)
--  Idempotente (ids fijos + on conflict do nothing). NO se ejecuta solo.
--  NO ejecutar en prod sin autorización. NO contiene datos reales.
--
--  Org demo:  22222222-2222-2222-2222-222222222222  (slug titotrainer, tenant_type demo)
--  La cuenta de entrenador demo (Auth) se crea aparte con la Edge Function/script
--  (nunca con contraseñas en el repo). Ver docs/tito-trainer-demo.md.
-- ═══════════════════════════════════════════════════════════════

do $$
declare demo uuid := '22222222-2222-2222-2222-222222222222';
begin
  -- Organización demo
  insert into public.organizations (id,name,slug,tenant_type,status)
  values (demo,'Tito Trainer Demo','titotrainer','demo','active')
  on conflict (slug) do nothing;
  select id into demo from public.organizations where slug='titotrainer';

  -- Suscripción activa (manual) de la demo. Necesaria para pasar la validación
  -- pre-RLS (toda org debe tener suscripción) y para que la demo no quede bloqueada.
  insert into public.organization_subscriptions (organization_id, plan, status, provider)
  values (demo, 'demo', 'active', 'manual')
  on conflict (organization_id) do nothing;

  -- Branding demo (neutro + CTA desde configuración, no hardcodeado en componentes)
  insert into public.organization_settings
    (organization_id, display_name, tagline, primary_color, secondary_color, call_to_action, bio)
  values
    (demo,'Tito Trainer Demo','Demo de Tito Apps','#7B1FA2','#0B1F4B',
     '¿Querés tu propia plataforma? Contactá a Tito Apps',
     'Cuenta de demostración con datos ficticios para mostrar la plataforma.')
  on conflict (organization_id) do nothing;

  -- Ejercicios privados de la demo (ids fijos)
  insert into public.exercises (id,name,muscle_group,type,equipment,visibility,organization_id) values
    ('demo_ex_sentadilla','Sentadilla goblet','Piernas','normal','Mancuerna','organization',demo),
    ('demo_ex_press','Press de banca','Pecho','normal','Barra','organization',demo),
    ('demo_ex_remo','Remo con mancuerna','Espalda','normal','Mancuerna','organization',demo),
    ('demo_ex_peso_muerto','Peso muerto','Piernas','normal','Barra','organization',demo),
    ('demo_ex_plancha','Plancha','Core','normal','Ninguno','organization',demo),
    ('demo_ex_zancada','Zancadas','Piernas','normal','Mancuerna','organization',demo),
    ('demo_ex_curl','Curl de bíceps','Bíceps','normal','Mancuerna','organization',demo),
    ('demo_ex_estiramiento','Estiramiento isquios','Piernas','stretching','Ninguno','organization',demo)
  on conflict (id) do nothing;

  -- Clientes ficticios (8): activos, por vencer y vencidos. Sin datos reales.
  insert into public.users (id,username,password,name,role,phone,email,dob,height,plan_type,plan_modality,plan_format,plan_start_date,plan_end_date,plan_price,organization_id) values
    ('demo_c1','demo.ana','x','Ana Demo','user','0000-0001','ana@demo.local','1995-04-12','165','Elite','Virtual','Individual',(current_date-30),(current_date+60),'35000',demo),
    ('demo_c2','demo.beto','x','Beto Demo','user','0000-0002','beto@demo.local','1990-08-03','178','Base','En Estudio','Individual',(current_date-25),(current_date+8),'25000',demo),
    ('demo_c3','demo.caro','x','Caro Demo','user','0000-0003','caro@demo.local','1998-01-20','160','Transformación','Virtual','Pareja',(current_date-90),(current_date-5),'30000',demo),
    ('demo_c4','demo.dani','x','Dani Demo','user','0000-0004','dani@demo.local','1993-11-11','172','Elite','En Estudio','Individual',(current_date-15),(current_date+45),'35000',demo),
    ('demo_c5','demo.eva','x','Eva Demo','user','0000-0005','eva@demo.local','2000-06-30','168','Activación','Virtual','Grupo',(current_date-40),(current_date+20),'20000',demo),
    ('demo_c6','demo.fer','x','Fer Demo','user','0000-0006','fer@demo.local','1988-02-14','180','Base','En Visita','Individual',(current_date-60),(current_date-20),'25000',demo),
    ('demo_c7','demo.gina','x','Gina Demo','user','0000-0007','gina@demo.local','1996-09-09','162','Especial','Virtual','Individual',(current_date-10),(current_date+80),'40000',demo),
    ('demo_c8','demo.hugo','x','Hugo Demo','user','0000-0008','hugo@demo.local','1992-12-25','175','Elite','En Estudio','Trío',(current_date-5),(current_date+55),'35000',demo)
  on conflict (id) do nothing;

  -- Pagos (varios)
  insert into public.payments (id,client_id,date,end_date,amount,period,notes,organization_id) values
    ('demo_p1','demo_c1',(current_date-30),(current_date+60),'35000',3,'Trimestre',demo),
    ('demo_p2','demo_c2',(current_date-25),(current_date+8),'25000',1,'Mensual',demo),
    ('demo_p3','demo_c4',(current_date-15),(current_date+45),'35000',2,'',demo),
    ('demo_p4','demo_c7',(current_date-10),(current_date+80),'40000',3,'Trimestre',demo),
    ('demo_p5','demo_c1',(current_date-120),(current_date-30),'35000',3,'Renovación previa',demo)
  on conflict (id) do nothing;

  -- Mediciones (varias por cliente)
  insert into public.measurements (id,client_id,date,weight,fat,muscle_mass,organization_id) values
    ('demo_m1','demo_c1',(current_date-60),'68','28','24',demo),
    ('demo_m2','demo_c1',(current_date-30),'66','26','25',demo),
    ('demo_m3','demo_c1',(current_date-2),'64','24','26',demo),
    ('demo_m4','demo_c4',(current_date-40),'82','22','35',demo),
    ('demo_m5','demo_c4',(current_date-5),'80','20','36',demo),
    ('demo_m6','demo_c7',(current_date-20),'59','25','22',demo)
  on conflict (id) do nothing;

  -- 4 rutinas (asignadas a c1, c4, c5, c7)
  insert into public.routines (id,user_id,title,days_per_week,note,organization_id,created_at) values
    ('demo_r1','demo_c1','Full Body Inicial',3,'Enfocarse en técnica',demo,(current_date-30)),
    ('demo_r2','demo_c4','Fuerza Superior',4,'Progresión semanal',demo,(current_date-15)),
    ('demo_r3','demo_c5','Activación Glúteo',3,null,demo,(current_date-40)),
    ('demo_r4','demo_c7','Recomposición',4,'Combinar con cardio',demo,(current_date-10))
  on conflict (id) do nothing;

  -- Días
  insert into public.routine_days (id,routine_id,label,sort_order,organization_id) values
    ('demo_d1a','demo_r1','Día 1 - Full',0,demo),
    ('demo_d1b','demo_r1','Día 2 - Full',1,demo),
    ('demo_d2a','demo_r2','Día 1 - Empuje',0,demo),
    ('demo_d2b','demo_r2','Día 2 - Tirón',1,demo),
    ('demo_d3a','demo_r3','Día 1 - Glúteo',0,demo),
    ('demo_d4a','demo_r4','Día 1 - Total',0,demo)
  on conflict (id) do nothing;

  -- Grupos
  insert into public.routine_groups (id,day_id,label,rest_seconds,sort_order,organization_id) values
    ('demo_g1','demo_d1a','A',60,0,demo),
    ('demo_g2','demo_d1a','B',45,1,demo),
    ('demo_g3','demo_d2a','A',90,0,demo),
    ('demo_g4','demo_d3a','A',60,0,demo),
    ('demo_g5','demo_d4a','A',60,0,demo)
  on conflict (id) do nothing;

  -- Ejercicios de rutina
  insert into public.routine_exercises (id,group_id,exercise_id,series,reps,weight_amount,weight_unit,equipment,surface,sort_order,organization_id) values
    ('demo_re1','demo_g1','demo_ex_sentadilla',4,'12','20','lbs','Mancuerna','Ninguno',0,demo),
    ('demo_re2','demo_g1','demo_ex_remo',3,'10','15','lbs','Mancuerna','Ninguno',1,demo),
    ('demo_re3','demo_g2','demo_ex_plancha',3,'30 seg','','lbs','Ninguno','Piso',0,demo),
    ('demo_re4','demo_g3','demo_ex_press',5,'5','95','lbs','Barra','Banco',0,demo),
    ('demo_re5','demo_g4','demo_ex_zancada',3,'12','20','lbs','Mancuerna','Ninguno',0,demo),
    ('demo_re6','demo_g5','demo_ex_peso_muerto',4,'8','135','lbs','Barra','Ninguno',0,demo)
  on conflict (id) do nothing;

  -- Rutina activa
  update public.users set active_routine_id='demo_r1' where id='demo_c1' and active_routine_id is null;
  update public.users set active_routine_id='demo_r2' where id='demo_c4' and active_routine_id is null;

  -- Sesiones de entrenamiento + logs (progreso de peso)
  insert into public.workout_sessions (id,user_id,routine_id,day_id,day_label,started_at,finished_at,status,organization_id) values
    ('demo_s1','demo_c1','demo_r1','demo_d1a','Día 1 - Full',(now()-interval '20 days'),(now()-interval '20 days')+interval '50 min','completed',demo),
    ('demo_s2','demo_c1','demo_r1','demo_d1a','Día 1 - Full',(now()-interval '13 days'),(now()-interval '13 days')+interval '48 min','completed',demo),
    ('demo_s3','demo_c1','demo_r1','demo_d1a','Día 1 - Full',(now()-interval '6 days'),(now()-interval '6 days')+interval '52 min','completed',demo)
  on conflict (id) do nothing;

  insert into public.workout_logs (id,session_id,exercise_id,exercise_name,series,reps,planned_weight,actual_weight,weight_unit,sort_order,organization_id) values
    ('demo_l1','demo_s1','demo_ex_sentadilla','Sentadilla goblet','4','12','20','20','lbs',0,demo),
    ('demo_l2','demo_s2','demo_ex_sentadilla','Sentadilla goblet','4','12','20','25','lbs',0,demo),
    ('demo_l3','demo_s3','demo_ex_sentadilla','Sentadilla goblet','4','12','20','30','lbs',0,demo)
  on conflict (id) do nothing;

  -- Catálogos de la demo (para que los menús no queden vacíos si RLS filtra por org)
  insert into public.catalogs (id,category,label,sort_order,organization_id) values
    ('demo_cat_eq1','equipment','Ninguno',0,demo),
    ('demo_cat_eq2','equipment','Mancuerna',1,demo),
    ('demo_cat_eq3','equipment','Barra',2,demo),
    ('demo_cat_su1','surface','Ninguno',0,demo),
    ('demo_cat_su2','surface','Banco',1,demo),
    ('demo_cat_su3','surface','Piso',2,demo)
  on conflict (id) do nothing;
end $$;
