// api/schools-manual.js
// Manuellen Schuleintrag speichern

import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { name, city, zip, state, school_type } = req.body;

  if (!name?.trim() || !state || !school_type) {
    return res.status(400).json({ error: "Pflichtfelder fehlen" });
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    const id = `manual-${crypto.randomUUID()}`;

    const [school] = await sql`
      INSERT INTO schools (id, name, city, zip, state, school_type, source, confirmed, confirm_count)
      VALUES (${id}, ${name.trim()}, ${city||""}, ${zip||""}, ${state}, ${school_type},
              'manual', false, 0)
      RETURNING id, name, city, zip, state, school_type, source, confirmed
    `;

    res.status(201).json(school);
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ error: "Datenbankfehler" });
  }
}
