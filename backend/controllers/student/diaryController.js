// controllers/student/diaryController.js
const diaryService = require("../../services/student/diaryService");
const { parseRequestBody } = require("../../middleware/authMiddleware");

const createEntry = async (req, res) => {
  try {
    const data = await parseRequestBody(req);
    const studentId = req.user.id;

    if (!data.text) {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({
          error: "Diary text is required",
        })
      );
    }

    const entry = await diaryService.createEntry(studentId, data);

    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Diary entry created successfully",
        entry: entry,
      })
    );
  } catch (error) {
    console.error("Error creating diary entry:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        error: "Failed to create diary entry",
        details: error.message,
      })
    );
  }
};

const getEntries = async (req, res) => {
  try {
    const studentId = req.user.id;
    const entries = await diaryService.getEntries(studentId);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Diary entries retrieved successfully",
        entries: entries,
      })
    );
  } catch (error) {
    console.error("Error fetching diary entries:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        error: "Failed to fetch diary entries",
        details: error.message,
      })
    );
  }
};

const updateEntry = async (req, res) => {
  try {
    const entryId = parseInt(req.url.split("/").pop());
    
    if (isNaN(entryId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(
            JSON.stringify({ error: "Invalid entry ID" })
        );
    }

    const data = await parseRequestBody(req);
    const studentId = req.user.id;

    const updatedEntry = await diaryService.updateEntry(
      studentId,
      entryId,
      data
    );

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Diary entry updated successfully",
        entry: updatedEntry,
      })
    );
  } catch (error) {
    console.error("Error updating diary entry:", error);
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        error: "Failed to update diary entry",
        details: error.message,
      })
    );
  }
};

const deleteEntry = async (req, res) => {
  try {
    const entryId = parseInt(req.url.split("/").pop());

    if (isNaN(entryId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(
            JSON.stringify({ error: "Invalid entry ID" })
        );
    }

    const studentId = req.user.id;

    await diaryService.deleteEntry(studentId, entryId);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: "Diary entry deleted successfully",
      })
    );
  } catch (error) {
    console.error("Error deleting diary entry:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        error: "Failed to delete diary entry",
        details: error.message,
      })
    );
  }
};

module.exports = {
  createEntry,
  getEntries,
  updateEntry,
  deleteEntry,
};
