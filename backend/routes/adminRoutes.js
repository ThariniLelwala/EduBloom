// routes/adminRoutes.js
const userController = require("../controllers/admin/userController");
const forumController = require("../controllers/admin/forumController");
const contentModerationController = require("../controllers/admin/contentModerationController");
const announcementsController = require("../controllers/admin/announcementsController");
const helpController = require("../controllers/admin/helpController");
const todoController = require("../controllers/admin/todoController");
const analyticsController = require("../controllers/admin/analyticsController");
const verificationController = require("../controllers/teacher/verificationController");
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

    // Update specific user: PUT /api/admin/users/:userId
    if (method === "PUT" && pathname.match(/^\/api\/admin\/users\/\d+$/)) {
      return applyMiddleware(
        [verifyToken, requireRole("admin")],
        userController.updateUser
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

    // Get pending deletion requests: GET /api/admin/forums/pending-deletions
    if (method === "GET" && pathname === "/api/admin/forums/pending-deletions") {
      return applyMiddleware(
        [verifyToken, requireRole("admin")],
        forumController.getPendingDeletions
      )(req, res);
    }

    // Approve forum deletion: POST /api/admin/forums/:id/approve-delete
    if (method === "POST" && pathname.match(/^\/api\/admin\/forums\/\d+\/approve-delete$/)) {
      return applyMiddleware(
        [verifyToken, requireRole("admin")],
        forumController.approveDelete
      )(req, res);
    }

    // Reject forum deletion: POST /api/admin/forums/:id/reject-delete
    if (method === "POST" && pathname.match(/^\/api\/admin\/forums\/\d+\/reject-delete$/)) {
      return applyMiddleware(
        [verifyToken, requireRole("admin")],
        forumController.rejectDelete
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

    // =========================================================================
    // Teacher Verification Routes - /api/admin/teacher-verifications/*
    // =========================================================================

    // GET /api/admin/teacher-verifications - Get all pending verifications
    if (method === "GET" && pathname === "/api/admin/teacher-verifications") {
      return applyMiddleware(
        [verifyToken, requireRole("admin")],
        verificationController.getPendingVerifications
      )(req, res);
    }

    // GET /api/admin/verification-details/:verificationId - Get verification details
    if (method === "GET" && pathname.match(/^\/api\/admin\/verification-details\/\d+$/)) {
      const verificationId = pathname.match(/^\/api\/admin\/verification-details\/(\d+)$/)[1];
      req.params = { verificationId };
      return applyMiddleware(
        [verifyToken, requireRole("admin")],
        verificationController.getVerificationDetails
      )(req, res);
    }

    // POST /api/admin/approve-verification - Approve verification
    if (method === "POST" && pathname === "/api/admin/approve-verification") {
      return applyMiddleware(
        [verifyToken, requireRole("admin")],
        async (req, res) => {
          const body = await parseRequestBody(req);
          req.body = body;
          return verificationController.approveVerification(req, res);
        }
      )(req, res);
    }

    // POST /api/admin/reject-verification - Reject verification
    if (method === "POST" && pathname === "/api/admin/reject-verification") {
      return applyMiddleware(
        [verifyToken, requireRole("admin")],
        async (req, res) => {
          const body = await parseRequestBody(req);
          req.body = body;
          return verificationController.rejectVerification(req, res);
        }
      )(req, res);
    }

    // GET /api/admin/download-verification/:verificationId - Download verification file
    if (method === "GET" && pathname.match(/^\/api\/admin\/download-verification\/\d+$/)) {
      const verificationId = pathname.match(/^\/api\/admin\/download-verification\/(\d+)$/)[1];
      req.params = { verificationId };
      return applyMiddleware(
        [verifyToken, requireRole("admin")],
        verificationController.downloadVerificationFile
      )(req, res);
    }

    // =========================================================================
    // Admin Todo Routes - /api/admin/todos/*
    // =========================================================================

    // GET /api/admin/todos - Get all todos for logged-in admin
    if (method === "GET" && pathname === "/api/admin/todos") {
      return applyMiddleware(
        [verifyToken, requireRole("admin")],
        todoController.getTodos
      )(req, res);
    }

    // POST /api/admin/todos - Create a new todo
    if (method === "POST" && pathname === "/api/admin/todos") {
      return applyMiddleware(
        [verifyToken, requireRole("admin")],
        todoController.createTodo
      )(req, res);
    }

    // PUT /api/admin/todos/:id - Update a todo (text or completion)
    if (method === "PUT" && pathname.match(/^\/api\/admin\/todos\/\d+$/)) {
      return applyMiddleware(
        [verifyToken, requireRole("admin")],
        todoController.updateTodo
      )(req, res);
    }

    // DELETE /api/admin/todos/:id - Delete a todo
    if (method === "DELETE" && pathname.match(/^\/api\/admin\/todos\/\d+$/)) {
      return applyMiddleware(
        [verifyToken, requireRole("admin")],
        todoController.deleteTodo
      )(req, res);
    }

    // =========================================================================
    // System Analytics Routes
    // =========================================================================

    // GET /api/admin/system/analytics - Get system-wide aggregated data
    if (method === "GET" && pathname === "/api/admin/system/analytics") {
      return applyMiddleware(
        [verifyToken, requireRole("admin")],
        analyticsController.getSystemAnalytics
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
