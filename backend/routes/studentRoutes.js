// routes/studentRoutes.js
const subjectController = require("../controllers/student/subjectController");
const notesController = require("../controllers/student/notesController");
const flashcardController = require("../controllers/student/flashcardController");
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
        subjectController.createSubject
      )(req, res);
    }

    // Get all subjects: GET /api/student/subjects
    if (method === "GET" && pathname === "/api/student/subjects") {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        subjectController.getSubjects
      )(req, res);
    }

    // Get specific subject: GET /api/student/subjects/:subjectId
    if (method === "GET" && pathname.match(/^\/api\/student\/subjects\/\d+$/)) {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        subjectController.getSubject
      )(req, res);
    }

    // Update subject: PUT /api/student/subjects/:subjectId
    if (method === "PUT" && pathname.match(/^\/api\/student\/subjects\/\d+$/)) {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        subjectController.updateSubject
      )(req, res);
    }

    // Delete subject: DELETE /api/student/subjects/:subjectId
    if (
      method === "DELETE" &&
      pathname.match(/^\/api\/student\/subjects\/\d+$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        subjectController.deleteSubject
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
        subjectController.createTopic
      )(req, res);
    }

    // Get topics: GET /api/student/subjects/:subjectId/topics
    if (
      method === "GET" &&
      pathname.match(/^\/api\/student\/subjects\/\d+\/topics$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        subjectController.getTopics
      )(req, res);
    }

    // Delete topic: DELETE /api/student/subjects/:subjectId/topics/:topicId
    if (
      method === "DELETE" &&
      pathname.match(/^\/api\/student\/subjects\/\d+\/topics\/\d+$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        subjectController.deleteTopic
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
        notesController.addModuleNote
      )(req, res);
    }

    // Get module notes: GET /api/student/subjects/:subjectId/topics/:topicId/notes
    if (
      method === "GET" &&
      pathname.match(/^\/api\/student\/subjects\/\d+\/topics\/\d+\/notes$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        notesController.getModuleNotes
      )(req, res);
    }

    // Delete module note: DELETE /api/student/subjects/:subjectId/topics/:topicId/notes/:noteId
    if (
      method === "DELETE" &&
      pathname.match(/^\/api\/student\/subjects\/\d+\/topics\/\d+\/notes\/\d+$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        notesController.deleteModuleNote
      )(req, res);
    }

    // ========== FLASHCARD MANAGEMENT ROUTES ==========

    // Flashcard Subjects routes
    // Create subject: POST /api/student/flashcards/subjects
    if (method === "POST" && pathname === "/api/student/flashcards/subjects") {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        flashcardController.createSubject
      )(req, res);
    }

    // Get all subjects: GET /api/student/flashcards/subjects
    if (method === "GET" && pathname === "/api/student/flashcards/subjects") {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        flashcardController.getSubjects
      )(req, res);
    }

    // Get specific subject: GET /api/student/flashcards/subjects/:subjectId
    if (
      method === "GET" &&
      pathname.match(/^\/api\/student\/flashcards\/subjects\/\d+$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        flashcardController.getSubject
      )(req, res);
    }

    // Update subject: PUT /api/student/flashcards/subjects/:subjectId
    if (
      method === "PUT" &&
      pathname.match(/^\/api\/student\/flashcards\/subjects\/\d+$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        flashcardController.updateSubject
      )(req, res);
    }

    // Delete subject: DELETE /api/student/flashcards/subjects/:subjectId
    if (
      method === "DELETE" &&
      pathname.match(/^\/api\/student\/flashcards\/subjects\/\d+$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        flashcardController.deleteSubject
      )(req, res);
    }

    // Flashcard Sets routes
    // Create flashcard set: POST /api/student/flashcards/subjects/:subjectId/sets
    if (
      method === "POST" &&
      pathname.match(/^\/api\/student\/flashcards\/subjects\/\d+\/sets$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        flashcardController.createFlashcardSet
      )(req, res);
    }

    // Get all flashcard sets for subject: GET /api/student/flashcards/subjects/:subjectId/sets
    if (
      method === "GET" &&
      pathname.match(/^\/api\/student\/flashcards\/subjects\/\d+\/sets$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        flashcardController.getFlashcardSets
      )(req, res);
    }

    // Get specific flashcard set: GET /api/student/flashcards/sets/:setId
    if (
      method === "GET" &&
      pathname.match(/^\/api\/student\/flashcards\/sets\/\d+$/) &&
      !pathname.includes("items") &&
      !pathname.includes("reorder")
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        flashcardController.getFlashcardSet
      )(req, res);
    }

    // Update flashcard set: PUT /api/student/flashcards/sets/:setId
    if (
      method === "PUT" &&
      pathname.match(/^\/api\/student\/flashcards\/sets\/\d+$/) &&
      !pathname.includes("items") &&
      !pathname.includes("reorder")
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        flashcardController.updateFlashcardSet
      )(req, res);
    }

    // Delete flashcard set: DELETE /api/student/flashcards/sets/:setId
    if (
      method === "DELETE" &&
      pathname.match(/^\/api\/student\/flashcards\/sets\/\d+$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        flashcardController.deleteFlashcardSet
      )(req, res);
    }

    // Flashcard Items routes
    // Create flashcard item: POST /api/student/flashcards/sets/:setId/items
    if (
      method === "POST" &&
      pathname.match(/^\/api\/student\/flashcards\/sets\/\d+\/items$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        flashcardController.createFlashcardItem
      )(req, res);
    }

    // Get all flashcard items: GET /api/student/flashcards/sets/:setId/items
    if (
      method === "GET" &&
      pathname.match(/^\/api\/student\/flashcards\/sets\/\d+\/items$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        flashcardController.getFlashcardItems
      )(req, res);
    }

    // Update flashcard item: PUT /api/student/flashcards/sets/:setId/items/:itemId
    if (
      method === "PUT" &&
      pathname.match(/^\/api\/student\/flashcards\/sets\/\d+\/items\/\d+$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        flashcardController.updateFlashcardItem
      )(req, res);
    }

    // Delete flashcard item: DELETE /api/student/flashcards/sets/:setId/items/:itemId
    if (
      method === "DELETE" &&
      pathname.match(/^\/api\/student\/flashcards\/sets\/\d+\/items\/\d+$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        flashcardController.deleteFlashcardItem
      )(req, res);
    }

    // Reorder flashcard items: PUT /api/student/flashcards/sets/:setId/reorder-items
    if (
      method === "PUT" &&
      pathname.match(/^\/api\/student\/flashcards\/sets\/\d+\/reorder-items$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        flashcardController.reorderFlashcardItems
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
