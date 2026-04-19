// src/lib/api.js
// Alle API-Calls gehen über Vercel Serverless Functions.
// Der DATABASE_URL kommt NIE in den Browser.

const BASE = import.meta.env.DEV ? "http://localhost:3000" : "";

async function get(path) {
  const res = await fetch(BASE + path);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function post(path, body) {
  const res = await fetch(BASE + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// ─── Schulsuche ──────────────────────────────────────────────────────────────
export async function searchSchools(query, limit = 8) {
  if (!query || query.trim().length < 2) return [];
  const params = new URLSearchParams({ q: query.trim(), limit });
  return get(`/api/schools?${params}`);
}

// ─── Manuellen Schuleintrag speichern ────────────────────────────────────────
export async function insertManualSchool(data) {
  return post("/api/schools-manual", data);
}
