// controllers/admin/verificationController.js
const verificationService = require("../../services/admin/verificationService");
const { parseRequestBody } = require("../../middleware/authMiddleware");

class VerificationController {
  async getPending(req, res) {
    try {
      const data = await verificationService.getPending();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ verifications: data }));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async getAll(req, res) {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const status = url.searchParams.get("status");
      const data = await verificationService.getAll(status);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ verifications: data }));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async getById(req, res) {
    try {
      const id = parseInt(req.url.split("/")[4]);
      const data = await verificationService.getById(id);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ verification: data }));
    } catch (err) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async approve(req, res) {
    try {
      const id = parseInt(req.url.split("/")[4]);
      const result = await verificationService.approve(id);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async reject(req, res) {
    try {
      const id = parseInt(req.url.split("/")[4]);
      const { reason } = await parseRequestBody(req);
      const result = await verificationService.reject(id, reason);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async getStats(req, res) {
    try {
      const stats = await verificationService.getStats();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(stats));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }
}

module.exports = new VerificationController();
