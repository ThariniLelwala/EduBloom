// routes/teacherRoutes.js
const subjectController = require("../controllers/teacher/subjectController");
const notesController = require("../controllers/teacher/notesController");
const quizController = require("../controllers/teacher/quizController");
const todoController = require("../controllers/teacher/todoController");
const forumController = require("../controllers/teacher/forumController");
const {
  verifyToken,
  requireRole,
  applyMiddleware,
} = require("../middleware/authMiddleware");

const url = require("url");

function handleTeacherRoutes(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  try {
    // ========== FORUM MANAGEMENT ROUTES ==========
    if (pathname.startsWith("/api/teacher/forums")) {
      // Get all forums: GET /api/teacher/forums
      if (method === "GET" && (pathname === "/api/teacher/forums" || pathname === "/api/teacher/forums/")) {
        return applyMiddleware([verifyToken], forumController.getAllForums)(req, res);
      }

      // Get my forums: GET /api/teacher/forums/my
      if (method === "GET" && (pathname === "/api/teacher/forums/my" || pathname === "/api/teacher/forums/my/")) {
        return applyMiddleware(
          [verifyToken, requireRole("teacher")],
          forumController.getMyForums
        )(req, res);
      }

      // Get tags: GET /api/teacher/forums/tags
      if (method === "GET" && pathname === "/api/teacher/forums/tags") {
        return applyMiddleware([verifyToken], forumController.getTags)(req, res);
      }

      // Create forum: POST /api/teacher/forums/create
      if (method === "POST" && pathname === "/api/teacher/forums/create") {
        return applyMiddleware(
          [verifyToken, requireRole("teacher")],
          forumController.createForum
        )(req, res);
      }

      // Routes with postId
      const forumPathMatch = pathname.match(/^\/api\/teacher\/forums\/(\d+)$/);
      if (forumPathMatch) {
        const postId = forumPathMatch[1];
        req.params = { postId };
        
        if (method === "GET") {
          return applyMiddleware([verifyToken], forumController.getForum)(req, res);
        }
        if (method === "PUT") {
          return applyMiddleware([verifyToken, requireRole("teacher")], forumController.updateForum)(req, res);
        }
        if (method === "DELETE") {
          return applyMiddleware([verifyToken, requireRole("teacher")], forumController.deleteForum)(req, res);
        }
      }

      // Replies
      const replyPathMatch = pathname.match(/^\/api\/teacher\/forums\/(\d+)\/replies(\/(\d+))?$/);
      if (replyPathMatch) {
        const postId = replyPathMatch[1];
        const replyId = replyPathMatch[3];
        req.params = { postId, replyId };

        if (method === "POST") {
          return applyMiddleware([verifyToken], forumController.addReply)(req, res);
        }
        if (method === "DELETE" && replyId) {
          return applyMiddleware([verifyToken], forumController.deleteReply)(req, res);
        }
      }

      // Views
      const viewPathMatch = pathname.match(/^\/api\/teacher\/forums\/(\d+)\/view$/);
      if (method === "POST" && viewPathMatch) {
        const postId = viewPathMatch[1];
        req.params = { postId };
        return applyMiddleware([verifyToken], forumController.incrementViews)(req, res);
      }
    }

    // ========== OTHER TEACHER ROUTES ==========

    // Subject management routes
    if (method === "POST" && pathname === "/api/teacher/subjects/create") {
      return applyMiddleware([verifyToken, requireRole("teacher")], subjectController.createSubject)(req, res);
    }
    if (method === "GET" && pathname === "/api/teacher/subjects") {
      return applyMiddleware([verifyToken, requireRole("teacher")], subjectController.getSubjects)(req, res);
    }
    if (method === "GET" && pathname.match(/^\/api\/teacher\/subjects\/\d+$/)) {
      const id = pathname.split("/").pop();
      req.params = { id };
      return applyMiddleware([verifyToken, requireRole("teacher")], subjectController.getSubject)(req, res);
    }
    if (method === "PUT" && pathname.match(/^\/api\/teacher\/subjects\/\d+$/)) {
      const id = pathname.split("/").pop();
      req.params = { id };
      return applyMiddleware([verifyToken, requireRole("teacher")], subjectController.updateSubject)(req, res);
    }
    if (method === "DELETE" && pathname.match(/^\/api\/teacher\/subjects\/\d+$/)) {
      const id = pathname.split("/").pop();
      req.params = { id };
      return applyMiddleware([verifyToken, requireRole("teacher")], subjectController.deleteSubject)(req, res);
    }

    // Topic management routes
    if (method === "POST" && pathname.match(/^\/api\/teacher\/subjects\/\d+\/topics\/create$/)) {
      const parts = pathname.split("/");
      const subjectId = parts[parts.length - 3];
      req.params = { subjectId };
      return applyMiddleware([verifyToken, requireRole("teacher")], subjectController.createTopic)(req, res);
    }
    if (method === "GET" && pathname.match(/^\/api\/teacher\/subjects\/\d+\/topics$/)) {
      const subjectId = pathname.split("/")[4];
      req.params = { subjectId };
      return applyMiddleware([verifyToken, requireRole("teacher")], subjectController.getTopics)(req, res);
    }
    if (method === "DELETE" && pathname.match(/^\/api\/teacher\/subjects\/\d+\/topics\/\d+$/)) {
      const parts = pathname.split("/");
      const topicId = parts.pop();
      const subjectId = parts[parts.length - 2];
      req.params = { subjectId, topicId };
      return applyMiddleware([verifyToken, requireRole("teacher")], subjectController.deleteTopic)(req, res);
    }
    if (method === "PUT" && pathname.match(/^\/api\/teacher\/subjects\/\d+\/topics\/\d+$/)) {
      const parts = pathname.split("/");
      const topicId = parts.pop();
      const subjectId = parts[parts.length - 2];
      req.params = { subjectId, topicId };
      return applyMiddleware([verifyToken, requireRole("teacher")], subjectController.updateTopic)(req, res);
    }

    // Module notes routes
    if (method === "POST" && pathname.match(/^\/api\/teacher\/subjects\/\d+\/topics\/\d+\/notes\/create$/)) {
      const parts = pathname.split("/");
      const topicId = parts[parts.length - 2];
      const subjectId = parts[parts.length - 4];
      req.params = { subjectId, topicId };
      return applyMiddleware([verifyToken, requireRole("teacher")], notesController.addModuleNote)(req, res);
    }
    if (method === "GET" && pathname.match(/^\/api\/teacher\/subjects\/\d+\/topics\/\d+\/notes$/)) {
      const parts = pathname.split("/");
      const topicId = parts[parts.length - 1];
      const subjectId = parts[parts.length - 3];
      req.params = { subjectId, topicId };
      return applyMiddleware([verifyToken, requireRole("teacher")], notesController.getModuleNotes)(req, res);
    }
    if (method === "DELETE" && pathname.match(/^\/api\/teacher\/subjects\/\d+\/topics\/\d+\/notes\/\d+$/)) {
      const parts = pathname.split("/");
      const noteId = parts.pop();
      const topicId = parts[parts.length - 2];
      const subjectId = parts[parts.length - 4];
      req.params = { subjectId, topicId, noteId };
      return applyMiddleware([verifyToken, requireRole("teacher")], notesController.deleteModuleNote)(req, res);
    }
    if (method === "PUT" && pathname.match(/^\/api\/teacher\/notes\/\d+\/visibility$/)) {
      const noteId = pathname.split("/")[4];
      req.params = { noteId };
      return applyMiddleware([verifyToken, requireRole("teacher")], notesController.updateNoteVisibility)(req, res);
    }
    if (method === "GET" && pathname.match(/^\/api\/teacher\/\d+\/notes\/public$/)) {
      const teacherId = pathname.split("/")[3];
      req.params = { teacherId };
      return applyMiddleware([verifyToken], notesController.getPublicNotes)(req, res);
    }

    // Quiz routes
    if (method === "POST" && pathname === "/api/teacher/quiz/subjects") {
      return applyMiddleware([verifyToken, requireRole("teacher")], quizController.createSubject)(req, res);
    }
    if (method === "GET" && pathname === "/api/teacher/quiz/subjects") {
      return applyMiddleware([verifyToken, requireRole("teacher")], quizController.getSubjects)(req, res);
    }
    if (method === "GET" && pathname.match(/^\/api\/teacher\/quiz\/subjects\/\d+$/)) {
      const id = pathname.split("/").pop();
      req.params = { id };
      return applyMiddleware([verifyToken, requireRole("teacher")], quizController.getSubject)(req, res);
    }
    if (method === "PUT" && pathname.match(/^\/api\/teacher\/quiz\/subjects\/\d+$/)) {
      const id = pathname.split("/").pop();
      req.params = { id };
      return applyMiddleware([verifyToken, requireRole("teacher")], quizController.updateSubject)(req, res);
    }
    if (method === "DELETE" && pathname.match(/^\/api\/teacher\/quiz\/subjects\/\d+$/)) {
      const id = pathname.split("/").pop();
      req.params = { id };
      return applyMiddleware([verifyToken, requireRole("teacher")], quizController.deleteSubject)(req, res);
    }
    if (method === "POST" && pathname.match(/^\/api\/teacher\/quiz\/subjects\/\d+\/quiz-sets$/)) {
      const subjectId = pathname.split("/")[5];
      req.params = { subjectId };
      return applyMiddleware([verifyToken, requireRole("teacher")], quizController.createQuizSet)(req, res);
    }
    if (method === "GET" && pathname.match(/^\/api\/teacher\/quiz\/subjects\/\d+\/quiz-sets$/)) {
      const subjectId = pathname.split("/")[5];
      req.params = { subjectId };
      return applyMiddleware([verifyToken], quizController.getQuizSets)(req, res);
    }
    if (method === "GET" && pathname.match(/^\/api\/teacher\/quiz\/quiz-sets\/\d+$/)) {
      const id = pathname.split("/").pop();
      req.params = { id };
      return applyMiddleware([verifyToken], quizController.getQuizSet)(req, res);
    }
    if (method === "PUT" && pathname.match(/^\/api\/teacher\/quiz\/quiz-sets\/\d+$/) && !pathname.includes("reorder")) {
      const id = pathname.split("/").pop();
      req.params = { id };
      return applyMiddleware([verifyToken, requireRole("teacher")], quizController.updateQuizSet)(req, res);
    }
    if (method === "DELETE" && pathname.match(/^\/api\/teacher\/quiz\/quiz-sets\/\d+$/)) {
      const id = pathname.split("/").pop();
      req.params = { id };
      return applyMiddleware([verifyToken, requireRole("teacher")], quizController.deleteQuizSet)(req, res);
    }
    if (method === "POST" && pathname.match(/^\/api\/teacher\/quiz\/quiz-sets\/\d+\/questions$/)) {
      const quizSetId = pathname.split("/")[5];
      req.params = { quizSetId };
      return applyMiddleware([verifyToken, requireRole("teacher")], quizController.createQuestion)(req, res);
    }
    if (method === "GET" && pathname.match(/^\/api\/teacher\/quiz\/quiz-sets\/\d+\/questions$/)) {
      const quizSetId = pathname.split("/")[5];
      req.params = { quizSetId };
      return applyMiddleware([verifyToken], quizController.getQuestions)(req, res);
    }
    if (method === "GET" && pathname.match(/^\/api\/teacher\/quiz\/questions\/\d+$/)) {
      const id = pathname.split("/").pop();
      req.params = { id };
      return applyMiddleware([verifyToken], quizController.getQuestion)(req, res);
    }
    if (method === "PUT" && pathname.match(/^\/api\/teacher\/quiz\/questions\/\d+$/)) {
      const id = pathname.split("/").pop();
      req.params = { id };
      return applyMiddleware([verifyToken, requireRole("teacher")], quizController.updateQuestion)(req, res);
    }
    if (method === "DELETE" && pathname.match(/^\/api\/teacher\/quiz\/questions\/\d+$/)) {
      const id = pathname.split("/").pop();
      req.params = { id };
      return applyMiddleware([verifyToken, requireRole("teacher")], quizController.deleteQuestion)(req, res);
    }
    if (method === "PUT" && pathname.match(/^\/api\/teacher\/quiz\/quiz-sets\/\d+\/reorder-questions$/)) {
      const quizSetId = pathname.split("/")[5];
      req.params = { quizSetId };
      return applyMiddleware([verifyToken, requireRole("teacher")], quizController.reorderQuestions)(req, res);
    }

    // Todo routes
    if (method === "POST" && pathname === "/api/teacher/todos/create") {
      return applyMiddleware([verifyToken, requireRole("teacher")], todoController.createTodo)(req, res);
    }
    if (method === "GET" && pathname === "/api/teacher/todos") {
      return applyMiddleware([verifyToken, requireRole("teacher")], todoController.getTodos)(req, res);
    }
    if (method === "PUT" && pathname.match(/^\/api\/teacher\/todos\/\d+$/)) {
      const id = pathname.split("/").pop();
      req.params = { id };
      return applyMiddleware([verifyToken, requireRole("teacher")], todoController.updateTodo)(req, res);
    }
    if (method === "DELETE" && pathname.match(/^\/api\/teacher\/todos\/\d+$/)) {
      const id = pathname.split("/").pop();
      req.params = { id };
      return applyMiddleware([verifyToken, requireRole("teacher")], todoController.deleteTodo)(req, res);
    }

    return null;
  } catch (err) {
    console.error(`[TeacherRoutes Error] ${err.message}`);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
}

module.exports = handleTeacherRoutes;
