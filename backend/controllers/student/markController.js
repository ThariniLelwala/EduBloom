// controllers/student/markController.js
const markService = require("../../services/student/markService");
const { parseRequestBody } = require("../../middleware/authMiddleware");

class MarkController {
  async createSubject(req, res) {
    try {
      const data = await parseRequestBody(req);
      const { name } = data;

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

      const result = await markService.createSubject(req.user.id, name);
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

      if (!id || isNaN(id)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid subject ID" }));
        return;
      }

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

      if (!id || isNaN(id)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid subject ID" }));
        return;
      }

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
      const { name, mark } = data;

      if (!id || isNaN(id)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid subject ID" }));
        return;
      }

      if (!name) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Test name is required" }));
        return;
      }

      if (name.length > 100) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Test name must be 100 characters or less" }));
        return;
      }

      if (mark === undefined || mark === null) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Mark is required" }));
        return;
      }

      const markNum = parseFloat(mark);
      if (isNaN(markNum) || markNum < 0 || markNum > 100) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Mark must be between 0 and 100" }));
        return;
      }

      const result = await markService.createTest(id, req.user.id, name, markNum);
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

      if (!id || isNaN(id)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid test ID" }));
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

      if (!id || isNaN(id)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid test ID" }));
        return;
      }

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
