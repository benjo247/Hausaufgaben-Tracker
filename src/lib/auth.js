import { createAuthClient } from "@neondatabase/neon-js/auth";

export const authClient = createAuthClient(
  import.meta.env.VITE_NEON_AUTH_URL
);

export async function getCurrentUser() {
  try {
    const { data, error } = await authClient.getSession();
    if (error || !data?.session) return null;
    return data.user;
  } catch {
    return null;
  }
}

export async function signUpWithEmail(email, password, name) {
  const { data, error } = await authClient.signUp.email({
    email,
    password,
    name: name || email.split("@")[0],
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function signInWithEmail(email, password) {
  const { data, error } = await authClient.signIn.email({
    email,
    password,
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function signInWithGoogle() {
  const { error } = await authClient.signIn.social({
    provider: "google",
    callbackURL: `${window.location.origin}/auth/callback`,
  });
  if (error) throw new Error(error.message);
}

export async function signOut() {
  const { error } = await authClient.signOut();
  if (error) throw new Error(error.message);
}

export async function getSessionToken() {
  try {
    const { data } = await authClient.getSession();
    return data?.session?.token || null;
  } catch {
    return null;
  }
}
