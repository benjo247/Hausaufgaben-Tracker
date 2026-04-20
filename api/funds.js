import { sql, getUser, error, setCors } from "./_db.js";

export default async function handler(req, res) {
  setCors(res);

  if (req.method === "GET") {
    const { group_id } = req.query;
    if (!group_id) return error(res, 400, "group_id fehlt");
    try {
      const collections = await sql`
        SELECT
          fc.*,
          COALESCE(
            json_agg(
              json_build_object(
                'user_id', fp.user_id,
                'user_name', fp.user_name,
                'amount', fp.amount,
                'status', fp.status
              )
            ) FILTER (WHERE fp.id IS NOT NULL),
            '[]'
          ) AS pledges
        FROM fund_collections fc
        LEFT JOIN fund_pledges fp ON fp.collection_id = fc.id
        WHERE fc.group_id = ${group_id}
        GROUP BY fc.id
        ORDER BY fc.created_at DESC
      `;
      res.status(200).json(collections);
    } catch (err) { error(res, 500, "Datenbankfehler"); }
    return;
  }

  if (req.method === "POST") {
    const user = await getUser(req);
    if (!user) return error(res, 401, "Nicht eingeloggt");
    const { group_id, title, description, target_amount, amount_per_family, author_name } = req.body;
    if (!group_id || !title) return error(res, 400, "Pflichtfelder fehlen");
    try {
      const [collection] = await sql`
        INSERT INTO fund_collections (group_id, author_id, author_name, title, description, target_amount, amount_per_family)
        VALUES (${group_id}, ${user.id}, ${author_name}, ${title}, ${description||null}, ${target_amount||null}, ${amount_per_family||null})
        RETURNING *
      `;
      res.status(201).json({ ...collection, pledges: [] });
    } catch (err) { error(res, 500, "Datenbankfehler"); }
    return;
  }

  error(res, 405, "Method not allowed");
}
