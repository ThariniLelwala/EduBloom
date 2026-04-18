// controllers/parent/progressController.js
const progressService = require("../../services/parent/progressService");

/**
 * Get child's pomodoro sessions
 */
async function getPomodoroSessions(req, res) {
  try {
    const childId = parseInt(req.url.split("/")[4]);

    if (!childId) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Child ID is required" }));
    }

    const url = new URL(req.url, `http://${req.headers.host}`);
    const limit = parseInt(url.searchParams.get("limit")) || 50;

    const sessions = await progressService.getPomodoroSessions(req.user.id, childId, limit);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Sessions retrieved successfully",
        sessions: sessions,
      })
    );
  } catch (error) {
    console.error("Error fetching child's pomodoro sessions:", error);
    const statusCode = error.message.includes("Not authorized") ? 403 : 500;
    res.writeHead(statusCode, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        error: "Failed to fetch sessions",
        details: error.message,
      })
    );
  }
}

/**
 * Get child's pomodoro statistics
 */
async function getPomodoroStats(req, res) {
  try {
    const childId = parseInt(req.url.split("/")[4]);

    if (!childId) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Child ID is required" }));
    }

    const url = new URL(req.url, `http://${req.headers.host}`);
    const dateFrom = url.searchParams.get("dateFrom") || null;
    const dateTo = url.searchParams.get("dateTo") || null;

    const stats = await progressService.getPomodoroStats(req.user.id, childId, dateFrom, dateTo);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Statistics retrieved successfully",
        stats: stats,
      })
    );
  } catch (error) {
    console.error("Error fetching child's pomodoro stats:", error);
    const statusCode = error.message.includes("Not authorized") ? 403 : 500;
    res.writeHead(statusCode, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        error: "Failed to fetch statistics",
        details: error.message,
      })
    );
  }
}

/**
 * Get child's diary entries
 */
async function getDiaryEntries(req, res) {
  try {
    const childId = parseInt(req.url.split("/")[4]);

    if (!childId) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Child ID is required" }));
    }

    const entries = await progressService.getDiaryEntries(req.user.id, childId);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Diary entries retrieved successfully",
        entries: entries,
      })
    );
  } catch (error) {
    console.error("Error fetching child's diary entries:", error);
    const statusCode = error.message.includes("Not authorized") ? 403 : 500;
    res.writeHead(statusCode, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        error: "Failed to fetch diary entries",
        details: error.message,
      })
    );
  }
}

/**
 * Get child's todos
 */
async function getTodos(req, res) {
  try {
    const childId = parseInt(req.url.split("/")[4]);

    if (!childId) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Child ID is required" }));
    }

    // Check if specific type is requested
    const urlParts = req.url.split("/");
    const typeIndex = urlParts.indexOf("todos") + 1;
    const type = typeIndex < urlParts.length ? urlParts[typeIndex] : null;

    const todos = await progressService.getTodos(req.user.id, childId, type);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Todos retrieved successfully",
        todos: todos,
      })
    );
  } catch (error) {
    console.error("Error fetching child's todos:", error);
    const statusCode = error.message.includes("Not authorized") ? 403 : 500;
    res.writeHead(statusCode, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        error: "Failed to fetch todos",
        details: error.message,
      })
    );
  }
}

/**
 * Get child's exam terms
 */
async function getExamTerms(req, res) {
  try {
    const childId = parseInt(req.url.split("/")[4]);

    if (!childId) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Child ID is required" }));
    }

    const terms = await progressService.getExamTerms(req.user.id, childId);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Exam terms retrieved successfully",
        terms: terms,
      })
    );
  } catch (error) {
    console.error("Error fetching child's exam terms:", error);
    const statusCode = error.message.includes("Not authorized") ? 403 : 500;
    res.writeHead(statusCode, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        error: "Failed to fetch exam terms",
        details: error.message,
      })
    );
  }
}

/**
 * Get child's mark subjects
 */
async function getMarkSubjects(req, res) {
  try {
    const childId = parseInt(req.url.split("/")[4]);

    if (!childId) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Child ID is required" }));
    }

    const subjects = await progressService.getMarkSubjects(req.user.id, childId);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Mark subjects retrieved successfully",
        subjects: subjects,
      })
    );
  } catch (error) {
    console.error("Error fetching child's mark subjects:", error);
    const statusCode = error.message.includes("Not authorized") ? 403 : 500;
    res.writeHead(statusCode, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        error: "Failed to fetch mark subjects",
        details: error.message,
      })
    );
  }
}

/**
 * Get all progress data for a child (convenience endpoint)
 */
async function getAllProgressData(req, res) {
  try {
    const childId = parseInt(req.url.split("/")[4]);

    if (!childId) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Child ID is required" }));
    }

    const data = await progressService.getAllProgressData(req.user.id, childId);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Progress data retrieved successfully",
        data: data,
      })
    );
  } catch (error) {
    console.error("Error fetching all progress data:", error);
    const statusCode = error.message.includes("Not authorized") ? 403 : 500;
    res.writeHead(statusCode, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        error: "Failed to fetch progress data",
        details: error.message,
      })
    );
  }
}

/**
 * Get linked children for a parent
 */
async function getLinkedChildren(req, res) {
  try {
    const children = await progressService.getLinkedChildren(req.user.id);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Children retrieved successfully",
        children: children,
      })
    );
  } catch (error) {
    console.error("Error fetching linked children:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        error: "Failed to fetch children",
        details: error.message,
      })
    );
  }
}

module.exports = {
  getPomodoroSessions,
  getPomodoroStats,
  getDiaryEntries,
  getTodos,
  getExamTerms,
  getMarkSubjects,
  getAllProgressData,
  getLinkedChildren,
};