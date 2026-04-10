// server.js
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const http = require("http");
const url = require("url");
const handleApiRoutes = require("./routes/index");
const serveStaticFiles = require("./utils/staticFileHandler");
const handleAdminRoutes = require("./routes/adminRoutes");

// Server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Try admin routes first
  const adminHandled = handleAdminRoutes(req, res);
  if (adminHandled) return;
  
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
    return handleApiRoutes(req, res);
  }

  // Static frontend files
  serveStaticFiles(req, res);
});


// Start server
const PORT = process.env.PORT || 3000;

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `❌ Port ${PORT} is already in use. Stop the existing process or set a different PORT in .env.`
    );
    process.exit(1);
  }
  console.error(err);
});

server.listen(PORT, () =>
  console.log(`✅ Server running at http://localhost:${PORT}`)
);
