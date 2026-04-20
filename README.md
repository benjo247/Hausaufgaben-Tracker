# Hausaufgaben-App v2

Eltern-Community für Schulklassen – Hausaufgaben, Termine, Klassenkasse.

## Stack
- **Vite + React** – Frontend + PWA
- **Neon PostgreSQL** – Datenbank
- **Neon Auth** – Authentifizierung (Magic Link + Google)
- **Vercel** – Hosting + Serverless API Routes
- **GitHub Actions** – Wöchentlicher Schuldaten-Import

---

## Setup

### 1. Neon Auth einrichten
1. Neon Dashboard → dein Projekt → **Auth** Tab
2. Auth aktivieren
3. `VITE_NEON_AUTH_URL` aus den Settings kopieren
4. Optional: Google OAuth einrichten (Client ID + Secret)

### 2. Schema einspielen
Neon Dashboard → SQL Editor → `schema.sql` ausführen

### 3. Vercel Environment Variables
```
DATABASE_URL          = dein Neon Connection String
VITE_NEON_AUTH_URL    = deine Neon Auth URL
```

### 4. GitHub Secret
```
DATABASE_URL          = dein Neon Connection String (für Schuldaten-Import)
```

### 5. Lokal entwickeln
```bash
cp .env.example .env.local
# Werte eintragen
npm install
npm run dev
```

---

## Projektstruktur
```
src/
  pages/
    Login.jsx      ← Magic Link + Google Login
    Join.jsx       ← Schule suchen → Klasse → Kinder
    Feed.jsx       ← Hausaufgaben-Feed (multi-child)
  lib/
    auth.js        ← Neon Auth Client
    db.js          ← Alle API-Calls
    schoolLogic.js ← Kurssystem-Matrix
  App.jsx          ← Router + Auth-State

api/
  _db.js           ← Geteilter Neon-Client
  groups.js        ← GET Gruppen einer Schule
  groups/join.js   ← POST Gruppe beitreten/anlegen
  entries.js       ← GET/POST Einträge
  entries/confirm.js ← POST Bestätigung toggle
  entries/comments.js ← GET/POST Kommentare
  events.js        ← GET/POST Termine
  funds.js         ← GET/POST Klassenkasse
  schools.js       ← GET Schulsuche
  schools-manual.js ← POST Manuelle Schule

schema.sql         ← Komplettes DB-Schema
```

---

## Features
- 🔐 Magic Link Login (kein Passwort)
- 🏫 33.000 Schulen durchsuchbar
- 👨‍👩‍👧 Mehrere Kinder pro Elternteil
- 📚 Hausaufgaben mit Kurssystem (A/B/C, E/G)
- ✅ Community-Bestätigung
- 💬 Kommentare
- 📅 Events & Termine
- 💰 Klassenkasse (Tracking wer zahlt)
- 🔥 Streaks
- 📱 PWA – auf Homescreen speicherbar
