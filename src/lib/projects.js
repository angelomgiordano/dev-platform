import { supabase } from "./supabase";

// ---------- camelCase <-> snake_case converters ----------
const toSnake = (s) => s.replace(/[A-Z]/g, (m) => "_" + m.toLowerCase());
const toCamel = (s) => s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

function rowToProject(row) {
  if (!row) return row;
  const out = {};
  for (const k of Object.keys(row)) {
    if (k === "created_at" || k === "updated_at") continue;
    out[toCamel(k)] = row[k];
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
