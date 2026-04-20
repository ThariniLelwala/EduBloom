// services/student/forumService.js
const db = require("../../db/db");

class StudentForumService {
  async getStudentForums(studentId) {
    // Return ALL published forums (not just student's own) for the browse view
    // Exclude archived and deletion-requested forums
    const result = await db.query(
      `SELECT fp.*, u.username as author,
        (SELECT COALESCE(json_agg(tag_name), '[]') FROM forum_tags WHERE post_id = fp.id) as tags,
        (SELECT COUNT(*) FROM forum_replies WHERE post_id = fp.id) as reply_count
       FROM forum_posts fp
       JOIN users u ON fp.author_id = u.id
       WHERE fp.published = TRUE AND fp.archived = FALSE AND fp.deletion_requested = FALSE AND u.role != 'teacher'
       ORDER BY fp.created_at DESC`
    );
    return result.rows.map(row => ({
      ...row,
      reply_count: parseInt(row.reply_count)
    }));
  }

  async getStudentForumById(studentId, forumId) {
    // Allow viewing any published forum, not just the student's own
    // Exclude archived and deletion-requested forums
    const forumResult = await db.query(
      `SELECT fp.*, u.username as author,
        (SELECT COALESCE(json_agg(tag_name), '[]') FROM forum_tags WHERE post_id = fp.id) as tags
       FROM forum_posts fp
       JOIN users u ON fp.author_id = u.id
       WHERE fp.id = $1 AND fp.published = TRUE AND fp.archived = FALSE AND fp.deletion_requested = FALSE AND u.role != 'teacher'`,
      [forumId]
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
    // Allow replying to any published forum, not just the student's own
    // Exclude archived and deletion-requested forums
    const forumCheck = await db.query(
      `SELECT fp.id FROM forum_posts fp JOIN users u ON fp.author_id = u.id WHERE fp.id = $1 AND fp.published = TRUE AND fp.archived = FALSE AND fp.deletion_requested = FALSE AND u.role != 'teacher'`,
      [forumId]
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

  async getStudentStats(studentId) {
    const totalTopics = await db.query(
      `SELECT COUNT(*) FROM forum_posts fp JOIN users u ON fp.author_id = u.id WHERE fp.published = TRUE AND fp.archived = FALSE AND fp.deletion_requested = FALSE AND u.role != 'teacher'`
    );
    const myTopics = await db.query(
      `SELECT COUNT(*) FROM forum_posts WHERE author_id = $1 AND archived = FALSE AND deletion_requested = FALSE`,
      [studentId]
    );
    const myReplies = await db.query(
      `SELECT COUNT(*) FROM forum_replies WHERE user_id = $1`,
      [studentId]
    );
    const activeUsers = await db.query(
      `SELECT COUNT(DISTINCT author_id) FROM forum_posts fp JOIN users u ON fp.author_id = u.id WHERE fp.published = TRUE AND fp.archived = FALSE AND fp.deletion_requested = FALSE AND u.role != 'teacher'`
    );

    return {
      totalTopics: parseInt(totalTopics.rows[0].count),
      myTopics: parseInt(myTopics.rows[0].count),
      myReplies: parseInt(myReplies.rows[0].count),
      activeUsers: parseInt(activeUsers.rows[0].count)
    };
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

  async getMyForums(studentId) {
    const result = await db.query(
      `SELECT fp.*, u.username as author,
        (SELECT COALESCE(json_agg(tag_name), '[]') FROM forum_tags WHERE post_id = fp.id) as tags,
        (SELECT COUNT(*) FROM forum_replies WHERE post_id = fp.id) as reply_count
       FROM forum_posts fp
       JOIN users u ON fp.author_id = u.id
       WHERE fp.author_id = $1
       ORDER BY fp.created_at DESC`,
      [studentId]
    );
    return result.rows.map(row => ({
      ...row,
      reply_count: parseInt(row.reply_count)
    }));
  }

  async updateForum(studentId, forumId, title, description, tags) {
    const forumCheck = await db.query(
      `SELECT id FROM forum_posts WHERE id = $1 AND author_id = $2`,
      [forumId, studentId]
    );

    if (forumCheck.rows.length === 0) {
      throw new Error("Forum not found or access denied");
    }

    await db.query(
      `UPDATE forum_posts SET title = $1, description = $2, updated_at = NOW() WHERE id = $3`,
      [title, description, forumId]
    );

    await db.query(`DELETE FROM forum_tags WHERE post_id = $1`, [forumId]);

    if (tags && tags.length > 0) {
      for (const tag of tags) {
        await db.query(
          `INSERT INTO forum_tags (post_id, tag_name) VALUES ($1, $2)`,
          [forumId, tag]
        );
      }
    }

    return this.getStudentForumById(studentId, forumId);
  }

  async archiveForum(studentId, forumId) {
    const forumCheck = await db.query(
      `SELECT id FROM forum_posts WHERE id = $1 AND author_id = $2`,
      [forumId, studentId]
    );

    if (forumCheck.rows.length === 0) {
      throw new Error("Forum not found or access denied");
    }

    await db.query(
      `UPDATE forum_posts SET archived = TRUE, updated_at = NOW() WHERE id = $1`,
      [forumId]
    );

    return { message: "Forum archived successfully" };
  }

  async unarchiveForum(studentId, forumId) {
    const forumCheck = await db.query(
      `SELECT id FROM forum_posts WHERE id = $1 AND author_id = $2`,
      [forumId, studentId]
    );

    if (forumCheck.rows.length === 0) {
      throw new Error("Forum not found or access denied");
    }

    await db.query(
      `UPDATE forum_posts SET archived = FALSE, updated_at = NOW() WHERE id = $1`,
      [forumId]
    );

    return { message: "Forum unarchived successfully" };
  }

  async requestDeletion(studentId, forumId, reason) {
    const forumCheck = await db.query(
      `SELECT id FROM forum_posts WHERE id = $1 AND author_id = $2 AND archived = FALSE`,
      [forumId, studentId]
    );

    if (forumCheck.rows.length === 0) {
      throw new Error("Forum not found, access denied, or already archived");
    }

    await db.query(
      `UPDATE forum_posts SET deletion_requested = TRUE, deletion_reason = $1, updated_at = NOW() WHERE id = $2`,
      [reason, forumId]
    );

    return { message: "Deletion request submitted" };
  }
}

module.exports = new StudentForumService();
