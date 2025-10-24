// routes/authRoutes.js
const authController = require("../controllers/authController");
const parentController = require("../controllers/parentController");
const todoController = require("../controllers/parent/todoController");
const verificationController = require("../controllers/teacher/verificationController");
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

    if (method === "POST" && pathname === "/api/parent/request-child-link") {
      return applyMiddleware(
        [verifyToken, requireRole("parent")],
        parentController.requestChildLink
      )(req, res);
    }

    if (method === "POST" && pathname === "/api/parent/remove-student-link") {
      return applyMiddleware(
        [verifyToken, requireRole("parent")],
        parentController.removeStudentLink
      )(req, res);
    }

    // Teacher verification routes
    if (method === "GET" && pathname === "/api/teacher/verification-status") {
      return applyMiddleware(
        [verifyToken, requireRole("teacher")],
        verificationController.getVerificationStatus
      )(req, res);
    }

    if (method === "POST" && pathname === "/api/teacher/request-verification") {
      return applyMiddleware(
        [verifyToken, requireRole("teacher")],
        verificationController.requestVerification
      )(req, res);
    }

    if (method === "GET" && pathname === "/api/admin/teacher-verifications") {
      return applyMiddleware(
        [verifyToken, requireRole("admin")],
        verificationController.getPendingVerifications
      )(req, res);
    }

    if (method === "POST" && pathname === "/api/admin/approve-verification") {
      return applyMiddleware(
        [verifyToken, requireRole("admin")],
        verificationController.approveVerification
      )(req, res);
    }

    if (method === "POST" && pathname === "/api/admin/reject-verification") {
      return applyMiddleware(
        [verifyToken, requireRole("admin")],
        verificationController.rejectVerification
      )(req, res);
    }

    if (method === "PUT" && pathname === "/api/teacher/update-verification") {
      return applyMiddleware(
        [verifyToken, requireRole("teacher")],
        verificationController.updateVerification
      )(req, res);
    }

    if (
      method === "DELETE" &&
      pathname === "/api/teacher/delete-verification"
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("teacher")],
        verificationController.deleteVerification
      )(req, res);
    }

    if (
      method === "GET" &&
      pathname === "/api/teacher/download-verification-file"
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("teacher")],
        verificationController.downloadVerificationFile
      )(req, res);
    }

    // ========== PARENT TODO ROUTES ==========

    // Create a new todo item: POST /api/parent/todos
    if (method === "POST" && pathname === "/api/parent/todos") {
      return applyMiddleware(
        [verifyToken, requireRole("parent")],
        todoController.createTodo
      )(req, res);
    }

    // Get all todos for a student: GET /api/parent/students/:studentId/todos
    if (
      method === "GET" &&
      pathname.match(/^\/api\/parent\/students\/\d+\/todos$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("parent")],
        todoController.getTodos
      )(req, res);
    }

    // Get todos by type: GET /api/parent/students/:studentId/todos/:type
    if (
      method === "GET" &&
      pathname.match(
        /^\/api\/parent\/students\/\d+\/todos\/(todo|weekly|monthly)$/
      )
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("parent")],
        todoController.getTodosByType
      )(req, res);
    }

    // Update a todo item: PUT /api/parent/todos/:todoId
    if (method === "PUT" && pathname.match(/^\/api\/parent\/todos\/\d+$/)) {
      return applyMiddleware(
        [verifyToken, requireRole("parent")],
        todoController.updateTodo
      )(req, res);
    }

    // Delete a todo item: DELETE /api/parent/todos/:todoId
    if (method === "DELETE" && pathname.match(/^\/api\/parent\/todos\/\d+$/)) {
      return applyMiddleware(
        [verifyToken, requireRole("parent")],
        todoController.deleteTodo
      )(req, res);
    }

    // Get all students for parent: GET /api/parent/students
    if (method === "GET" && pathname === "/api/parent/students") {
      return applyMiddleware(
        [verifyToken, requireRole("parent")],
        todoController.getParentStudents
      )(req, res);
    }

    // Archive expired goals: POST /api/parent/archive-expired-goals
    if (method === "POST" && pathname === "/api/parent/archive-expired-goals") {
      return applyMiddleware(
        [verifyToken, requireRole("parent")],
        todoController.archiveExpiredGoals
      )(req, res);
    }

    // Get expired goals for student: GET /api/parent/students/:studentId/expired-goals
    if (
      method === "GET" &&
      pathname.match(/^\/api\/parent\/students\/\d+\/expired-goals$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("parent")],
        todoController.getExpiredGoals
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
