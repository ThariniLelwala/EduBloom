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
    const labels = [];
    const data = [];
    
    const result = await db.query(`
      SELECT 
        EXTRACT(WEEK FROM created_at) as week_num,
        EXTRACT(YEAR FROM created_at) as year_num,
        COUNT(*) as count
      FROM users
      WHERE created_at >= NOW() - INTERVAL $1
      GROUP BY EXTRACT(YEAR FROM created_at), EXTRACT(WEEK FROM created_at)
      ORDER BY year_num DESC, week_num DESC
      LIMIT $2
    `, [`${weeks} weeks`, weeks]);
    
    const weekMap = {};
    result.rows.forEach(row => {
      const key = `${row.year_num}-${row.week_num}`;
      weekMap[key] = parseInt(row.count);
    });
    
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const pastDays = (today - startOfYear) / 86400000;
    const currentWeek = Math.ceil((pastDays + startOfYear.getDay() + 1) / 7);
    
    for (let i = 0; i < weeks; i++) {
      const weekNum = currentWeek - (weeks - 1 - i);
      const year = weekNum <= 0 ? today.getFullYear() - 1 : today.getFullYear();
      const week = weekNum <= 0 ? 52 + weekNum : weekNum;
      const key = `${year}-${week}`;
      
      labels.push(`Week ${i + 1}`);
      data.push(weekMap[key] || 0);
    }
    
    return { labels, data };
  }

  async getDailyLogins() {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data = new Array(7).fill(0);
    
    const result = await db.query(`
      SELECT 
        TO_CHAR(created_at, 'Dy') as day,
        COUNT(*) as count
      FROM users
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY TO_CHAR(created_at, 'Dy')
      ORDER BY MIN(created_at) ASC
    `);
    
    const dayMap = {};
    result.rows.forEach(row => {
      dayMap[row.day] = parseInt(row.count);
    });
    
    days.forEach((day, index) => {
      data[index] = dayMap[day] || 0;
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
        u.id, u.username, COALESCE(u.firstname, '') as firstname, COALESCE(u.lastname, '') as lastname, u.role,
        COALESCE((SELECT COUNT(*) FROM forum_posts WHERE author_id = u.id), 0) +
        COALESCE((SELECT COUNT(*) FROM forum_replies WHERE user_id = u.id), 0) as activity_count
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
