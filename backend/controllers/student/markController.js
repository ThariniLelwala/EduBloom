// controllers/student/markController.js
const markService = require("../../services/student/markService");
const { parseRequestBody } = require("../../middleware/authMiddleware");

class MarkController {
  async createSubject(req, res) {
    try {
      const data = await parseRequestBody(req);
      const result = await markService.createSubject(req.user.id, data.name);
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async getSubjects(req, res) {
    try {
      const result = await markService.getSubjects(req.user.id);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async getSubject(req, res) {
    try {
      const id = parseInt(req.url.split("/")[5]);
      const result = await markService.getSubject(id, req.user.id);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

    async updateSubject(req, res) {
    try {
      const id = parseInt(req.url.split("/")[5]);
      const data = await parseRequestBody(req);
      const result = await markService.updateSubject(id, req.user.id, data.name);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async deleteSubject(req, res) {
    try {
      const id = parseInt(req.url.split("/")[5]);
      const result = await markService.deleteSubject(id, req.user.id);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async createTest(req, res) {
    try {
      const id = parseInt(req.url.split("/")[5]);
      const data = await parseRequestBody(req);
      const result = await markService.createTest(id, req.user.id, data.name, data.mark);
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async updateTest(req, res) {
    try {
      const id = parseInt(req.url.split("/")[5]);
      const data = await parseRequestBody(req);
      const result = await markService.updateTest(id, req.user.id, data);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async deleteTest(req, res) {
    try {
      const id = parseInt(req.url.split("/")[5]);
      const result = await markService.deleteTest(id, req.user.id);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }
}

module.exports = new MarkController();
