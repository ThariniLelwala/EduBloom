// controllers/admin/forumManagementController.js
const forumManagementService = require("../../services/admin/forumManagementService");

class ForumManagementController {
  async getStatistics(req, res) {
    try {
      const stats = await forumManagementService.getStatistics();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(stats));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async getAllForums(req, res) {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const filters = {
        search: url.searchParams.get("search"),
        creatorRole: url.searchParams.get("creatorRole"),
        status: url.searchParams.get("status"),
        includeUnpublished: url.searchParams.get("includeUnpublished")
      };

      const forums = await forumManagementService.getAllForums(filters);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ forums }));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async getPendingApprovals(req, res) {
    try {
      const approvals = await forumManagementService.getPendingApprovals();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ approvals }));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async getForum(req, res) {
    try {
      const id = parseInt(req.url.split("/")[5]);
      if (isNaN(id)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Invalid forum ID" }));
      }

      const forum = await forumManagementService.getForumById(id);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ forum }));
    } catch (err) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async approveForum(req, res) {
    try {
      const id = parseInt(req.url.split("/")[5]);
      if (isNaN(id)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Invalid forum ID" }));
      }

      const result = await forumManagementService.approveForum(id);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async rejectForum(req, res) {
    try {
      const id = parseInt(req.url.split("/")[5]);
      if (isNaN(id)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Invalid forum ID" }));
      }

      const result = await forumManagementService.rejectForum(id);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async deleteForum(req, res) {
    try {
      const id = parseInt(req.url.split("/")[5]);
      if (isNaN(id)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Invalid forum ID" }));
      }

      const result = await forumManagementService.deleteForum(id);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }
}

module.exports = new ForumManagementController();
