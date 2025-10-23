// routes/teacherRoutes.js
const teacherController = require("../controllers/teacherController");
const {
  verifyToken,
  requireRole,
  applyMiddleware,
} = require("../middleware/authMiddleware");

function handleTeacherRoutes(req, res) {
  const pathname = req.url.split("?")[0]; // Remove query params
  const method = req.method;

  try {
    // Subject management routes
    // Create subject: POST /api/teacher/subjects/create
    if (method === "POST" && pathname === "/api/teacher/subjects/create") {
      return applyMiddleware(
        [verifyToken, requireRole("teacher")],
        teacherController.createSubject
      )(req, res);
    }

    // Get all subjects: GET /api/teacher/subjects
    if (method === "GET" && pathname === "/api/teacher/subjects") {
      return applyMiddleware(
        [verifyToken, requireRole("teacher")],
        teacherController.getSubjects
      )(req, res);
    }

    // Get specific subject: GET /api/teacher/subjects/:subjectId
    if (method === "GET" && pathname.match(/^\/api\/teacher\/subjects\/\d+$/)) {
      return applyMiddleware(
        [verifyToken, requireRole("teacher")],
        teacherController.getSubject
      )(req, res);
    }

    // Update subject: PUT /api/teacher/subjects/:subjectId
    if (method === "PUT" && pathname.match(/^\/api\/teacher\/subjects\/\d+$/)) {
      return applyMiddleware(
        [verifyToken, requireRole("teacher")],
        teacherController.updateSubject
      )(req, res);
    }

    // Delete subject: DELETE /api/teacher/subjects/:subjectId
    if (
      method === "DELETE" &&
      pathname.match(/^\/api\/teacher\/subjects\/\d+$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("teacher")],
        teacherController.deleteSubject
      )(req, res);
    }

    // Topic management routes
    // Create topic: POST /api/teacher/subjects/:subjectId/topics/create
    if (
      method === "POST" &&
      pathname.match(/^\/api\/teacher\/subjects\/\d+\/topics\/create$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("teacher")],
        teacherController.createTopic
      )(req, res);
    }

    // Get topics: GET /api/teacher/subjects/:subjectId/topics
    if (
      method === "GET" &&
      pathname.match(/^\/api\/teacher\/subjects\/\d+\/topics$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("teacher")],
        teacherController.getTopics
      )(req, res);
    }

    // Delete topic: DELETE /api/teacher/subjects/:subjectId/topics/:topicId
    if (
      method === "DELETE" &&
      pathname.match(/^\/api\/teacher\/subjects\/\d+\/topics\/\d+$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("teacher")],
        teacherController.deleteTopic
      )(req, res);
    }

    // Module notes routes
    // Add module note: POST /api/teacher/subjects/:subjectId/topics/:topicId/notes/create
    if (
      method === "POST" &&
      pathname.match(
        /^\/api\/teacher\/subjects\/\d+\/topics\/\d+\/notes\/create$/
      )
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("teacher")],
        teacherController.addModuleNote
      )(req, res);
    }

    // Get module notes: GET /api/teacher/subjects/:subjectId/topics/:topicId/notes
    if (
      method === "GET" &&
      pathname.match(/^\/api\/teacher\/subjects\/\d+\/topics\/\d+\/notes$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("teacher")],
        teacherController.getModuleNotes
      )(req, res);
    }

    // Delete module note: DELETE /api/teacher/subjects/:subjectId/topics/:topicId/notes/:noteId
    if (
      method === "DELETE" &&
      pathname.match(/^\/api\/teacher\/subjects\/\d+\/topics\/\d+\/notes\/\d+$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("teacher")],
        teacherController.deleteModuleNote
      )(req, res);
    }

    // Update note visibility: PUT /api/teacher/notes/:noteId/visibility
    if (
      method === "PUT" &&
      pathname.match(/^\/api\/teacher\/notes\/\d+\/visibility$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("teacher")],
        teacherController.updateNoteVisibility
      )(req, res);
    }

    // Get public notes by teacher: GET /api/teacher/:teacherId/notes/public
    if (
      method === "GET" &&
      pathname.match(/^\/api\/teacher\/\d+\/notes\/public$/)
    ) {
      return applyMiddleware([verifyToken], teacherController.getPublicNotes)(
        req,
        res
      );
    }

    // Route not found in teacher routes
    return null; // Return null to indicate route not handled
  } catch (err) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
}

module.exports = handleTeacherRoutes;
