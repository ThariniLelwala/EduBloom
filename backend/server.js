// server.js
const http = require("http");
const url = require("url");
const fs = require("fs");
const path = require("path");
const handleAuthRoutes = require("./routes/authRoutes");
const handleStudentRoutes = require("./routes/studentRoutes");

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
    // Try student routes first
    const studentResult = handleStudentRoutes(req, res);
    if (studentResult !== null) {
      return studentResult;
    }

    // Fall back to auth routes
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
