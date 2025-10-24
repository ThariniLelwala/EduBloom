// services/parent/todoService.js
const db = require("../../db/db");

class TodoService {
  /**
   * Create a new todo item for a student (created by parent)
   */
  async createTodo(parentId, studentId, type, text) {
    if (!parentId || !studentId || !type || !text) {
      throw new Error("Parent ID, Student ID, type, and text are required");
    }

    if (!["todo", "weekly", "monthly"].includes(type)) {
      throw new Error("Type must be 'todo', 'weekly', or 'monthly'");
    }

    // Verify parent exists and is a parent
    const parentCheck = await db.query(
      "SELECT * FROM users WHERE id = $1 AND role = 'parent'",
      [parentId]
    );

    if (parentCheck.rows.length === 0) {
      throw new Error("Parent not found");
    }

    // Verify student exists and is a student
    const studentCheck = await db.query(
      "SELECT * FROM users WHERE id = $1 AND role = 'student'",
      [studentId]
    );

    if (studentCheck.rows.length === 0) {
      throw new Error("Student not found");
    }

    // Verify parent has link to student
    const linkCheck = await db.query(
      "SELECT * FROM parent_student_links WHERE parent_id = $1 AND student_id = $2 AND status = 'accepted'",
      [parentId, studentId]
    );

    if (linkCheck.rows.length === 0) {
      throw new Error("Parent does not have access to this student");
    }

    // Calculate expiration date based on type
    let expiresAt = null;
    if (type === "weekly") {
      // Weekly expires at end of Sunday (7 days from now)
      const today = new Date();
      const daysUntilSunday = 7 - today.getDay();
      expiresAt = new Date(
        today.getTime() + daysUntilSunday * 24 * 60 * 60 * 1000
      );
      expiresAt.setHours(23, 59, 59, 999);
    } else if (type === "monthly") {
      // Monthly expires at end of month
      const today = new Date();
      expiresAt = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      expiresAt.setHours(23, 59, 59, 999);
    }

    const result = await db.query(
      `INSERT INTO parent_todos (parent_id, student_id, type, text, completed, expires_at)
       VALUES ($1, $2, $3, $4, FALSE, $5)
       RETURNING id, parent_id, student_id, type, text, completed, expires_at, created_at, updated_at`,
      [parentId, studentId, type, text, expiresAt]
    );

    return result.rows[0];
  }

  /**
   * Get all todos for a specific student by parent
   */
  async getTodos(parentId, studentId) {
    if (!parentId || !studentId) {
      throw new Error("Parent ID and Student ID are required");
    }

    // Verify parent has access to student
    const linkCheck = await db.query(
      "SELECT * FROM parent_student_links WHERE parent_id = $1 AND student_id = $2 AND status = 'accepted'",
      [parentId, studentId]
    );

    if (linkCheck.rows.length === 0) {
      throw new Error("Parent does not have access to this student");
    }

    const result = await db.query(
      `SELECT id, parent_id, student_id, type, text, completed, created_at, updated_at
       FROM parent_todos
       WHERE parent_id = $1 AND student_id = $2
       ORDER BY type ASC, created_at DESC`,
      [parentId, studentId]
    );

    return result.rows;
  }

  /**
   * Get todos by type for a specific student
   */
  async getTodosByType(parentId, studentId, type) {
    if (!parentId || !studentId || !type) {
      throw new Error("Parent ID, Student ID, and type are required");
    }

    if (!["todo", "weekly", "monthly"].includes(type)) {
      throw new Error("Type must be 'todo', 'weekly', or 'monthly'");
    }

    // Verify parent has access to student
    const linkCheck = await db.query(
      "SELECT * FROM parent_student_links WHERE parent_id = $1 AND student_id = $2 AND status = 'accepted'",
      [parentId, studentId]
    );

    if (linkCheck.rows.length === 0) {
      throw new Error("Parent does not have access to this student");
    }

    const result = await db.query(
      `SELECT id, parent_id, student_id, type, text, completed, created_at, updated_at
       FROM parent_todos
       WHERE parent_id = $1 AND student_id = $2 AND type = $3
       ORDER BY created_at DESC`,
      [parentId, studentId, type]
    );

    return result.rows;
  }

  /**
   * Update a todo item (mark as completed or edit text)
   */
  async updateTodo(parentId, todoId, updates) {
    if (!parentId || !todoId) {
      throw new Error("Parent ID and Todo ID are required");
    }

    const { text, completed } = updates;

    // Verify ownership
    const todo = await db.query(
      "SELECT * FROM parent_todos WHERE id = $1 AND parent_id = $2",
      [todoId, parentId]
    );

    if (todo.rows.length === 0) {
      throw new Error("Todo not found or access denied");
    }

    const result = await db.query(
      `UPDATE parent_todos
       SET text = COALESCE($1, text),
           completed = COALESCE($2, completed),
           updated_at = NOW()
       WHERE id = $3 AND parent_id = $4
       RETURNING id, parent_id, student_id, type, text, completed, created_at, updated_at`,
      [text, completed, todoId, parentId]
    );

    return result.rows[0];
  }

  /**
   * Delete a todo item
   */
  async deleteTodo(parentId, todoId) {
    if (!parentId || !todoId) {
      throw new Error("Parent ID and Todo ID are required");
    }

    // Verify ownership
    const todo = await db.query(
      "SELECT * FROM parent_todos WHERE id = $1 AND parent_id = $2",
      [todoId, parentId]
    );

    if (todo.rows.length === 0) {
      throw new Error("Todo not found or access denied");
    }

    await db.query(
      "DELETE FROM parent_todos WHERE id = $1 AND parent_id = $2",
      [todoId, parentId]
    );

    return { message: "Todo deleted successfully" };
  }

  /**
   * Get all students the parent is connected to
   */
  async getParentStudents(parentId) {
    if (!parentId) {
      throw new Error("Parent ID is required");
    }

    const result = await db.query(
      `SELECT u.id, u.username, u.email
       FROM users u
       INNER JOIN parent_student_links psl ON u.id = psl.student_id
       WHERE psl.parent_id = $1 AND psl.status = 'accepted' AND u.role = 'student'
       ORDER BY u.username ASC`,
      [parentId]
    );

    return result.rows;
  }

  /**
   * Archive/delete expired weekly and monthly goals
   * Called periodically to clean up expired goals
   */
  async archiveExpiredGoals() {
    try {
      // Delete weekly and monthly goals that have expired
      const result = await db.query(
        `DELETE FROM parent_todos
         WHERE expires_at IS NOT NULL AND expires_at < NOW()
         AND type IN ('weekly', 'monthly')
         RETURNING id, student_id, type`
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
   * Get expired goals for a specific student (for display/review before archiving)
   */
  async getExpiredGoals(parentId, studentId) {
    if (!parentId || !studentId) {
      throw new Error("Parent ID and Student ID are required");
    }

    // Verify parent has access to student
    const linkCheck = await db.query(
      "SELECT * FROM parent_student_links WHERE parent_id = $1 AND student_id = $2 AND status = 'accepted'",
      [parentId, studentId]
    );

    if (linkCheck.rows.length === 0) {
      throw new Error("Parent does not have access to this student");
    }

    const result = await db.query(
      `SELECT id, parent_id, student_id, type, text, completed, expires_at, created_at, updated_at
       FROM parent_todos
       WHERE parent_id = $1 AND student_id = $2 
       AND expires_at IS NOT NULL AND expires_at < NOW()
       ORDER BY expires_at DESC`,
      [parentId, studentId]
    );

    return result.rows;
  }
}

module.exports = new TodoService();
