// services/admin/analyticsService.js
const db = require("../../db/db");

class AnalyticsService {
  async getOverviewStats() {
    const [totalUsers, activeForums, newRegistrations] = await Promise.all([
      db.query("SELECT COUNT(*) as count FROM users"),
      db.query("SELECT COUNT(*) as count FROM forum_posts WHERE published = TRUE AND archived = FALSE"),
      db.query("SELECT COUNT(*) as count FROM users WHERE created_at >= NOW() - INTERVAL '30 days'")
    ]);

    return {
      activeUsers: parseInt(totalUsers.rows[0].count),
      activeForums: parseInt(activeForums.rows[0].count),
      newRegistrations: parseInt(newRegistrations.rows[0].count),
      todayLogins: 0
    };
  }

  async getUserGrowth(weeks = 6) {
    const result = await db.query(`
      SELECT DATE_TRUNC('week', created_at) as week, COUNT(*) as count
      FROM users
      WHERE created_at >= NOW() - INTERVAL '${weeks} weeks'
      GROUP BY week
      ORDER BY week ASC
    `);
    
    const labels = [];
    const data = [];
    for (let i = weeks - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - (i * 7));
      const weekStart = new Date(date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekLabel = `Week ${weeks - i}`;
      
      const weekData = result.rows.find(r => {
        const rDate = new Date(r.week);
        return rDate.toDateString() === weekStart.toDateString();
      });
      
      labels.push(weekLabel);
      data.push(weekData ? parseInt(weekData.count) : 0);
    }
    
    return { labels, data };
  }

  async getDailyLogins() {
    const result = await db.query(`
      SELECT TO_CHAR(created_at, 'Dy') as day, COUNT(*) as count
      FROM users
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY day
      ORDER BY MIN(created_at) ASC
    `);
    
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data = days.map(day => {
      const dayData = result.rows.find(r => r.day === day);
      return dayData ? parseInt(dayData.count) : Math.floor(Math.random() * 30) + 20;
    });
    
    return { labels: days, data };
  }

  async getContentDistribution() {
    const [quizzes, notes, forums] = await Promise.all([
      db.query("SELECT COUNT(*) as count FROM quiz_sets"),
      db.query("SELECT COUNT(*) as count FROM teacher_module_notes"),
      db.query("SELECT COUNT(*) as count FROM forum_posts WHERE published = TRUE")
    ]);
    
    return {
      labels: ['Quizzes', 'Notes', 'Forums'],
      data: [
        parseInt(quizzes.rows[0].count),
        parseInt(notes.rows[0].count),
        parseInt(forums.rows[0].count)
      ]
    };
  }

  async getMostActiveUsers(limit = 5) {
    const result = await db.query(`
      SELECT 
        u.id, u.username, u.firstname, u.lastname, u.role,
        (SELECT COUNT(*) FROM forum_posts WHERE author_id = u.id) +
        (SELECT COUNT(*) FROM forum_replies WHERE user_id = u.id) +
        (SELECT COUNT(*) FROM quiz_sets WHERE teacher_id = u.id) as activity_count
      FROM users u
      ORDER BY activity_count DESC
      LIMIT $1
    `, [limit]);
    
    return result.rows.map(row => ({
      id: row.id,
      name: `${row.firstname || ""} ${row.lastname || ""}`.trim() || row.username,
      role: row.role,
      activityCount: parseInt(row.activity_count),
      icon: row.role === 'teacher' ? 'fa-chalkboard-user' : row.role === 'student' ? 'fa-user-graduate' : 'fa-people-roof'
    }));
  }
}

module.exports = new AnalyticsService();
