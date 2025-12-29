const fs = require("fs");
const path = require("path");
const url = require("url");

// Frontend path
const frontendPath = path.join(__dirname, "../../frontend");

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

/**
 * Serves static files from the frontend directory
 * @param {http.IncomingMessage} req
 * @param {http.ServerResponse} res
 */
const serveStaticFiles = (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

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
};

module.exports = serveStaticFiles;
