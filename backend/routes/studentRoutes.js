// routes/studentRoutes.js
const subjectController = require("../controllers/student/subjectController");
const notesController = require("../controllers/student/notesController");
const flashcardController = require("../controllers/student/flashcardController");
const quizController = require("../controllers/student/quizController");
const gpaController = require("../controllers/student/gpaController");
const todoController = require("../controllers/student/todoController");
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

    // Todo management routes
    // Create todo: POST /api/student/todos/create
    if (method === "POST" && pathname === "/api/student/todos/create") {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        todoController.createTodo
      )(req, res);
    }

    // Get all todos: GET /api/student/todos
    if (method === "GET" && pathname === "/api/student/todos") {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        todoController.getTodos
      )(req, res);
    }

    // Get todos by type: GET /api/student/todos/:type
    if (
      method === "GET" &&
      pathname.match(/^\/api\/student\/todos\/(todo|weekly|monthly)$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        todoController.getTodosByType
      )(req, res);
    }

    // Update todo: PUT /api/student/todos/:id
    if (method === "PUT" && pathname.match(/^\/api\/student\/todos\/\d+$/)) {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        todoController.updateTodo
      )(req, res);
    }

    // Delete todo: DELETE /api/student/todos/:id
    if (method === "DELETE" && pathname.match(/^\/api\/student\/todos\/\d+$/)) {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        todoController.deleteTodo
      )(req, res);
    }

    // Archive expired goals: POST /api/student/archive-expired-goals
    if (
      method === "POST" &&
      pathname === "/api/student/archive-expired-goals"
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        todoController.archiveExpiredGoals
      )(req, res);
    }

    // Get expired goals: GET /api/student/expired-goals
    if (method === "GET" && pathname === "/api/student/expired-goals") {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        todoController.getExpiredGoals
      )(req, res);
    }

    // Get parent-assigned todos: GET /api/student/parent-todos
    if (method === "GET" && pathname === "/api/student/parent-todos") {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        todoController.getParentTodos
      )(req, res);
    }

    // Update parent todo completion: PUT /api/student/parent-todos/:id
    if (
      method === "PUT" &&
      pathname.match(/^\/api\/student\/parent-todos\/\d+$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        todoController.updateParentTodoCompletion
      )(req, res);
    }

    // ========== STUDENT QUIZ MANAGEMENT ROUTES ==========

    // Quiz Subjects routes
    // Create subject: POST /api/student/quizzes/subjects
    if (method === "POST" && pathname === "/api/student/quizzes/subjects") {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        quizController.createSubject
      )(req, res);
    }

    // Get all subjects: GET /api/student/quizzes/subjects
    if (method === "GET" && pathname === "/api/student/quizzes/subjects") {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        quizController.getSubjects
      )(req, res);
    }

    // Get specific subject: GET /api/student/quizzes/subjects/:subjectId
    if (
      method === "GET" &&
      pathname.match(/^\/api\/student\/quizzes\/subjects\/\d+$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        quizController.getSubject
      )(req, res);
    }

    // Update subject: PUT /api/student/quizzes/subjects/:subjectId
    if (
      method === "PUT" &&
      pathname.match(/^\/api\/student\/quizzes\/subjects\/\d+$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        quizController.updateSubject
      )(req, res);
    }

    // Delete subject: DELETE /api/student/quizzes/subjects/:subjectId
    if (
      method === "DELETE" &&
      pathname.match(/^\/api\/student\/quizzes\/subjects\/\d+$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        quizController.deleteSubject
      )(req, res);
    }

    // Quiz Sets routes
    // Create quiz set: POST /api/student/quizzes/subjects/:subjectId/sets
    if (
      method === "POST" &&
      pathname.match(/^\/api\/student\/quizzes\/subjects\/\d+\/sets$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        quizController.createQuizSet
      )(req, res);
    }

    // Get all quiz sets for subject: GET /api/student/quizzes/subjects/:subjectId/sets
    if (
      method === "GET" &&
      pathname.match(/^\/api\/student\/quizzes\/subjects\/\d+\/sets$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        quizController.getQuizSets
      )(req, res);
    }

    // Get specific quiz set: GET /api/student/quizzes/sets/:setId
    if (
      method === "GET" &&
      pathname.match(/^\/api\/student\/quizzes\/sets\/\d+$/) &&
      !pathname.includes("questions")
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        quizController.getQuizSet
      )(req, res);
    }

    // Update quiz set: PUT /api/student/quizzes/sets/:setId
    if (
      method === "PUT" &&
      pathname.match(/^\/api\/student\/quizzes\/sets\/\d+$/) &&
      !pathname.includes("questions")
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        quizController.updateQuizSet
      )(req, res);
    }

    // Delete quiz set: DELETE /api/student/quizzes/sets/:setId
    if (
      method === "DELETE" &&
      pathname.match(/^\/api\/student\/quizzes\/sets\/\d+$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        quizController.deleteQuizSet
      )(req, res);
    }

    // Quiz Questions routes
    // Create question: POST /api/student/quizzes/sets/:setId/questions
    if (
      method === "POST" &&
      pathname.match(/^\/api\/student\/quizzes\/sets\/\d+\/questions$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        quizController.createQuestion
      )(req, res);
    }

    // Get all questions: GET /api/student/quizzes/sets/:setId/questions
    if (
      method === "GET" &&
      pathname.match(/^\/api\/student\/quizzes\/sets\/\d+\/questions$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        quizController.getQuestions
      )(req, res);
    }

    // Update question: PUT /api/student/quizzes/questions/:questionId
    if (
      method === "PUT" &&
      pathname.match(/^\/api\/student\/quizzes\/questions\/\d+$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        quizController.updateQuestion
      )(req, res);
    }

    // Delete question: DELETE /api/student/quizzes/questions/:questionId
    if (
      method === "DELETE" &&
      pathname.match(/^\/api\/student\/quizzes\/questions\/\d+$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        quizController.deleteQuestion
      )(req, res);
    }

    // ========== GPA TRACKER MANAGEMENT ROUTES ==========

    // GPA Semesters routes
    // Create semester: POST /api/student/gpa/semesters
    if (method === "POST" && pathname === "/api/student/gpa/semesters") {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        gpaController.createSemester
      )(req, res);
    }

    // Get all semesters: GET /api/student/gpa/semesters
    if (method === "GET" && pathname === "/api/student/gpa/semesters") {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        gpaController.getSemesters
      )(req, res);
    }

    // Get specific semester: GET /api/student/gpa/semesters/:semesterId
    if (
      method === "GET" &&
      pathname.match(/^\/api\/student\/gpa\/semesters\/\d+$/) &&
      !pathname.includes("subjects")
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        gpaController.getSemester
      )(req, res);
    }

    // Update semester: PUT /api/student/gpa/semesters/:semesterId
    if (
      method === "PUT" &&
      pathname.match(/^\/api\/student\/gpa\/semesters\/\d+$/) &&
      !pathname.includes("subjects")
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        gpaController.updateSemester
      )(req, res);
    }

    // Delete semester: DELETE /api/student/gpa/semesters/:semesterId
    if (
      method === "DELETE" &&
      pathname.match(/^\/api\/student\/gpa\/semesters\/\d+$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        gpaController.deleteSemester
      )(req, res);
    }

    // GPA Subjects routes
    // Create subject: POST /api/student/gpa/semesters/:semesterId/subjects
    if (
      method === "POST" &&
      pathname.match(/^\/api\/student\/gpa\/semesters\/\d+\/subjects$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        gpaController.createSubject
      )(req, res);
    }

    // Update subject: PUT /api/student/gpa/subjects/:subjectId
    if (
      method === "PUT" &&
      pathname.match(/^\/api\/student\/gpa\/subjects\/\d+$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        gpaController.updateSubject
      )(req, res);
    }

    // Delete subject: DELETE /api/student/gpa/subjects/:subjectId
    if (
      method === "DELETE" &&
      pathname.match(/^\/api\/student\/gpa\/subjects\/\d+$/)
    ) {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        gpaController.deleteSubject
      )(req, res);
    }

    // GPA Grade Mappings routes
    // Get grade mappings: GET /api/student/gpa/grade-mappings
    if (method === "GET" && pathname === "/api/student/gpa/grade-mappings") {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        gpaController.getGradeMappings
      )(req, res);
    }

    // Update grade mappings: PUT /api/student/gpa/grade-mappings
    if (method === "PUT" && pathname === "/api/student/gpa/grade-mappings") {
      return applyMiddleware(
        [verifyToken, requireRole("student")],
        gpaController.updateGradeMappings
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
