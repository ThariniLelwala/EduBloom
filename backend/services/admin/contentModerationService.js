// services/admin/contentModerationService.js
const db = require("../../db/db");

class ContentModerationService {
  /**
   * Get all flagged content with filters
   */
  async getFlaggedContent(filters = {}) {
    let query = `
      SELECT 
        f.id,
        f.content_id,
        f.content_type,
        f.reason,
        f.description,
        f.status,
        f.created_at,
        f.updated_at,
        author.id as author_id,
        author.username as author_username,
        author.firstname as author_firstname,
        author.lastname as author_lastname,
        author.email as author_email,
        flagger.id as flagger_id,
        flagger.username as flagger_username,
        flagger.firstname as flagger_firstname,
        flagger.lastname as flagger_lastname
      FROM flagged_content f
      JOIN users author ON f.author_id = author.id
      JOIN users flagger ON f.flagger_id = flagger.id
    `;
    const params = [];
    let paramIndex = 1;
    const conditions = [];

    if (filters.status) {
      conditions.push(`f.status = $${paramIndex}`);
      params.push(filters.status);
      paramIndex++;
    }

    if (filters.content_type) {
      conditions.push(`f.content_type = $${paramIndex}`);
      params.push(filters.content_type);
      paramIndex++;
    }

    if (filters.reason) {
      conditions.push(`f.reason = $${paramIndex}`);
      params.push(filters.reason);
      paramIndex++;
    }

    if (filters.search) {
      conditions.push(`(
        CAST(f.id AS TEXT) ILIKE $${paramIndex} OR
        author.username ILIKE $${paramIndex} OR
        author.firstname ILIKE $${paramIndex} OR
        author.lastname ILIKE $${paramIndex}
      )`);
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += ` ORDER BY f.created_at DESC`;

    const result = await db.query(query, params);
    return result.rows;
  }

  /**
   * Get specific flagged content by ID
   */
  async getFlaggedContentById(id) {
    const result = await db.query(`
      SELECT 
        f.id,
        f.content_id,
        f.content_type,
        f.reason,
        f.description,
        f.status,
        f.created_at,
        f.updated_at,
        author.id as author_id,
        author.username as author_username,
        author.firstname as author_firstname,
        author.lastname as author_lastname,
        author.email as author_email,
        flagger.id as flagger_id,
        flagger.username as flagger_username,
        flagger.firstname as flagger_firstname,
        flagger.lastname as flagger_lastname
      FROM flagged_content f
      JOIN users author ON f.author_id = author.id
      JOIN users flagger ON f.flagger_id = flagger.id
      WHERE f.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      throw new Error("Flagged content not found");
    }

    return result.rows[0];
  }

  /**
   * Get content moderation statistics
   */
  async getStatistics() {
    const totalResult = await db.query("SELECT COUNT(*) as count FROM flagged_content");
    
    const pendingResult = await db.query(
      "SELECT COUNT(*) as count FROM flagged_content WHERE status = 'pending'"
    );

    const quizzesCountResult = await db.query(
      "SELECT COUNT(*) as count FROM quiz_sets WHERE is_published = true"
    );

    const forumsCountResult = await db.query(
      "SELECT COUNT(*) as count FROM forum_posts WHERE published = true"
    );

    const notesCountResult = await db.query(
      "SELECT COUNT(*) as count FROM teacher_module_notes"
    );

    const todayUploadsResult = await db.query(`
      SELECT COUNT(*) as count FROM (
        SELECT created_at as upload_time FROM quiz_sets WHERE DATE(created_at) = CURRENT_DATE
        UNION ALL
        SELECT created_at as upload_time FROM forum_posts WHERE DATE(created_at) = CURRENT_DATE
        UNION ALL
        SELECT created_at as upload_time FROM teacher_module_notes WHERE DATE(created_at) = CURRENT_DATE
      ) today_uploads
    `);

    const engagedUsersResult = await db.query(`
      SELECT COUNT(DISTINCT user_id) as count FROM (
        SELECT author_id as user_id FROM forum_posts WHERE created_at >= NOW() - INTERVAL '30 days'
        UNION
        SELECT teacher_id as user_id FROM quiz_sets WHERE created_at >= NOW() - INTERVAL '30 days'
      ) engaged
    `);

    return {
      totalFlagged: parseInt(totalResult.rows[0].count),
      pendingReview: parseInt(pendingResult.rows[0].count),
      totalQuizzes: parseInt(quizzesCountResult.rows[0].count),
      totalForums: parseInt(forumsCountResult.rows[0].count),
      totalNotes: parseInt(notesCountResult.rows[0].count),
      todayUploads: parseInt(todayUploadsResult.rows[0].count),
      engagedUsers: parseInt(engagedUsersResult.rows[0].count)
    };
  }

  /**
   * Dismiss a flag (keep content, remove flag)
   */
  async dismissFlag(id) {
    const flaggedContent = await this.getFlaggedContentById(id);

    if (flaggedContent.status !== "pending") {
      throw new Error("Flag has already been reviewed");
    }

    const result = await db.query(`
      UPDATE flagged_content 
      SET status = 'dismissed', updated_at = NOW()
      WHERE id = $1
      RETURNING id, status
    `, [id]);

    return {
      message: "Flag dismissed successfully",
      flaggedContent: result.rows[0],
      originalContent: {
        id: flaggedContent.content_id,
        type: flaggedContent.content_type,
        author: flaggedContent.author_username
      }
    };
  }

  /**
   * Delete flagged content and mark flag as deleted
   */
  async deleteFlaggedContent(id) {
    const flaggedContent = await this.getFlaggedContentById(id);

    if (flaggedContent.status === "deleted") {
      throw new Error("Content has already been deleted");
    }

    let contentTable;
    switch (flaggedContent.content_type) {
      case "forum":
        contentTable = "forum_posts";
        break;
      case "quiz":
        contentTable = "quiz_sets";
        break;
      case "note":
        contentTable = "teacher_module_notes";
        break;
      default:
        throw new Error("Invalid content type");
    }

    await db.query(`DELETE FROM ${contentTable} WHERE id = $1`, [flaggedContent.content_id]);

    const result = await db.query(`
      UPDATE flagged_content 
      SET status = 'deleted', updated_at = NOW()
      WHERE id = $1
      RETURNING id, status
    `, [id]);

    return {
      message: "Content deleted successfully",
      flaggedContent: result.rows[0],
      deletedContent: {
        id: flaggedContent.content_id,
        type: flaggedContent.content_type,
        author: flaggedContent.author_username
      }
    };
  }

  /**
   * Create a new flag (submitted by user)
   */
  async createFlag(contentId, contentType, authorId, flaggerId, reason, description = null) {
    const result = await db.query(`
      INSERT INTO flagged_content (content_id, content_type, author_id, flagger_id, reason, description)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, content_id, content_type, reason, description, status, created_at
    `, [contentId, contentType, authorId, flaggerId, reason, description]);

    return result.rows[0];
  }

  /**
   * Get flags for a specific content item
   */
  async getFlagsForContent(contentId, contentType) {
    const result = await db.query(`
      SELECT 
        f.id,
        f.reason,
        f.description,
        f.status,
        f.created_at,
        u.username as flagger_username,
        u.firstname as flagger_firstname,
        u.lastname as flagger_lastname
      FROM flagged_content f
      JOIN users u ON f.flagger_id = u.id
      WHERE f.content_id = $1 AND f.content_type = $2
      ORDER BY f.created_at DESC
    `, [contentId, contentType]);

    return result.rows;
  }
}

module.exports = new ContentModerationService();
