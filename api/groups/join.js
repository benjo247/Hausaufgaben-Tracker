import { sql, getUser, error, setCors } from "../_db.js";

export default async function handler(req, res) {
  setCors(res);
  if (req.method !== "POST") return error(res, 405, "Method not allowed");

  const user = await getUser(req);
  if (!user) return error(res, 401, "Nicht eingeloggt");

  const { school_id, grade, section, display_name, children } = req.body;

  if (!school_id || !grade || !display_name) {
    return error(res, 400, "Pflichtfelder fehlen");
  }

  try {
    // 1. Gruppe suchen oder anlegen
    let [group] = await sql`
      SELECT * FROM groups
      WHERE school_id = ${school_id}
        AND grade = ${grade}
        AND section = ${section || null}
        AND school_year = '2025/26'
    `;

    if (!group) {
      [group] = await sql`
        INSERT INTO groups (school_id, grade, section, school_year)
        VALUES (${school_id}, ${grade}, ${section || null}, '2025/26')
        ON CONFLICT (school_id, grade, section, school_year)
        DO UPDATE SET updated_at = now()
        RETURNING *
      `;
    }

    // 2. Mitglied suchen oder anlegen
    let [member] = await sql`
      SELECT * FROM members
      WHERE user_id = ${user.id}
        AND group_id = ${group.id}
    `;

    const isFirstMember = group.member_count === 0;

    if (!member) {
      [member] = await sql`
        INSERT INTO members (
          user_id, group_id, display_name, children,
          status, is_admin
        )
        VALUES (
          ${user.id}, ${group.id}, ${display_name},
          ${JSON.stringify(children || [])},
          ${isFirstMember ? 'active' : 'pending'},
          ${isFirstMember}
        )
        RETURNING *
      `;
    }

    res.status(200).json({ group, member });
  } catch (err) {
    console.error(err);
    error(res, 500, "Datenbankfehler");
  }
}
