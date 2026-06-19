import { sb } from "./supabase";

// ═══════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════

// Convierte un user de BD (snake_case) al formato que usa la app (camelCase)
function dbToUser(u) {
  if (!u) return null;
  return {
    id: u.id,
    username: u.username,
    password: u.password,
    name: u.name,
    role: u.role,
    phone: u.phone || "",
    email: u.email || "",
    cedula: u.cedula || "",
    dob: u.dob || "",
    height: u.height || "",
    notes: u.notes || "",
    activeRoutineId: u.active_routine_id || null,
    disabled: u.disabled || false,
    plan: {
      type: u.plan_type || "",
      modality: u.plan_modality || "",
      format: u.plan_format || "",
      startDate: u.plan_start_date || "",
      endDate: u.plan_end_date || "",
      price: u.plan_price || "",
      status: u.plan_status || "",
    },
  };
}

// Convierte un user de la app al formato de BD
function userToDb(u) {
  return {
    id: u.id,
    username: u.username,
    password: u.password,
    name: u.name,
    role: u.role || "user",
    phone: u.phone || null,
    email: u.email || null,
    cedula: u.cedula || null,
    dob: u.dob || null,
    height: u.height || null,
    notes: u.notes || null,
    active_routine_id: u.activeRoutineId || null,
    disabled: u.disabled || false,
    plan_type: u.plan?.type || null,
    plan_modality: u.plan?.modality || null,
    plan_format: u.plan?.format || null,
    plan_start_date: u.plan?.startDate || null,
    plan_end_date: u.plan?.endDate || null,
    plan_price: u.plan?.price || null,
    plan_status: u.plan?.status || null,
  };
}

// Convierte exercise de BD al formato app
function dbToExercise(e) {
  if (!e) return null;
  return {
    id: e.id,
    name: e.name,
    videoUrl: e.video_url || "",
    muscleGroup: e.muscle_group || "",
    type: e.type || "normal",
    equipment: e.equipment || "Ninguno",
  };
}

// Convierte exercise de app al formato BD
function exerciseToDb(e) {
  return {
    id: e.id,
    name: e.name,
    video_url: e.videoUrl || null,
    muscle_group: e.muscleGroup || null,
    type: e.type || "normal",
    equipment: e.equipment || null,
  };
}

// Convierte una rutina completa de BD (con días/grupos/ejercicios) al formato app
function dbToRoutine(r, days) {
  return {
    id: r.id,
    userId: r.user_id || "",
    title: r.title,
    daysPerWeek: r.days_per_week || 0,
    note: r.note || "",
    warmupStretchIds: r.warmup_stretch_ids || [],
    cooldownStretchIds: r.cooldown_stretch_ids || [],
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    days: (days || [])
      .filter((d) => d.routine_id === r.id)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((d) => ({
        id: d.id,
        label: d.label,
        groups: (d.groups || [])
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((g) => ({
            id: g.id,
            label: g.label,
            restSeconds: g.rest_seconds || 60,
            exercises: (g.exercises || [])
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((ex) => ({
                exId: ex.exercise_id,
                series: ex.series || 3,
                reps: ex.reps || "",
                notes: ex.notes || "",
                weightAmount: ex.weight_amount || "",
                weightUnit: ex.weight_unit || "lbs",
                equipment: ex.equipment || "Ninguno",
                surface: ex.surface || "Ninguno",
              })),
          })),
      })),
  };
}

// Convierte measurement de BD al formato app
function dbToMeasurement(m) {
  return {
    id: m.id,
    clientId: m.client_id,
    date: m.date,
    weight: m.weight || "",
    fat: m.fat || "",
    water: m.water || "",
    imc: m.imc || "",
    visceralFat: m.visceral_fat || "",
    protein: m.protein || "",
    muscleMass: m.muscle_mass || "",
    boneMass: m.bone_mass || "",
    bmi: m.bmi || "",
    metabolicAge: m.metabolic_age || "",
  };
}

function measurementToDb(m) {
  return {
    id: m.id,
    client_id: m.clientId,
    date: m.date,
    weight: m.weight || null,
    fat: m.fat || null,
    water: m.water || null,
    imc: m.imc || null,
    visceral_fat: m.visceralFat || null,
    protein: m.protein || null,
    muscle_mass: m.muscleMass || null,
    bone_mass: m.boneMass || null,
    bmi: m.bmi || null,
    metabolic_age: m.metabolicAge || null,
  };
}

// Convierte payment de BD al formato app
function dbToPayment(p) {
  return {
    id: p.id,
    clientId: p.client_id,
    date: p.date,
    endDate: p.end_date,
    amount: p.amount || "",
    period: p.period || "",
    notes: p.notes || "",
  };
}

function paymentToDb(p) {
  return {
    id: p.id,
    client_id: p.clientId,
    date: p.date || null,
    end_date: p.endDate || null,
    amount: p.amount || null,
    period: p.period || null,
    notes: p.notes || null,
  };
}

// ═══════════════════════════════════════════
// USERS
// ═══════════════════════════════════════════

export async function getUsers() {
  const { data, error } = await sb.from("users").select("*");
  if (error) throw error;
  return data.map(dbToUser);
}

export async function upsertUser(user) {
  const { error } = await sb
    .from("users")
    .upsert(userToDb(user), { onConflict: "id" });
  if (error) throw error;
}

export async function deleteUser(id) {
  const { error } = await sb.from("users").delete().eq("id", id);
  if (error) throw error;
}

// ═══════════════════════════════════════════
// EXERCISES
// ═══════════════════════════════════════════

