// routes/authRoutes.js
const authController = require("../controllers/authController");
const parentController = require("../controllers/parentController");
const teacherController = require("../controllers/teacherController");
const {
  verifyToken,
  requireRole,
  requireAnyRole,
  applyMiddleware,
} = require("../middleware/authMiddleware");

function handleAuthRoutes(req, res) {
  const pathname = req.url.split("?")[0]; // Remove query params
  const method = req.method;

  try {
    // Public routes (no auth required)
    if (method === "POST" && pathname === "/api/auth/register") {
      return authController.register(req, res);
    }

    if (method === "POST" && pathname === "/api/auth/login") {
      return authController.login(req, res);
    }

    // Protected routes (require authentication)
    if (method === "POST" && pathname === "/api/auth/logout") {
      return applyMiddleware([verifyToken], authController.logout)(req, res);
    }

    if (method === "GET" && pathname === "/api/auth/profile") {
      return applyMiddleware([verifyToken], authController.getProfile)(
        req,
        res
      );
    }

    if (method === "POST" && pathname === "/api/auth/change-password") {
      return applyMiddleware([verifyToken], authController.changePassword)(
        req,
        res
      );
    }

    // Student-specific protected routes
    if (method === "GET" && pathname === "/api/student/linked-parents") {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        authController.getLinkedParents
      )(req, res);
    }

    if (
      method === "GET" &&
      pathname === "/api/student/pending-parent-requests"
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        authController.getPendingParentRequests
      )(req, res);
    }

    if (method === "POST" && pathname === "/api/student/accept-parent-link") {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        authController.acceptParentLink
      )(req, res);
    }

    if (method === "POST" && pathname === "/api/student/reject-parent-link") {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        authController.rejectParentLink
      )(req, res);
    }

    if (method === "POST" && pathname === "/api/student/remove-parent-link") {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        authController.removeParentLink
      )(req, res);
    }

    // Parent-specific protected routes
    if (method === "GET" && pathname === "/api/parent/children") {
      return applyMiddleware(
        [verifyToken, requireRole("parent")],
        parentController.getChildren
      )(req, res);
    }

    if (method === "GET" && pathname.match(/^\/api\/parent\/children\/\d+$/)) {
      return applyMiddleware(
        [verifyToken, requireRole("parent")],
        parentController.getChildData
      )(req, res);
    }

    if (
      method === "GET" &&
      pathname.match(/^\/api\/parent\/children\/\d+\/subjects$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("parent")],
        parentController.getChildSubjects
      )(req, res);
    }

    // Teacher verification routes
    if (method === "GET" && pathname === "/api/teacher/verification-status") {
      return applyMiddleware(
        [verifyToken, requireRole("teacher")],
        teacherController.getVerificationStatus
      )(req, res);
    }

    if (method === "POST" && pathname === "/api/teacher/request-verification") {
      return applyMiddleware(
        [verifyToken, requireRole("teacher")],
        teacherController.requestVerification
      )(req, res);
    }

    if (method === "GET" && pathname === "/api/admin/teacher-verifications") {
      return applyMiddleware(
        [verifyToken, requireRole("admin")],
        teacherController.getPendingVerifications
      )(req, res);
    }

    if (method === "POST" && pathname === "/api/admin/approve-verification") {
      return applyMiddleware(
        [verifyToken, requireRole("admin")],
        teacherController.approveVerification
      )(req, res);
    }

    if (method === "POST" && pathname === "/api/admin/reject-verification") {
      return applyMiddleware(
        [verifyToken, requireRole("admin")],
        teacherController.rejectVerification
      )(req, res);
    }

    if (method === "PUT" && pathname === "/api/teacher/update-verification") {
      return applyMiddleware(
        [verifyToken, requireRole("teacher")],
        teacherController.updateVerification
      )(req, res);
    }

    if (
      method === "DELETE" &&
      pathname === "/api/teacher/delete-verification"
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("teacher")],
        teacherController.deleteVerification
      )(req, res);
    }

    if (
      method === "GET" &&
      pathname === "/api/teacher/download-verification-file"
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("teacher")],
        teacherController.downloadVerificationFile
      )(req, res);
    }

    // Example protected routes for different roles
    // Uncomment and implement as needed:

    // Teacher-only routes
    // if (method === "GET" && pathname === "/api/teacher/dashboard") {
    //   return applyMiddleware(
    //     [verifyToken, requireRole("teacher")],
    //     teacherController.getDashboard
    //   )(req, res);
    // }

    // Parent-only routes
    // if (method === "GET" && pathname === "/api/parent/children") {
    //   return applyMiddleware(
    //     [verifyToken, requireRole("parent")],
    //     parentController.getChildren
    //   )(req, res);
    // }

    // Admin-only routes
    // if (method === "GET" && pathname === "/api/admin/users") {
    //   return applyMiddleware(
    //     [verifyToken, requireRole("admin")],
    //     adminController.listUsers
    //   )(req, res);
    // }

    // Multi-role routes (teacher OR admin)
    // if (method === "GET" && pathname === "/api/students") {
    //   return applyMiddleware(
    //     [verifyToken, requireAnyRole(["teacher", "admin"])],
    //     studentController.listStudents
    //   )(req, res);
    // }

    // Route not found
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Route not found" }));
  } catch (err) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
}

module.exports = handleAuthRoutes;
