import { createContext, useContext } from "react";
import {
  EQUIPMENT_TYPES,
  SURFACE_TYPES,
  MUSCLE_GROUPS_FILTER,
  PLAN_TYPES,
  PLAN_MODALITIES,
  PLAN_FORMATS,
} from "./johel-training.constants";

// Listas editables desde la app. `key` = nombre usado en el código,
// `dbCat` = categoría en Supabase, `def` = valores por defecto (fallback).
export const CATALOG_META = [
  { key: "equipment", dbCat: "equipment", label: "Equipo", def: EQUIPMENT_TYPES },
  { key: "surface", dbCat: "surface", label: "Superficie", def: SURFACE_TYPES },
  { key: "muscleGroups", dbCat: "muscle_group", label: "Grupos musculares", def: MUSCLE_GROUPS_FILTER.slice(1) },
  { key: "planTypes", dbCat: "plan_type", label: "Tipos de plan", def: PLAN_TYPES },
  { key: "planModalities", dbCat: "plan_modality", label: "Modalidades de plan", def: PLAN_MODALITIES },
  { key: "planFormats", dbCat: "plan_format", label: "Formatos de plan", def: PLAN_FORMATS },
];

// Valor por defecto: todas las listas en su versión de código y un saveCategory no-op.
const defaultValue = { saveCategory: async () => {}, meta: CATALOG_META };
CATALOG_META.forEach((m) => {
  defaultValue[m.key] = m.def;
});

export const CatalogContext = createContext(defaultValue);
export function useCatalogs() {
  return useContext(CatalogContext);
}

// Construye el valor efectivo del contexto a partir de los overrides de la BD.
// overrides: { [dbCat]: [labels] }
export function buildCatalogValue(overrides, saveCategory) {
  const v = { saveCategory, meta: CATALOG_META };
  CATALOG_META.forEach((m) => {
    v[m.key] = overrides && overrides[m.dbCat] ? overrides[m.dbCat] : m.def;
  });
  return v;
}
