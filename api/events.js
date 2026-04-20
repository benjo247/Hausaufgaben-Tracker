import { sql, getUser, error, setCors } from "./_db.js";

export default async function handler(req, res) {
  setCors(res);

  if (req.method === "GET") {
    const { group_id } = req.query;
    if (!group_id) return error(res, 400, "group_id fehlt");
    try {
      const events = await sql`
        SELECT * FROM events
        WHERE group_id = ${group_id}
          AND event_date >= now() - interval '1 day'
        ORDER BY event_date ASC
        LIMIT 20
      `;
      res.status(200).json(events);
    } catch (err) { error(res, 500, "Datenbankfehler"); }
    return;
  }

  if (req.method === "POST") {
    const user = await getUser(req);
    if (!user) return error(res, 401, "Nicht eingeloggt");
    const { group_id, title, description, event_date, type, author_name } = req.body;
    if (!group_id || !title || !event_date) return error(res, 400, "Pflichtfelder fehlen");
    try {
      const [event] = await sql`
        INSERT INTO events (group_id, author_id, author_name, title, description, event_date, type)
        VALUES (${group_id}, ${user.id}, ${author_name}, ${title}, ${description||null}, ${event_date}, ${type||'sonstiges'})
        RETURNING *
      `;
      res.status(201).json(event);
    } catch (err) { error(res, 500, "Datenbankfehler"); }
    return;
  }

  error(res, 405, "Method not allowed");
}
