// controllers/parent/todoController.js
const todoService = require("../../services/parent/todoService");
const { parseRequestBody } = require("../../middleware/authMiddleware");

class TodoController {
  /**
   * Create a new todo item
   * POST /api/parent/todos
   */
  async createTodo(req, res) {
    try {
      const data = await parseRequestBody(req);
      const result = await todoService.createTodo(
        req.user.id,
        data.student_id,
        data.type,
        data.text
      );

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Get all todos for a student
   * GET /api/parent/students/:studentId/todos
   */
  async getTodos(req, res) {
    try {
      const studentId = parseInt(req.url.split("/")[4]);
      const result = await todoService.getTodos(req.user.id, studentId);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Get todos by type for a student
   * GET /api/parent/students/:studentId/todos/:type
   */
  async getTodosByType(req, res) {
    try {
      const studentId = parseInt(req.url.split("/")[4]);
      const type = req.url.split("/")[6];
      const result = await todoService.getTodosByType(
        req.user.id,
        studentId,
        type
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Update a todo item
   * PUT /api/parent/todos/:todoId
   */
  async updateTodo(req, res) {
    try {
      const todoId = parseInt(req.url.split("/")[4]);
      const data = await parseRequestBody(req);
      const result = await todoService.updateTodo(req.user.id, todoId, data);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Delete a todo item
   * DELETE /api/parent/todos/:todoId
   */
  async deleteTodo(req, res) {
    try {
      const todoId = parseInt(req.url.split("/")[4]);
      const result = await todoService.deleteTodo(req.user.id, todoId);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Get all students for this parent
   * GET /api/parent/students
   */
  async getParentStudents(req, res) {
    try {
      const result = await todoService.getParentStudents(req.user.id);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Archive expired weekly and monthly goals
   * POST /api/parent/archive-expired-goals
   */
  async archiveExpiredGoals(req, res) {
    try {
      const result = await todoService.archiveExpiredGoals();

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Get expired goals for a specific student
   * GET /api/parent/students/:studentId/expired-goals
   */
  async getExpiredGoals(req, res) {
    try {
      const studentId = parseInt(req.url.split("/")[4]);
      const result = await todoService.getExpiredGoals(req.user.id, studentId);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }
}

module.exports = new TodoController();
