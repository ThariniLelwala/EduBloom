// controllers/parent/calendarController.js
const calendarService = require("../../services/parent/calendarService");
const { parseRequestBody } = require("../../middleware/authMiddleware");

class CalendarController {
  async createDeadline(req, res) {
    try {
      const data = await parseRequestBody(req);
      const result = await calendarService.createDeadline(
        req.user.id,
        data.student_id,
        data.title,
        data.date
      );

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async getDeadlines(req, res) {
    try {
      const studentId = parseInt(req.url.split("/")[5]);
      const result = await calendarService.getDeadlines(req.user.id, studentId);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async updateDeadline(req, res) {
    try {
      const deadlineId = parseInt(req.url.split("/")[5]);
      const data = await parseRequestBody(req);
      const result = await calendarService.updateDeadline(
        req.user.id,
        deadlineId,
        data
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async deleteDeadline(req, res) {
    try {
      const deadlineId = parseInt(req.url.split("/")[5]);
      const result = await calendarService.deleteDeadline(req.user.id, deadlineId);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async createParentTask(req, res) {
    try {
      const data = await parseRequestBody(req);
      const result = await calendarService.createParentOnlyTask(
        req.user.id,
        data.text
      );

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async getParentTasks(req, res) {
    try {
      const result = await calendarService.getParentOnlyTasks(req.user.id);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async updateParentTask(req, res) {
    try {
      const taskId = parseInt(req.url.split("/")[5]);
      const data = await parseRequestBody(req);
      const result = await calendarService.updateParentOnlyTask(
        req.user.id,
        taskId,
        data
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async deleteParentTask(req, res) {
    try {
      const taskId = parseInt(req.url.split("/")[5]);
      const result = await calendarService.deleteParentOnlyTask(req.user.id, taskId);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }
}

module.exports = new CalendarController();
