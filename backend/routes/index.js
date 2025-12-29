const url = require("url");
const handleAuthRoutes = require("./authRoutes");
const handleStudentRoutes = require("./studentRoutes");
const handleTeacherRoutes = require("./teacherRoutes");
const handleAdminRoutes = require("./adminRoutes");

const handleApiRoutes = (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  let handled = null;

  // Delegate to specific route handlers based on path prefix
  if (pathname.startsWith("/api/student/")) {
    handled = handleStudentRoutes(req, res);
  } else if (pathname.startsWith("/api/teacher/")) {
    handled = handleTeacherRoutes(req, res);
  } else if (pathname.startsWith("/api/admin/")) {
    handled = handleAdminRoutes(req, res);
  }

  // If a specific handler processed the request, return
  if (handled !== null) {
    return;
  }

  // Fallback to auth routes for unhandled paths or specific auth-related endpoints
  return handleAuthRoutes(req, res);
};

module.exports = handleApiRoutes;
