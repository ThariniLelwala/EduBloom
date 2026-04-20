// controllers/student/forumController.js
const studentForumService = require("../../services/student/forumService");
const { parseRequestBody } = require("../../middleware/authMiddleware");

class StudentForumController {
  async getStudentForums(req, res) {
    try {
      const studentId = req.user.id;
      const forums = await studentForumService.getStudentForums(studentId);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(forums));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async getStats(req, res) {
    try {
      const studentId = req.user.id;
      const stats = await studentForumService.getStudentStats(studentId);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(stats));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async getStudentForum(req, res) {
    try {
      const studentId = req.user.id;
      const pathname = req.url.split("?")[0];
      const forumId = parseInt(pathname.split("/")[4]);

      if (isNaN(forumId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid forum ID" }));
        return;
      }

      const forum = await studentForumService.getStudentForumById(studentId, forumId);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(forum));
    } catch (err) {
      res.writeHead(err.message === "Forum not found" ? 404 : 500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async createForum(req, res) {
    try {
      const studentId = req.user.id;
      const data = await parseRequestBody(req);
      const { title, description, tags } = data;

      if (!title || !description) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Title and description are required" }));
        return;
      }

      const forum = await studentForumService.createForum(studentId, title, description, tags || []);
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(forum));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async addReply(req, res) {
    try {
      const studentId = req.user.id;
      const pathname = req.url.split("?")[0];
      const forumId = parseInt(pathname.split("/")[4]);
      const data = await parseRequestBody(req);
      const { content } = data;

      if (isNaN(forumId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid forum ID" }));
        return;
      }

      if (!content) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Content is required" }));
        return;
      }

      const reply = await studentForumService.addReply(studentId, forumId, content);
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(reply));
    } catch (err) {
      res.writeHead(err.message === "Forum not found or access denied" ? 403 : 500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async deleteForum(req, res) {
    try {
      const studentId = req.user.id;
      const pathname = req.url.split("?")[0];
      const forumId = parseInt(pathname.split("/")[4]);

      if (isNaN(forumId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid forum ID" }));
        return;
      }

      const result = await studentForumService.deleteForum(studentId, forumId);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(err.message === "Forum not found or access denied" ? 403 : 500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async getMyForums(req, res) {
    try {
      const studentId = req.user.id;
      const forums = await studentForumService.getMyForums(studentId);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(forums));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async updateForum(req, res) {
    try {
      const studentId = req.user.id;
      const pathname = req.url.split("?")[0];
      const forumId = parseInt(pathname.split("/")[4]);
      const data = await parseRequestBody(req);
      const { title, description, tags } = data;

      if (isNaN(forumId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid forum ID" }));
        return;
      }

      if (!title || !description) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Title and description are required" }));
        return;
      }

      const forum = await studentForumService.updateForum(studentId, forumId, title, description, tags || []);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(forum));
    } catch (err) {
      res.writeHead(err.message === "Forum not found or access denied" ? 403 : 500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async archiveForum(req, res) {
    try {
      const studentId = req.user.id;
      const pathname = req.url.split("?")[0];
      const forumId = parseInt(pathname.split("/")[4]);

      if (isNaN(forumId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid forum ID" }));
        return;
      }

      const result = await studentForumService.archiveForum(studentId, forumId);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(err.message === "Forum not found or access denied" ? 403 : 500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async unarchiveForum(req, res) {
    try {
      const studentId = req.user.id;
      const pathname = req.url.split("?")[0];
      const forumId = parseInt(pathname.split("/")[4]);

      if (isNaN(forumId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid forum ID" }));
        return;
      }

      const result = await studentForumService.unarchiveForum(studentId, forumId);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(err.message === "Forum not found or access denied" ? 403 : 500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async requestDeletion(req, res) {
    try {
      const studentId = req.user.id;
      const pathname = req.url.split("?")[0];
      const forumId = parseInt(pathname.split("/")[4]);
      const data = await parseRequestBody(req);
      const { reason } = data;

      if (isNaN(forumId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid forum ID" }));
        return;
      }

      if (!reason) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Reason is required" }));
        return;
      }

      const result = await studentForumService.requestDeletion(studentId, forumId, reason);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(err.message.includes("not found") ? 403 : 500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }
}

module.exports = new StudentForumController();
