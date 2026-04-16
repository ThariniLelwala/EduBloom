// controllers/teacher/viewController.js
const viewService = require("../../services/teacher/viewService");

class ViewController {
  async incrementView(req, res) {
    try {
      const pathname = req.url.split("?")[0];
      console.log("[ViewController] incrementView called with pathname:", pathname);
      const parts = pathname.split("/");
      
      console.log("[ViewController] parts:", parts);
      
      // For /api/public/forums/2/view -> parts = ["", "api", "public", "forums", "2", "view"]
      // For /api/public/notes/2/view -> parts = ["", "api", "public", "notes", "2", "view"]
      // For /api/public/quizzes/2/view -> parts = ["", "api", "public", "quizzes", "2", "view"]
      const resourceType = parts[3];
      const resourceId = parseInt(parts[4]);

      console.log("[ViewController] resourceType:", resourceType, "resourceId:", resourceId);

      if (!resourceType || isNaN(resourceId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid resource type or ID" }));
        return;
      }

      await viewService.incrementView(resourceType, resourceId);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true }));
    } catch (err) {
      console.error("[ViewController] Error:", err.message);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async getViews(req, res) {
    try {
      const pathname = req.url.split("?")[0];
      const parts = pathname.split("/");
      
      const resourceType = parts[3];
      const resourceId = parseInt(parts[4]);

      if (!resourceType || isNaN(resourceId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid resource type or ID" }));
        return;
      }

      const views = await viewService.getViews(resourceType, resourceId);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(views));
    } catch (err) {
      res.writeHead(err.message === "Resource not found" ? 404 : 500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }
}

module.exports = new ViewController();
