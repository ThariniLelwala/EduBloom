// controllers/admin/forumController.js
const forumService = require("../../services/admin/forumService");
const { parseRequestBody } = require("../../middleware/authMiddleware");

class ForumController {
  /**
   * Get all forums
   * GET /api/admin/forums
   */
  async getAllForums(req, res) {
    try {
      const forums = await forumService.getAllForums();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ forums }));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Get forum statistics
   * GET /api/admin/forums/statistics
   */
  async getStatistics(req, res) {
    try {
      const stats = await forumService.getStatistics();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(stats));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Get single forum
   * GET /api/admin/forums/:id
   */
  async getForum(req, res) {
    try {
      let pathname = req.url.split("?")[0];
      if (pathname.endsWith("/") && pathname.length > 1) {
        pathname = pathname.slice(0, -1);
      }
      const match = pathname.match(/\/api\/admin\/forums\/(\d+)$/);
      if (!match) {
        throw new Error("Invalid forum ID");
      }
      const forumId = parseInt(match[1]);
      const forum = await forumService.getForumById(forumId);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ forum }));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Get pending deletion requests
   * GET /api/admin/forums/pending-deletions
   */
  async getPendingDeletions(req, res) {
    try {
      const requests = await forumService.getPendingDeletions();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ requests }));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Approve forum deletion
   * POST /api/admin/forums/:id/approve-delete
   */
  async approveDelete(req, res) {
    try {
      let pathname = req.url.split("?")[0];
      if (pathname.endsWith("/") && pathname.length > 1) {
        pathname = pathname.slice(0, -1);
      }
      const match = pathname.match(/\/api\/admin\/forums\/(\d+)\/approve-delete$/);
      if (!match) {
        throw new Error("Invalid forum ID");
      }
      const forumId = parseInt(match[1]);
      const result = await forumService.approveDeletion(forumId);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Reject forum deletion request
   * POST /api/admin/forums/:id/reject-delete
   */
  async rejectDelete(req, res) {
    try {
      let pathname = req.url.split("?")[0];
      if (pathname.endsWith("/") && pathname.length > 1) {
        pathname = pathname.slice(0, -1);
      }
      const match = pathname.match(/\/api\/admin\/forums\/(\d+)\/reject-delete$/);
      if (!match) {
        throw new Error("Invalid forum ID");
      }
      const forumId = parseInt(match[1]);
      const result = await forumService.rejectDeletion(forumId);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

}

module.exports = new ForumController();