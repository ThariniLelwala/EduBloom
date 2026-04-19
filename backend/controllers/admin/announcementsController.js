// controllers/admin/announcementsController.js
const announcementsService = require("../../services/admin/announcementsService");

class AnnouncementsController {
  /**
   * Get all announcements
   * GET /api/admin/announcements
   */
  async getAllAnnouncements(req, res) {
    try {
      const announcements = await announcementsService.getAllAnnouncements();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ announcements }));
    } catch (err) {
      console.error("getAllAnnouncements error:", err);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ announcements: [] }));
    }
  }

  /**
   * Create announcement
   * POST /api/admin/announcements
   */
  async createAnnouncement(req, res) {
    try {
      const { title, message, targetRole } = req.body || {};
      if (!title || !message) {
        throw new Error("Title and message are required");
      }
      
      const createdBy = req.user?.id || null;

      const announcement = await announcementsService.createAnnouncement(title, message, targetRole, createdBy);
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ announcement }));
    } catch (err) {
      console.error("createAnnouncement error:", err);
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Update announcement
   * PUT /api/admin/announcements/:id
   */
  async updateAnnouncement(req, res) {
    try {
      let pathname = req.url.split("?")[0];
      if (pathname.endsWith("/") && pathname.length > 1) {
        pathname = pathname.slice(0, -1);
      }
      const match = pathname.match(/\/api\/admin\/announcements\/(\d+)$/);
      if (!match) {
        throw new Error("Invalid announcement ID");
      }
      
      const id = parseInt(match[1]);
      const { title, message, targetRole } = req.body || {};
      
      if (!title || !message) {
        throw new Error("Title and message are required");
      }

      const announcement = await announcementsService.updateAnnouncement(id, title, message, targetRole);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ announcement }));
    } catch (err) {
      console.error("updateAnnouncement error:", err);
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Delete announcement
   * DELETE /api/admin/announcements/:id
   */
  async deleteAnnouncement(req, res) {
    try {
      let pathname = req.url.split("?")[0];
      if (pathname.endsWith("/") && pathname.length > 1) {
        pathname = pathname.slice(0, -1);
      }
      const match = pathname.match(/\/api\/admin\/announcements\/(\d+)$/);
      if (!match) {
        throw new Error("Invalid announcement ID");
      }
      
      const id = parseInt(match[1]);
      const result = await announcementsService.deleteAnnouncement(id);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      console.error("deleteAnnouncement error:", err);
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }
}

module.exports = new AnnouncementsController();