// services/parent/progressService.js
const db = require("../../db/db");

class ProgressService {
  constructor() {
    // Import student services for data retrieval
    this.pomodoroService = require("../student/pomodoroService");
    this.diaryService = require("../student/diaryService");
    this.todoService = require("../student/todoService");
    this.examService = require("../student/examService");
    this.markService = require("../student/markService");
  }

  /**
   * Verify parent-child link exists
   */
  async verifyParentChildLink(parentId, childId) {
    try {
      const result = await db.query(
        `SELECT * FROM parent_student_links 
         WHERE parent_id = $1 AND student_id = $2 AND status = 'accepted'`,
        [parentId, childId]
      );
      return result.rows.length > 0;
    } catch (error) {
      console.error("Error verifying parent-child link:", error);
      return false;
    }
  }

  /**
   * Verify link and throw error if not authorized
   */
  async requireParentChildLink(parentId, childId) {
    const isLinked = await this.verifyParentChildLink(parentId, childId);
    if (!isLinked) {
      throw new Error("Not authorized to view this child's data");
    }
  }

  /**
   * Get child's pomodoro sessions
   */
  async getPomodoroSessions(parentId, childId, limit = 50) {
    await this.requireParentChildLink(parentId, childId);
    return await this.pomodoroService.getSessions(childId, limit);
  }

  /**
   * Get child's pomodoro statistics
   */
  async getPomodoroStats(parentId, childId, dateFrom = null, dateTo = null) {
    await this.requireParentChildLink(parentId, childId);
    return await this.pomodoroService.getSessionStats(childId, dateFrom, dateTo);
  }

  /**
   * Get child's diary entries
   */
  async getDiaryEntries(parentId, childId) {
    await this.requireParentChildLink(parentId, childId);
    return await this.diaryService.getEntries(childId);
  }

  /**
   * Get child's todos
   */
  async getTodos(parentId, childId, type = null) {
    await this.requireParentChildLink(parentId, childId);
    if (type && ["todo", "weekly", "monthly"].includes(type)) {
      return await this.todoService.getTodosByType(childId, type);
    }
    return await this.todoService.getTodos(childId);
  }

  /**
   * Get child's exam terms
   */
  async getExamTerms(parentId, childId) {
    await this.requireParentChildLink(parentId, childId);
    return await this.examService.getTerms(childId);
  }

  /**
   * Get child's mark subjects
   */
  async getMarkSubjects(parentId, childId) {
    await this.requireParentChildLink(parentId, childId);
    return await this.markService.getSubjects(childId);
  }

  /**
   * Get all progress data for a child
   */
  async getAllProgressData(parentId, childId) {
    await this.requireParentChildLink(parentId, childId);

    const [
      pomodoroSessions,
      pomodoroStats,
      diaryEntries,
      todos,
      examTerms,
      markSubjects
    ] = await Promise.all([
      this.pomodoroService.getSessions(childId, 50),
      this.pomodoroService.getSessionStats(childId, null, null),
      this.diaryService.getEntries(childId),
      this.todoService.getTodos(childId),
      this.examService.getTerms(childId),
      this.markService.getSubjects(childId)
    ]);

    return {
      pomodoro: {
        sessions: pomodoroSessions,
        stats: pomodoroStats
      },
      diary: {
        entries: diaryEntries
      },
      todos: {
        items: todos
      },
      exams: {
        terms: examTerms
      },
      marks: {
        subjects: markSubjects
      }
    };
  }

  /**
   * Get linked children for a parent
   */
  async getLinkedChildren(parentId) {
    try {
      const result = await db.query(
        `SELECT u.id, u.username, u.email, u.firstname, u.lastname, u.student_type,
                psl.status as link_status, psl.created_at as linked_at
         FROM users u
         INNER JOIN parent_student_links psl ON u.id = psl.student_id
         WHERE psl.parent_id = $1 AND psl.status = 'accepted' AND u.role = 'student'
         ORDER BY u.username ASC`,
        [parentId]
      );
      return result.rows;
    } catch (error) {
      console.error("Error fetching linked children:", error);
      throw new Error("Failed to fetch linked children");
    }
  }
}

module.exports = new ProgressService();