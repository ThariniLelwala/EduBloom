// services/student/pomodoroService.js
const db = require("../../db/db");

class PomodoroService {
  /**
   * Create a new active Pomodoro session
   */
  async createSession(studentId, mode) {
    if (!studentId || !mode) {
      throw new Error("Student ID and mode are required");
    }

    if (!["freestyle", "custom"].includes(mode)) {
      throw new Error("Mode must be 'freestyle' or 'custom'");
    }

    const result = await db.query(
      `INSERT INTO pomodoro_sessions (student_id, mode, start_time, status, cycles_completed, duration_minutes)
       VALUES ($1, $2, NOW(), 'active', 0, 0)
       RETURNING id, student_id, mode, start_time, status, cycles_completed`,
      [studentId, mode]
    );

    return result.rows[0];
  }

  /**
   * Update session cycle count
   */
  async updateSession(sessionId, studentId, cyclesCompleted) {
    const result = await db.query(
      `UPDATE pomodoro_sessions 
       SET cycles_completed = $1
       WHERE id = $2 AND student_id = $3 AND status = 'active'
       RETURNING *`,
      [cyclesCompleted, sessionId, studentId]
    );

    if (result.rows.length === 0) {
      throw new Error("Session not found or not active");
    }

    return result.rows[0];
  }

  /**
   * Finish a session
   */
  async finishSession(sessionId, studentId, durationMinutes = null) {
    // Get start time to calculate duration
    const sessionResult = await db.query(
      `SELECT start_time FROM pomodoro_sessions WHERE id = $1 AND student_id = $2`,
      [sessionId, studentId]
    );

    if (sessionResult.rows.length === 0) {
      throw new Error("Session not found");
    }

    let finalDuration = durationMinutes;
    if (finalDuration === null || finalDuration === undefined) {
        const startTime = new Date(sessionResult.rows[0].start_time);
        const endTime = new Date();
        const durationMs = endTime - startTime;
        finalDuration = Math.floor(durationMs / 1000 / 60);
    }

    const result = await db.query(
      `UPDATE pomodoro_sessions 
       SET end_time = NOW(), status = 'completed', duration_minutes = $1
       WHERE id = $2 AND student_id = $3
       RETURNING *`,
      [finalDuration, sessionId, studentId]
    );

    return result.rows[0];
  }

  /**
   * Resume a session (called after page reload to mark session active again)
   */
  async resumeSession(sessionId, studentId) {
    const result = await db.query(
      `UPDATE pomodoro_sessions
       SET status = 'active', end_time = NULL
       WHERE id = $1 AND student_id = $2
       RETURNING *`,
      [sessionId, studentId]
    );

    if (result.rows.length === 0) {
      throw new Error("Session not found");
    }

    return result.rows[0];
  }

  /**
   * Get sessions for a student
   */
  async getSessions(studentId, limit = 50) {
    const result = await db.query(
      `SELECT * FROM pomodoro_sessions
       WHERE student_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [studentId, limit]
    );

    return result.rows;
  }

  /**
   * Get session statistics for a student
   */
  async getSessionStats(studentId, dateFrom = null, dateTo = null) {
    let query = `
      SELECT 
        COUNT(*) as total_sessions,
        COALESCE(SUM(duration_minutes), 0) as total_minutes,
        COALESCE(SUM(cycles_completed), 0) as total_cycles,
        COALESCE(AVG(duration_minutes), 0) as avg_duration
      FROM pomodoro_sessions
      WHERE student_id = $1 AND status = 'completed'
    `;

    const params = [studentId];

    if (dateFrom) {
      params.push(dateFrom);
      query += ` AND created_at >= $${params.length}`;
    }

    if (dateTo) {
      params.push(dateTo);
      query += ` AND created_at <= $${params.length}`;
    }

    const result = await db.query(query, params);

    return {
      totalSessions: parseInt(result.rows[0].total_sessions),
      totalMinutes: parseInt(result.rows[0].total_minutes),
      totalCycles: parseInt(result.rows[0].total_cycles),
      avgDuration: parseFloat(result.rows[0].avg_duration).toFixed(2),
    };
  }
}

module.exports = new PomodoroService();
