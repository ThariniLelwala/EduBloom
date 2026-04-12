const url = require("url");
const handleAuthRoutes = require("./authRoutes");
const handleStudentRoutes = require("./studentRoutes");
const handleTeacherRoutes = require("./teacherRoutes");
const handleAdminRoutes = require("./adminRoutes");
const handlePublicRoutes = require("./publicRoutes");

const handleApiRoutes = (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  let handled = null;

  // Public routes (no auth required)
  if (pathname.startsWith("/api/announcements") || pathname.startsWith("/api/faqs")) {
    handled = handlePublicRoutes(req, res);
  }

  // Delegated routes (auth required)
  if (handled === null && pathname.startsWith("/api/student/")) {
    handled = handleStudentRoutes(req, res);
  } else if (handled === null && pathname.startsWith("/api/teacher/")) {
    handled = handleTeacherRoutes(req, res);
  } else if (handled === null && pathname.startsWith("/api/admin/")) {
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
