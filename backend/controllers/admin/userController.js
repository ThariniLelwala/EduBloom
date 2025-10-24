// controllers/admin/userController.js
const userService = require("../../services/admin/userService");
const { parseRequestBody } = require("../../middleware/authMiddleware");

class UserController {
  /**
   * Get all users with filtering and search
   * GET /api/admin/users
   */
  async getAllUsers(req, res) {
    try {
      // Extract query parameters
      const url = new URL(req.url, `http://${req.headers.host}`);
      const role = url.searchParams.get("role");
      const search = url.searchParams.get("search");
      const studentType = url.searchParams.get("student_type");

      const filters = {};
      if (role) filters.role = role;
      if (search) filters.search = search;
      if (studentType) filters.student_type = studentType;

      const users = await userService.getAllUsers(filters);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ users }));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Get user statistics
   * GET /api/admin/users/statistics
   */
  async getStatistics(req, res) {
    try {
      const stats = await userService.getUserStatistics();

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(stats));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Get specific user by ID
   * GET /api/admin/users/:userId
   */
  async getUser(req, res) {
    try {
      const userId = parseInt(req.url.split("/")[4]);

      if (isNaN(userId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Invalid user ID" }));
      }

      const user = await userService.getUserById(userId);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ user }));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Delete a user with password verification
   * DELETE /api/admin/users/:userId
   */
  async deleteUser(req, res) {
    try {
      const userId = parseInt(req.url.split("/")[4]);
      const data = await parseRequestBody(req);
      const { password } = data;

      if (isNaN(userId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Invalid user ID" }));
      }

      if (!password) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Password is required for deletion" }));
      }

      // Get admin user from request (added by middleware)
      const adminUserInfo = req.user;
      if (!adminUserInfo) {
        res.writeHead(401, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Unauthorized" }));
      }

      // Fetch full admin user with password and salt from database
      const adminUser = await userService.getUserById(adminUserInfo.id);
      if (!adminUser) {
        res.writeHead(401, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Admin not found" }));
      }

      const result = await userService.deleteUser(userId, adminUser, password);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Delete multiple users with password verification
   * DELETE /api/admin/users
   */
  async deleteMultipleUsers(req, res) {
    try {
      const data = await parseRequestBody(req);
      const { user_ids, password } = data;

      if (!Array.isArray(user_ids) || user_ids.length === 0) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "user_ids array is required" }));
      }

      if (!password) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Password is required for deletion" }));
      }

      // Get admin user from request (added by middleware)
      const adminUserInfo = req.user;
      if (!adminUserInfo) {
        res.writeHead(401, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Unauthorized" }));
      }

      // Fetch full admin user with password and salt from database
      const adminUser = await userService.getUserById(adminUserInfo.id);
      if (!adminUser) {
        res.writeHead(401, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Admin not found" }));
      }

      const result = await userService.deleteMultipleUsers(user_ids, adminUser, password);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Get role distribution
   * GET /api/admin/users/analytics/role-distribution
   */
  async getRoleDistribution(req, res) {
    try {
      const distribution = await userService.getRoleDistribution();

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ distribution }));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Get recent registrations
   * GET /api/admin/users/recent
   */
  async getRecentRegistrations(req, res) {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const limit = parseInt(url.searchParams.get("limit") || "10");

      const registrations = await userService.getRecentRegistrations(limit);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ registrations }));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Create a new admin
   * POST /api/admin/users
   */
  async createAdmin(req, res) {
    try {
      const data = await parseRequestBody(req);
      const { firstname, lastname, birthday, username, email, password } = data;

      if (!firstname || !lastname || !birthday || !username || !email || !password) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "All fields are required" }));
      }

      const user = await userService.createAdmin({
        firstname,
        lastname,
        birthday,
        username,
        email,
        password,
      });

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ user, message: "Admin created successfully" }));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }
}

module.exports = new UserController();
