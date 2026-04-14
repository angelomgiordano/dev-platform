import { supabase } from "./supabase";

// ---------- camelCase <-> snake_case converters ----------
const toSnake = (s) => s.replace(/[A-Z]/g, (m) => "_" + m.toLowerCase());
const toCamel = (s) => s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

// Postgres numeric/decimal types come back as strings from PostgREST.
// Cast known numeric columns to Number so comparisons work.
const NUMERIC_FIELDS = new Set([
  "dev_status", "power_mw", "capacity_h", "capacity_mwh", "es_volt", "es_dist",
  "stmg_acc_vat", "connection_tot_cost", "ha", "orig_fee_per_mw", "tot_orig_fee",
  "dev_fee", "tot_dev_fee", "m1", "m2", "m3", "m4", "m5",
]);

function rowToProject(row) {
  if (!row) return row;
  const out = {};
  for (const k of Object.keys(row)) {
    if (k === "created_at" || k === "updated_at") continue;
    let v = row[k];
    if (NUMERIC_FIELDS.has(k) && v !== null && v !== undefined) {
      v = Number(v);
    }
    out[toCamel(k)] = v;
  }
  return out;
}

function projectToRow(p) {
  const out = {};
  for (const k of Object.keys(p)) {
    out[toSnake(k)] = p[k];
  }
  return out;
}

// ---------- API ----------
export async function fetchProjects() {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw error;
  return data.map(rowToProject);
}

export async function upsertProject(project) {
  const row = projectToRow(project);
  const { data, error } = await supabase
    .from("projects")
    .upsert(row, { onConflict: "id" })
    .select()
    .single();
  if (error) throw error;
  return rowToProject(data);
}

export async function updateProject(id, patch) {
  const row = projectToRow(patch);
  const { data, error } = await supabase
    .from("projects")
    .update(row)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return rowToProject(data);
}

export async function deleteProject(id) {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
}
