// services/admin/announcementsService.js
const db = require("../../db/db");

class AnnouncementsService {
  /**
   * Get all announcements
   */
  async getAllAnnouncements() {
    try {
      const result = await db.query(`
        SELECT a.*, 
               COALESCE(u.username, 'System') as created_by_name,
               COALESCE(u2.username, 'System') as author_name
        FROM announcements a
        LEFT JOIN users u ON a.created_by = u.id
        LEFT JOIN users u2 ON a.author_id = u2.id
        ORDER BY a.created_at DESC
      `);
      return result.rows.map(row => ({
        id: row.id,
        title: row.title,
        message: row.message,
        targetRole: row.target_role,
        createdBy: row.created_by_name || row.author_name || 'System',
        createdAt: row.created_at,
        date: row.created_at ? row.created_at.toISOString().split('T')[0] : '',
        time: row.created_at ? row.created_at.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''
      }));
    } catch (err) {
      console.error("Error in getAllAnnouncements:", err.message);
      // Fallback query without joins
      const result = await db.query(`
        SELECT a.*
        FROM announcements a
        ORDER BY a.created_at DESC
      `);
      return result.rows.map(row => ({
        id: row.id,
        title: row.title,
        message: row.message,
        targetRole: row.target_role,
        createdBy: 'System',
        createdAt: row.created_at,
        date: row.created_at ? row.created_at.toISOString().split('T')[0] : '',
        time: row.created_at ? row.created_at.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''
      }));
    }
  }

  /**
   * Create new announcement
   */
  async createAnnouncement(title, message, targetRole, createdBy) {
    try {
      // Try with created_by column
      const result = await db.query(
        `INSERT INTO announcements (title, message, target_role, created_by)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [title, message, targetRole || 'all', createdBy || null]
      );
      return result.rows[0];
    } catch (err) {
      try {
        // Try with author_id column
        const result = await db.query(
          `INSERT INTO announcements (title, message, target_role, author_id)
           VALUES ($1, $2, $3, $4) RETURNING *`,
          [title, message, targetRole || 'all', createdBy || null]
        );
        return result.rows[0];
      } catch (err2) {
        // Fallback without author/created_by column
        const result = await db.query(
          `INSERT INTO announcements (title, message, target_role)
           VALUES ($1, $2, $3) RETURNING *`,
          [title, message, targetRole || 'all']
        );
        return result.rows[0];
      }
    }
  }

  /**
   * Update announcement
   */
  async updateAnnouncement(id, title, message, targetRole) {
    try {
      const result = await db.query(
        `UPDATE announcements SET title = $1, message = $2, target_role = $3, updated_at = NOW()
         WHERE id = $4 RETURNING *`,
        [title, message, targetRole, id]
      );
      if (result.rows.length === 0) {
        throw new Error("Announcement not found");
      }
      return result.rows[0];
    } catch (err) {
      // Fallback without target_role column
      const result = await db.query(
        `UPDATE announcements SET title = $1, message = $2, updated_at = NOW()
         WHERE id = $3 RETURNING *`,
        [title, message, id]
      );
      if (result.rows.length === 0) {
        throw new Error("Announcement not found");
      }
      return result.rows[0];
    }
  }

  /**
   * Delete announcement
   */
  async deleteAnnouncement(id) {
    const result = await db.query(
      "DELETE FROM announcements WHERE id = $1 RETURNING id",
      [id]
    );
    if (result.rows.length === 0) {
      throw new Error("Announcement not found");
    }
    return { message: "Announcement deleted", id };
  }
}

module.exports = new AnnouncementsService();