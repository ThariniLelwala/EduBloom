// services/admin/announcementsService.js
const db = require("../../db/db");

class AnnouncementsService {
  /**
   * Get all announcements with optional role filter
   */
  async getAllAnnouncements(filters = {}) {
    try {
      let query = `
        SELECT 
          a.id,
          a.title,
          a.message,
          a.target_role,
          a.scheduled_at,
          a.created_at,
          a.updated_at,
          u.username AS created_by_username,
          u.firstname,
          u.lastname
        FROM announcements a
        LEFT JOIN users u ON a.created_by = u.id
      `;

      const conditions = [];
      const values = [];

      if (filters.target_role && filters.target_role !== "all") {
        values.push(filters.target_role);
        conditions.push(`a.target_role = $${values.length}`);
      }

      if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
      }

      query += " ORDER BY a.created_at DESC";

      const result = await db.query(query, values);
      return result.rows;
    } catch (err) {
      throw new Error("Failed to fetch announcements: " + err.message);
    }
  }

  /**
   * Get a single announcement by ID
   */
  async getAnnouncementById(id) {
    try {
      const result = await db.query(
        `SELECT 
          a.id,
          a.title,
          a.message,
          a.target_role,
          a.scheduled_at,
          a.created_at,
          a.updated_at,
          u.username AS created_by_username
        FROM announcements a
        LEFT JOIN users u ON a.created_by = u.id
        WHERE a.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        throw new Error("Announcement not found");
      }

      return result.rows[0];
    } catch (err) {
      throw new Error(err.message);
    }
  }

  /**
   * Create a new announcement
   */
  async createAnnouncement({ title, message, target_role, scheduled_at, created_by }) {
    try {
      if (!title || !message) {
        throw new Error("Title and message are required");
      }

      const role = target_role || "all";
      const scheduledAt = scheduled_at || null;

      const result = await db.query(
        `INSERT INTO announcements (title, message, target_role, scheduled_at, created_by)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [title, message, role, scheduledAt, created_by]
      );

      return result.rows[0];
    } catch (err) {
      throw new Error("Failed to create announcement: " + err.message);
    }
  }

  /**
   * Update an existing announcement
   */
  async updateAnnouncement(id, { title, message, target_role, scheduled_at }) {
    try {
      const existing = await this.getAnnouncementById(id);
      if (!existing) throw new Error("Announcement not found");

      const result = await db.query(
        `UPDATE announcements
         SET 
           title = COALESCE($1, title),
           message = COALESCE($2, message),
           target_role = COALESCE($3, target_role),
           scheduled_at = COALESCE($4, scheduled_at),
           updated_at = NOW()
         WHERE id = $5
         RETURNING *`,
        [title, message, target_role, scheduled_at, id]
      );

      return result.rows[0];
    } catch (err) {
      throw new Error("Failed to update announcement: " + err.message);
    }
  }

  /**
   * Delete an announcement
   */
  async deleteAnnouncement(id) {
    try {
      const result = await db.query(
        `DELETE FROM announcements WHERE id = $1 RETURNING id`,
        [id]
      );

      if (result.rows.length === 0) {
        throw new Error("Announcement not found");
      }

      return { message: "Announcement deleted successfully", id };
    } catch (err) {
      throw new Error("Failed to delete announcement: " + err.message);
    }
  }

  /**
   * Get count of announcements (for dashboard stats)
   */
  async getAnnouncementsCount() {
    try {
      const result = await db.query(`SELECT COUNT(*) AS count FROM announcements`);
      return parseInt(result.rows[0].count);
    } catch (err) {
      throw new Error("Failed to get announcements count: " + err.message);
    }
  }
}

module.exports = new AnnouncementsService();