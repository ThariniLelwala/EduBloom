// controllers/student/helpController.js
const helpService = require("../../services/admin/helpService");
const { parseRequestBody } = require("../../middleware/authMiddleware");

class StudentHelpController {
  async submitRequest(req, res) {
    try {
      const { topic, message } = await parseRequestBody(req);
      if (!topic || !message) throw new Error("Topic and message are required");
      const request = await helpService.createRequest(req.user.id, topic, message);
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ request, message: "Request submitted successfully" }));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async getMyRequests(req, res) {
    try {
      const requests = await helpService.getRequestsByUser(req.user.id);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ requests }));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }
}

module.exports = new StudentHelpController();
