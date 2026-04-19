// routes/teacherRoutes.js - Handles /api/teacher/* and /api/public/* routes

// Controller imports
const subjectController = require("../controllers/teacher/subjectController");
const notesController = require("../controllers/teacher/notesController");
const quizController = require("../controllers/teacher/quizController");
const todoController = require("../controllers/teacher/todoController");
const forumController = require("../controllers/teacher/forumController");
const publicController = require("../controllers/teacher/publicController");
const viewController = require("../controllers/teacher/viewController");
const profileController = require("../controllers/teacher/profileController");

// Middleware imports
const { verifyToken, requireRole, applyMiddleware } = require("../middleware/authMiddleware");

// Helper imports
const { getId, isPath, matches } = require("../utils/routeHelpers");

const url = require("url");

function handleTeacherRoutes(req, res) {
  const pathname = req.url.split("?")[0];
  const method = req.method;

  try {
    // =========================================================================
    // FORUM MANAGEMENT - /api/teacher/forums/*
    // =========================================================================
    if (pathname.startsWith("/api/teacher/forums")) {
      // GET /api/teacher/forums - Get all forums
      if (method === "GET" && isPath(pathname, "/api/teacher/forums")) {
        return applyMiddleware([verifyToken], forumController.getAllForums)(req, res);
      }

      // GET /api/teacher/forums/my - Get teacher's own forums
      if (method === "GET" && isPath(pathname, "/api/teacher/forums/my")) {
        return applyMiddleware([verifyToken, requireRole("teacher")], forumController.getMyForums)(req, res);
      }

      // GET /api/teacher/forums/tags - Get forum tags
      if (method === "GET" && isPath(pathname, "/api/teacher/forums/tags")) {
        return applyMiddleware([verifyToken], forumController.getTags)(req, res);
      }

      // POST /api/teacher/forums/create - Create forum
      if (method === "POST" && isPath(pathname, "/api/teacher/forums/create")) {
        return applyMiddleware([verifyToken, requireRole("teacher")], forumController.createForum)(req, res);
      }

      // GET/PUT/DELETE /api/teacher/forums/:id - Single forum operations
      const forumMatch = pathname.match(/^\/api\/teacher\/forums\/(\d+)$/);
      if (forumMatch) {
        req.params = { postId: forumMatch[1] };
        if (method === "GET") return applyMiddleware([verifyToken], forumController.getForum)(req, res);
        if (method === "PUT") return applyMiddleware([verifyToken, requireRole("teacher")], forumController.updateForum)(req, res);
        if (method === "DELETE") return applyMiddleware([verifyToken, requireRole("teacher")], forumController.deleteForum)(req, res);
      }

      // POST/DELETE /api/teacher/forums/:id/replies - Forum replies
      const replyMatch = pathname.match(/^\/api\/teacher\/forums\/(\d+)\/replies(\/(\d+))?$/);
      if (replyMatch) {
        req.params = { postId: replyMatch[1], replyId: replyMatch[3] };
        if (method === "POST") return applyMiddleware([verifyToken], forumController.addReply)(req, res);
        if (method === "DELETE" && replyMatch[3]) return applyMiddleware([verifyToken], forumController.deleteReply)(req, res);
      }

      // POST /api/teacher/forums/:id/view - Increment forum views
      if (method === "POST" && matches("/api/teacher/forums/\\d+/view")(pathname)) {
        req.params = { postId: getId(pathname, 4) };
        return applyMiddleware([verifyToken], forumController.incrementViews)(req, res);
      }
    }

    // =========================================================================
    // SUBJECT MANAGEMENT - /api/teacher/subjects/*
    // =========================================================================
    
    // POST /api/teacher/subjects/create - Create subject
    if (method === "POST" && isPath(pathname, "/api/teacher/subjects/create")) {
      return applyMiddleware([verifyToken, requireRole("teacher")], subjectController.createSubject)(req, res);
    }

    // GET /api/teacher/subjects - Get all subjects
    if (method === "GET" && isPath(pathname, "/api/teacher/subjects")) {
      return applyMiddleware([verifyToken, requireRole("teacher")], subjectController.getSubjects)(req, res);
    }

    // GET/PUT/DELETE /api/teacher/subjects/:id - Single subject operations
    if (matches("/api/teacher/subjects/\\d+")(pathname)) {
      req.params = { id: getId(pathname, 4) };
      if (method === "GET") return applyMiddleware([verifyToken, requireRole("teacher")], subjectController.getSubject)(req, res);
      if (method === "PUT") return applyMiddleware([verifyToken, requireRole("teacher")], subjectController.updateSubject)(req, res);
      if (method === "DELETE") return applyMiddleware([verifyToken, requireRole("teacher")], subjectController.deleteSubject)(req, res);
    }

    // Topic management - /api/teacher/subjects/:id/topics/*
    if (matches("/api/teacher/subjects/\\d+/topics/create")(pathname)) {
      req.params = { subjectId: getId(pathname, 4) };
      return applyMiddleware([verifyToken, requireRole("teacher")], subjectController.createTopic)(req, res);
    }

    if (matches("/api/teacher/subjects/\\d+/topics")(pathname) && method === "GET") {
      req.params = { subjectId: getId(pathname, 4) };
      return applyMiddleware([verifyToken, requireRole("teacher")], subjectController.getTopics)(req, res);
    }

    if (matches("/api/teacher/subjects/\\d+/topics/\\d+")(pathname)) {
      req.params = { subjectId: getId(pathname, 4), topicId: getId(pathname, 6) };
      if (method === "DELETE") return applyMiddleware([verifyToken, requireRole("teacher")], subjectController.deleteTopic)(req, res);
      if (method === "PUT") return applyMiddleware([verifyToken, requireRole("teacher")], subjectController.updateTopic)(req, res);
    }

    // =========================================================================
    // MODULE NOTES - /api/teacher/subjects/:id/topics/:id/notes/*
    // =========================================================================
    
    if (matches("/api/teacher/subjects/\\d+/topics/\\d+/notes/create")(pathname)) {
      req.params = { subjectId: getId(pathname, 4), topicId: getId(pathname, 6) };
      return applyMiddleware([verifyToken, requireRole("teacher")], notesController.addModuleNote)(req, res);
    }

    if (matches("/api/teacher/subjects/\\d+/topics/\\d+/notes")(pathname) && method === "GET") {
      req.params = { subjectId: getId(pathname, 4), topicId: getId(pathname, 6) };
      return applyMiddleware([verifyToken, requireRole("teacher")], notesController.getModuleNotes)(req, res);
    }

    if (matches("/api/teacher/subjects/\\d+/topics/\\d+/notes/\\d+")(pathname)) {
      req.params = { subjectId: getId(pathname, 4), topicId: getId(pathname, 6), noteId: getId(pathname, 8) };
      return applyMiddleware([verifyToken, requireRole("teacher")], notesController.deleteModuleNote)(req, res);
    }

    // PUT /api/teacher/notes/:id/visibility - Update note visibility
    if (method === "PUT" && matches("/api/teacher/notes/\\d+/visibility")(pathname)) {
      req.params = { noteId: getId(pathname, 4) };
      return applyMiddleware([verifyToken, requireRole("teacher")], notesController.updateNoteVisibility)(req, res);
    }

    // GET /api/teacher/:id/notes/public - Get teacher's public notes
    if (method === "GET" && matches("/api/teacher/\\d+/notes/public")(pathname)) {
      req.params = { teacherId: getId(pathname, 3) };
      return applyMiddleware([verifyToken], notesController.getPublicNotes)(req, res);
    }

    // =========================================================================
    // QUIZ MANAGEMENT - /api/teacher/quiz/*
    // =========================================================================
    
    // Quiz subjects
    if (isPath(pathname, "/api/teacher/quiz/subjects")) {
      if (method === "POST") return applyMiddleware([verifyToken, requireRole("teacher")], quizController.createSubject)(req, res);
      if (method === "GET") return applyMiddleware([verifyToken, requireRole("teacher")], quizController.getSubjects)(req, res);
    }

    if (matches("/api/teacher/quiz/subjects/\\d+")(pathname)) {
      req.params = { id: getId(pathname, 5) };
      if (method === "GET") return applyMiddleware([verifyToken, requireRole("teacher")], quizController.getSubject)(req, res);
      if (method === "PUT") return applyMiddleware([verifyToken, requireRole("teacher")], quizController.updateSubject)(req, res);
      if (method === "DELETE") return applyMiddleware([verifyToken, requireRole("teacher")], quizController.deleteSubject)(req, res);
    }

    // Quiz sets
    if (matches("/api/teacher/quiz/subjects/\\d+/quiz-sets")(pathname)) {
      req.params = { subjectId: getId(pathname, 5) };
      if (method === "POST") return applyMiddleware([verifyToken, requireRole("teacher")], quizController.createQuizSet)(req, res);
      if (method === "GET") return applyMiddleware([verifyToken], quizController.getQuizSets)(req, res);
    }

    if (matches("/api/teacher/quiz/quiz-sets/\\d+")(pathname)) {
      req.params = { id: getId(pathname, 5) };
      if (method === "GET") return applyMiddleware([verifyToken], quizController.getQuizSet)(req, res);
      if (method === "PUT" && !pathname.includes("reorder")) return applyMiddleware([verifyToken, requireRole("teacher")], quizController.updateQuizSet)(req, res);
      if (method === "DELETE") return applyMiddleware([verifyToken, requireRole("teacher")], quizController.deleteQuizSet)(req, res);
    }

    // Quiz questions
    if (matches("/api/teacher/quiz/quiz-sets/\\d+/questions")(pathname)) {
      req.params = { quizSetId: getId(pathname, 5) };
      if (method === "POST") return applyMiddleware([verifyToken, requireRole("teacher")], quizController.createQuestion)(req, res);
      if (method === "GET") return applyMiddleware([verifyToken], quizController.getQuestions)(req, res);
    }

    if (matches("/api/teacher/quiz/questions/\\d+")(pathname)) {
      req.params = { id: getId(pathname, 5) };
      if (method === "GET") return applyMiddleware([verifyToken], quizController.getQuestion)(req, res);
      if (method === "PUT") return applyMiddleware([verifyToken, requireRole("teacher")], quizController.updateQuestion)(req, res);
      if (method === "DELETE") return applyMiddleware([verifyToken, requireRole("teacher")], quizController.deleteQuestion)(req, res);
    }

    // PUT /api/teacher/quiz/quiz-sets/:id/reorder-questions
    if (method === "PUT" && matches("/api/teacher/quiz/quiz-sets/\\d+/reorder-questions")(pathname)) {
      req.params = { quizSetId: getId(pathname, 5) };
      return applyMiddleware([verifyToken, requireRole("teacher")], quizController.reorderQuestions)(req, res);
    }

    // =========================================================================
    // TODO MANAGEMENT - /api/teacher/todos/*
    // =========================================================================
    
    if (isPath(pathname, "/api/teacher/todos/create")) {
      if (method === "POST") return applyMiddleware([verifyToken, requireRole("teacher")], todoController.createTodo)(req, res);
    }

    if (isPath(pathname, "/api/teacher/todos") && method === "GET") {
      return applyMiddleware([verifyToken, requireRole("teacher")], todoController.getTodos)(req, res);
    }

    if (matches("/api/teacher/todos/\\d+")(pathname)) {
      req.params = { id: getId(pathname, 4) };
      if (method === "PUT") return applyMiddleware([verifyToken, requireRole("teacher")], todoController.updateTodo)(req, res);
      if (method === "DELETE") return applyMiddleware([verifyToken, requireRole("teacher")], todoController.deleteTodo)(req, res);
    }

    // =========================================================================
    // PROFILE MANAGEMENT - /api/teacher/profile
    // =========================================================================
    
    if (isPath(pathname, "/api/teacher/profile")) {
      if (method === "GET") return applyMiddleware([verifyToken, requireRole("teacher")], profileController.getProfile)(req, res);
      if (method === "PUT") return applyMiddleware([verifyToken, requireRole("teacher")], profileController.updateProfile)(req, res);
    }

    // GET /api/teacher/:teacherId/profile - Public teacher profile
    if (method === "GET" && matches("/api/teacher/\\d+/profile")(pathname)) {
      req.params = { teacherId: getId(pathname, 3) };
      return applyMiddleware([verifyToken], profileController.getPublicProfile)(req, res);
    }

    // =========================================================================
    // PUBLIC RESOURCES (Teacher-created content) - /api/public/*
    // These are teacher resources exposed for students/parents to access
    // Note: These endpoints don't require authentication as they are public resources
    // =========================================================================
    
    // Public notes - GET /api/public/notes
    if (method === "GET" && isPath(pathname, "/api/public/notes")) {
      return publicController.getAllPublicNotes(req, res);
    }

    // GET /api/public/subjects/:id/notes
    if (method === "GET" && matches("/api/public/subjects/\\d+/notes")(pathname)) {
      req.params = { subjectId: getId(pathname, 4) };
      return publicController.getPublicNotesBySubject(req, res);
    }

    // Public quizzes
    if (method === "GET" && isPath(pathname, "/api/public/quizzes")) {
      return publicController.getAllPublishedQuizzes(req, res);
    }

    if (method === "GET" && matches("/api/public/subjects/\\d+/quizzes")(pathname)) {
      req.params = { subjectId: getId(pathname, 4) };
      return publicController.getPublishedQuizzesBySubject(req, res);
    }

    if (method === "GET" && matches("/api/public/quizzes/\\d+")(pathname)) {
      req.params = { quizSetId: getId(pathname, 4) };
      return publicController.getPublishedQuizSet(req, res);
    }

    // Public forums
    if (method === "GET" && isPath(pathname, "/api/public/forums")) {
      return publicController.getAllPublishedForums(req, res);
    }

    if (method === "GET" && matches("/api/public/forums/grade/\\d+")(pathname)) {
      req.params = { grade: getId(pathname, 5) };
      return publicController.getPublishedForumsByGrade(req, res);
    }

    // Public teachers list - GET /api/public/teachers
    if (method === "GET" && isPath(pathname, "/api/public/teachers")) {
      return publicController.getAllTeachers(req, res);
    }

    // Public view count routes - These still need auth for tracking
    if (method === "POST" && matches("/api/public/notes/\\d+/view")(pathname)) {
      req.params = { id: getId(pathname, 4), type: "notes" };
      return applyMiddleware([verifyToken], viewController.incrementView)(req, res);
    }

    if (method === "POST" && matches("/api/public/quizzes/\\d+/view")(pathname)) {
      req.params = { id: getId(pathname, 4), type: "quizzes" };
      return applyMiddleware([verifyToken], viewController.incrementView)(req, res);
    }

    if (method === "POST" && matches("/api/public/forums/\\d+/view")(pathname)) {
      req.params = { id: getId(pathname, 4), type: "forums" };
      return applyMiddleware([verifyToken], viewController.incrementView)(req, res);
    }

    return null;
  } catch (err) {
    console.error(`[TeacherRoutes Error] ${err.message}`);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
}

module.exports = handleTeacherRoutes;