// controllers/admin/todoController.js
const { parseRequestBody } = require("../../middleware/authMiddleware");
const db = require("../../db/db");

/**
 * Create a new admin todo
 */
const createTodo = async (req, res) => {
  try {
    const data = await parseRequestBody(req);
    const { text } = data;
    const adminId = req.user.id;

    if (!text || !text.trim()) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Task text is required" }));
    }

    const result = await db.query(
      `INSERT INTO admin_todos (admin_id, text, completed, created_at, updated_at)
       VALUES ($1, $2, false, NOW(), NOW())
       RETURNING id, admin_id, text, completed, created_at, updated_at`,
      [adminId, text.trim()]
    );

    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      message: "Task created successfully",
      todo: result.rows[0]
    }));
  } catch (error) {
    console.error("Error creating admin todo:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Failed to create task", details: error.message }));
  }
};

/**
 * Get all todos for the logged-in admin
 */
const getTodos = async (req, res) => {
  try {
    const adminId = req.user.id;

    const result = await db.query(
      `SELECT id, admin_id, text, completed, created_at, updated_at
       FROM admin_todos
       WHERE admin_id = $1
       ORDER BY created_at DESC`,
      [adminId]
    );

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      message: "Tasks retrieved successfully",
      todos: result.rows
    }));
  } catch (error) {
    console.error("Error fetching admin todos:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Failed to fetch tasks", details: error.message }));
  }
};

/**
 * Update a todo (text or completion status)
 */
const updateTodo = async (req, res) => {
  try {
    const todoId = parseInt(req.url.split("/")[4]);
    const data = await parseRequestBody(req);
    const adminId = req.user.id;
    const { text, completed } = data;

    if (isNaN(todoId)) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Invalid task ID" }));
    }

    // Verify ownership
    const todoCheck = await db.query(
      "SELECT * FROM admin_todos WHERE id = $1 AND admin_id = $2",
      [todoId, adminId]
    );

    if (todoCheck.rows.length === 0) {
      res.writeHead(404, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Task not found or access denied" }));
    }

    const result = await db.query(
      `UPDATE admin_todos
       SET text = COALESCE($1, text),
           completed = COALESCE($2, completed),
           updated_at = NOW()
       WHERE id = $3 AND admin_id = $4
       RETURNING id, admin_id, text, completed, created_at, updated_at`,
      [text ? text.trim() : null, completed !== undefined ? completed : null, todoId, adminId]
    );

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      message: "Task updated successfully",
      todo: result.rows[0]
    }));
  } catch (error) {
    console.error("Error updating admin todo:", error);
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Failed to update task", details: error.message }));
  }
};

/**
 * Delete a todo
 */
const deleteTodo = async (req, res) => {
  try {
    const todoId = parseInt(req.url.split("/")[4]);
    const adminId = req.user.id;

    if (isNaN(todoId)) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Invalid task ID" }));
    }

    const result = await db.query(
      "DELETE FROM admin_todos WHERE id = $1 AND admin_id = $2 RETURNING id",
      [todoId, adminId]
    );

    if (result.rows.length === 0) {
      res.writeHead(404, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Task not found or access denied" }));
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Task deleted successfully" }));
  } catch (error) {
    console.error("Error deleting admin todo:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Failed to delete task", details: error.message }));
  }
};

module.exports = {
  createTodo,
  getTodos,
  updateTodo,
  deleteTodo,
};
