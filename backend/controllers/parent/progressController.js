// controllers/parent/progressController.js
const pomodoroService = require("../../services/student/pomodoroService");
const diaryService = require("../../services/student/diaryService");
const todoService = require("../../services/student/todoService");
const examService = require("../../services/student/examService");
const markService = require("../../services/student/markService");
const db = require("../../db/db");

/**
 * Verify parent-child link exists
 */
async function verifyParentChildLink(parentId, childId) {
  try {
    const result = await db.query(
      `SELECT * FROM parent_student_links 
       WHERE parent_id = $1 AND student_id = $2 AND status = 'accepted'`,
      [parentId, childId]
    );
    return result.rows.length > 0;
  } catch (error) {
    console.error("Error verifying parent-child link:", error);
    return false;
  }
}

/**
 * Get child's pomodoro sessions
 */
async function getPomodoroSessions(req, res) {
  try {
    const childId = parseInt(req.url.split("/")[4]);
    const parentId = req.user.id;

    if (!childId) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Child ID is required" }));
    }

    // Verify parent-child link
    const isLinked = await verifyParentChildLink(parentId, childId);
    if (!isLinked) {
      res.writeHead(403, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Not authorized to view this child's data" }));
    }

    const url = new URL(req.url, `http://${req.headers.host}`);
    const limit = parseInt(url.searchParams.get("limit")) || 50;

    const sessions = await pomodoroService.getSessions(childId, limit);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Sessions retrieved successfully",
        sessions: sessions,
      })
    );
  } catch (error) {
    console.error("Error fetching child's pomodoro sessions:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
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
    const parentId = req.user.id;

    if (!childId) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Child ID is required" }));
    }

    // Verify parent-child link
    const isLinked = await verifyParentChildLink(parentId, childId);
    if (!isLinked) {
      res.writeHead(403, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Not authorized to view this child's data" }));
    }

    const url = new URL(req.url, `http://${req.headers.host}`);
    const dateFrom = url.searchParams.get("dateFrom") || null;
    const dateTo = url.searchParams.get("dateTo") || null;

    const stats = await pomodoroService.getSessionStats(childId, dateFrom, dateTo);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Statistics retrieved successfully",
        stats: stats,
      })
    );
  } catch (error) {
    console.error("Error fetching child's pomodoro stats:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
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
    const parentId = req.user.id;

    if (!childId) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Child ID is required" }));
    }

    // Verify parent-child link
    const isLinked = await verifyParentChildLink(parentId, childId);
    if (!isLinked) {
      res.writeHead(403, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Not authorized to view this child's data" }));
    }

    const entries = await diaryService.getEntries(childId);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Diary entries retrieved successfully",
        entries: entries,
      })
    );
  } catch (error) {
    console.error("Error fetching child's diary entries:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
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
    const parentId = req.user.id;

    if (!childId) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Child ID is required" }));
    }

    // Verify parent-child link
    const isLinked = await verifyParentChildLink(parentId, childId);
    if (!isLinked) {
      res.writeHead(403, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Not authorized to view this child's data" }));
    }

    // Check if specific type is requested
    const urlParts = req.url.split("/");
    const typeIndex = urlParts.indexOf("todos") + 1;
    const type = typeIndex < urlParts.length ? urlParts[typeIndex] : null;

    let todos;
    if (type && ["todo", "weekly", "monthly"].includes(type)) {
      todos = await todoService.getTodosByType(childId, type);
    } else {
      todos = await todoService.getTodos(childId);
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Todos retrieved successfully",
        todos: todos,
      })
    );
  } catch (error) {
    console.error("Error fetching child's todos:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
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
    const parentId = req.user.id;

    if (!childId) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Child ID is required" }));
    }

    // Verify parent-child link
    const isLinked = await verifyParentChildLink(parentId, childId);
    if (!isLinked) {
      res.writeHead(403, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Not authorized to view this child's data" }));
    }

    const terms = await examService.getTerms(childId);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Exam terms retrieved successfully",
        terms: terms,
      })
    );
  } catch (error) {
    console.error("Error fetching child's exam terms:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
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
    const parentId = req.user.id;

    if (!childId) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Child ID is required" }));
    }

    // Verify parent-child link
    const isLinked = await verifyParentChildLink(parentId, childId);
    if (!isLinked) {
      res.writeHead(403, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Not authorized to view this child's data" }));
    }

    const subjects = await markService.getSubjects(childId);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Mark subjects retrieved successfully",
        subjects: subjects,
      })
    );
  } catch (error) {
    console.error("Error fetching child's mark subjects:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        error: "Failed to fetch mark subjects",
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
};