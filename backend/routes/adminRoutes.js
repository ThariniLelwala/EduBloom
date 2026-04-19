// routes/adminRoutes.js
const userController = require("../controllers/admin/userController");
const forumController = require("../controllers/admin/forumController");
const contentModerationController = require("../controllers/admin/contentModerationController");
const announcementsController = require("../controllers/admin/announcementsController");
const helpController = require("../controllers/admin/helpController");
const { parseRequestBody } = require("../middleware/authMiddleware");
const {
  verifyToken,
  requireRole,
  applyMiddleware,
} = require("../middleware/authMiddleware");

function handleAdminRoutes(req, res) {
  let pathname = req.url.split("?")[0]; // Remove query params
  // Remove trailing slash
  if (pathname.endsWith("/") && pathname.length > 1) {
    pathname = pathname.slice(0, -1);
  }
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

    // Forum management routes
    // Get all forums: GET /api/admin/forums
    if (method === "GET" && pathname === "/api/admin/forums") {
      return applyMiddleware(
        [verifyToken, requireRole("admin")],
        forumController.getAllForums
      )(req, res);
    }

    // Get pending forums: GET /api/admin/forums/pending
    if (method === "GET" && pathname === "/api/admin/forums/pending") {
      return applyMiddleware(
        [verifyToken, requireRole("admin")],
        forumController.getPendingForums
      )(req, res);
    }

    // Get forum statistics: GET /api/admin/forums/statistics
    if (method === "GET" && pathname === "/api/admin/forums/statistics") {
      return applyMiddleware(
        [verifyToken, requireRole("admin")],
        forumController.getStatistics
      )(req, res);
    }

    // Get single forum: GET /api/admin/forums/:id
    if (method === "GET" && pathname.match(/^\/api\/admin\/forums\/\d+$/)) {
      return applyMiddleware(
        [verifyToken, requireRole("admin")],
        forumController.getForum
      )(req, res);
    }

    // Approve forum: POST /api/admin/forums/:id/approve
    if (method === "POST" && pathname.match(/^\/api\/admin\/forums\/\d+\/approve$/)) {
      return applyMiddleware(
        [verifyToken, requireRole("admin")],
        forumController.approveForum
      )(req, res);
    }

    // Reject forum: POST /api/admin/forums/:id/reject
    if (method === "POST" && pathname.match(/^\/api\/admin\/forums\/\d+\/reject$/)) {
      return applyMiddleware(
        [verifyToken, requireRole("admin")],
        forumController.rejectForum
      )(req, res);
    }

    // Content moderation routes
    // Get flagged content: GET /api/admin/moderation/flagged
    if (method === "GET" && pathname === "/api/admin/moderation/flagged") {
      return applyMiddleware(
        [verifyToken, requireRole("admin")],
        contentModerationController.getFlaggedContent
      )(req, res);
    }

    // Get moderation statistics: GET /api/admin/moderation/statistics
    if (method === "GET" && pathname === "/api/admin/moderation/statistics") {
      return applyMiddleware(
        [verifyToken, requireRole("admin")],
        contentModerationController.getStatistics
      )(req, res);
    }

    // Dismiss flag: POST /api/admin/moderation/flag/:id/dismiss
    if (method === "POST" && pathname.match(/^\/api\/admin\/moderation\/flag\/\d+\/dismiss$/)) {
      return applyMiddleware(
        [verifyToken, requireRole("admin")],
        contentModerationController.dismissFlag
      )(req, res);
    }

    // Delete flagged content: POST /api/admin/moderation/flag/:id/delete
    if (method === "POST" && pathname.match(/^\/api\/admin\/moderation\/flag\/\d+\/delete$/)) {
      return applyMiddleware(
        [verifyToken, requireRole("admin")],
        contentModerationController.deleteContent
      )(req, res);
    }

    // Announcements routes
    // Get all announcements: GET /api/admin/announcements
    if (method === "GET" && pathname === "/api/admin/announcements") {
      return applyMiddleware(
        [verifyToken, requireRole("admin")],
        announcementsController.getAllAnnouncements
      )(req, res);
    }

    // Create announcement: POST /api/admin/announcements
    if (method === "POST" && pathname === "/api/admin/announcements") {
      return applyMiddleware(
        [verifyToken, requireRole("admin")],
        async (req, res) => {
          const body = await parseRequestBody(req);
          req.body = body;
          return announcementsController.createAnnouncement(req, res);
        }
      )(req, res);
    }

    // Update announcement: PUT /api/admin/announcements/:id
    if (method === "PUT" && pathname.match(/^\/api\/admin\/announcements\/\d+$/)) {
      return applyMiddleware(
        [verifyToken, requireRole("admin")],
        async (req, res) => {
          const body = await parseRequestBody(req);
          req.body = body;
          return announcementsController.updateAnnouncement(req, res);
        }
      )(req, res);
    }

    // Delete announcement: DELETE /api/admin/announcements/:id
    if (method === "DELETE" && pathname.match(/^\/api\/admin\/announcements\/\d+$/)) {
      return applyMiddleware(
        [verifyToken, requireRole("admin")],
        announcementsController.deleteAnnouncement
      )(req, res);
    }

    // Help & Support routes
    // Get all FAQs: GET /api/admin/help/faqs
    if (method === "GET" && pathname === "/api/admin/help/faqs") {
      return applyMiddleware(
        [verifyToken, requireRole("admin")],
        helpController.getAllFAQs
      )(req, res);
    }

    // Create FAQ: POST /api/admin/help/faqs
    if (method === "POST" && pathname === "/api/admin/help/faqs") {
      return applyMiddleware(
        [verifyToken, requireRole("admin")],
        async (req, res) => {
          const body = await parseRequestBody(req);
          req.body = body;
          return helpController.createFAQ(req, res);
        }
      )(req, res);
    }

    // Delete FAQ: DELETE /api/admin/help/faqs/:id
    if (method === "DELETE" && pathname.match(/^\/api\/admin\/help\/faqs\/\d+$/)) {
      return applyMiddleware(
        [verifyToken, requireRole("admin")],
        helpController.deleteFAQ
      )(req, res);
    }

    // Get all help requests: GET /api/admin/help/requests
    if (method === "GET" && pathname === "/api/admin/help/requests") {
      return applyMiddleware(
        [verifyToken, requireRole("admin")],
        helpController.getAllHelpRequests
      )(req, res);
    }

    // Get help request by ID: GET /api/admin/help/requests/:id
    if (method === "GET" && pathname.match(/^\/api\/admin\/help\/requests\/\d+$/)) {
      return applyMiddleware(
        [verifyToken, requireRole("admin")],
        helpController.getHelpRequest
      )(req, res);
    }

    // Reply to help request: POST /api/admin/help/requests/:id/reply
    if (method === "POST" && pathname.match(/^\/api\/admin\/help\/requests\/\d+\/reply$/)) {
      return applyMiddleware(
        [verifyToken, requireRole("admin")],
        async (req, res) => {
          const body = await parseRequestBody(req);
          req.body = body;
          return helpController.replyToHelpRequest(req, res);
        }
      )(req, res);
    }

    // Update help request status: PUT /api/admin/help/requests/:id/status
    if (method === "PUT" && pathname.match(/^\/api\/admin\/help\/requests\/\d+\/status$/)) {
      return applyMiddleware(
        [verifyToken, requireRole("admin")],
        async (req, res) => {
          const body = await parseRequestBody(req);
          req.body = body;
          return helpController.updateHelpRequestStatus(req, res);
        }
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
