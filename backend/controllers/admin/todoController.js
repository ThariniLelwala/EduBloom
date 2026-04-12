const todoService = require("../../services/admin/todoService");
const { parseRequestBody } = require("../../middleware/authMiddleware");

class AdminTodoController {
  async getAll(req, res) {
    try {
      const todos = await todoService.getAll();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ todos }));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async create(req, res) {
    try {
      const { text } = await parseRequestBody(req);
      if (!text) throw new Error("Task text is required");
      const todo = await todoService.create(text);
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ todo }));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async update(req, res) {
    try {
      const id = parseInt(req.url.split("/").pop());
      const { text, completed } = await parseRequestBody(req);
      const todo = await todoService.update(id, text, completed);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ todo }));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async delete(req, res) {
    try {
      const id = parseInt(req.url.split("/").pop());
      const result = await todoService.delete(id);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }
}

module.exports = new AdminTodoController();