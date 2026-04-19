// controllers/admin/contentModerationController.js
const contentModerationService = require("../../services/admin/contentModerationService");

class ContentModerationController {
  /**
   * Get all flagged content
   * GET /api/admin/moderation/flagged
   */
  async getFlaggedContent(req, res) {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const filters = {
        status: url.searchParams.get("status") || "pending",
        contentType: url.searchParams.get("contentType") || null,
        reason: url.searchParams.get("reason") || null
      };

      const flagged = await contentModerationService.getFlaggedContent(filters);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ flagged }));
    } catch (err) {
      console.error("getFlaggedContent error:", err);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ flagged: [], error: err.message }));
    }
  }

  /**
   * Get content moderation statistics
   * GET /api/admin/moderation/statistics
   */
  async getStatistics(req, res) {
    try {
      const stats = await contentModerationService.getStatistics();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(stats));
    } catch (err) {
      console.error("getStatistics error:", err);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        totalQuizzes: 0,
        totalForums: 0,
        totalNotes: 0,
        pendingReview: 0,
        todayUploads: 0,
        engagedUsers: 0,
        error: err.message
      }));
    }
  }

  /**
   * Dismiss a flag
   * POST /api/admin/moderation/flag/:id/dismiss
   */
  async dismissFlag(req, res) {
    try {
      let pathname = req.url.split("?")[0];
      if (pathname.endsWith("/") && pathname.length > 1) {
        pathname = pathname.slice(0, -1);
      }
      const match = pathname.match(/\/api\/admin\/moderation\/flag\/(\d+)\/dismiss$/);
      if (!match) {
        throw new Error("Invalid flag ID");
      }
      const flagId = parseInt(match[1]);
      const result = await contentModerationService.dismissFlag(flagId);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      console.error("dismissFlag error:", err);
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Delete flagged content
   * POST /api/admin/moderation/flag/:id/delete
   */
  async deleteContent(req, res) {
    try {
      let pathname = req.url.split("?")[0];
      if (pathname.endsWith("/") && pathname.length > 1) {
        pathname = pathname.slice(0, -1);
      }
      const match = pathname.match(/\/api\/admin\/moderation\/flag\/(\d+)\/delete$/);
      if (!match) {
        throw new Error("Invalid flag ID");
      }
      const flagId = parseInt(match[1]);
      const result = await contentModerationService.deleteContent(flagId);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      console.error("deleteContent error:", err);
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }
}

module.exports = new ContentModerationController();