import { sql, getUser, error, setCors } from "../../_db.js";

export default async function handler(req, res) {
  setCors(res);
  const { id: entryId } = req.query;

  if (req.method === "GET") {
    try {
      const comments = await sql`
        SELECT * FROM comments
        WHERE entry_id = ${entryId}
        ORDER BY created_at ASC
      `;
      res.status(200).json(comments);
    } catch (err) {
      error(res, 500, "Datenbankfehler");
    }
    return;
  }

  if (req.method === "POST") {
    const user = await getUser(req);
    if (!user) return error(res, 401, "Nicht eingeloggt");

    const { text, author_name } = req.body;
    if (!text?.trim()) return error(res, 400, "Text fehlt");

    try {
      const [comment] = await sql`
        INSERT INTO comments (entry_id, author_id, author_name, text)
        VALUES (${entryId}, ${user.id}, ${author_name}, ${text.trim()})
        RETURNING *
      `;
      res.status(201).json(comment);
    } catch (err) {
      error(res, 500, "Datenbankfehler");
    }
    return;
  }

  error(res, 405, "Method not allowed");
}
