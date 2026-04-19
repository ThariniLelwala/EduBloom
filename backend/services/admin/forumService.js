// services/admin/forumService.js
const db = require("../../db/db");

class AdminForumService {
  /**
   * Get all forums (including unpublished) for admin management
   */
  async getAllForums() {
    const result = await db.query(
      `SELECT fp.*, u.username as author, u.role as author_role,
              (SELECT COALESCE(json_agg(tag_name), '[]') FROM forum_tags WHERE post_id = fp.id) as tags,
              (SELECT COUNT(*) FROM forum_replies WHERE post_id = fp.id) as reply_count
       FROM forum_posts fp
       JOIN users u ON fp.author_id = u.id
       ORDER BY fp.created_at DESC`
    );
    return result.rows.map(row => ({
      id: row.id,
      name: row.title,
      createdBy: row.author,
      creatorType: row.author_role,
      members: parseInt(row.reply_count) || 0,
      status: row.published ? "active" : "pending",
      description: row.description,
      createdAt: row.created_at
    }));
  }

  /**
   * Get pending forum requests (unpublished)
   */
  async getPendingForums() {
    const result = await db.query(
      `SELECT fp.*, u.username as requested_by, u.role as requester_role,
              (SELECT COALESCE(json_agg(tag_name), '[]') FROM forum_tags WHERE post_id = fp.id) as tags
       FROM forum_posts fp
       JOIN users u ON fp.author_id = u.id
       WHERE fp.published = FALSE AND fp.archived = FALSE
       ORDER BY fp.created_at DESC`
    );
    return result.rows.map(row => ({
      id: row.id,
      forumName: row.title,
      requestedBy: row.requested_by,
      category: row.author_role,
      requestedDate: new Date(row.created_at).toISOString().split('T')[0],
      description: row.description
    }));
  }

  /**
   * Approve a forum (publish it)
   */
  async approveForum(forumId) {
    const result = await db.query(
      "UPDATE forum_posts SET published = TRUE, updated_at = NOW() WHERE id = $1 RETURNING id, title",
      [forumId]
    );
    if (result.rows.length === 0) {
      throw new Error("Forum not found");
    }
    return { message: "Forum approved successfully", id: forumId, name: result.rows[0].title };
  }

  /**
   * Reject a forum (archive it)
   */
  async rejectForum(forumId) {
    const result = await db.query(
      "UPDATE forum_posts SET archived = TRUE, updated_at = NOW() WHERE id = $1 RETURNING id, title",
      [forumId]
    );
    if (result.rows.length === 0) {
      throw new Error("Forum not found");
    }
    return { message: "Forum rejected", id: forumId, name: result.rows[0].title };
  }

  /**
   * Get forum statistics
   */
  async getStatistics() {
    const totalForums = await db.query("SELECT COUNT(*) as count FROM forum_posts WHERE archived = FALSE");
    const publishedForums = await db.query("SELECT COUNT(*) as count FROM forum_posts WHERE published = TRUE AND archived = FALSE");
    const pendingForums = await db.query("SELECT COUNT(*) as count FROM forum_posts WHERE published = FALSE AND archived = FALSE");
    const totalReplies = await db.query("SELECT COUNT(*) as count FROM forum_replies");

    // Get most active forum (most replies)
    const mostActiveResult = await db.query(
      `SELECT fp.title, COUNT(fr.id) as reply_count
       FROM forum_posts fp
       LEFT JOIN forum_replies fr ON fp.id = fr.post_id
       WHERE fp.published = TRUE AND fp.archived = FALSE
       GROUP BY fp.id, fp.title
       ORDER BY reply_count DESC
       LIMIT 1`
    );

    // Get forum admin count (teachers + university students)
    const adminCount = await db.query(
      "SELECT COUNT(*) as count FROM users WHERE role = 'teacher' OR (role = 'student' AND student_type = 'university')"
    );

    return {
      totalForums: parseInt(totalForums.rows[0].count),
      activeForums: parseInt(publishedForums.rows[0].count),
      pendingForums: parseInt(pendingForums.rows[0].count),
      totalReplies: parseInt(totalReplies.rows[0].count),
      mostActiveForum: mostActiveResult.rows[0]?.title || "N/A",
      forumAdmins: parseInt(adminCount.rows[0].count)
    };
  }

  /**
   * Get a single forum by ID
   */
  async getForumById(forumId) {
    const result = await db.query(
      `SELECT fp.*, u.username as author, u.role as author_role,
              (SELECT COALESCE(json_agg(tag_name), '[]') FROM forum_tags WHERE post_id = fp.id) as tags,
              (SELECT COUNT(*) FROM forum_replies WHERE post_id = fp.id) as reply_count
       FROM forum_posts fp
       JOIN users u ON fp.author_id = u.id
       WHERE fp.id = $1`,
      [forumId]
    );

    if (result.rows.length === 0) {
      throw new Error("Forum not found");
    }

    const row = result.rows[0];
    return {
      id: row.id,
      name: row.title,
      createdBy: row.author,
      creatorType: row.author_role,
      members: parseInt(row.reply_count) || 0,
      status: row.published ? "active" : "pending",
      description: row.description
    };
  }
}

module.exports = new AdminForumService();