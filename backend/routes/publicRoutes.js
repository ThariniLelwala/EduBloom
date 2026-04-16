// routes/publicRoutes.js
const profileController = require("../controllers/teacher/profileController");
const {
  verifyToken,
  applyMiddleware,
} = require("../middleware/authMiddleware");

function handlePublicRoutes(req, res) {
  const pathname = req.url.split("?")[0];
  const method = req.method;

  try {
    // ========== PUBLIC TEACHER ROUTES ==========
    // Get all public teachers: GET /api/public/teachers
    if (method === "GET" && (pathname === "/api/public/teachers" || pathname === "/api/public/teachers/")) {
      return applyMiddleware([verifyToken], profileController.getAllPublicTeachers)(req, res);
    }

    return null;
  } catch (err) {
    console.error(`[PublicRoutes Error] ${err.message}`);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
}

module.exports = handlePublicRoutes;