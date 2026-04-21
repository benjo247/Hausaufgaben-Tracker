import { sql, getUser, error, setCors } from "./_db.js";

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const { school_id } = req.query;
  if (!school_id) return error(res, 400, "school_id fehlt");

  try {
    const groups = await sql`
      SELECT
        g.id, g.school_id, g.grade, g.section,
        g.course_system, g.course_subjects,
        g.school_year, g.member_count,
        s.name AS school_name,
        s.school_type
      FROM groups g
      JOIN schools s ON s.id = g.school_id
      WHERE g.school_id = ${school_id}
        AND g.school_year = '2025/26'
      ORDER BY g.grade, g.section
    `;
    res.status(200).json(groups);
  } catch (err) {
    console.error(err);
    error(res, 500, "Datenbankfehler");
  }
}
