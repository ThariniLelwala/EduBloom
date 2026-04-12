// routes/adminRoutes.js
const userController = require("../controllers/admin/userController");
const contentModerationController = require("../controllers/admin/contentModerationController");
const forumManagementController = require("../controllers/admin/forumManagementController");
const announcementController = require("../controllers/admin/announcementController");
const dashboardController = require("../controllers/admin/dashboardController");
const profileController = require("../controllers/admin/profileController");
const analyticsController = require("../controllers/admin/analyticsController");
const helpController = require("../controllers/admin/helpController");
const verificationController = require("../controllers/admin/verificationController");
const todoController = require("../controllers/admin/todoController");
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
      pathname === "/api/admin/users/analytics/role-distribution"
    ) {
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

    // Update user: PUT /api/admin/users/:userId
    if (method === "PUT" && pathname.match(/^\/api\/admin\/users\/\d+$/)) {
      return applyMiddleware(
        [verifyToken, requireRole("admin")],
        userController.updateUser
      )(req, res);
    }

    // Content Moderation routes
    // Get flagged content: GET /api/admin/moderation
    if (method === "GET" && pathname === "/api/admin/moderation") {
      return applyMiddleware(
        [verifyToken, requireRole("admin")],
        contentModerationController.getFlaggedContent
      )(req, res);
    }

    // Get moderation statistics: GET /api/admin/moderation/stats
    if (method === "GET" && pathname === "/api/admin/moderation/stats") {
      return applyMiddleware(
        [verifyToken, requireRole("admin")],
        contentModerationController.getStatistics
      )(req, res);
    }

    // Create new flag: POST /api/admin/moderation/flag
    if (method === "POST" && pathname === "/api/admin/moderation/flag") {
      return applyMiddleware(
        [verifyToken, requireRole("admin")],
        contentModerationController.createFlag
      )(req, res);
    }

    // Get specific flagged content: GET /api/admin/moderation/:id
    if (method === "GET" && pathname.match(/^\/api\/admin\/moderation\/\d+$/)) {
      return applyMiddleware(
        [verifyToken, requireRole("admin")],
        contentModerationController.getFlaggedContentById
      )(req, res);
    }

    // Dismiss flag: POST /api/admin/moderation/:id/dismiss
    if (method === "POST" && pathname.match(/^\/api\/admin\/moderation\/\d+\/dismiss$/)) {
      return applyMiddleware(
        [verifyToken, requireRole("admin")],
        contentModerationController.dismissFlag
      )(req, res);
    }

    // Delete flagged content: DELETE /api/admin/moderation/:id
    if (method === "DELETE" && pathname.match(/^\/api\/admin\/moderation\/\d+$/)) {
      return applyMiddleware(
        [verifyToken, requireRole("admin")],
        contentModerationController.deleteFlaggedContent
      )(req, res);
    }

    // Forum Management routes
    if (pathname.startsWith("/api/admin/forums")) {
      // Get forum statistics: GET /api/admin/forums/stats
      if (method === "GET" && pathname === "/api/admin/forums/stats") {
        return applyMiddleware(
          [verifyToken, requireRole("admin")],
          forumManagementController.getStatistics
        )(req, res);
      }

      // Get pending approvals: GET /api/admin/forums/pending
      if (method === "GET" && pathname === "/api/admin/forums/pending") {
        return applyMiddleware(
          [verifyToken, requireRole("admin")],
          forumManagementController.getPendingApprovals
        )(req, res);
      }

      // Get all forums: GET /api/admin/forums
      if (method === "GET" && pathname === "/api/admin/forums") {
        return applyMiddleware(
          [verifyToken, requireRole("admin")],
          forumManagementController.getAllForums
        )(req, res);
      }

      // Get specific forum: GET /api/admin/forums/:id
      if (method === "GET" && pathname.match(/^\/api\/admin\/forums\/\d+$/)) {
        return applyMiddleware(
          [verifyToken, requireRole("admin")],
          forumManagementController.getForum
        )(req, res);
      }

      // Approve forum: POST /api/admin/forums/:id/approve
      if (method === "POST" && pathname.match(/^\/api\/admin\/forums\/\d+\/approve$/)) {
        return applyMiddleware(
          [verifyToken, requireRole("admin")],
          forumManagementController.approveForum
        )(req, res);
      }

      // Reject forum: POST /api/admin/forums/:id/reject
      if (method === "POST" && pathname.match(/^\/api\/admin\/forums\/\d+\/reject$/)) {
        return applyMiddleware(
          [verifyToken, requireRole("admin")],
          forumManagementController.rejectForum
        )(req, res);
      }

      // Delete forum: DELETE /api/admin/forums/:id
      if (method === "DELETE" && pathname.match(/^\/api\/admin\/forums\/\d+$/)) {
        return applyMiddleware(
          [verifyToken, requireRole("admin")],
          forumManagementController.deleteForum
        )(req, res);
      }
    }

    // Dashboard routes
    if (pathname.startsWith("/api/admin/dashboard")) {
      // Get overview stats: GET /api/admin/dashboard/overview
      if (method === "GET" && pathname === "/api/admin/dashboard/overview") {
        return applyMiddleware([verifyToken, requireRole("admin")], dashboardController.getOverview)(req, res);
      }
      // Get recent activity: GET /api/admin/dashboard/activity
      if (method === "GET" && pathname === "/api/admin/dashboard/activity") {
        return applyMiddleware([verifyToken, requireRole("admin")], dashboardController.getRecentActivity)(req, res);
      }
    }

    // Analytics routes
    if (pathname.startsWith("/api/admin/analytics")) {
      // Get overview: GET /api/admin/analytics/overview
      if (method === "GET" && pathname === "/api/admin/analytics/overview") {
        return applyMiddleware([verifyToken, requireRole("admin")], analyticsController.getOverview)(req, res);
      }
      // Get user growth: GET /api/admin/analytics/user-growth
      if (method === "GET" && pathname === "/api/admin/analytics/user-growth") {
        return applyMiddleware([verifyToken, requireRole("admin")], analyticsController.getUserGrowth)(req, res);
      }
      // Get daily logins: GET /api/admin/analytics/daily-logins
      if (method === "GET" && pathname === "/api/admin/analytics/daily-logins") {
        return applyMiddleware([verifyToken, requireRole("admin")], analyticsController.getDailyLogins)(req, res);
      }
      // Get content distribution: GET /api/admin/analytics/content
      if (method === "GET" && pathname === "/api/admin/analytics/content") {
        return applyMiddleware([verifyToken, requireRole("admin")], analyticsController.getContentDistribution)(req, res);
      }
      // Get most active users: GET /api/admin/analytics/active-users
      if (method === "GET" && pathname === "/api/admin/analytics/active-users") {
        return applyMiddleware([verifyToken, requireRole("admin")], analyticsController.getMostActiveUsers)(req, res);
      }
    }

    // Profile routes
    if (pathname.startsWith("/api/admin/profile")) {
      // Get profile: GET /api/admin/profile
      if (method === "GET" && pathname === "/api/admin/profile") {
        return applyMiddleware([verifyToken, requireRole("admin")], profileController.getProfile)(req, res);
      }
      // Update profile: PUT /api/admin/profile
      if (method === "PUT" && pathname === "/api/admin/profile") {
        return applyMiddleware([verifyToken, requireRole("admin")], profileController.updateProfile)(req, res);
      }
      // Change password: POST /api/admin/profile/password
      if (method === "POST" && pathname === "/api/admin/profile/password") {
        return applyMiddleware([verifyToken, requireRole("admin")], profileController.changePassword)(req, res);
      }
    }

    // Announcement routes
    if (pathname.startsWith("/api/admin/announcements")) {
      // Get all: GET /api/admin/announcements
      if (method === "GET" && pathname === "/api/admin/announcements") {
        return applyMiddleware([verifyToken, requireRole("admin")], announcementController.getAll)(req, res);
      }
      // Get one: GET /api/admin/announcements/:id
      if (method === "GET" && pathname.match(/^\/api\/admin\/announcements\/\d+$/)) {
        return applyMiddleware([verifyToken, requireRole("admin")], announcementController.getById)(req, res);
      }
      // Create: POST /api/admin/announcements
      if (method === "POST" && pathname === "/api/admin/announcements") {
        return applyMiddleware([verifyToken, requireRole("admin")], announcementController.create)(req, res);
      }
      // Update: PUT /api/admin/announcements/:id
      if (method === "PUT" && pathname.match(/^\/api\/admin\/announcements\/\d+$/)) {
        return applyMiddleware([verifyToken, requireRole("admin")], announcementController.update)(req, res);
      }
      // Delete: DELETE /api/admin/announcements/:id
      if (method === "DELETE" && pathname.match(/^\/api\/admin\/announcements\/\d+$/)) {
        return applyMiddleware([verifyToken, requireRole("admin")], announcementController.delete)(req, res);
      }
    }

    // Help routes
    if (pathname.startsWith("/api/admin/help")) {
      // FAQs
      if (method === "GET" && pathname === "/api/admin/help/faqs") {
        return applyMiddleware([verifyToken, requireRole("admin")], helpController.getFAQs)(req, res);
      }
      if (method === "POST" && pathname === "/api/admin/help/faqs") {
        return applyMiddleware([verifyToken, requireRole("admin")], helpController.createFAQ)(req, res);
      }
      if (method === "PUT" && pathname.match(/^\/api\/admin\/help\/faqs\/\d+$/)) {
        return applyMiddleware([verifyToken, requireRole("admin")], helpController.updateFAQ)(req, res);
      }
      if (method === "DELETE" && pathname.match(/^\/api\/admin\/help\/faqs\/\d+$/)) {
        return applyMiddleware([verifyToken, requireRole("admin")], helpController.deleteFAQ)(req, res);
      }
      // Requests
      if (method === "GET" && pathname === "/api/admin/help/requests") {
        return applyMiddleware([verifyToken, requireRole("admin")], helpController.getRequests)(req, res);
      }
      if (method === "POST" && pathname.match(/^\/api\/admin\/help\/requests\/\d+\/reply$/)) {
        return applyMiddleware([verifyToken, requireRole("admin")], helpController.replyToRequest)(req, res);
      }
      if (method === "POST" && pathname.match(/^\/api\/admin\/help\/requests\/\d+\/resolve$/)) {
        return applyMiddleware([verifyToken, requireRole("admin")], helpController.resolveRequest)(req, res);
      }
    }

    // Verification routes
    if (pathname.startsWith("/api/admin/verifications")) {
      if (method === "GET" && pathname === "/api/admin/verifications") {
        return applyMiddleware([verifyToken, requireRole("admin")], verificationController.getAll)(req, res);
      }
      if (method === "GET" && pathname === "/api/admin/verifications/pending") {
        return applyMiddleware([verifyToken, requireRole("admin")], verificationController.getPending)(req, res);
      }
      if (method === "GET" && pathname === "/api/admin/verifications/stats") {
        return applyMiddleware([verifyToken, requireRole("admin")], verificationController.getStats)(req, res);
      }
      if (method === "GET" && pathname.match(/^\/api\/admin\/verifications\/\d+$/)) {
        return applyMiddleware([verifyToken, requireRole("admin")], verificationController.getById)(req, res);
      }
      if (method === "POST" && pathname.match(/^\/api\/admin\/verifications\/\d+\/approve$/)) {
        return applyMiddleware([verifyToken, requireRole("admin")], verificationController.approve)(req, res);
      }
      if (method === "POST" && pathname.match(/^\/api\/admin\/verifications\/\d+\/reject$/)) {
        return applyMiddleware([verifyToken, requireRole("admin")], verificationController.reject)(req, res);
      }
      if (method === "GET" && pathname.match(/^\/api\/admin\/verifications\/\d+\/download$/)) {
        return applyMiddleware([verifyToken, requireRole("admin")], verificationController.download)(req, res);
      }
    }

    // Todo routes
    if (pathname.startsWith("/api/admin/todos")) {
      if (method === "GET" && pathname === "/api/admin/todos") {
        return applyMiddleware([verifyToken, requireRole("admin")], todoController.getAll)(req, res);
      }
      if (method === "POST" && pathname === "/api/admin/todos") {
        return applyMiddleware([verifyToken, requireRole("admin")], todoController.create)(req, res);
      }
      if (method === "PUT" && pathname.match(/^\/api\/admin\/todos\/\d+$/)) {
        return applyMiddleware([verifyToken, requireRole("admin")], todoController.update)(req, res);
      }
      if (method === "DELETE" && pathname.match(/^\/api\/admin\/todos\/\d+$/)) {
        return applyMiddleware([verifyToken, requireRole("admin")], todoController.delete)(req, res);
      }
    }

    // Route not found in admin routes
    return null; // Return null to indicate route not handled
  } catch (err) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
}

module.exports = handleAdminRoutes;
