// controllers/teacher/todoController.js
const { parseRequestBody } = require("../../middleware/authMiddleware");
const db = require("../../db/db");

/**
 * Create a new teacher todo or deadline
 */
const createTodo = async (req, res) => {
  try {
    const data = await parseRequestBody(req);
    const { type, text, expiresAt } = data;
    const teacherId = req.user.id;

    if (!type || !text) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Type and text are required" }));
    }

    if (!["todo", "deadline"].includes(type)) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Type must be 'todo' or 'deadline'" }));
    }

    const result = await db.query(
      `INSERT INTO teacher_todos (teacher_id, type, text, completed, expires_at, created_at, updated_at)
       VALUES ($1, $2, $3, false, $4, NOW(), NOW())
       RETURNING id, teacher_id, type, text, completed, expires_at, created_at, updated_at`,
      [teacherId, type, text, expiresAt]
    );

    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      message: "Todo created successfully",
      todo: result.rows[0]
    }));
  } catch (error) {
    console.error("Error creating teacher todo:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Failed to create todo", details: error.message }));
  }
};

/**
 * Get all todos for the logged-in teacher
 */
const getTodos = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const result = await db.query(
      `SELECT id, teacher_id, type, text, completed, expires_at, created_at, updated_at
       FROM teacher_todos
       WHERE teacher_id = $1
       ORDER BY created_at DESC`,
      [teacherId]
    );

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      message: "Todos retrieved successfully",
      todos: result.rows
    }));
  } catch (error) {
    console.error("Error fetching teacher todos:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Failed to fetch todos", details: error.message }));
  }
};

/**
 * Update a todo (text, completion status, or date)
 */
const updateTodo = async (req, res) => {
  try {
    const todoId = parseInt(req.url.split("/")[4]);
    const data = await parseRequestBody(req);
    const teacherId = req.user.id;
    const { text, completed, expiresAt } = data;

    // Verify ownership
    const todoCheck = await db.query(
      "SELECT * FROM teacher_todos WHERE id = $1 AND teacher_id = $2",
      [todoId, teacherId]
    );

    if (todoCheck.rows.length === 0) {
      res.writeHead(404, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Todo not found or access denied" }));
    }

    const result = await db.query(
      `UPDATE teacher_todos
       SET text = COALESCE($1, text),
           completed = COALESCE($2, completed),
           expires_at = COALESCE($3, expires_at),
           updated_at = NOW()
       WHERE id = $4 AND teacher_id = $5
       RETURNING id, teacher_id, type, text, completed, expires_at, created_at, updated_at`,
      [text, completed, expiresAt, todoId, teacherId]
    );

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      message: "Todo updated successfully",
      todo: result.rows[0]
    }));
  } catch (error) {
    console.error("Error updating teacher todo:", error);
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Failed to update todo", details: error.message }));
  }
};

/**
 * Delete a todo
 */
const deleteTodo = async (req, res) => {
  try {
    const todoId = parseInt(req.url.split("/")[4]);
    const teacherId = req.user.id;

    // Verify ownership
    const result = await db.query(
      "DELETE FROM teacher_todos WHERE id = $1 AND teacher_id = $2 RETURNING id",
      [todoId, teacherId]
    );

    if (result.rows.length === 0) {
      res.writeHead(404, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Todo not found or access denied" }));
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Todo deleted successfully" }));
  } catch (error) {
    console.error("Error deleting teacher todo:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Failed to delete todo", details: error.message }));
  }
};

module.exports = {
  createTodo,
  getTodos,
  updateTodo,
  deleteTodo,
};
