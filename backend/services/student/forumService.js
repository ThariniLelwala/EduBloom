// services/student/forumService.js
const db = require("../../db/db");

class StudentForumService {
  async getStudentForums(studentId) {
    const result = await db.query(
      `SELECT fp.*, u.username as author,
        (SELECT COALESCE(json_agg(tag_name), '[]') FROM forum_tags WHERE post_id = fp.id) as tags,
        (SELECT COUNT(*) FROM forum_replies WHERE post_id = fp.id) as reply_count
       FROM forum_posts fp
       JOIN users u ON fp.author_id = u.id
       WHERE fp.author_id = $1 AND fp.published = TRUE AND fp.archived = FALSE
       ORDER BY fp.created_at DESC`,
      [studentId]
    );
    return result.rows.map(row => ({
      ...row,
      reply_count: parseInt(row.reply_count)
    }));
  }

  async getStudentForumById(studentId, forumId) {
    const forumResult = await db.query(
      `SELECT fp.*, u.username as author,
        (SELECT COALESCE(json_agg(tag_name), '[]') FROM forum_tags WHERE post_id = fp.id) as tags
       FROM forum_posts fp
       JOIN users u ON fp.author_id = u.id
       WHERE fp.id = $1 AND fp.author_id = $2`,
      [forumId, studentId]
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
      [forumId]
    );

    const forum = forumResult.rows[0];
    forum.replies = repliesResult.rows;
    return forum;
  }

  async createForum(studentId, title, description, tags = []) {
    const result = await db.query(
      `INSERT INTO forum_posts (author_id, title, description, published, archived)
       VALUES ($1, $2, $3, TRUE, FALSE)
       RETURNING *`,
      [studentId, title, description]
    );

    const forum = result.rows[0];

    if (tags && tags.length > 0) {
      for (const tag of tags) {
        await db.query(
          `INSERT INTO forum_tags (post_id, tag_name) VALUES ($1, $2)`,
          [forum.id, tag]
        );
      }
    }

    return this.getStudentForumById(studentId, forum.id);
  }

  async addReply(studentId, forumId, content) {
    const forumCheck = await db.query(
      `SELECT id FROM forum_posts WHERE id = $1 AND author_id = $2`,
      [forumId, studentId]
    );

    if (forumCheck.rows.length === 0) {
      throw new Error("Forum not found or access denied");
    }

    const result = await db.query(
      `INSERT INTO forum_replies (post_id, user_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [forumId, studentId, content]
    );

    const reply = result.rows[0];

    const userResult = await db.query(
      `SELECT username FROM users WHERE id = $1`,
      [studentId]
    );
    reply.author = userResult.rows[0].username;

    return reply;
  }

  async deleteForum(studentId, forumId) {
    const result = await db.query(
      `DELETE FROM forum_posts WHERE id = $1 AND author_id = $2 RETURNING id`,
      [forumId, studentId]
    );

    if (result.rows.length === 0) {
      throw new Error("Forum not found or access denied");
    }

    return { message: "Forum deleted successfully" };
  }
}

module.exports = new StudentForumService();
