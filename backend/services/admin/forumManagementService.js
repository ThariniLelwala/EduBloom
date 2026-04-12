// services/admin/forumManagementService.js
const db = require("../../db/db");

class ForumManagementService {
  /**
   * Get forum statistics
   */
  async getStatistics() {
    const totalResult = await db.query(
      "SELECT COUNT(*) as count FROM forum_posts WHERE archived = FALSE"
    );
    
    const pendingResult = await db.query(
      "SELECT COUNT(*) as count FROM forum_posts WHERE published = FALSE AND archived = FALSE"
    );
    
    const activeResult = await db.query(
      "SELECT COUNT(*) as count FROM forum_posts WHERE published = TRUE AND archived = FALSE"
    );
    
    const teachersResult = await db.query(
      "SELECT COUNT(DISTINCT author_id) as count FROM forum_posts WHERE archived = FALSE"
    );

    const mostActiveResult = await db.query(`
      SELECT fp.title, COUNT(fr.id) as reply_count
      FROM forum_posts fp
      LEFT JOIN forum_replies fr ON fp.id = fr.post_id
      WHERE fp.published = TRUE AND fp.archived = FALSE
      GROUP BY fp.id, fp.title
      ORDER BY reply_count DESC
      LIMIT 1
    `);

    return {
      totalForums: parseInt(totalResult.rows[0].count),
      pendingApprovals: parseInt(pendingResult.rows[0].count),
      activeForums: parseInt(activeResult.rows[0].count),
      forumCreators: parseInt(teachersResult.rows[0].count),
      mostActiveForum: mostActiveResult.rows[0]?.title || "None"
    };
  }

  /**
   * Get all forums with filters
   */
  async getAllForums(filters = {}) {
    let query = `
      SELECT 
        fp.id,
        fp.title,
        fp.description,
        fp.published,
        fp.archived,
        fp.views,
        fp.created_at,
        fp.updated_at,
        u.id as author_id,
        u.username as author_username,
        u.firstname as author_firstname,
        u.lastname as author_lastname,
        u.role as author_role,
        (SELECT COUNT(*) FROM forum_replies WHERE post_id = fp.id) as reply_count,
        (SELECT COALESCE(json_agg(tag_name), '[]') FROM forum_tags WHERE post_id = fp.id) as tags
      FROM forum_posts fp
      JOIN users u ON fp.author_id = u.id
    `;
    
    const params = [];
    const conditions = [];
    let paramIndex = 1;

    if (filters.includeUnpublished !== "true") {
      conditions.push(`fp.published = TRUE`);
    }

    if (filters.archived !== undefined) {
      conditions.push(`fp.archived = $${paramIndex}`);
      params.push(filters.archived);
      paramIndex++;
    }

    if (filters.creatorRole) {
      conditions.push(`u.role = $${paramIndex}`);
      params.push(filters.creatorRole);
      paramIndex++;
    }

    if (filters.status) {
      if (filters.status === "active") {
        conditions.push(`fp.published = TRUE AND fp.archived = FALSE`);
      } else if (filters.status === "inactive") {
        conditions.push(`(fp.published = FALSE OR fp.archived = TRUE)`);
      }
    }

    if (filters.search) {
      conditions.push(`(fp.title ILIKE $${paramIndex} OR u.username ILIKE $${paramIndex})`);
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += ` ORDER BY fp.created_at DESC`;

    const result = await db.query(query, params);
    return result.rows;
  }

  /**
   * Get pending approval forums
   */
  async getPendingApprovals() {
    const result = await db.query(`
      SELECT 
        fp.id,
        fp.title,
        fp.description,
        fp.created_at,
        u.id as author_id,
        u.username as author_username,
        u.firstname as author_firstname,
        u.lastname as author_lastname
      FROM forum_posts fp
      JOIN users u ON fp.author_id = u.id
      WHERE fp.published = FALSE AND fp.archived = FALSE
      ORDER BY fp.created_at DESC
    `);
    return result.rows;
  }

  /**
   * Get specific forum by ID
   */
  async getForumById(id) {
    const result = await db.query(`
      SELECT 
        fp.*,
        u.id as author_id,
        u.username as author_username,
        u.firstname as author_firstname,
        u.lastname as author_lastname,
        u.role as author_role,
        (SELECT COUNT(*) FROM forum_replies WHERE post_id = fp.id) as reply_count,
        (SELECT COALESCE(json_agg(tag_name), '[]') FROM forum_tags WHERE post_id = fp.id) as tags
      FROM forum_posts fp
      JOIN users u ON fp.author_id = u.id
      WHERE fp.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      throw new Error("Forum not found");
    }

    return result.rows[0];
  }

  /**
   * Approve a forum (publish it)
   */
  async approveForum(id) {
    const forum = await this.getForumById(id);

    if (forum.published) {
      throw new Error("Forum is already published");
    }

    const result = await db.query(`
      UPDATE forum_posts SET published = TRUE, updated_at = NOW()
      WHERE id = $1 RETURNING id, title, published
    `, [id]);

    return {
      message: "Forum approved successfully",
      forum: result.rows[0]
    };
  }

  /**
   * Reject a forum (archive it)
   */
  async rejectForum(id) {
    const forum = await this.getForumById(id);

    const result = await db.query(`
      UPDATE forum_posts SET archived = TRUE, updated_at = NOW()
      WHERE id = $1 RETURNING id, title, archived
    `, [id]);

    return {
      message: "Forum rejected and archived",
      forum: result.rows[0]
    };
  }

  /**
   * Delete a forum
   */
  async deleteForum(id) {
    const result = await db.query(`
      DELETE FROM forum_posts WHERE id = $1 RETURNING id, title
    `, [id]);

    if (result.rows.length === 0) {
      throw new Error("Forum not found");
    }

    return {
      message: "Forum deleted successfully",
      forum: result.rows[0]
    };
  }
}

module.exports = new ForumManagementService();
