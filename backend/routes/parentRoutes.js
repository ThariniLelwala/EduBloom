// routes/parentRoutes.js
const parentController = require("../controllers/parentController");
const todoController = require("../controllers/parent/todoController");
const calendarController = require("../controllers/parent/calendarController");
const progressController = require("../controllers/parent/progressController");
const resourceController = require("../controllers/parent/resourceController");
const announcementsService = require("../services/admin/announcementsService");
const {
  verifyToken,
  requireRole,
  applyMiddleware,
} = require("../middleware/authMiddleware");

function handleParentRoutes(req, res) {
  const pathname = req.url.split("?")[0];
  const method = req.method;

  try {
    // ========== CHILDREN MANAGEMENT ROUTES ==========

    // Get all children for parent: GET /api/parent/children
    if (method === "GET" && pathname === "/api/parent/children") {
      return applyMiddleware(
        [verifyToken, requireRole("parent")],
        progressController.getLinkedChildren
      )(req, res);
    }

    // Get all progress data for child: GET /api/parent/children/:childId/progress/all
    if (
      method === "GET" &&
      pathname.match(/^\/api\/parent\/children\/\d+\/progress\/all$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("parent")],
        progressController.getAllProgressData
      )(req, res);
    }

    // Get single child: GET /api/parent/children/:id
    if (method === "GET" && pathname.match(/^\/api\/parent\/children\/\d+$/)) {
      return applyMiddleware(
        [verifyToken, requireRole("parent")],
        parentController.getChildData
      )(req, res);
    }

    // Get child subjects: GET /api/parent/children/:id/subjects
    if (
      method === "GET" &&
      pathname.match(/^\/api\/parent\/children\/\d+\/subjects$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("parent")],
        parentController.getChildSubjects
      )(req, res);
    }

    // Request child link: POST /api/parent/request-child-link
    if (method === "POST" && pathname === "/api/parent/request-child-link") {
      return applyMiddleware(
        [verifyToken, requireRole("parent")],
        parentController.requestChildLink
      )(req, res);
    }

    // Remove student link: POST /api/parent/remove-student-link
    if (method === "POST" && pathname === "/api/parent/remove-student-link") {
      return applyMiddleware(
        [verifyToken, requireRole("parent")],
        parentController.removeStudentLink
      )(req, res);
    }

    // ========== PROGRESS DATA ROUTES ==========

    // Get child's pomodoro sessions: GET /api/parent/children/:childId/pomodoro/sessions
    if (
      method === "GET" &&
      pathname.match(/^\/api\/parent\/children\/\d+\/pomodoro\/sessions$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("parent")],
        progressController.getPomodoroSessions
      )(req, res);
    }

    // Get child's pomodoro stats: GET /api/parent/children/:childId/pomodoro/stats
    if (
      method === "GET" &&
      pathname.match(/^\/api\/parent\/children\/\d+\/pomodoro\/stats$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("parent")],
        progressController.getPomodoroStats
      )(req, res);
    }

    // Get child's diary entries: GET /api/parent/children/:childId/diary/entries
    if (
      method === "GET" &&
      pathname.match(/^\/api\/parent\/children\/\d+\/diary\/entries$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("parent")],
        progressController.getDiaryEntries
      )(req, res);
    }

    // Get child's todos: GET /api/parent/children/:childId/todos
    if (
      method === "GET" &&
      pathname.match(/^\/api\/parent\/children\/\d+\/todos$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("parent")],
        progressController.getTodos
      )(req, res);
    }

    // Get child's todos by type: GET /api/parent/children/:childId/todos/:type
    if (
      method === "GET" &&
      pathname.match(/^\/api\/parent\/children\/\d+\/todos\/(todo|weekly|monthly)$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("parent")],
        progressController.getTodos
      )(req, res);
    }

    // Get child's exam terms: GET /api/parent/children/:childId/exams/terms
    if (
      method === "GET" &&
      pathname.match(/^\/api\/parent\/children\/\d+\/exams\/terms$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("parent")],
        progressController.getExamTerms
      )(req, res);
    }

    // Get child's mark subjects: GET /api/parent/children/:childId/marks/subjects
    if (
      method === "GET" &&
      pathname.match(/^\/api\/parent\/children\/\d+\/marks\/subjects$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("parent")],
        progressController.getMarkSubjects
      )(req, res);
    }

    // ========== TODO ROUTES ==========

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

    // ========== CALENDAR ROUTES ==========

    // Create deadline: POST /api/parent/calendar/deadlines
    if (method === "POST" && pathname === "/api/parent/calendar/deadlines") {
      return applyMiddleware(
        [verifyToken, requireRole("parent")],
        calendarController.createDeadline
      )(req, res);
    }

    // Get deadlines for student: GET /api/parent/calendar/students/:studentId/deadlines
    if (
      method === "GET" &&
      pathname.match(/^\/api\/parent\/calendar\/students\/\d+\/deadlines$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("parent")],
        calendarController.getDeadlines
      )(req, res);
    }

    // Update deadline: PUT /api/parent/calendar/deadlines/:deadlineId
    if (method === "PUT" && pathname.match(/^\/api\/parent\/calendar\/deadlines\/\d+$/)) {
      return applyMiddleware(
        [verifyToken, requireRole("parent")],
        calendarController.updateDeadline
      )(req, res);
    }

    // Delete deadline: DELETE /api/parent/calendar/deadlines/:deadlineId
    if (method === "DELETE" && pathname.match(/^\/api\/parent\/calendar\/deadlines\/\d+$/)) {
      return applyMiddleware(
        [verifyToken, requireRole("parent")],
        calendarController.deleteDeadline
      )(req, res);
    }

    // Create parent task: POST /api/parent/calendar/parent-tasks
    if (method === "POST" && pathname === "/api/parent/calendar/parent-tasks") {
      return applyMiddleware(
        [verifyToken, requireRole("parent")],
        calendarController.createParentTask
      )(req, res);
    }

    // Get parent tasks: GET /api/parent/calendar/parent-tasks
    if (method === "GET" && pathname === "/api/parent/calendar/parent-tasks") {
      return applyMiddleware(
        [verifyToken, requireRole("parent")],
        calendarController.getParentTasks
      )(req, res);
    }

    // Update parent task: PUT /api/parent/calendar/parent-tasks/:taskId
    if (method === "PUT" && pathname.match(/^\/api\/parent\/calendar\/parent-tasks\/\d+$/)) {
      return applyMiddleware(
        [verifyToken, requireRole("parent")],
        calendarController.updateParentTask
      )(req, res);
    }

    // Delete parent task: DELETE /api/parent/calendar/parent-tasks/:taskId
    if (method === "DELETE" && pathname.match(/^\/api\/parent\/calendar\/parent-tasks\/\d+$/)) {
      return applyMiddleware(
        [verifyToken, requireRole("parent")],
        calendarController.deleteParentTask
      )(req, res);
    }

    // Resource recommendations: POST /api/parent/resources/recommend
    if (method === "POST" && pathname === "/api/parent/resources/recommend") {
      return applyMiddleware(
        [verifyToken, requireRole("parent")],
        resourceController.addRecommendation
      )(req, res);
    }

    // Get recommendations for student: GET /api/parent/resources/:studentId/recommendations
    if (method === "GET" && pathname.match(/^\/api\/parent\/resources\/\d+\/recommendations$/)) {
      return applyMiddleware(
        [verifyToken, requireRole("parent")],
        resourceController.getRecommendations
      )(req, res);
    }

    // Remove recommendation: DELETE /api/parent/resources/recommend/:id
    if (method === "DELETE" && pathname.match(/^\/api\/parent\/resources\/recommend\/\d+$/)) {
      return applyMiddleware(
        [verifyToken, requireRole("parent")],
        resourceController.removeRecommendation
      )(req, res);
    }

    // Remove recommendation by resource: DELETE /api/parent/resources/remove-recommendation
    if (method === "POST" && pathname === "/api/parent/resources/remove-recommendation") {
      return applyMiddleware(
        [verifyToken, requireRole("parent")],
        resourceController.removeRecommendationByResource
      )(req, res);
    }

    // =========================================================================
    // ANNOUNCEMENTS - /api/parent/announcements/*
    // =========================================================================

    // Get announcements for parent: GET /api/parent/announcements
    if (method === "GET" && pathname === "/api/parent/announcements") {
      return applyMiddleware(
        [verifyToken, requireRole("parent")],
        async (req, res) => {
          const announcements = await announcementsService.getAnnouncementsByRole("parent");
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ announcements }));
        }
      )(req, res);
    }

    // Get latest announcement for parent: GET /api/parent/announcements/latest
    if (method === "GET" && pathname === "/api/parent/announcements/latest") {
      return applyMiddleware(
        [verifyToken, requireRole("parent")],
        async (req, res) => {
          const announcement = await announcementsService.getLatestAnnouncementByRole("parent");
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ announcement }));
        }
      )(req, res);
    }

    // Route not found
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Parent route not found" }));
  } catch (err) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
}

module.exports = handleParentRoutes;