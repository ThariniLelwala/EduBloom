// controllers/admin/helpController.js
const helpService = require("../../services/admin/helpService");
const { parseRequestBody } = require("../../middleware/authMiddleware");

class HelpController {
  async getFAQs(req, res) {
    try {
      const faqs = await helpService.getAllFAQs();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ faqs }));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async createFAQ(req, res) {
    try {
      const { question, answer, target_role } = await parseRequestBody(req);
      if (!question || !answer) throw new Error("Question and answer required");
      const faq = await helpService.createFAQ(question, answer, target_role || null);
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ faq, message: "FAQ created" }));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async updateFAQ(req, res) {
    try {
      const id = parseInt(req.url.split("/")[5]);
      const { question, answer, target_role } = await parseRequestBody(req);
      if (!question || !answer) throw new Error("Question and answer required");
      if (isNaN(id)) throw new Error("Invalid FAQ ID");
      const faq = await helpService.updateFAQ(id, question, answer, target_role || null);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ faq, message: "FAQ updated" }));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async deleteFAQ(req, res) {
    try {
      const id = parseInt(req.url.split("/")[5]);
      if (isNaN(id)) throw new Error("Invalid FAQ ID");
      await helpService.deleteFAQ(id);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "FAQ deleted" }));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async getRequests(req, res) {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const status = url.searchParams.get("status");
      const requests = await helpService.getAllRequests(status);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ requests }));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async replyToRequest(req, res) {
    try {
      const id = parseInt(req.url.split("/")[5]);
      const { reply } = await parseRequestBody(req);
      if (!reply) throw new Error("Reply required");
      if (isNaN(id)) throw new Error("Invalid request ID");
      const request = await helpService.replyToRequest(id, reply);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ request, message: "Reply sent" }));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async resolveRequest(req, res) {
    try {
      const id = parseInt(req.url.split("/")[5]);
      if (isNaN(id)) throw new Error("Invalid request ID");
      const request = await helpService.resolveRequest(id);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ request, message: "Request resolved" }));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }
}

module.exports = new HelpController();
