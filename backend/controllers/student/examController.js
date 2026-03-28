// controllers/student/examController.js
const examService = require("../../services/student/examService");
const { parseRequestBody } = require("../../middleware/authMiddleware");

class ExamController {
  async createTerm(req, res) {
    try {
      const data = await parseRequestBody(req);
      const result = await examService.createTerm(req.user.id, data.name);
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async getTerms(req, res) {
    try {
      const result = await examService.getTerms(req.user.id);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async getTerm(req, res) {
    try {
      const id = parseInt(req.url.split("/")[5]);
      const result = await examService.getTerm(id, req.user.id);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async updateTerm(req, res) {
    try {
      const id = parseInt(req.url.split("/")[5]);
      const data = await parseRequestBody(req);
      const result = await examService.updateTerm(id, req.user.id, data.name);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async deleteTerm(req, res) {
    try {
      const id = parseInt(req.url.split("/")[5]);
      const result = await examService.deleteTerm(id, req.user.id);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async createSubject(req, res) {
    try {
      const id = parseInt(req.url.split("/")[5]);
      const data = await parseRequestBody(req);
      const result = await examService.createSubject(id, req.user.id, data.name, data.mark);
      res.writeHead(201, { "Content-Type": "application/json" });
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
      const result = await examService.updateSubject(id, req.user.id, data);
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
      const result = await examService.deleteSubject(id, req.user.id);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }
}

module.exports = new ExamController();
