// services/parent/calendarService.js
const db = require("../../db/db");

class CalendarService {
  async createDeadline(parentId, studentId, title, date) {
    if (!parentId || !studentId || !title || !date) {
      throw new Error("Parent ID, Student ID, title, and date are required");
    }

    const linkCheck = await db.query(
      "SELECT * FROM parent_student_links WHERE parent_id = $1 AND student_id = $2 AND status = 'accepted'",
      [parentId, studentId]
    );

    if (linkCheck.rows.length === 0) {
      throw new Error("Parent does not have access to this student");
    }

    const result = await db.query(
      `INSERT INTO parent_calendar_deadlines (parent_id, student_id, title, event_date)
       VALUES ($1, $2, $3, $4)
       RETURNING id, parent_id, student_id, title, event_date, created_at`,
      [parentId, studentId, title, date]
    );

    return result.rows[0];
  }

  async getDeadlines(parentId, studentId) {
    if (!parentId || !studentId) {
      throw new Error("Parent ID and Student ID are required");
    }

    const linkCheck = await db.query(
      "SELECT * FROM parent_student_links WHERE parent_id = $1 AND student_id = $2 AND status = 'accepted'",
      [parentId, studentId]
    );

    if (linkCheck.rows.length === 0) {
      throw new Error("Parent does not have access to this student");
    }

    const result = await db.query(
      `SELECT id, parent_id, student_id, title, event_date as date, created_at
       FROM parent_calendar_deadlines
       WHERE parent_id = $1 AND student_id = $2
       ORDER BY event_date ASC`,
      [parentId, studentId]
    );

    return result.rows;
  }

  async updateDeadline(parentId, deadlineId, updates) {
    if (!parentId || !deadlineId) {
      throw new Error("Parent ID and Deadline ID are required");
    }

    const { title, date } = updates;

    const deadline = await db.query(
      "SELECT * FROM parent_calendar_deadlines WHERE id = $1 AND parent_id = $2",
      [deadlineId, parentId]
    );

    if (deadline.rows.length === 0) {
      throw new Error("Deadline not found or access denied");
    }

    const result = await db.query(
      `UPDATE parent_calendar_deadlines
       SET title = COALESCE($1, title),
           event_date = COALESCE($2, event_date)
       WHERE id = $3 AND parent_id = $4
       RETURNING id, parent_id, student_id, title, event_date as date, created_at`,
      [title, date, deadlineId, parentId]
    );

    return result.rows[0];
  }

  async deleteDeadline(parentId, deadlineId) {
    if (!parentId || !deadlineId) {
      throw new Error("Parent ID and Deadline ID are required");
    }

    const deadline = await db.query(
      "SELECT * FROM parent_calendar_deadlines WHERE id = $1 AND parent_id = $2",
      [deadlineId, parentId]
    );

    if (deadline.rows.length === 0) {
      throw new Error("Deadline not found or access denied");
    }

    await db.query(
      "DELETE FROM parent_calendar_deadlines WHERE id = $1 AND parent_id = $2",
      [deadlineId, parentId]
    );

    return { message: "Deadline deleted successfully" };
  }

  async createParentOnlyTask(parentId, text) {
    if (!parentId || !text) {
      throw new Error("Parent ID and text are required");
    }

    const result = await db.query(
      `INSERT INTO parent_only_tasks (parent_id, text, completed)
       VALUES ($1, $2, FALSE)
       RETURNING id, parent_id, text, completed, created_at`,
      [parentId, text]
    );

    return result.rows[0];
  }

  async getParentOnlyTasks(parentId) {
    if (!parentId) {
      throw new Error("Parent ID is required");
    }

    const result = await db.query(
      `SELECT id, parent_id, text, completed, created_at, updated_at
       FROM parent_only_tasks
       WHERE parent_id = $1
       ORDER BY created_at DESC`,
      [parentId]
    );

    return result.rows;
  }

  async updateParentOnlyTask(parentId, taskId, updates) {
    if (!parentId || !taskId) {
      throw new Error("Parent ID and Task ID are required");
    }

    const { text, completed } = updates;

    const task = await db.query(
      "SELECT * FROM parent_only_tasks WHERE id = $1 AND parent_id = $2",
      [taskId, parentId]
    );

    if (task.rows.length === 0) {
      throw new Error("Task not found or access denied");
    }

    const result = await db.query(
      `UPDATE parent_only_tasks
       SET text = COALESCE($1, text),
           completed = COALESCE($2, completed),
           updated_at = NOW()
       WHERE id = $3 AND parent_id = $4
       RETURNING id, parent_id, text, completed, created_at, updated_at`,
      [text, completed, taskId, parentId]
    );

    return result.rows[0];
  }

  async deleteParentOnlyTask(parentId, taskId) {
    if (!parentId || !taskId) {
      throw new Error("Parent ID and Task ID are required");
    }

    const task = await db.query(
      "SELECT * FROM parent_only_tasks WHERE id = $1 AND parent_id = $2",
      [taskId, parentId]
    );

    if (task.rows.length === 0) {
      throw new Error("Task not found or access denied");
    }

    await db.query(
      "DELETE FROM parent_only_tasks WHERE id = $1 AND parent_id = $2",
      [taskId, parentId]
    );

    return { message: "Task deleted successfully" };
  }
}

module.exports = new CalendarService();
