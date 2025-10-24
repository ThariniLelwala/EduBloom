// controllers/student/todoController.js
const todoService = require("../../services/student/todoService");
const { parseRequestBody } = require("../../middleware/authMiddleware");

const createTodo = async (req, res) => {
  try {
    const data = await parseRequestBody(req);
    const { type, text } = data;
    const studentId = req.user.id;

    if (!type || !text) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({
          error: "Type and text are required",
        })
      );
    }

    if (!["todo", "weekly", "monthly"].includes(type)) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({
          error: "Type must be 'todo', 'weekly', or 'monthly'",
        })
      );
    }

    // Calculate expires_at based on type
    let expiresAt = null;

    if (type === "weekly") {
      // Expire at end of this Sunday
      const today = new Date();
      const dayOfWeek = today.getDay();
      const daysUntilSunday = (7 - dayOfWeek) % 7 || 7;
      expiresAt = new Date(today);
      expiresAt.setDate(expiresAt.getDate() + daysUntilSunday);
      expiresAt.setHours(23, 59, 59, 999);
    } else if (type === "monthly") {
      // Expire at end of this month
      const today = new Date();
      expiresAt = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );
    }

    // Insert into database
    const db = require("../../db/db");
    const result = await db.query(
      `INSERT INTO student_todos (student_id, type, text, completed, expires_at, created_at, updated_at)
       VALUES ($1, $2, $3, false, $4, NOW(), NOW())
       RETURNING id, student_id, type, text, completed, expires_at, created_at, updated_at`,
      [studentId, type, text, expiresAt]
    );

    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Todo created successfully",
        todo: result.rows[0],
      })
    );
  } catch (error) {
    console.error("Error creating todo:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        error: "Failed to create todo",
        details: error.message,
      })
    );
  }
};

const getTodos = async (req, res) => {
  try {
    const studentId = req.user.id;
    const todos = await todoService.getTodos(studentId);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Todos retrieved successfully",
        todos: todos,
      })
    );
  } catch (error) {
    console.error("Error fetching todos:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        error: "Failed to fetch todos",
        details: error.message,
      })
    );
  }
};

const getTodosByType = async (req, res) => {
  try {
    const type = req.url.split("/")[4];
    const studentId = req.user.id;

    const todos = await todoService.getTodosByType(studentId, type);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: `Todos of type '${type}' retrieved successfully`,
        todos: todos,
      })
    );
  } catch (error) {
    console.error("Error fetching todos by type:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        error: "Failed to fetch todos",
        details: error.message,
      })
    );
  }
};

const updateTodo = async (req, res) => {
  try {
    const todoId = parseInt(req.url.split("/")[4]);
    const data = await parseRequestBody(req);
    const studentId = req.user.id;
    const updates = data;

    const updatedTodo = await todoService.updateTodo(
      studentId,
      todoId,
      updates
    );

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Todo updated successfully",
        todo: updatedTodo,
      })
    );
  } catch (error) {
    console.error("Error updating todo:", error);
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        error: "Failed to update todo",
        details: error.message,
      })
    );
  }
};

const deleteTodo = async (req, res) => {
  try {
    const todoId = parseInt(req.url.split("/")[4]);
    const studentId = req.user.id;

    // Verify ownership
    const db = require("../../db/db");
    const todo = await db.query(
      "SELECT * FROM student_todos WHERE id = $1 AND student_id = $2",
      [todoId, studentId]
    );

    if (todo.rows.length === 0) {
      res.writeHead(404, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({
          error: "Todo not found or access denied",
        })
      );
    }

    // Delete
    await db.query(
      "DELETE FROM student_todos WHERE id = $1 AND student_id = $2",
      [todoId, studentId]
    );

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Todo deleted successfully",
      })
    );
  } catch (error) {
    console.error("Error deleting todo:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        error: "Failed to delete todo",
        details: error.message,
      })
    );
  }
};

const archiveExpiredGoals = async (req, res) => {
  try {
    const studentId = req.user.id;

    const result = await todoService.archiveExpiredGoals(studentId);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: result.message,
        archivedCount: result.archivedCount,
      })
    );
  } catch (error) {
    console.error("Error archiving expired goals:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        error: "Failed to archive expired goals",
        details: error.message,
      })
    );
  }
};

const getExpiredGoals = async (req, res) => {
  try {
    const studentId = req.user.id;

    const goals = await todoService.getExpiredGoals(studentId);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Expired goals retrieved successfully",
        expiredGoals: goals,
      })
    );
  } catch (error) {
    console.error("Error fetching expired goals:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        error: "Failed to fetch expired goals",
        details: error.message,
      })
    );
  }
};

const getParentTodos = async (req, res) => {
  try {
    const studentId = req.user.id;
    const db = require("../../db/db");

    // Get all parent-assigned todos for this student
    const result = await db.query(
      `SELECT id, parent_id, student_id, type, text, completed, expires_at, created_at, updated_at
       FROM parent_todos
       WHERE student_id = $1
       ORDER BY type ASC, created_at DESC`,
      [studentId]
    );

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Parent-assigned todos retrieved successfully",
        todos: result.rows,
      })
    );
  } catch (error) {
    console.error("Error fetching parent todos:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        error: "Failed to fetch parent todos",
        details: error.message,
      })
    );
  }
};

const updateParentTodoCompletion = async (req, res) => {
  try {
    const todoId = parseInt(req.url.split("/")[4]);
    const data = await parseRequestBody(req);
    let { completed } = data;

    // Convert string boolean to actual boolean
    if (typeof completed === "string") {
      completed = completed === "true";
    }

    const studentId = req.user.id;
    const db = require("../../db/db");

    // Verify that the student is assigned this todo
    const todo = await db.query(
      "SELECT * FROM parent_todos WHERE id = $1 AND student_id = $2",
      [todoId, studentId]
    );

    if (todo.rows.length === 0) {
      res.writeHead(404, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({
          error: "Todo not found or access denied",
        })
      );
    }

    // Update only the completed status
    const result = await db.query(
      `UPDATE parent_todos
       SET completed = $1, updated_at = NOW()
       WHERE id = $2 AND student_id = $3
       RETURNING id, parent_id, student_id, type, text, completed, expires_at, created_at, updated_at`,
      [completed, todoId, studentId]
    );

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Todo updated successfully",
        todo: result.rows[0],
      })
    );
  } catch (error) {
    console.error("Error updating parent todo:", error);
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        error: "Failed to update todo",
        details: error.message,
      })
    );
  }
};

module.exports = {
  createTodo,
  getTodos,
  getTodosByType,
  updateTodo,
  deleteTodo,
  archiveExpiredGoals,
  getExpiredGoals,
  getParentTodos,
  updateParentTodoCompletion,
};
