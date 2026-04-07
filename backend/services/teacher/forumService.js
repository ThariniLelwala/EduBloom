// services/teacher/forumService.js
const db = require("../../db/db");

class ForumService {
  /**
   * Get all published forums with tags and reply count
   */
  async getAllForums() {
    const result = await db.query(
      `SELECT fp.*, u.username as author, 
              (SELECT COALESCE(json_agg(tag_name), '[]') FROM forum_tags WHERE post_id = fp.id) as tags,
              (SELECT COUNT(*) FROM forum_replies WHERE post_id = fp.id) as reply_count
       FROM forum_posts fp
       JOIN users u ON fp.author_id = u.id
       WHERE fp.published = TRUE AND fp.archived = FALSE
       ORDER BY fp.created_at DESC`
    );
    return result.rows.map(row => ({
      ...row,
      reply_count: parseInt(row.reply_count),
      target_grade: row.target_grade ? parseInt(row.target_grade) : null
    }));
  }

  /**
   * Get forums created by a specific teacher
   */
  async getTeacherForums(teacherId) {
    const result = await db.query(
      `SELECT fp.*, u.username as author, 
              (SELECT COALESCE(json_agg(tag_name), '[]') FROM forum_tags WHERE post_id = fp.id) as tags,
              (SELECT COUNT(*) FROM forum_replies WHERE post_id = fp.id) as reply_count
       FROM forum_posts fp
       JOIN users u ON fp.author_id = u.id
       WHERE fp.author_id = $1
       ORDER BY fp.created_at DESC`,
      [teacherId]
    );
    return result.rows.map(row => ({
      ...row,
      reply_count: parseInt(row.reply_count),
      target_grade: row.target_grade ? parseInt(row.target_grade) : null
    }));
  }

  /**
   * Get a single forum with replies and tags
   */
  async getForumById(postId) {
    const forumResult = await db.query(
      `SELECT fp.*, u.username as author, 
              (SELECT COALESCE(json_agg(tag_name), '[]') FROM forum_tags WHERE post_id = fp.id) as tags
       FROM forum_posts fp
       JOIN users u ON fp.author_id = u.id
       WHERE fp.id = $1`,
      [postId]
    );

    if (forumResult.rows.length === 0) {
      throw new Error("Forum not found");
    }

    const repliesResult = await db.query(
      `SELECT fr.*, u.username as author
       FROM forum_replies fr
       JOIN users u ON fr.user_id = u.id
       WHERE fr.post_id = $1
       ORDER BY fr.created_at ASC`,
      [postId]
    );

    const forum = forumResult.rows[0];
    forum.replies = repliesResult.rows;
    forum.target_grade = forum.target_grade ? parseInt(forum.target_grade) : null;
    return forum;
  }

  /**
   * Create a new forum post
   */
  async createForum(authorId, title, description, tags = [], published = true, targetGrade = null) {
    try {
      await db.query("BEGIN");

      const postResult = await db.query(
        `INSERT INTO forum_posts (author_id, title, description, published, target_grade)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [authorId, title, description, published, targetGrade]
      );

      const postId = postResult.rows[0].id;

      if (tags && tags.length > 0) {
        for (const tag of tags) {
          await db.query(
            "INSERT INTO forum_tags (post_id, tag_name) VALUES ($1, $2)",
            [postId, tag.toLowerCase()]
          );
        }
      }

      await db.query("COMMIT");

      const createdPost = postResult.rows[0];
      createdPost.tags = tags;
      return createdPost;
    } catch (err) {
      await db.query("ROLLBACK");
      throw err;
    }
  }

  /**
   * Update an existing forum post
   */
  async updateForum(postId, teacherId, title, description, tags = [], published = true) {
    try {
      await db.query("BEGIN");

      // Verify ownership
      const checkResult = await db.query(
        "SELECT * FROM forum_posts WHERE id = $1 AND author_id = $2",
        [postId, teacherId]
      );

      if (checkResult.rows.length === 0) {
        throw new Error("Forum not found or unauthorized");
      }

      await db.query(
        `UPDATE forum_posts 
         SET title = $1, description = $2, published = $3, updated_at = NOW()
         WHERE id = $4`,
        [title, description, published, postId]
      );

      // Update tags: delete old ones and insert new ones
      await db.query("DELETE FROM forum_tags WHERE post_id = $1", [postId]);
      if (tags && tags.length > 0) {
        for (const tag of tags) {
          await db.query(
            "INSERT INTO forum_tags (post_id, tag_name) VALUES ($1, $2)",
            [postId, tag.toLowerCase()]
          );
        }
      }

      await db.query("COMMIT");
      return { id: postId, title, description, tags, published };
    } catch (err) {
      await db.query("ROLLBACK");
      throw err;
    }
  }

  /**
   * Delete or archive a forum post
   */
  async deleteForum(postId, teacherId) {
    // Check reply count
    const replyCountResult = await db.query(
      "SELECT COUNT(*) FROM forum_replies WHERE post_id = $1",
      [postId]
    );
    const replyCount = parseInt(replyCountResult.rows[0].count);

    if (replyCount > 0) {
      // Archive instead of delete
      const result = await db.query(
        "UPDATE forum_posts SET published = false, archived = true WHERE id = $1 AND author_id = $2 RETURNING id",
        [postId, teacherId]
      );

      if (result.rows.length === 0) {
        throw new Error("Forum not found or unauthorized");
      }

      return {
        message: "Forum archived successfully (it has active replies)",
        id: postId,
        action: "archived",
      };
    } else {
      // Hard delete
      const result = await db.query(
        "DELETE FROM forum_posts WHERE id = $1 AND author_id = $2 RETURNING id",
        [postId, teacherId]
      );

      if (result.rows.length === 0) {
        throw new Error("Forum not found or unauthorized");
      }

      return {
        message: "Forum deleted successfully",
        id: postId,
        action: "deleted",
      };
    }
  }

  /**
   * Add a reply to a forum post
   */
  async addReply(postId, userId, content) {
    const result = await db.query(
      `INSERT INTO forum_replies (post_id, user_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [postId, userId, content]
    );
    return result.rows[0];
  }

  /**
   * Delete a reply
   */
  async deleteReply(replyId, userId, role) {
    let query = "";
    let params = [];

    if (role === "teacher") {
      // Teachers can delete their own replies OR any reply in their own forums
      query = `DELETE FROM forum_replies 
               WHERE id = $1 AND (user_id = $2 OR post_id IN (SELECT id FROM forum_posts WHERE author_id = $2))
               RETURNING id`;
      params = [replyId, userId];
    } else {
      // Students can only delete their own replies
      query = "DELETE FROM forum_replies WHERE id = $1 AND user_id = $2 RETURNING id";
      params = [replyId, userId];
    }

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      throw new Error("Reply not found or unauthorized");
    }

    return { message: "Reply deleted successfully", id: replyId };
  }

  /**
   * Increment forum view count
   */
  async incrementViews(postId) {
    await db.query(
      "UPDATE forum_posts SET views = views + 1 WHERE id = $1",
      [postId]
    );
    return { success: true };
  }

  /**
   * Get all unique tags used in forums
   */
  async getAvailableTags() {
    const result = await db.query(
      "SELECT DISTINCT tag_name FROM forum_tags ORDER BY tag_name ASC"
    );
    return result.rows.map(row => row.tag_name);
  }
}

module.exports = new ForumService();
