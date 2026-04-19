// services/admin/analyticsService.js
const db = require("../../db/db");

class AnalyticsService {
  async getOverviewStats() {
    const [totalUsers, activeForums, newRegistrations, todayLogins] = await Promise.all([
      db.query("SELECT COUNT(*) as count FROM users"),
      db.query("SELECT COUNT(*) as count FROM forum_posts WHERE published = TRUE AND archived = FALSE"),
      db.query("SELECT COUNT(*) as count FROM users WHERE created_at >= NOW() - INTERVAL '30 days'"),
      db.query("SELECT COUNT(*) as count FROM users WHERE last_login >= CURRENT_DATE")
    ]);

    return {
      activeUsers: parseInt(totalUsers.rows[0].count),
      activeForums: parseInt(activeForums.rows[0].count),
      newRegistrations: parseInt(newRegistrations.rows[0].count),
      todayLogins: parseInt(todayLogins.rows[0].count) || 0
    };
  }

  async getUserGrowth(weeks = 8) { 
    const result = await db.query(`
      SELECT 
        EXTRACT(WEEK FROM created_at)::int as week_num,
        EXTRACT(YEAR FROM created_at)::int as year_num,
        COUNT(*) as count
      FROM users
      WHERE created_at >= NOW() - INTERVAL $1
      GROUP BY EXTRACT(WEEK FROM created_at), EXTRACT(YEAR FROM created_at)
      ORDER BY year_num, week_num ASC
    `, [`${weeks} weeks`]);
    
    const weekMap = {};
    result.rows.forEach(row => {
      weekMap[`${row.year_num}-${row.week_num}`] = parseInt(row.count);
    });
    
    const labels = [];
    const data = [];
    const now = new Date();
    const currentWeek = getISOWeekNumber(now);
    
    for (let i = weeks - 1; i >= 0; i--) {
      const weekNum = currentWeek - i;
      const yearNum = weekNum > 0 ? now.getFullYear() : now.getFullYear() - 1;
      const key = `${yearNum}-${weekNum > 0 ? weekNum : 52 + weekNum}`;
      
      labels.push(`Week ${weeks - i}`);
      data.push(weekMap[key] || 0);
    }
    
return { labels, data };
  }
  
  getISOWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

  async getDailyLogins(days = 7) {
    const result = await db.query(`
      SELECT 
        TO_CHAR(DATE(last_login), 'Day') as day_name,
        COUNT(*) as count
      FROM users
      WHERE last_login >= NOW() - INTERVAL $1
      GROUP BY TO_CHAR(DATE(last_login), 'Day')
    `, [`${days} days`]);
    
    const loginMap = {};
    result.rows.forEach(row => {
      if (row.login_date) {
        const dayName = row.day_name.trim().slice(0, 3);
        loginMap[dayName] = parseInt(row.count);
      }
    });
    
    const labels = [];
    const data = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const todayDay = dayNames[today.getDay()];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dayName = dayNames[date.getDay()];
      
      labels.push(dayName);
      data.push(loginMap[dayName] || 0);
    }
    
    return { labels, data };
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
