// controllers/teacherController.js
const teacherService = require("../services/teacherService");
const { parseRequestBody } = require("../middleware/authMiddleware");

class TeacherController {
  /**
   * Create a new subject
   * POST /api/teacher/subjects/create
   */
  async createSubject(req, res) {
    try {
      const data = await parseRequestBody(req);
      const { name, description } = data;
      const teacherId = req.user.id;

      if (!name) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Subject name is required" }));
        return;
      }

      const subject = await teacherService.createSubject(
        teacherId,
        name,
        description || null
      );

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Subject created successfully",
          subject,
        })
      );
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Get all subjects for the teacher
   * GET /api/teacher/subjects
   */
  async getSubjects(req, res) {
    try {
      const teacherId = req.user.id;
      const subjects = await teacherService.getTeacherSubjects(teacherId);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Subjects retrieved successfully",
          subjects,
        })
      );
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Get a specific subject with its topics
   * GET /api/teacher/subjects/:subjectId
   */
  async getSubject(req, res) {
    try {
      const teacherId = req.user.id;
      const pathname = req.url.split("?")[0];
      const subjectId = parseInt(pathname.split("/").pop());

      if (!subjectId || isNaN(subjectId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid subject ID" }));
        return;
      }

      const subject = await teacherService.getSubjectWithTopics(
        subjectId,
        teacherId
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Subject retrieved successfully",
          subject,
        })
      );
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Update a subject
   * PUT /api/teacher/subjects/:subjectId
   */
  async updateSubject(req, res) {
    try {
      const data = await parseRequestBody(req);
      const teacherId = req.user.id;
      const pathname = req.url.split("?")[0];
      const subjectId = parseInt(pathname.split("/").pop());

      if (!subjectId || isNaN(subjectId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid subject ID" }));
        return;
      }

      const subject = await teacherService.updateSubject(
        subjectId,
        teacherId,
        data
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Subject updated successfully",
          subject,
        })
      );
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Delete a subject
   * DELETE /api/teacher/subjects/:subjectId
   */
  async deleteSubject(req, res) {
    try {
      const teacherId = req.user.id;
      const pathname = req.url.split("?")[0];
      const subjectId = parseInt(pathname.split("/").pop());

      if (!subjectId || isNaN(subjectId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid subject ID" }));
        return;
      }

      const result = await teacherService.deleteSubject(subjectId, teacherId);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Create a topic within a subject
   * POST /api/teacher/subjects/:subjectId/topics/create
   */
  async createTopic(req, res) {
    try {
      const data = await parseRequestBody(req);
      const { name, description } = data;
      const teacherId = req.user.id;
      const pathname = req.url.split("?")[0];
      const subjectId = parseInt(pathname.split("/")[4]);

      if (!subjectId || isNaN(subjectId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid subject ID" }));
        return;
      }

      if (!name) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Topic name is required" }));
        return;
      }

      const topic = await teacherService.createTopic(
        subjectId,
        teacherId,
        name,
        description || null
      );

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Topic created successfully",
          topic,
        })
      );
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Get topics for a subject
   * GET /api/teacher/subjects/:subjectId/topics
   */
  async getTopics(req, res) {
    try {
      const teacherId = req.user.id;
      const pathname = req.url.split("?")[0];
      const subjectId = parseInt(pathname.split("/")[4]);

      if (!subjectId || isNaN(subjectId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid subject ID" }));
        return;
      }

      const topics = await teacherService.getTopics(subjectId, teacherId);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Topics retrieved successfully",
          topics,
        })
      );
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Delete a topic
   * DELETE /api/teacher/subjects/:subjectId/topics/:topicId
   */
  async deleteTopic(req, res) {
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

      const result = await teacherService.deleteTopic(
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

      const note = await teacherService.addModuleNote(
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

      const notes = await teacherService.getModuleNotes(
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

      const result = await teacherService.deleteModuleNote(
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

      const note = await teacherService.updateNoteVisibility(
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

      const notes = await teacherService.getPublicNotesByTeacher(teacherId);

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

module.exports = new TeacherController();
