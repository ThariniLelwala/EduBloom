// controllers/admin/announcementController.js
const announcementService = require("../../services/admin/announcementService");
const { parseRequestBody } = require("../../middleware/authMiddleware");

class AnnouncementController {
  async getAll(req, res) {
    try {
      const announcements = await announcementService.getAll();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ announcements }));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async getById(req, res) {
    try {
      const id = parseInt(req.url.split("/")[4]);
      if (isNaN(id)) throw new Error("Invalid ID");
      const announcement = await announcementService.getById(id);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ announcement }));
    } catch (err) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async create(req, res) {
    try {
      const { title, message } = await parseRequestBody(req);
      if (!title || !message) throw new Error("Title and message are required");
      const announcement = await announcementService.create(req.user.id, title, message);
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ announcement, message: "Announcement created" }));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async update(req, res) {
    try {
      const id = parseInt(req.url.split("/")[4]);
      if (isNaN(id)) throw new Error("Invalid ID");
      const { title, message } = await parseRequestBody(req);
      if (!title || !message) throw new Error("Title and message are required");
      const announcement = await announcementService.update(id, title, message);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ announcement, message: "Announcement updated" }));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async delete(req, res) {
    try {
      const id = parseInt(req.url.split("/")[4]);
      if (isNaN(id)) throw new Error("Invalid ID");
      await announcementService.delete(id);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Announcement deleted" }));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }
}

module.exports = new AnnouncementController();
