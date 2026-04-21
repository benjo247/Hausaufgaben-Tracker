/**
 * _db.js
 * Geteilter Neon-Client für alle API Routes.
 *
 * Token-Verifikation:
 * Der Browser schickt den Session-Token als Bearer Header.
 * Wir verifizieren ihn gegen den Neon Auth JWKS Endpoint.
 */

import { neon } from "@neondatabase/serverless";

export const sql = neon(process.env.DATABASE_URL);

/**
 * Aktuellen Nutzer aus dem Authorization-Header holen.
 * Gibt null zurück wenn nicht eingeloggt oder Token ungültig.
 */
export async function getUser(req) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) return null;

    // Token gegen Neon Auth verifizieren
    const authUrl = process.env.NEON_AUTH_URL;
    if (!authUrl) return null;

    const res = await fetch(`${authUrl}/session`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;

    const data = await res.json();
    return data?.user ?? null;
  } catch {
    return null;
  }
}

/** CORS Headers */
export function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
}

/** Fehler-Response */
export function error(res, status, message) {
  return res.status(status).json({ error: message });
}
