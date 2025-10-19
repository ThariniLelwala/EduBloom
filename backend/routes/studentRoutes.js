// routes/studentRoutes.js
const studentController = require("../controllers/studentController");
const {
  verifyToken,
  requireRole,
  applyMiddleware,
} = require("../middleware/authMiddleware");

function handleStudentRoutes(req, res) {
  const pathname = req.url.split("?")[0]; // Remove query params
  const method = req.method;

  try {
    // Subject management routes
    // Create subject: POST /api/student/subjects/create
    if (method === "POST" && pathname === "/api/student/subjects/create") {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        studentController.createSubject
      )(req, res);
    }

    // Get all subjects: GET /api/student/subjects
    if (method === "GET" && pathname === "/api/student/subjects") {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        studentController.getSubjects
      )(req, res);
    }

    // Get specific subject: GET /api/student/subjects/:subjectId
    if (method === "GET" && pathname.match(/^\/api\/student\/subjects\/\d+$/)) {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        studentController.getSubject
      )(req, res);
    }

    // Update subject: PUT /api/student/subjects/:subjectId
    if (method === "PUT" && pathname.match(/^\/api\/student\/subjects\/\d+$/)) {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        studentController.updateSubject
      )(req, res);
    }

    // Delete subject: DELETE /api/student/subjects/:subjectId
    if (
      method === "DELETE" &&
      pathname.match(/^\/api\/student\/subjects\/\d+$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        studentController.deleteSubject
      )(req, res);
    }

    // Topic management routes
    // Create topic: POST /api/student/subjects/:subjectId/topics/create
    if (
      method === "POST" &&
      pathname.match(/^\/api\/student\/subjects\/\d+\/topics\/create$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        studentController.createTopic
      )(req, res);
    }

    // Get topics: GET /api/student/subjects/:subjectId/topics
    if (
      method === "GET" &&
      pathname.match(/^\/api\/student\/subjects\/\d+\/topics$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        studentController.getTopics
      )(req, res);
    }

    // Delete topic: DELETE /api/student/subjects/:subjectId/topics/:topicId
    if (
      method === "DELETE" &&
      pathname.match(/^\/api\/student\/subjects\/\d+\/topics\/\d+$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        studentController.deleteTopic
      )(req, res);
    }

    // Module notes routes
    // Add module note: POST /api/student/subjects/:subjectId/topics/:topicId/notes/create
    if (
      method === "POST" &&
      pathname.match(
        /^\/api\/student\/subjects\/\d+\/topics\/\d+\/notes\/create$/
      )
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        studentController.addModuleNote
      )(req, res);
    }

    // Get module notes: GET /api/student/subjects/:subjectId/topics/:topicId/notes
    if (
      method === "GET" &&
      pathname.match(/^\/api\/student\/subjects\/\d+\/topics\/\d+\/notes$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        studentController.getModuleNotes
      )(req, res);
    }

    // Delete module note: DELETE /api/student/subjects/:subjectId/topics/:topicId/notes/:noteId
    if (
      method === "DELETE" &&
      pathname.match(/^\/api\/student\/subjects\/\d+\/topics\/\d+\/notes\/\d+$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        studentController.deleteModuleNote
      )(req, res);
    }

    // Route not found in student routes
    return null; // Return null to indicate route not handled
  } catch (err) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
}

module.exports = handleStudentRoutes;
