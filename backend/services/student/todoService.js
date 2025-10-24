// services/student/todoService.js
const db = require("../../db/db");

class TodoService {
  /**
   * Get all todos for a student
   */
  async getTodos(studentId) {
    if (!studentId) {
      throw new Error("Student ID is required");
    }

    const result = await db.query(
      `SELECT id, student_id, type, text, completed, expires_at, created_at, updated_at
       FROM student_todos
       WHERE student_id = $1
       ORDER BY type ASC, created_at DESC`,
      [studentId]
    );

    return result.rows;
  }

  /**
   * Get todos by type for a student
   */
  async getTodosByType(studentId, type) {
    if (!studentId || !type) {
      throw new Error("Student ID and type are required");
    }

    if (!["todo", "weekly", "monthly"].includes(type)) {
      throw new Error("Type must be 'todo', 'weekly', or 'monthly'");
    }

    const result = await db.query(
      `SELECT id, student_id, type, text, completed, expires_at, created_at, updated_at
       FROM student_todos
       WHERE student_id = $1 AND type = $2
       ORDER BY created_at DESC`,
      [studentId, type]
    );

    return result.rows;
  }

  /**
   * Update a todo item (mark as completed or edit text)
   */
  async updateTodo(studentId, todoId, updates) {
    if (!studentId || !todoId) {
      throw new Error("Student ID and Todo ID are required");
    }

    const { text, completed } = updates;

    // Verify ownership
    const todo = await db.query(
      "SELECT * FROM student_todos WHERE id = $1 AND student_id = $2",
      [todoId, studentId]
    );

    if (todo.rows.length === 0) {
      throw new Error("Todo not found or access denied");
    }

    const result = await db.query(
      `UPDATE student_todos
       SET text = COALESCE($1, text),
           completed = COALESCE($2, completed),
           updated_at = NOW()
       WHERE id = $3 AND student_id = $4
       RETURNING id, student_id, type, text, completed, expires_at, created_at, updated_at`,
      [text, completed, todoId, studentId]
    );

    return result.rows[0];
  }

  /**
   * Archive/delete expired weekly and monthly goals
   */
  async archiveExpiredGoals(studentId) {
    if (!studentId) {
      throw new Error("Student ID is required");
    }

    try {
      // Delete weekly and monthly goals that have expired
      const result = await db.query(
        `DELETE FROM student_todos
         WHERE student_id = $1 
         AND expires_at IS NOT NULL AND expires_at < NOW()
         AND type IN ('weekly', 'monthly')
         RETURNING id, type`,
        [studentId]
      );

      return {
        message: `${result.rows.length} expired goals archived successfully`,
        archivedCount: result.rows.length,
        details: result.rows,
      };
    } catch (error) {
      throw new Error(`Failed to archive expired goals: ${error.message}`);
    }
  }

  /**
   * Get expired goals for a student
   */
  async getExpiredGoals(studentId) {
    if (!studentId) {
      throw new Error("Student ID is required");
    }

    const result = await db.query(
      `SELECT id, student_id, type, text, completed, expires_at, created_at, updated_at
       FROM student_todos
       WHERE student_id = $1 
       AND expires_at IS NOT NULL AND expires_at < NOW()
       ORDER BY expires_at DESC`,
      [studentId]
    );

    return result.rows;
  }
}

module.exports = new TodoService();
