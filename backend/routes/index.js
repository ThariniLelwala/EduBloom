const url = require("url");
const handleAuthRoutes = require("./authRoutes");
const handleStudentRoutes = require("./studentRoutes");
const handleTeacherRoutes = require("./teacherRoutes");
const handleAdminRoutes = require("./adminRoutes");
const handleParentRoutes = require("./parentRoutes");

const handleApiRoutes = (req, res) => {
  console.log("\n========== NEW REQUEST ==========");
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  console.log("[INDEX] Full URL:", req.url);
  console.log("[INDEX] Pathname:", pathname);

  // Delegate to specific route handlers based on path prefix
  if (pathname.startsWith("/api/student/")) {
    return handleStudentRoutes(req, res);
  } else if (pathname.startsWith("/api/teacher/") || pathname.startsWith("/api/public/")) {
    console.log("[INDEX] -> teacherRoutes");
    return handleTeacherRoutes(req, res);
  } else if (pathname.startsWith("/api/admin/")) {
    return handleAdminRoutes(req, res);
  } else if (pathname.startsWith("/api/parent/")) {
    console.log("[INDEX] -> parentRoutes");
    return handleParentRoutes(req, res);
  }

  console.log("[INDEX] -> authRoutes (fallback)");
  return handleAuthRoutes(req, res);
};

module.exports = handleApiRoutes;