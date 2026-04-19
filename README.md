# Hausaufgaben-App

PWA für Eltern zum gemeinsamen Hausaufgaben-Tracking.  
Stack: **Vite + React · Supabase · Vercel · GitHub Actions**

---

## Setup in 5 Schritten

### 1. GitHub Repo anlegen
```bash
git init
git add .
git commit -m "🎉 Initial commit"
# Neues Repo auf github.com anlegen, dann:
git remote add origin https://github.com/DEIN-USER/hausaufgaben-app.git
git push -u origin main
```

### 2. Supabase anlegen
1. [supabase.com](https://supabase.com) → Neues Projekt
2. SQL Editor → Inhalt von `supabase/schema.sql` ausführen
3. Settings → API → URL + anon key kopieren

### 3. Vercel verbinden
1. [vercel.com](https://vercel.com) → "Import Git Repository"
2. GitHub Repo auswählen
3. Environment Variables eintragen:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy → fertig ✓ (jeder Push deployt automatisch)

### 4. Schuldaten importieren (GitHub Actions)
GitHub Repo → Settings → Secrets → Actions:
- `SUPABASE_URL` → deine Supabase URL
- `SUPABASE_SERVICE_KEY` → service_role key (nicht den anon key!)

Dann: Actions → "Schuldaten aktualisieren" → "Run workflow"

### 5. Lokal entwickeln
```bash
cp .env.example .env.local
# .env.local mit deinen Supabase-Werten füllen
npm install
npm run dev
```

---

## PWA auf dem Homescreen speichern

**iPhone/iPad (Safari):**  
Teilen → "Zum Home-Bildschirm"

**Android (Chrome):**  
Menü → "App installieren"

---

## Icons generieren
Ersetze `public/icons/icon-192.png` und `icon-512.png`  
mit deinen eigenen Icons (PNG mit transparentem Hintergrund).

Schnell generieren mit [realfavicongenerator.net](https://realfavicongenerator.net)

---

## Projektstruktur
```
src/
  pages/
    Onboarding.jsx   ← Einladung, Name, Schule, Datenschutz
    Feed.jsx         ← Haupt-Feed mit Eintragen, Bestätigen, Kommentieren
  lib/
    supabase.js      ← Supabase Client + Schulsuche
    schoolLogic.js   ← Kurs-System Matrix (Hessen, NRW, etc.)
  App.jsx            ← Router (Onboarding ↔ Feed)
  main.jsx           ← Entry Point + PWA Service Worker
supabase/
  schema.sql         ← DB Schema + RLS + Volltextsuche
scripts/
  update_schools.py  ← Weekly CSV Import (jedeschule → Supabase)
.github/workflows/
  update-schools.yml ← GitHub Action (jeden Montag 04:00)
```

## Nächste Schritte (nach erfolgreichem Launch)
- [ ] Supabase Auth für echte Nutzerkonten
- [ ] Push-Benachrichtigungen (Web Push API)
- [ ] Gruppen-System mit Einladungslinks
- [ ] Capacitor → iOS App Store + Google Play
