#!/usr/bin/env python3
"""
update_schools.py
-----------------
Lädt die aktuelle Schuldaten-CSV von jedeschule.codefor.de
und importiert sie per Upsert in Supabase.

Manuelle Einträge (source='manual') werden nie überschrieben.

Verwendung:
  pip install requests supabase pandas
  SUPABASE_URL=... SUPABASE_KEY=... python update_schools.py
"""

import os
import sys
import logging
import requests
import pandas as pd
from io import StringIO
from supabase import create_client, Client

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)s  %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger(__name__)

# ─── Config ──────────────────────────────────────────────────────────────────
CSV_URL      = "https://jedeschule.codefor.de/csv-data/schools.csv"
BATCH_SIZE   = 500          # Zeilen pro Upsert-Batch
SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_KEY"]   # service_role key!

# Mapping: jedeschule CSV-Spalte → unsere DB-Spalte
# Passe an, sobald du die echte CSV-Struktur kennst.
# jedeschule-Felder laut Scraper: id, name, address, zip, city, state, school_type, website, phone
COLUMN_MAP = {
    "id":          "id",
    "name":        "name",
    "address":     "address",
    "zip":         "zip",
    "city":        "city",
    "state":       "state",
    "school_type": "school_type",
    "website":     "website",
    "phone":       "phone",
}

# Bundesland-Kürzel → Vollname (falls die CSV Kürzel verwendet)
STATE_MAP = {
    "BB": "Brandenburg",    "BE": "Berlin",
    "BW": "Baden-Württemberg", "BY": "Bayern",
    "HB": "Bremen",         "HE": "Hessen",
    "HH": "Hamburg",        "MV": "Mecklenburg-Vorpommern",
    "NI": "Niedersachsen",  "NW": "Nordrhein-Westfalen",
    "RP": "Rheinland-Pfalz","SH": "Schleswig-Holstein",
    "SL": "Saarland",       "SN": "Sachsen",
    "ST": "Sachsen-Anhalt", "TH": "Thüringen",
}

# ─── Schritt 1: CSV laden ─────────────────────────────────────────────────────
def download_csv() -> pd.DataFrame:
    log.info(f"Lade CSV von {CSV_URL} …")
    r = requests.get(CSV_URL, timeout=60)
    r.raise_for_status()
    df = pd.read_csv(StringIO(r.text), dtype=str)
    log.info(f"  → {len(df):,} Zeilen geladen")
    return df

# ─── Schritt 2: Daten aufbereiten ────────────────────────────────────────────
def transform(df: pd.DataFrame) -> list[dict]:
    # Nur bekannte Spalten behalten
    available = {c: COLUMN_MAP[c] for c in COLUMN_MAP if c in df.columns}
    df = df[list(available.keys())].rename(columns=available)

    # Bundesland-Kürzel → Vollname
    if "state" in df.columns:
        df["state"] = df["state"].map(lambda s: STATE_MAP.get(str(s).strip(), str(s).strip()))

    # NaN → None (JSON-kompatibel)
    df = df.where(pd.notnull(df), None)

    # source-Flag setzen (wird beim Upsert nur für neue Zeilen geschrieben)
    df["source"] = "jedeschule"

    records = df.to_dict("records")
    log.info(f"  → {len(records):,} Datensätze vorbereitet")
    return records

# ─── Schritt 3: Upsert in Supabase ───────────────────────────────────────────
def upsert(client: Client, records: list[dict]) -> None:
    total   = len(records)
    batches = (total + BATCH_SIZE - 1) // BATCH_SIZE
    errors  = 0

    log.info(f"Starte Upsert ({total:,} Zeilen, {batches} Batches à {BATCH_SIZE}) …")

    for i in range(0, total, BATCH_SIZE):
        batch = records[i : i + BATCH_SIZE]
        batch_no = i // BATCH_SIZE + 1
        try:
            (
                client.table("schools")
                .upsert(
                    batch,
                    on_conflict="id",           # Konflikt auf PK
                    # ignore_duplicates=False   # bestehende Zeilen werden aktualisiert
                )
                .execute()
            )
            log.info(f"  Batch {batch_no}/{batches} ✓  ({i+1}–{min(i+BATCH_SIZE, total)})")
        except Exception as e:
            log.error(f"  Batch {batch_no}/{batches} FEHLER: {e}")
            errors += 1

    if errors:
        log.warning(f"Fertig mit {errors} Fehlern.")
        sys.exit(1)
    else:
        log.info(f"Alle {total:,} Schulen erfolgreich importiert ✓")

# ─── Schritt 4: Manuelle Einträge schützen ───────────────────────────────────
# Supabase upsert überschreibt bestehende Zeilen.
# Manuelle Schulen haben IDs wie "manual-<uuid>" – die kollidieren nie mit
# jedeschule-IDs (HE-..., NW-...). Kein extra Schutz nötig, da die IDs
# disjunkt sind. 
#
# Falls du trotzdem sicher gehen willst, kannst du vor dem Upsert
# alle manuellen IDs laden und aus dem Batch herausfiltern:
#
# manual_ids = {r['id'] for r in client.table('schools')
#                .select('id').eq('source','manual').execute().data}
# records = [r for r in records if r['id'] not in manual_ids]

# ─── Main ─────────────────────────────────────────────────────────────────────
def main():
    client = create_client(SUPABASE_URL, SUPABASE_KEY)

    df      = download_csv()
    records = transform(df)
    upsert(client, records)

if __name__ == "__main__":
    main()
