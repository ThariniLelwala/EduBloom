// services/admin/announcementService.js
const db = require("../../db/db");

class AnnouncementService {
  async getAll() {
    const result = await db.query(
      `SELECT a.*, u.username as author_username, u.firstname as author_firstname, u.lastname as author_lastname
       FROM announcements a
       JOIN users u ON a.author_id = u.id
       ORDER BY a.created_at DESC`
    );
    return result.rows;
  }

  async getById(id) {
    const result = await db.query(
      `SELECT a.*, u.username as author_username, u.firstname as author_firstname, u.lastname as author_lastname
       FROM announcements a
       JOIN users u ON a.author_id = u.id
       WHERE a.id = $1`,
      [id]
    );
    if (result.rows.length === 0) throw new Error("Announcement not found");
    return result.rows[0];
  }

  async create(authorId, title, message) {
    const result = await db.query(
      `INSERT INTO announcements (author_id, title, message) VALUES ($1, $2, $3) RETURNING *`,
      [authorId, title, message]
    );
    return result.rows[0];
  }

  async update(id, title, message) {
    const result = await db.query(
      `UPDATE announcements SET title = $2, message = $3, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, title, message]
    );
    if (result.rows.length === 0) throw new Error("Announcement not found");
    return result.rows[0];
  }

  async delete(id) {
    const result = await db.query(
      `DELETE FROM announcements WHERE id = $1 RETURNING id`,
      [id]
    );
    if (result.rows.length === 0) throw new Error("Announcement not found");
    return { id };
  }
}

module.exports = new AnnouncementService();
