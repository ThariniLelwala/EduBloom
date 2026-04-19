// services/admin/contentModerationService.js
const db = require("../../db/db");

class ContentModerationService {
  /**
   * Get all flagged content with optional filters
   */
  async getFlaggedContent(filters = {}) {
    try {
      let query = `
        SELECT fc.*, 
               COALESCE(u.username, 'Unknown') as author_name,
               COALESCE(fu.username, 'Unknown') as flagged_by_name,
               CASE 
                 WHEN fc.content_type = 'forum' THEN fp.title
                 WHEN fc.content_type = 'note' THEN tmn.title
                 WHEN fc.content_type = 'quiz' THEN qs.name
               END as content_title
        FROM flagged_content fc
        LEFT JOIN users u ON fc.author_id = u.id
        LEFT JOIN users fu ON fc.flagged_by = fu.id
        LEFT JOIN forum_posts fp ON fc.content_type = 'forum' AND fc.content_id = fp.id
        LEFT JOIN teacher_module_notes tmn ON fc.content_type = 'note' AND fc.content_id = tmn.id
        LEFT JOIN quiz_sets qs ON fc.content_type = 'quiz' AND fc.content_id = qs.id
        WHERE 1=1
      `;
      const params = [];
      let paramIndex = 1;

      if (filters.status) {
        query += ` AND fc.status = $${paramIndex}`;
        params.push(filters.status);
        paramIndex++;
      }
      if (filters.contentType) {
        query += ` AND fc.content_type = $${paramIndex}`;
        params.push(filters.contentType);
        paramIndex++;
      }
      if (filters.reason) {
        query += ` AND fc.reason = $${paramIndex}`;
        params.push(filters.reason);
        paramIndex++;
      }

      query += ` ORDER BY fc.created_at DESC`;

      const result = await db.query(query, params);
      return result.rows.map(row => ({
        id: `FC${String(row.id).padStart(3, '0')}`,
        contentId: row.content_id,
        author: row.author_name,
        authorId: row.author_id,
        contentType: row.content_type,
        contentTitle: row.content_title,
        flaggedBy: row.flagged_by_name,
        flaggedById: row.flagged_by,
        reason: row.reason,
        flagReason: row.description,
        contentPreview: row.content_preview,
        status: row.status,
        timestamp: row.created_at
      }));
    } catch (err) {
      console.error("Error in getFlaggedContent:", err.message);
      return [];
    }
  }

  /**
   * Get statistics for content moderation
   */
  async getStatistics() {
    try {
      const quizCountResult = await db.query("SELECT COUNT(*) as count FROM quiz_sets WHERE is_published = TRUE");
      const forumCountResult = await db.query("SELECT COUNT(*) as count FROM forum_posts WHERE archived = FALSE");
      const noteCountResult = await db.query("SELECT COUNT(*) as count FROM teacher_module_notes");

      const pendingCountResult = await db.query(
        "SELECT COUNT(*) as count FROM flagged_content WHERE status = 'pending'"
      );

      const todayUploadsResult = await db.query(`
        SELECT (
          (SELECT COALESCE(COUNT(*), 0) FROM forum_posts WHERE DATE(created_at) = CURRENT_DATE) +
          (SELECT COALESCE(COUNT(*), 0) FROM teacher_module_notes WHERE DATE(created_at) = CURRENT_DATE) +
          (SELECT COALESCE(COUNT(*), 0) FROM quiz_sets WHERE DATE(created_at) = CURRENT_DATE)
        ) as count
      `);

      const engagedUsersResult = await db.query(`
        SELECT COUNT(DISTINCT user_id) as count FROM (
          SELECT author_id as user_id FROM forum_posts WHERE created_at > NOW() - INTERVAL '30 days'
          UNION ALL
          SELECT subject_id::int as user_id FROM quiz_sets WHERE subject_id IS NOT NULL AND created_at > NOW() - INTERVAL '30 days'
        ) as engaged
      `);

      return {
        totalQuizzes: parseInt(quizCountResult.rows[0]?.count) || 0,
        totalForums: parseInt(forumCountResult.rows[0]?.count) || 0,
        totalNotes: parseInt(noteCountResult.rows[0]?.count) || 0,
        pendingReview: parseInt(pendingCountResult.rows[0]?.count) || 0,
        todayUploads: parseInt(todayUploadsResult.rows[0]?.count) || 0,
        engagedUsers: parseInt(engagedUsersResult.rows[0]?.count) || 0
      };
    } catch (err) {
      console.error("Error in getStatistics:", err.message);
      return {
        totalQuizzes: 0,
        totalForums: 0,
        totalNotes: 0,
        pendingReview: 0,
        todayUploads: 0,
        engagedUsers: 0
      };
    }
  }

  /**
   * Dismiss a flag (keep content, remove flag)
   */
  async dismissFlag(flagId) {
    try {
      const result = await db.query(
        "UPDATE flagged_content SET status = 'dismissed', resolved_at = NOW() WHERE id = $1 AND status = 'pending' RETURNING id",
        [flagId]
      );
      if (result.rows.length === 0) {
        throw new Error("Flag not found or already resolved");
      }
      return { message: "Flag dismissed successfully", id: flagId };
    } catch (err) {
      console.error("Error in dismissFlag:", err.message);
      throw err;
    }
  }

  /**
   * Delete flagged content
   */
  async deleteContent(flagId) {
    try {
      const flagResult = await db.query(
        "SELECT * FROM flagged_content WHERE id = $1 AND status = 'pending'",
        [flagId]
      );

      if (flagResult.rows.length === 0) {
        throw new Error("Flag not found or already resolved");
      }

      const flag = flagResult.rows[0];
      let deleteQuery = "";
      
      switch (flag.content_type) {
        case 'forum':
          deleteQuery = "DELETE FROM forum_posts WHERE id = $1";
          break;
        case 'note':
          deleteQuery = "DELETE FROM teacher_module_notes WHERE id = $1";
          break;
        case 'quiz':
          deleteQuery = "DELETE FROM quiz_sets WHERE id = $1";
          break;
        default:
          throw new Error("Unknown content type");
      }

      await db.query(deleteQuery, [flag.content_id]);
      await db.query(
        "UPDATE flagged_content SET status = 'deleted', resolved_at = NOW() WHERE id = $1",
        [flagId]
      );

      return { message: "Content deleted successfully", id: flagId };
    } catch (err) {
      console.error("Error in deleteContent:", err.message);
      throw err;
    }
  }
}

module.exports = new ContentModerationService();