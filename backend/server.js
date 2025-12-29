// server.js
const http = require("http");
const url = require("url");
const handleApiRoutes = require("./routes/index");
const serveStaticFiles = require("./utils/staticFileHandler");

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
    return handleApiRoutes(req, res);
  }

  // Static frontend files
  serveStaticFiles(req, res);
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () =>
  console.log(`✅ Server running at http://localhost:${PORT}`)
);
