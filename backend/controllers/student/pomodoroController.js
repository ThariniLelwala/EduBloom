// controllers/student/pomodoroController.js
const pomodoroService = require("../../services/student/pomodoroService");
const { parseRequestBody } = require("../../middleware/authMiddleware");

const createSession = async (req, res) => {
  try {
    const data = await parseRequestBody(req);
    const { mode } = data;
    const studentId = req.user.id;

    if (!mode) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Mode is required" }));
    }

    const session = await pomodoroService.createSession(studentId, mode);

    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Session started successfully",
        session: session,
      })
    );
  } catch (error) {
    console.error("Error creating Pomodoro session:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        error: "Failed to start session",
        details: error.message,
      })
    );
  }
};

const updateSession = async (req, res) => {
  try {
    const data = await parseRequestBody(req);
    const { sessionId, cyclesCompleted } = data;
    const studentId = req.user.id;

    if (!sessionId || cyclesCompleted === undefined) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({ error: "Session ID and cycles completed are required" })
      );
    }

    const session = await pomodoroService.updateSession(
      sessionId,
      studentId,
      cyclesCompleted
    );

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Session updated successfully",
        session: session,
      })
    );
  } catch (error) {
    console.error("Error updating Pomodoro session:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        error: "Failed to update session",
        details: error.message,
      })
    );
  }
};

const finishSession = async (req, res) => {
  try {
    const data = await parseRequestBody(req);
    const { sessionId, durationMinutes } = data;
    const studentId = req.user.id;

    if (!sessionId) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Session ID is required" }));
    }

    const session = await pomodoroService.finishSession(sessionId, studentId, durationMinutes);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Session finished successfully",
        session: session,
      })
    );
  } catch (error) {
    console.error("Error in finishSession:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: error.message }));
  }
};

const resumeSession = async (req, res) => {
  try {
    const data = await parseRequestBody(req);
    const { sessionId } = data;
    const studentId = req.user.id;

    if (!sessionId) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Session ID is required" }));
    }

    const session = await pomodoroService.resumeSession(sessionId, studentId);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Session resumed successfully",
        session: session,
      })
    );
  } catch (error) {
    console.error("Error in resumeSession:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: error.message }));
  }
};

const getSessions = async (req, res) => {
  try {
    const studentId = req.user.id;
    const url = new URL(req.url, `http://${req.headers.host}`);
    const limit = parseInt(url.searchParams.get("limit")) || 50;

    const sessions = await pomodoroService.getSessions(studentId, limit);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Sessions retrieved successfully",
        sessions: sessions,
      })
    );
  } catch (error) {
    console.error("Error fetching Pomodoro sessions:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        error: "Failed to fetch sessions",
        details: error.message,
      })
    );
  }
};

const getStats = async (req, res) => {
  try {
    const studentId = req.user.id;
    const url = new URL(req.url, `http://${req.headers.host}`);
    const dateFrom = url.searchParams.get("dateFrom") || null;
    const dateTo = url.searchParams.get("dateTo") || null;

    const stats = await pomodoroService.getSessionStats(
      studentId,
      dateFrom,
      dateTo
    );

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Statistics retrieved successfully",
        stats: stats,
      })
    );
  } catch (error) {
    console.error("Error fetching Pomodoro stats:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        error: "Failed to fetch statistics",
        details: error.message,
      })
    );
  }
};

module.exports = {
  createSession,
  updateSession,
  finishSession,
  resumeSession,
  getSessions,
  getStats,
};
