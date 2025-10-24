// server.js
const http = require("http");
const url = require("url");
const fs = require("fs");
const path = require("path");
const handleAuthRoutes = require("./routes/authRoutes");
const handleStudentRoutes = require("./routes/studentRoutes");
const handleTeacherRoutes = require("./routes/teacherRoutes");
const handleAdminRoutes = require("./routes/adminRoutes");

// Frontend path
const frontendPath = path.join(__dirname, "../frontend");

// MIME types
const mimeTypes = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

// Server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Add CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  // API routes
  if (pathname.startsWith("/api/")) {
    // Check if it's a student module route (subjects, topics, notes, flashcards, todos) - these go to studentRoutes
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

    // Check if it's a teacher module route (subjects, topics, notes, quiz) - these go to teacherRoutes
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

    // Check if it's an admin route - these go to adminRoutes
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
  }

  // Static frontend files
  let filePath = path.join(
    frontendPath,
    pathname === "/" ? "index.html" : pathname
  );

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 Not Found");
    } else {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = mimeTypes[ext] || "application/octet-stream";
      res.writeHead(200, { "Content-Type": contentType });
      res.end(data);
    }
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () =>
  console.log(`✅ Server running at http://localhost:${PORT}`)
);
