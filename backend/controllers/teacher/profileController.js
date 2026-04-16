// controllers/teacher/profileController.js
const profileService = require("../../services/teacher/profileService");
const { parseRequestBody } = require("../../middleware/authMiddleware");

class ProfileController {
  /**
   * Get teacher's own profile
   * GET /api/teacher/profile
   */
  async getProfile(req, res) {
    try {
      const teacherId = req.user.id;
      const profile = await profileService.getProfile(teacherId);

      if (!profile) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Profile not found" }));
        return;
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ profile }));
    } catch (err) {
      console.error("[ProfileController] getProfile error:", err.message);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Failed to fetch profile" }));
    }
  }

  /**
   * Create or update teacher profile
   * PUT /api/teacher/profile
   */
  async updateProfile(req, res) {
    try {
      const teacherId = req.user.id;
      const data = await parseRequestBody(req);

      const profile = await profileService.upsertProfile(teacherId, data);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Profile updated successfully",
          profile,
        })
      );
    } catch (err) {
      console.error("[ProfileController] updateProfile error:", err.message);
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Get public profile for a teacher (for students to view)
   * GET /api/teacher/:teacherId/profile
   */
  async getPublicProfile(req, res) {
    try {
      const pathname = req.url.split("?")[0];
      const teacherId = parseInt(pathname.split("/")[4]);

      if (!teacherId || isNaN(teacherId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid teacher ID" }));
        return;
      }

      const profile = await profileService.getPublicProfile(teacherId);

      if (!profile) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Teacher profile not found" }));
        return;
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ profile }));
    } catch (err) {
      console.error("[ProfileController] getPublicProfile error:", err.message);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Failed to fetch teacher profile" }));
    }
  }

  /**
   * Get all public teachers (for students/parents to browse)
   * GET /api/public/teachers
   */
  async getAllPublicTeachers(req, res) {
    try {
      const urlParams = new URL(req.url, `http://${req.headers.host}`).searchParams;
      const filters = {
        subject: urlParams.get("subject"),
        rating: urlParams.get("rating"),
        grade: urlParams.get("grade"),
      };

      const teachers = await profileService.getAllPublicTeachers(filters);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Teachers retrieved successfully",
          teachers,
        })
      );
    } catch (err) {
      console.error("[ProfileController] getAllPublicTeachers error:", err.message);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Failed to fetch teachers" }));
    }
  }
}

module.exports = new ProfileController();