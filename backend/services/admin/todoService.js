const db = require("../../db/db");

class AdminTodoService {
  async getAll() {
    const result = await db.query(
      "SELECT * FROM admin_todos ORDER BY created_at DESC"
    );
    return result.rows;
  }

  async create(text) {
    const result = await db.query(
      "INSERT INTO admin_todos (text) VALUES ($1) RETURNING *",
      [text]
    );
    return result.rows[0];
  }

  async update(id, text, completed) {
    const result = await db.query(
      "UPDATE admin_todos SET text = $1, completed = $2, updated_at = NOW() WHERE id = $3 RETURNING *",
      [text, completed, id]
    );
    return result.rows[0];
  }

  async delete(id) {
    await db.query("DELETE FROM admin_todos WHERE id = $1", [id]);
    return { message: "Task deleted" };
  }
}

module.exports = new AdminTodoService();