// controllers/student/examController.js
const examService = require("../../services/student/examService");
const { parseRequestBody } = require("../../middleware/authMiddleware");

class ExamController {
  async createTerm(req, res) {
    try {
      const data = await parseRequestBody(req);
      const { name } = data;

      if (!name) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Term name is required" }));
        return;
      }

      if (name.length > 100) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Term name must be 100 characters or less" }));
        return;
      }

      const result = await examService.createTerm(req.user.id, name);
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

      if (!id || isNaN(id)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid term ID" }));
        return;
      }

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

      if (!id || isNaN(id)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid term ID" }));
        return;
      }

      if (data.name && data.name.length > 100) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Term name must be 100 characters or less" }));
        return;
      }

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

      if (!id || isNaN(id)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid term ID" }));
        return;
      }

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
      const { name, mark } = data;

      if (!id || isNaN(id)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid term ID" }));
        return;
      }

      if (!name) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Subject name is required" }));
        return;
      }

      if (name.length > 100) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Subject name must be 100 characters or less" }));
        return;
      }

      if (mark !== undefined && mark !== null) {
        const markNum = parseFloat(mark);
        if (isNaN(markNum) || markNum < 0 || markNum > 100) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Mark must be between 0 and 100" }));
          return;
        }
      }

      const result = await examService.createSubject(id, req.user.id, name, mark || null);
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

      if (!id || isNaN(id)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid subject ID" }));
        return;
      }

      if (data.name && data.name.length > 100) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Subject name must be 100 characters or less" }));
        return;
      }

      if (data.mark !== undefined && data.mark !== null) {
        const markNum = parseFloat(data.mark);
        if (isNaN(markNum) || markNum < 0 || markNum > 100) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Mark must be between 0 and 100" }));
          return;
        }
      }

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

      if (!id || isNaN(id)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid subject ID" }));
        return;
      }

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
