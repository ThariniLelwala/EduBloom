// controllers/admin/announcementsController.js
const announcementsService = require("../../services/admin/announcementsService");
const { parseRequestBody } = require("../../middleware/authMiddleware");

class AnnouncementsController {
  /**
   * GET /api/admin/announcements
   */
  async getAllAnnouncements(req, res) {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const target_role = url.searchParams.get("target_role");

      const filters = {};
      if (target_role) filters.target_role = target_role;

      const announcements = await announcementsService.getAllAnnouncements(filters);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ announcements }));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * GET /api/admin/announcements/:id
   */
  async getAnnouncement(req, res) {
    try {
      const id = parseInt(req.url.split("/")[4]);

      if (isNaN(id)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Invalid announcement ID" }));
      }

      const announcement = await announcementsService.getAnnouncementById(id);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ announcement }));
    } catch (err) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * POST /api/admin/announcements
   */
  async createAnnouncement(req, res) {
    try {
      const data = await parseRequestBody(req);
      const { title, message, target_role, scheduled_at } = data;

      if (!title || !message) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Title and message are required" }));
      }

      // Get admin ID from JWT (set by authMiddleware)
      const created_by = req.user.id;

      const announcement = await announcementsService.createAnnouncement({
        title,
        message,
        target_role,
        scheduled_at,
        created_by,
      });

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ announcement, message: "Announcement created successfully" }));
    } catch (err) {
      console.error("createAnnouncement error:", err.message);
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * PATCH /api/admin/announcements/:id
   */
  async updateAnnouncement(req, res) {
    try {
      const id = parseInt(req.url.split("/")[4]);

      if (isNaN(id)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Invalid announcement ID" }));
      }

      const data = await parseRequestBody(req);
      const { title, message, target_role, scheduled_at } = data;

      const announcement = await announcementsService.updateAnnouncement(id, {
        title,
        message,
        target_role,
        scheduled_at,
      });

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ announcement, message: "Announcement updated successfully" }));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * DELETE /api/admin/announcements/:id
   */
  async deleteAnnouncement(req, res) {
    try {
      const id = parseInt(req.url.split("/")[4]);

      if (isNaN(id)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Invalid announcement ID" }));
      }

      const result = await announcementsService.deleteAnnouncement(id);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }
}

module.exports = new AnnouncementsController();