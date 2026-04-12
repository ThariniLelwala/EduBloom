// services/admin/dashboardService.js
const db = require("../../db/db");

class DashboardService {
  async getOverviewStats() {
    const [users, forums, quizzes, notes, verifications] = await Promise.all([
      this.getUserStats(),
      this.getForumStats(),
      this.getContentStats(),
      this.getPendingVerifications()
    ]);

    return {
      ...users,
      ...forums,
      ...quizzes,
      ...notes,
      pendingVerifications: verifications
    };
  }

  async getUserStats() {
    const totalResult = await db.query("SELECT COUNT(*) as count FROM users");
    const activeResult = await db.query(
      "SELECT COUNT(*) as count FROM users WHERE created_at >= NOW() - INTERVAL '30 days'"
    );
    return {
      totalUsers: parseInt(totalResult.rows[0].count),
      activeUsers: parseInt(activeResult.rows[0].count)
    };
  }

  async getForumStats() {
    const result = await db.query(
      "SELECT COUNT(*) as count FROM forum_posts WHERE archived = FALSE"
    );
    return { totalForums: parseInt(result.rows[0].count) };
  }

  async getContentStats() {
    const [quizzes, notes] = await Promise.all([
      db.query("SELECT COUNT(*) as count FROM quiz_sets"),
      db.query("SELECT COUNT(*) as count FROM teacher_module_notes")
    ]);
    return {
      totalQuizzes: parseInt(quizzes.rows[0].count),
      totalNotes: parseInt(notes.rows[0].count)
    };
  }

  async getPendingVerifications() {
    const result = await db.query(
      "SELECT COUNT(*) as count FROM teacher_verifications WHERE status = 'pending'"
    );
    return parseInt(result.rows[0].count);
  }

  async getRecentActivity(limit = 10) {
    const result = await db.query(`
      SELECT 
        u.username,
        u.firstname,
        u.lastname,
        'new_user' as action_type,
        'Joined the platform' as action,
        u.created_at as timestamp
      FROM users u
      UNION ALL
      SELECT 
        u.username,
        u.firstname,
        u.lastname,
        'new_forum' as action_type,
        'Created a new forum' as action,
        fp.created_at as timestamp
      FROM forum_posts fp
      JOIN users u ON fp.author_id = u.id
      UNION ALL
      SELECT 
        u.username,
        u.firstname,
        u.lastname,
        'new_quiz' as action_type,
        'Created a new quiz' as action,
        qs.created_at as timestamp
      FROM quiz_sets qs
      JOIN quiz_subjects qsub ON qs.subject_id = qsub.id
      JOIN users u ON qsub.teacher_id = u.id
      ORDER BY timestamp DESC
      LIMIT $1
    `, [limit]);

    return result.rows.map(row => ({
      user: `${row.firstname || ""} ${row.lastname || ""}`.trim() || row.username,
      action: row.action,
      timestamp: row.timestamp
    }));
  }
}

module.exports = new DashboardService();
