const url = require("url");
const handleAuthRoutes = require("./authRoutes");
const handleStudentRoutes = require("./studentRoutes");
const handleTeacherRoutes = require("./teacherRoutes");
const handleAdminRoutes = require("./adminRoutes");

const handleApiRoutes = (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Check if it's a student module route
  if (
    pathname.startsWith("/api/student/subjects") ||
    pathname.startsWith("/api/student/flashcards") ||
    pathname.startsWith("/api/student/todos") ||
    pathname.startsWith("/api/student/archive-expired-goals") ||
    pathname.startsWith("/api/student/expired-goals") ||
    pathname.startsWith("/api/student/parent-todos") ||
    (pathname.startsWith("/api/student/") && pathname.includes("/topics"))
  ) {
    const studentResult = handleStudentRoutes(req, res);
    if (studentResult === null) {
      // If student routes don't handle it, fall back to auth routes
      return handleAuthRoutes(req, res);
    }
    return;
  }

  // Check if it's a teacher module route
  if (
    pathname.startsWith("/api/teacher/subjects") ||
    pathname.startsWith("/api/teacher/notes") ||
    pathname.startsWith("/api/teacher/quiz") ||
    (pathname.startsWith("/api/teacher/") && pathname.includes("/notes"))
  ) {
    const teacherResult = handleTeacherRoutes(req, res);
    if (teacherResult === null) {
      // If teacher routes don't handle it, fall back to auth routes
      return handleAuthRoutes(req, res);
    }
    return;
  }

  // Check if it's an admin route
  if (pathname.startsWith("/api/admin/")) {
    const adminResult = handleAdminRoutes(req, res);
    if (adminResult === null) {
      // If admin routes don't handle it, fall back to auth routes
      return handleAuthRoutes(req, res);
    }
    return;
  }

  // For all other API routes (including /api/student/linked-parents), use auth routes
  return handleAuthRoutes(req, res);
};

module.exports = handleApiRoutes;
