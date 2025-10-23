// controllers/teacher/notesController.js
const notesService = require("../../services/teacher/notesService");
const { parseRequestBody } = require("../../middleware/authMiddleware");

class NotesController {
  /**
   * Add a module note (PDF file)
   * POST /api/teacher/subjects/:subjectId/topics/:topicId/notes/create
   */
  async addModuleNote(req, res) {
    try {
      const data = await parseRequestBody(req);
      const { title, file_name, file_url, google_drive_file_id } = data;
      const teacherId = req.user.id;
      const pathname = req.url.split("?")[0];
      const parts = pathname.split("/");
      const subjectId = parseInt(parts[4]);
      const topicId = parseInt(parts[6]);

      if (!subjectId || isNaN(subjectId) || !topicId || isNaN(topicId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid subject or topic ID" }));
        return;
      }

      if (!title || !file_name) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Title and file name are required" }));
        return;
      }

      const note = await notesService.addModuleNote(
        topicId,
        subjectId,
        teacherId,
        title,
        file_name,
        file_url || null,
        google_drive_file_id || null
      );

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Module note added successfully",
          note,
        })
      );
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Get module notes for a topic
   * GET /api/teacher/subjects/:subjectId/topics/:topicId/notes
   */
  async getModuleNotes(req, res) {
    try {
      const teacherId = req.user.id;
      const pathname = req.url.split("?")[0];
      const parts = pathname.split("/");
      const subjectId = parseInt(parts[4]);
      const topicId = parseInt(parts[6]);

      if (!subjectId || isNaN(subjectId) || !topicId || isNaN(topicId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid subject or topic ID" }));
        return;
      }

      const notes = await notesService.getModuleNotes(
        topicId,
        subjectId,
        teacherId
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Module notes retrieved successfully",
          notes,
        })
      );
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Delete a module note
   * DELETE /api/teacher/subjects/:subjectId/topics/:topicId/notes/:noteId
   */
  async deleteModuleNote(req, res) {
    try {
      const teacherId = req.user.id;
      const pathname = req.url.split("?")[0];
      const parts = pathname.split("/");
      const subjectId = parseInt(parts[4]);
      const topicId = parseInt(parts[6]);
      const noteId = parseInt(parts[8]);

      if (
        !subjectId ||
        isNaN(subjectId) ||
        !topicId ||
        isNaN(topicId) ||
        !noteId ||
        isNaN(noteId)
      ) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid IDs" }));
        return;
      }

      const result = await notesService.deleteModuleNote(
        noteId,
        topicId,
        subjectId,
        teacherId
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Update note visibility (public/private)
   * PUT /api/teacher/notes/:noteId/visibility
   */
  async updateNoteVisibility(req, res) {
    try {
      const data = await parseRequestBody(req);
      const { is_public } = data;
      const teacherId = req.user.id;
      const pathname = req.url.split("?")[0];
      const noteId = parseInt(pathname.split("/")[4]);

      if (!noteId || isNaN(noteId) || is_public === undefined) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ error: "Invalid note ID or visibility status" })
        );
        return;
      }

      const note = await notesService.updateNoteVisibility(
        noteId,
        teacherId,
        is_public
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Note visibility updated successfully",
          note,
        })
      );
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Get public notes by teacher (for students)
   * GET /api/teacher/:teacherId/notes/public
   */
  async getPublicNotes(req, res) {
    try {
      const pathname = req.url.split("?")[0];
      const teacherId = parseInt(pathname.split("/")[3]);

      if (!teacherId || isNaN(teacherId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid teacher ID" }));
        return;
      }

      const notes = await notesService.getPublicNotesByTeacher(teacherId);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Public notes retrieved successfully",
          notes,
        })
      );
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }
}

module.exports = new NotesController();
