// routes/teacherRoutes.js
const subjectController = require("../controllers/teacher/subjectController");
const notesController = require("../controllers/teacher/notesController");
const verificationController = require("../controllers/teacher/verificationController");
const quizController = require("../controllers/teacher/quizController");
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
        subjectController.createSubject
      )(req, res);
    }

    // Get all subjects: GET /api/teacher/subjects
    if (method === "GET" && pathname === "/api/teacher/subjects") {
      return applyMiddleware(
        [verifyToken, requireRole("teacher")],
        subjectController.getSubjects
      )(req, res);
    }

    // Get specific subject: GET /api/teacher/subjects/:subjectId
    if (method === "GET" && pathname.match(/^\/api\/teacher\/subjects\/\d+$/)) {
      return applyMiddleware(
        [verifyToken, requireRole("teacher")],
        subjectController.getSubject
      )(req, res);
    }

    // Update subject: PUT /api/teacher/subjects/:subjectId
    if (method === "PUT" && pathname.match(/^\/api\/teacher\/subjects\/\d+$/)) {
      return applyMiddleware(
        [verifyToken, requireRole("teacher")],
        subjectController.updateSubject
      )(req, res);
    }

    // Delete subject: DELETE /api/teacher/subjects/:subjectId
    if (
      method === "DELETE" &&
      pathname.match(/^\/api\/teacher\/subjects\/\d+$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("teacher")],
        subjectController.deleteSubject
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
        subjectController.createTopic
      )(req, res);
    }

    // Get topics: GET /api/teacher/subjects/:subjectId/topics
    if (
      method === "GET" &&
      pathname.match(/^\/api\/teacher\/subjects\/\d+\/topics$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("teacher")],
        subjectController.getTopics
      )(req, res);
    }

    // Delete topic: DELETE /api/teacher/subjects/:subjectId/topics/:topicId
    if (
      method === "DELETE" &&
      pathname.match(/^\/api\/teacher\/subjects\/\d+\/topics\/\d+$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("teacher")],
        subjectController.deleteTopic
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
        notesController.addModuleNote
      )(req, res);
    }

    // Get module notes: GET /api/teacher/subjects/:subjectId/topics/:topicId/notes
    if (
      method === "GET" &&
      pathname.match(/^\/api\/teacher\/subjects\/\d+\/topics\/\d+\/notes$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("teacher")],
        notesController.getModuleNotes
      )(req, res);
    }

    // Delete module note: DELETE /api/teacher/subjects/:subjectId/topics/:topicId/notes/:noteId
    if (
      method === "DELETE" &&
      pathname.match(/^\/api\/teacher\/subjects\/\d+\/topics\/\d+\/notes\/\d+$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("teacher")],
        notesController.deleteModuleNote
      )(req, res);
    }

    // Update note visibility: PUT /api/teacher/notes/:noteId/visibility
    if (
      method === "PUT" &&
      pathname.match(/^\/api\/teacher\/notes\/\d+\/visibility$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("teacher")],
        notesController.updateNoteVisibility
      )(req, res);
    }

    // Get public notes by teacher: GET /api/teacher/:teacherId/notes/public
    if (
      method === "GET" &&
      pathname.match(/^\/api\/teacher\/\d+\/notes\/public$/)
    ) {
      return applyMiddleware([verifyToken], notesController.getPublicNotes)(
        req,
        res
      );
    }

    // ========== QUIZ MANAGEMENT ROUTES ==========

    // Quiz Subjects routes
    // Create subject: POST /api/teacher/quiz/subjects
    if (method === "POST" && pathname === "/api/teacher/quiz/subjects") {
      return applyMiddleware(
        [verifyToken, requireRole("teacher")],
        quizController.createSubject
      )(req, res);
    }

    // Get all subjects: GET /api/teacher/quiz/subjects
    if (method === "GET" && pathname === "/api/teacher/quiz/subjects") {
      return applyMiddleware(
        [verifyToken, requireRole("teacher")],
        quizController.getSubjects
      )(req, res);
    }

    // Get specific subject: GET /api/teacher/quiz/subjects/:subjectId
    if (
      method === "GET" &&
      pathname.match(/^\/api\/teacher\/quiz\/subjects\/\d+$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("teacher")],
        quizController.getSubject
      )(req, res);
    }

    // Update subject: PUT /api/teacher/quiz/subjects/:subjectId
    if (
      method === "PUT" &&
      pathname.match(/^\/api\/teacher\/quiz\/subjects\/\d+$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("teacher")],
        quizController.updateSubject
      )(req, res);
    }

    // Delete subject: DELETE /api/teacher/quiz/subjects/:subjectId
    if (
      method === "DELETE" &&
      pathname.match(/^\/api\/teacher\/quiz\/subjects\/\d+$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("teacher")],
        quizController.deleteSubject
      )(req, res);
    }

    // Quiz Sets routes
    // Create quiz set: POST /api/teacher/quiz/subjects/:subjectId/quiz-sets
    if (
      method === "POST" &&
      pathname.match(/^\/api\/teacher\/quiz\/subjects\/\d+\/quiz-sets$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("teacher")],
        quizController.createQuizSet
      )(req, res);
    }

    // Get all quiz sets for subject: GET /api/teacher/quiz/subjects/:subjectId/quiz-sets
    if (
      method === "GET" &&
      pathname.match(/^\/api\/teacher\/quiz\/subjects\/\d+\/quiz-sets$/)
    ) {
      return applyMiddleware([verifyToken], quizController.getQuizSets)(
        req,
        res
      );
    }

    // Get specific quiz set: GET /api/teacher/quiz/quiz-sets/:quizSetId
    if (
      method === "GET" &&
      pathname.match(/^\/api\/teacher\/quiz\/quiz-sets\/\d+$/)
    ) {
      return applyMiddleware([verifyToken], quizController.getQuizSet)(
        req,
        res
      );
    }

    // Update quiz set: PUT /api/teacher/quiz/quiz-sets/:quizSetId
    if (
      method === "PUT" &&
      pathname.match(/^\/api\/teacher\/quiz\/quiz-sets\/\d+$/) &&
      !pathname.includes("reorder")
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("teacher")],
        quizController.updateQuizSet
      )(req, res);
    }

    // Delete quiz set: DELETE /api/teacher/quiz/quiz-sets/:quizSetId
    if (
      method === "DELETE" &&
      pathname.match(/^\/api\/teacher\/quiz\/quiz-sets\/\d+$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("teacher")],
        quizController.deleteQuizSet
      )(req, res);
    }

    // Questions routes
    // Create question: POST /api/teacher/quiz/quiz-sets/:quizSetId/questions
    if (
      method === "POST" &&
      pathname.match(/^\/api\/teacher\/quiz\/quiz-sets\/\d+\/questions$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("teacher")],
        quizController.createQuestion
      )(req, res);
    }

    // Get all questions: GET /api/teacher/quiz/quiz-sets/:quizSetId/questions
    if (
      method === "GET" &&
      pathname.match(/^\/api\/teacher\/quiz\/quiz-sets\/\d+\/questions$/)
    ) {
      return applyMiddleware([verifyToken], quizController.getQuestions)(
        req,
        res
      );
    }

    // Get specific question: GET /api/teacher/quiz/questions/:questionId
    if (
      method === "GET" &&
      pathname.match(/^\/api\/teacher\/quiz\/questions\/\d+$/)
    ) {
      return applyMiddleware([verifyToken], quizController.getQuestion)(
        req,
        res
      );
    }

    // Update question: PUT /api/teacher/quiz/questions/:questionId
    if (
      method === "PUT" &&
      pathname.match(/^\/api\/teacher\/quiz\/questions\/\d+$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("teacher")],
        quizController.updateQuestion
      )(req, res);
    }

    // Delete question: DELETE /api/teacher/quiz/questions/:questionId
    if (
      method === "DELETE" &&
      pathname.match(/^\/api\/teacher\/quiz\/questions\/\d+$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("teacher")],
        quizController.deleteQuestion
      )(req, res);
    }

    // Reorder questions: PUT /api/teacher/quiz/quiz-sets/:quizSetId/reorder-questions
    if (
      method === "PUT" &&
      pathname.match(
        /^\/api\/teacher\/quiz\/quiz-sets\/\d+\/reorder-questions$/
      )
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("teacher")],
        quizController.reorderQuestions
      )(req, res);
    }

    // Route not found in teacher routes
    return null; // Return null to indicate route not handled
  } catch (err) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
}

module.exports = handleTeacherRoutes;
