const url = require("url");
const handleAuthRoutes = require("./authRoutes");
const handleStudentRoutes = require("./studentRoutes");
const handleTeacherRoutes = require("./teacherRoutes");
const handleAdminRoutes = require("./adminRoutes");
const handleParentRoutes = require("./parentRoutes");
const handleSupportRoutes = require("./supportRoutes");

const handleApiRoutes = (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Delegate to specific route handlers based on path prefix
  if (pathname.startsWith("/api/student/")) {
    return handleStudentRoutes(req, res);
  } else if (pathname.startsWith("/api/teacher/") || pathname.startsWith("/api/public/")) {
    return handleTeacherRoutes(req, res);
  } else if (pathname.startsWith("/api/admin/")) {
    return handleAdminRoutes(req, res);
  } else if (pathname.startsWith("/api/parent/")) {
    return handleParentRoutes(req, res);
  } else if (pathname.startsWith("/api/support/")) {
    console.log("Delegating to support routes");
    return handleSupportRoutes(req, res);
  }

  return handleAuthRoutes(req, res);
};

module.exports = handleApiRoutes;