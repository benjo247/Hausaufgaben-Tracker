import { sql, getUser, error, setCors } from "./_db.js";

export default async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  // GET – Einträge laden
  if (req.method === "GET") {
    const { group_id, subject, limit = 50 } = req.query;
    if (!group_id) return error(res, 400, "group_id fehlt");

    try {
      const entries = await sql`
        SELECT
          e.*,
          COALESCE(
            json_agg(
              json_build_object(
                'user_id', c.user_id,
                'user_name', c.user_name
              )
            ) FILTER (WHERE c.id IS NOT NULL),
            '[]'
          ) AS confirmed_by
        FROM entries e
        LEFT JOIN confirmations c ON c.entry_id = e.id
        WHERE e.group_id = ${group_id}
          ${subject ? sql`AND e.subject = ${subject}` : sql``}
        GROUP BY e.id
        ORDER BY e.created_at DESC
        LIMIT ${parseInt(limit)}
      `;
      res.status(200).json(entries);
    } catch (err) {
      console.error(err);
      error(res, 500, "Datenbankfehler");
    }
    return;
  }

  // POST – Eintrag erstellen
  if (req.method === "POST") {
    const user = await getUser(req);
    if (!user) return error(res, 401, "Nicht eingeloggt");

    const {
      group_id, subject, course, text,
      due_date, priority, author_name
    } = req.body;

    if (!group_id || !subject || !text || !author_name) {
      return error(res, 400, "Pflichtfelder fehlen");
    }

    // Rate limiting: max 5 Einträge pro Tag pro Nutzer
    try {
      const [{ count }] = await sql`
        SELECT COUNT(*) FROM entries
        WHERE author_id = ${user.id}
          AND group_id = ${group_id}
          AND created_at > now() - interval '24 hours'
      `;
      if (parseInt(count) >= 5) {
        return error(res, 429, "Maximal 5 Einträge pro Tag");
      }

      const [entry] = await sql`
        INSERT INTO entries (
          group_id, author_id, author_name,
          subject, course, text, due_date, priority
        )
        VALUES (
          ${group_id}, ${user.id}, ${author_name},
          ${subject}, ${course || null}, ${text},
          ${due_date || null}, ${priority || 'normal'}
        )
        RETURNING *
      `;

      // Streak aktualisieren
      await sql`
        UPDATE members
        SET
          streak_days = CASE
            WHEN streak_last = CURRENT_DATE - 1 THEN streak_days + 1
            WHEN streak_last = CURRENT_DATE THEN streak_days
            ELSE 1
          END,
          streak_last = CURRENT_DATE
        WHERE user_id = ${user.id}
          AND group_id = ${group_id}
      `;

      res.status(201).json({ ...entry, confirmed_by: [] });
    } catch (err) {
      console.error(err);
      error(res, 500, "Datenbankfehler");
    }
    return;
  }

  error(res, 405, "Method not allowed");
}
