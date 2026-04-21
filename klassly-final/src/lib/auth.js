/**
 * auth.js
 * Neon Auth Client – korrekt nach Doku
 * Paket: @neondatabase/neon-js
 * Doku:  https://neon.com/docs/auth/quick-start/react
 */

import { createAuthClient } from "@neondatabase/neon-js/auth";

// Auth Base URL aus Neon Dashboard → Auth → Configuration
export const authClient = createAuthClient(
  import.meta.env.VITE_NEON_AUTH_URL
);

// ─── Session laden ────────────────────────────────────────────
// Gibt { user, session } oder null zurück
export async function getCurrentUser() {
  try {
    const { data, error } = await authClient.getSession();
    if (error || !data?.session) return null;
    return data.user;
  } catch {
    return null;
  }
}

// ─── E-Mail + Passwort Registrierung ─────────────────────────
export async function signUpWithEmail(email, password, name) {
  const { data, error } = await authClient.signUp.email({
    email,
    password,
    name: name || email.split("@")[0],
  });
  if (error) throw new Error(error.message);
  return data;
}

// ─── E-Mail + Passwort Login ──────────────────────────────────
export async function signInWithEmail(email, password) {
  const { data, error } = await authClient.signIn.email({
    email,
    password,
  });
  if (error) throw new Error(error.message);
  return data;
}

// ─── Google Login ─────────────────────────────────────────────
export async function signInWithGoogle() {
  const { error } = await authClient.signIn.social({
    provider: "google",
    callbackURL: `${window.location.origin}/auth/callback`,
  });
  if (error) throw new Error(error.message);
}

// ─── Ausloggen ────────────────────────────────────────────────
export async function signOut() {
  const { error } = await authClient.signOut();
  if (error) throw new Error(error.message);
}

// ─── Session Token für API-Requests holen ────────────────────
// Wird in api/_db.js zur Verifikation verwendet
export async function getSessionToken() {
  try {
    const { data } = await authClient.getSession();
    return data?.session?.token || null;
  } catch {
    return null;
  }
}
