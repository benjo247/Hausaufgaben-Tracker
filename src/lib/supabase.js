import { createClient } from "@supabase/supabase-js";

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Supabase-Umgebungsvariablen fehlen. " +
    "Bitte .env.local aus .env.example erstellen."
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// ─── Schulsuche ──────────────────────────────────────────────────────────────
export async function searchSchools(query, limit = 8) {
  if (!query || query.trim().length < 2) return [];
  const q = query.trim();

  const [byName, byCity, byZip] = await Promise.all([
    supabase.from("schools").select("id,name,city,zip,state,school_type,source,confirmed")
      .ilike("name", `%${q}%`).limit(limit),
    supabase.from("schools").select("id,name,city,zip,state,school_type,source,confirmed")
      .ilike("city", `%${q}%`).limit(limit),
    supabase.from("schools").select("id,name,city,zip,state,school_type,source,confirmed")
      .ilike("zip", `${q}%`).limit(limit),
  ]);

  const seen = new Set();
  return [...(byName.data??[]), ...(byCity.data??[]), ...(byZip.data??[])]
    .filter(s => { if (seen.has(s.id)) return false; seen.add(s.id); return true; })
    .slice(0, limit);
}

// ─── Manuellen Schuleintrag speichern ────────────────────────────────────────
export async function insertManualSchool({ name, city, zip, state, school_type }) {
  const id = `manual-${crypto.randomUUID()}`;
  const { data, error } = await supabase
    .from("schools")
    .insert({ id, name, city, zip, state, school_type, source: "manual", confirmed: false, confirm_count: 0 })
    .select().single();
  if (error) throw error;
  return data;
}

// ─── Manuellen Eintrag bestätigen ────────────────────────────────────────────
export async function confirmManualSchool(schoolId) {
  const { data: s } = await supabase.from("schools").select("confirm_count").eq("id", schoolId).single();
  const newCount = (s?.confirm_count ?? 0) + 1;
  await supabase.from("schools")
    .update({ confirm_count: newCount, confirmed: newCount >= 2 })
    .eq("id", schoolId);
}
