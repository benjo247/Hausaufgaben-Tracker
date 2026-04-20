import { sql, getUser, error, setCors } from "../../_db.js";

export default async function handler(req, res) {
  setCors(res);
  if (req.method !== "POST") return error(res, 405, "Method not allowed");

  const user = await getUser(req);
  if (!user) return error(res, 401, "Nicht eingeloggt");

  const { id: entryId } = req.query;
  const { author_name } = req.body;

  try {
    // Eigene Einträge können nicht bestätigt werden
    const [entry] = await sql`SELECT author_id FROM entries WHERE id = ${entryId}`;
    if (!entry) return error(res, 404, "Eintrag nicht gefunden");
    if (entry.author_id === user.id) {
      return error(res, 403, "Eigene Einträge können nicht bestätigt werden");
    }

    // Toggle: existiert bereits → löschen, sonst anlegen
    const [existing] = await sql`
      SELECT id FROM confirmations
      WHERE entry_id = ${entryId} AND user_id = ${user.id}
    `;

    if (existing) {
      await sql`
        DELETE FROM confirmations
        WHERE entry_id = ${entryId} AND user_id = ${user.id}
      `;
      res.status(200).json({ confirmed: false });
    } else {
      await sql`
        INSERT INTO confirmations (entry_id, user_id, user_name)
        VALUES (${entryId}, ${user.id}, ${author_name || "Unbekannt"})
      `;
      res.status(200).json({ confirmed: true });
    }
  } catch (err) {
    console.error(err);
    error(res, 500, "Datenbankfehler");
  }
}
