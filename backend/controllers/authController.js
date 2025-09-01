// controllers/authController.js
const authService = require("../services/authService");
const { parseRequestBody } = require("../middleware/authMiddleware");
const db = require("../db/db");

class AuthController {
  async register(req, res) {
    try {
      const data = await parseRequestBody(req);
      const result = await authService.register(data);

      let message = `${result.user.role} registration successful`;
      if (result.user.role === "parent" && result.linkCreated) {
        message = "Parent registered and link request sent to student";
      }

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message,
          user: {
            id: result.user.id,
            username: result.user.username,
            email: result.user.email,
            role: result.user.role,
            student_type: result.user.student_type,
          },
        })
      );
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async login(req, res) {
    try {
      const data = await parseRequestBody(req);
      const result = await authService.login(data);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Login successful",
          user: result,
        })
      );
    } catch (err) {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async logout(req, res) {
    try {
      const user = req.user;

      // Clear token from database
      await db.query("UPDATE users SET token = NULL WHERE id = $1", [user.id]);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Logout successful" }));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async getProfile(req, res) {
    try {
      const user = req.user;

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            student_type: user.student_type,
          },
        })
      );
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async listPendingRequests(req, res) {
    try {
      const data = await parseRequestBody(req);
      const { student_id } = data;

      if (!student_id) {
        throw new Error("Student ID is required");
      }

      const requests = await authService.listPendingParentRequests(student_id);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ requests }));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async respondToRequest(req, res) {
    try {
      const data = await parseRequestBody(req);
      const { link_id, action, student_id } = data;

      if (!link_id || !action || !student_id) {
        throw new Error("Missing required fields");
      }

      const result = await authService.respondToParentRequest(
        link_id,
        action,
        student_id
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }
}

module.exports = new AuthController();
