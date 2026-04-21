// api/schools.js
// Vercel Serverless Function – läuft server-seitig, nie im Browser
// DATABASE_URL kommt aus Vercel Environment Variables (nie im Frontend!)

import { neon } from "@neondatabase/serverless";

export default async function handler(req, res) {
  // CORS für eigene Domain erlauben
  res.setHeader("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  const { q, limit = 8 } = req.query;

  if (!q || q.trim().length < 2) {
    return res.status(200).json([]);
  }

  try {
    const sql = neon(process.env.DATABASE_URL);
    const query = `%${q.trim()}%`;

    const results = await sql`
      SELECT id, name, city, zip, state, school_type, source, confirmed
      FROM schools
      WHERE
        name      ILIKE ${query} OR
        city      ILIKE ${query} OR
        zip       ILIKE ${q.trim() + "%"}
      ORDER BY
        CASE WHEN name ILIKE ${query} THEN 0 ELSE 1 END,
        name
      LIMIT ${parseInt(limit)}
    `;

    res.status(200).json(results);
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ error: "Datenbankfehler" });
  }
}