export async function getExercises() {
  const { data, error } = await sb
    .from("exercises")
    .select("*")
    .order("name");
  if (error) throw error;
  return data.map(dbToExercise);
}

export async function upsertExercise(ex) {
  const { error } = await sb
    .from("exercises")
    .upsert(exerciseToDb(ex), { onConflict: "id" });
  if (error) throw error;
}

export async function deleteExercise(id) {
  const { error } = await sb.from("exercises").delete().eq("id", id);
  if (error) throw error;
}

// ═══════════════════════════════════════════
// ROUTINES (con días, grupos y ejercicios)
// ═══════════════════════════════════════════

export async function getRoutines() {
  // 1. Traer todas las rutinas
  const { data: routines, error: rErr } = await sb
    .from("routines")
    .select("*")
    .order("created_at", { ascending: false });
  if (rErr) throw rErr;
  if (!routines.length) return [];

  // 2. Traer todos los días de esas rutinas
  const routineIds = routines.map((r) => r.id);
  const { data: days, error: dErr } = await sb
    .from("routine_days")
    .select("*")
    .in("routine_id", routineIds)
    .order("sort_order");
  if (dErr) throw dErr;

  // 3. Traer todos los grupos
  const dayIds = days.map((d) => d.id);
  let groups = [];
  if (dayIds.length) {
    const { data: g, error: gErr } = await sb
      .from("routine_groups")
      .select("*")
      .in("day_id", dayIds)
      .order("sort_order");
    if (gErr) throw gErr;
    groups = g;
  }

  // 4. Traer todos los ejercicios de esos grupos
  const groupIds = groups.map((g) => g.id);
  let exercises = [];
  if (groupIds.length) {
    const { data: ex, error: exErr } = await sb
      .from("routine_exercises")
      .select("*")
      .in("group_id", groupIds)
      .order("sort_order");
    if (exErr) throw exErr;
    exercises = ex;
  }

  // 5. Armar la estructura anidada
  const groupsWithEx = groups.map((g) => ({
    ...g,
    exercises: exercises.filter((ex) => ex.group_id === g.id),
  }));
  const daysWithGroups = days.map((d) => ({
    ...d,
    groups: groupsWithEx.filter((g) => g.day_id === d.id),
  }));

  return routines.map((r) => dbToRoutine(r, daysWithGroups));
}

export async function upsertRoutine(routine) {
  // 1. Guardar la rutina principal
  const { error: rErr } = await sb.from("routines").upsert(
    {
      id: routine.id,
      user_id: routine.userId || null,
      title: routine.title,
      days_per_week: routine.daysPerWeek || 0,
      note: routine.note || null,
      warmup_stretch_ids: routine.warmupStretchIds || [],
      cooldown_stretch_ids: routine.cooldownStretchIds || [],
      created_at: routine.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );
  if (rErr) throw rErr;

  // 2. Borrar días anteriores (cascade elimina grupos y ejercicios)
  await sb.from("routine_days").delete().eq("routine_id", routine.id);

  // 3. Insertar días, grupos y ejercicios
  for (let di = 0; di < (routine.days || []).length; di++) {
    const day = routine.days[di];
    const { error: dErr } = await sb.from("routine_days").insert({
      id: day.id,
      routine_id: routine.id,
      label: day.label,
      sort_order: di,
    });
    if (dErr) throw dErr;

    for (let gi = 0; gi < (day.groups || []).length; gi++) {
      const group = day.groups[gi];
      const { error: gErr } = await sb.from("routine_groups").insert({
        id: group.id,
        day_id: day.id,
        label: group.label,
        rest_seconds: group.restSeconds || 60,
        sort_order: gi,
      });
      if (gErr) throw gErr;

      for (let ei = 0; ei < (group.exercises || []).length; ei++) {
        const ex = group.exercises[ei];
        const { error: exErr } = await sb.from("routine_exercises").insert({
          id: "rex_" + Math.random().toString(36).slice(2, 10),
          group_id: group.id,
          exercise_id: ex.exId,
          series: ex.series || 3,
          reps: ex.reps || "",
          notes: ex.notes || null,
          weight_amount: ex.weightAmount || null,
          weight_unit: ex.weightUnit || "lbs",
          equipment: ex.equipment || null,
          surface: ex.surface || null,
          sort_order: ei,
        });
        if (exErr) throw exErr;
      }
    }
  }
}

export async function deleteRoutine(id) {
  const { error } = await sb.from("routines").delete().eq("id", id);
  if (error) throw error;
}

// ═══════════════════════════════════════════
// MEASUREMENTS
// ═══════════════════════════════════════════

export async function getMeasurements() {
  const { data, error } = await sb
    .from("measurements")
    .select("*")
    .order("date", { ascending: false });
  if (error) throw error;
  return data.map(dbToMeasurement);
}

export async function upsertMeasurement(m) {
  const { error } = await sb
    .from("measurements")
    .upsert(measurementToDb(m), { onConflict: "id" });
  if (error) throw error;
}

export async function deleteMeasurement(id) {
  const { error } = await sb.from("measurements").delete().eq("id", id);
  if (error) throw error;
}

// ═══════════════════════════════════════════
// PAYMENTS
// ═══════════════════════════════════════════

export async function getPayments() {
  const { data, error } = await sb
    .from("payments")
    .select("*")
    .order("date", { ascending: false });
  if (error) throw error;
  return data.map(dbToPayment);
}

export async function upsertPayment(p) {
  const { error } = await sb
    .from("payments")
    .upsert(paymentToDb(p), { onConflict: "id" });
  if (error) throw error;
}

export async function deletePayment(id) {
  const { error } = await sb.from("payments").delete().eq("id", id);
  if (error) throw error;
}
