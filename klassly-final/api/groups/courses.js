import { sql, getUser, error, setCors } from "../../_db.js";

export default async function handler(req, res) {
  setCors(res);
  if (req.method !== "PUT") return error(res, 405, "Method not allowed");

  const user = await getUser(req);
  if (!user) return error(res, 401, "Nicht eingeloggt");

  const { id: groupId } = req.query;
  const { course_system, course_subjects } = req.body;

  if (!course_system) return error(res, 400, "course_system fehlt");

  try {
    // Nur Admin oder erstes Mitglied darf einrichten
    const [member] = await sql`
      SELECT * FROM members
      WHERE user_id = ${user.id} AND group_id = ${groupId}
    `;
    if (!member?.is_admin) {
      return error(res, 403, "Nur Admins können das Kurssystem einrichten");
    }

    const [group] = await sql`
      UPDATE groups
      SET course_system = ${course_system},
          course_subjects = ${course_subjects || []}
      WHERE id = ${groupId}
      RETURNING *
    `;

    res.status(200).json(group);
  } catch (err) {
    console.error(err);
    error(res, 500, "Datenbankfehler");
  }
}
