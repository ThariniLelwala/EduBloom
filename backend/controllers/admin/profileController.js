// controllers/admin/profileController.js
const profileService = require("../../services/admin/profileService");
const { parseRequestBody } = require("../../middleware/authMiddleware");

class ProfileController {
  async getProfile(req, res) {
    try {
      const user = await profileService.getById(req.user.id);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ user }));
    } catch (err) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async updateProfile(req, res) {
    try {
      const data = await parseRequestBody(req);
      const user = await profileService.update(req.user.id, data);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ user, message: "Profile updated" }));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async changePassword(req, res) {
    try {
      const { oldPassword, newPassword } = await parseRequestBody(req);
      if (!oldPassword || !newPassword) throw new Error("Passwords required");
      const result = await profileService.changePassword(req.user.id, oldPassword, newPassword);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }
}

module.exports = new ProfileController();
