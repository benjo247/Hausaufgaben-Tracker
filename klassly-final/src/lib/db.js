/**
 * db.js
 * Alle Datenbank-Operationen über Vercel API Routes.
 * Schickt den Neon Auth Session-Token als Authorization Header mit.
 */

import { authClient } from "./auth.js";

// Session-Token für jeden API-Call holen
async function getToken() {
  const { data } = await authClient.getSession();
  return data?.session?.token || null;
}

async function apiCall(path, options = {}) {
  const token = await getToken();
  const res = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "API Fehler");
  }
  return res.json();
}

const get  = (path)        => apiCall(path);
const post = (path, body)  => apiCall(path, { method:"POST", body:JSON.stringify(body) });
const put  = (path, body)  => apiCall(path, { method:"PUT",  body:JSON.stringify(body) });

// ─── Schulen ─────────────────────────────────────────────────
export const searchSchools = (q, limit=8) =>
  get(`/api/schools?q=${encodeURIComponent(q)}&limit=${limit}`);

export const insertManualSchool = (data) =>
  post("/api/schools-manual", data);

// ─── Gruppen ──────────────────────────────────────────────────
export const getGroupsBySchool = (schoolId) =>
  get(`/api/groups?school_id=${schoolId}`);

export const joinOrCreateGroup = (data) =>
  post("/api/groups/join", data);

export const setupCourseSystem = (groupId, data) =>
  put(`/api/groups/${groupId}/courses`, data);

export const getGroup = (groupId) =>
  get(`/api/groups/${groupId}`);

// ─── Einträge ─────────────────────────────────────────────────
export const getEntries = (groupId, filters={}) => {
  const params = new URLSearchParams({ group_id: groupId, ...filters });
  return get(`/api/entries?${params}`);
};

export const createEntry = (data)     => post("/api/entries", data);

export const toggleConfirmation = (entryId, authorName) =>
  post(`/api/entries/${entryId}/confirm`, { author_name: authorName });

export const addComment = (entryId, text, authorName) =>
  post(`/api/entries/${entryId}/comments`, { text, author_name: authorName });

export const getComments = (entryId) =>
  get(`/api/entries/${entryId}/comments`);

// ─── Events ───────────────────────────────────────────────────
export const getEvents      = (groupId) => get(`/api/events?group_id=${groupId}`);
export const createEvent    = (data)    => post("/api/events", data);

// ─── Klassenkasse ─────────────────────────────────────────────
export const getFundCollections  = (groupId) => get(`/api/funds?group_id=${groupId}`);
export const createFundCollection = (data)   => post("/api/funds", data);
export const pledgeFund = (collectionId, data) =>
  post(`/api/funds/${collectionId}/pledge`, data);
