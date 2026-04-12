// server.js
const http = require("http");
const url = require("url");
const handleApiRoutes = require("./routes/index");
const serveStaticFiles = require("./utils/staticFileHandler");
const { initializeDatabase } = require("./db/db-init");

async function startServer() {
  try {
    await initializeDatabase();
  } catch (err) {
    console.error("Database initialization error:", err);
  }

  const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
      res.writeHead(200);
      res.end();
      return;
    }

    if (pathname.startsWith("/api/")) {
      return handleApiRoutes(req, res);
    }

    serveStaticFiles(req, res);
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () =>
    console.log(`Server running at http://localhost:${PORT}`)
  );
}

startServer();
