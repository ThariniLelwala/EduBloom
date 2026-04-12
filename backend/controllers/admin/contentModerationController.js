// controllers/admin/contentModerationController.js
const contentModerationService = require("../../services/admin/contentModerationService");
const { parseRequestBody } = require("../../middleware/authMiddleware");

class ContentModerationController {
  /**
   * Get all flagged content with filters
   * GET /api/admin/moderation
   */
  async getFlaggedContent(req, res) {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const status = url.searchParams.get("status");
      const content_type = url.searchParams.get("content_type");
      const reason = url.searchParams.get("reason");
      const search = url.searchParams.get("search");

      const filters = {};
      if (status) filters.status = status;
      if (content_type) filters.content_type = content_type;
      if (reason) filters.reason = reason;
      if (search) filters.search = search;

      const flaggedContent = await contentModerationService.getFlaggedContent(filters);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ flaggedContent }));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Get specific flagged content by ID
   * GET /api/admin/moderation/:id
   */
  async getFlaggedContentById(req, res) {
    try {
      const id = parseInt(req.url.split("/")[4]);

      if (isNaN(id)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Invalid ID" }));
      }

      const flaggedContent = await contentModerationService.getFlaggedContentById(id);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ flaggedContent }));
    } catch (err) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Get content moderation statistics
   * GET /api/admin/moderation/stats
   */
  async getStatistics(req, res) {
    try {
      const stats = await contentModerationService.getStatistics();

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(stats));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Dismiss a flag (keep content, remove flag)
   * POST /api/admin/moderation/:id/dismiss
   */
  async dismissFlag(req, res) {
    try {
      const id = parseInt(req.url.split("/")[4]);

      if (isNaN(id)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Invalid ID" }));
      }

      const result = await contentModerationService.dismissFlag(id);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Delete flagged content
   * DELETE /api/admin/moderation/:id
   */
  async deleteFlaggedContent(req, res) {
    try {
      const id = parseInt(req.url.split("/")[4]);

      if (isNaN(id)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Invalid ID" }));
      }

      const result = await contentModerationService.deleteFlaggedContent(id);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Create a new flag (submitted by user)
   * POST /api/admin/moderation/flag
   */
  async createFlag(req, res) {
    try {
      const data = await parseRequestBody(req);
      const { content_id, content_type, author_id, reason, description } = data;

      if (!content_id || !content_type || !author_id || !reason) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Missing required fields" }));
      }

      const flaggerId = req.user.id;

      const result = await contentModerationService.createFlag(
        content_id,
        content_type,
        author_id,
        flaggerId,
        reason,
        description
      );

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ flaggedContent: result, message: "Content flagged successfully" }));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }
}

module.exports = new ContentModerationController();
