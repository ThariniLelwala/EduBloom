// routes/adminRoutes.js
const userController = require("../controllers/admin/userController");
const announcementsController = require("../controllers/admin/announcementsController");
const {
  verifyToken,
  requireRole,
  applyMiddleware,
} = require("../middleware/authMiddleware");

function handleAdminRoutes(req, res) {
  const pathname = req.url.split("?")[0]; // Remove query params
  const method = req.method;

  try {
    // User management routes
    // Get all users with filters: GET /api/admin/users
    if (method === "GET" && pathname === "/api/admin/users") {
      return applyMiddleware(
        [verifyToken, requireRole("admin")],
        userController.getAllUsers
      )(req, res);
    }
    
    // Get user statistics: GET /api/admin/users/statistics
    if (method === "GET" && pathname === "/api/admin/users/statistics") {
      return applyMiddleware(
        [verifyToken, requireRole("admin")],
        userController.getStatistics
      )(req, res);
    }

    // Get role distribution: GET /api/admin/users/analytics/role-distribution
    if (
      method === "GET" &&
      pathname === "/api/admin/users/analytics/role-distribution") {
      return applyMiddleware(
        [verifyToken, requireRole("admin")],
        userController.getRoleDistribution
      )(req, res);
    }

    // Get recent registrations: GET /api/admin/users/recent
    if (method === "GET" && pathname === "/api/admin/users/recent") {
      return applyMiddleware(
        [verifyToken, requireRole("admin")],
        userController.getRecentRegistrations
      )(req, res);
    }

    // Create new admin: POST /api/admin/users
    if (method === "POST" && pathname === "/api/admin/users") {
      return applyMiddleware(
        [verifyToken, requireRole("admin")],
        userController.createAdmin
      )(req, res);
    }
  
    // Get specific user: GET /api/admin/users/:userId
    if (method === "GET" && pathname.match(/^\/api\/admin\/users\/\d+$/)) {
      return applyMiddleware(
        [verifyToken, requireRole("admin")],
        userController.getUser
      )(req, res);
    }
    
    // Delete multiple users: DELETE /api/admin/users
    if (method === "DELETE" && pathname === "/api/admin/users") {
      return applyMiddleware(
        [verifyToken, requireRole("admin")],
        userController.deleteMultipleUsers
      )(req, res);
    }
    
    // Delete specific user: DELETE /api/admin/users/:userId
    if (method === "DELETE" && pathname.match(/^\/api\/admin\/users\/\d+$/)) {
      return applyMiddleware(
        [verifyToken, requireRole("admin")],
        userController.deleteUser
      )(req, res);
    }

    // ===== Announcements Routes =====

    // GET /api/admin/announcements
    if (method === "GET" && pathname === "/api/admin/announcements") {
      return applyMiddleware(
          [verifyToken, requireRole("admin")],
        announcementsController.getAllAnnouncements
      )(req, res);
    }

    // GET /api/admin/announcements/:id
    if (method === "GET" && pathname.match(/^\/api\/admin\/announcements\/\d+$/)) {
      return applyMiddleware(
        [verifyToken, requireRole("admin")],
        announcementsController.getAnnouncement
      )(req, res);
    }

    // POST /api/admin/announcements
    if (method === "POST" && pathname === "/api/admin/announcements") {
      return applyMiddleware(
        [verifyToken, requireRole("admin")],
        announcementsController.createAnnouncement
      )(req, res);
    }

    // PATCH /api/admin/announcements/:id
    if (method === "PATCH" && pathname.match(/^\/api\/admin\/announcements\/\d+$/)) {
      return applyMiddleware(
        [verifyToken, requireRole("admin")],
        announcementsController.updateAnnouncement
      )(req, res);
    }

    // DELETE /api/admin/announcements/:id
    if (method === "DELETE" && pathname.match(/^\/api\/admin\/announcements\/\d+$/)) {
      return applyMiddleware(
        [verifyToken, requireRole("admin")],
        announcementsController.deleteAnnouncement
      )(req, res);
    }
      
    // Route not found in admin routes
    return null; // Return null to indicate route not handled
  } catch (err) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
}
    
module.exports = handleAdminRoutes;
