-- ============================================================
-- Hausaufgaben-App · Supabase Schema
-- ============================================================

-- ─── Schulen ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS schools (
  -- Primärschlüssel aus jedeschule (z.B. "HE-12345")
  -- Manuelle Einträge bekommen "manual-<uuid>"
  id            TEXT        PRIMARY KEY,

  name          TEXT        NOT NULL,
  address       TEXT,
  zip           TEXT,
  city          TEXT,
  state         TEXT,       -- Bundesland (Vollname, z.B. "Hessen")
  school_type   TEXT,       -- Schulart (z.B. "Gesamtschule")
  website       TEXT,
  phone         TEXT,

  -- "jedeschule" | "manual"
  source        TEXT        NOT NULL DEFAULT 'jedeschule',

  -- Für manuelle Einträge: wurde von mind. 2 Eltern bestätigt?
  confirmed     BOOLEAN     NOT NULL DEFAULT false,
  confirm_count INT         NOT NULL DEFAULT 0,

  -- Volltextsuche (automatisch gepflegt via Trigger)
  search_vector TSVECTOR,

  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Volltextsuche ──────────────────────────────────────────
-- GIN-Index für blitzschnelle Suche
CREATE INDEX IF NOT EXISTS schools_search_idx
  ON schools USING GIN(search_vector);

-- Wichtige Felder als reguläre Indizes
CREATE INDEX IF NOT EXISTS schools_state_idx      ON schools(state);
CREATE INDEX IF NOT EXISTS schools_school_type_idx ON schools(school_type);
CREATE INDEX IF NOT EXISTS schools_zip_idx         ON schools(zip);

-- Trigger-Funktion: search_vector automatisch befüllen
CREATE OR REPLACE FUNCTION schools_update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    -- Name hat höchstes Gewicht (A)
    setweight(to_tsvector('german', COALESCE(NEW.name, '')),        'A') ||
    -- Stadt hat zweithöchstes Gewicht (B)
    setweight(to_tsvector('german', COALESCE(NEW.city, '')),        'B') ||
    -- PLZ (C) – Prefix-Suche via ILIKE trotzdem sinnvoll
    setweight(to_tsvector('simple', COALESCE(NEW.zip, '')),         'C') ||
    -- Schulart (D)
    setweight(to_tsvector('german', COALESCE(NEW.school_type, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER schools_search_vector_trigger
  BEFORE INSERT OR UPDATE ON schools
  FOR EACH ROW EXECUTE FUNCTION schools_update_search_vector();

-- updated_at automatisch setzen
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER schools_updated_at
  BEFORE UPDATE ON schools
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ─── Row Level Security ─────────────────────────────────────
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;

-- Jeder (auch nicht eingeloggt) darf lesen
CREATE POLICY "schools_public_read"
  ON schools FOR SELECT
  USING (true);

-- Schreiben nur mit Service-Key (GitHub Action / Backend)
-- Kein INSERT/UPDATE/DELETE für anonyme oder eingeloggte User
-- → wird ausschließlich vom Python-Script mit service_role-Key gemacht


-- ─── Suchfunktion ───────────────────────────────────────────
-- Wird vom Frontend direkt aufgerufen via supabase.rpc('search_schools', {...})
CREATE OR REPLACE FUNCTION search_schools(
  query       TEXT,
  limit_n     INT  DEFAULT 8
)
RETURNS TABLE (
  id          TEXT,
  name        TEXT,
  city        TEXT,
  zip         TEXT,
  state       TEXT,
  school_type TEXT,
  source      TEXT,
  confirmed   BOOLEAN,
  rank        REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id, s.name, s.city, s.zip, s.state, s.school_type, s.source, s.confirmed,
    ts_rank(s.search_vector, query_parsed) AS rank
  FROM
    schools s,
    -- PLZ-Prefix → einfache LIKE-Suche kombiniert mit Volltext
    to_tsquery('german', string_agg(lexeme || ':*', ' & '))
      OVER () AS query_parsed,
    -- Volltext-Tokens aus dem Query
    unnest(string_to_array(
      regexp_replace(trim(query), '\s+', ' ', 'g'), ' '
    )) AS lexeme
  WHERE
    s.search_vector @@ to_tsquery('german', string_agg(lexeme || ':*', ' & ') OVER ())
    OR s.zip ILIKE query || '%'
    OR s.name ILIKE '%' || query || '%'
  ORDER BY rank DESC
  LIMIT limit_n;
END;
$$ LANGUAGE plpgsql STABLE;

-- Einfachere Alternative (funktioniert auch ohne Window-Funktion):
-- Wir nutzen im Python-Script eine einfachere RPC,
-- der Frontend-Client nutzt direkt .from('schools').select() mit ilike-Filter.
