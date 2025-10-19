// controllers/studentController.js
const studentService = require("../services/studentService");
const { parseRequestBody } = require("../middleware/authMiddleware");

class StudentController {
  /**
   * Create a new subject
   * POST /api/student/subjects/create
   */
  async createSubject(req, res) {
    try {
      const data = await parseRequestBody(req);
      const { name, description } = data;
      const studentId = req.user.id;

      if (!name) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Subject name is required" }));
        return;
      }

      const subject = await studentService.createSubject(
        studentId,
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
   * Get all subjects for the student
   * GET /api/student/subjects
   */
  async getSubjects(req, res) {
    try {
      const studentId = req.user.id;
      const subjects = await studentService.getStudentSubjects(studentId);

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
   * GET /api/student/subjects/:subjectId
   */
  async getSubject(req, res) {
    try {
      const studentId = req.user.id;
      const pathname = req.url.split("?")[0];
      const subjectId = parseInt(pathname.split("/").pop());

      if (!subjectId || isNaN(subjectId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid subject ID" }));
        return;
      }

      const subject = await studentService.getSubjectWithTopics(
        subjectId,
        studentId
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
   * PUT /api/student/subjects/:subjectId
   */
  async updateSubject(req, res) {
    try {
      const data = await parseRequestBody(req);
      const studentId = req.user.id;
      const pathname = req.url.split("?")[0];
      const subjectId = parseInt(pathname.split("/").pop());

      if (!subjectId || isNaN(subjectId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid subject ID" }));
        return;
      }

      const subject = await studentService.updateSubject(
        subjectId,
        studentId,
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
   * DELETE /api/student/subjects/:subjectId
   */
  async deleteSubject(req, res) {
    try {
      const studentId = req.user.id;
      const pathname = req.url.split("?")[0];
      const subjectId = parseInt(pathname.split("/").pop());

      if (!subjectId || isNaN(subjectId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid subject ID" }));
        return;
      }

      const result = await studentService.deleteSubject(subjectId, studentId);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Create a topic within a subject
   * POST /api/student/subjects/:subjectId/topics/create
   */
  async createTopic(req, res) {
    try {
      const data = await parseRequestBody(req);
      const { name, description } = data;
      const studentId = req.user.id;
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

      const topic = await studentService.createTopic(
        subjectId,
        studentId,
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
   * GET /api/student/subjects/:subjectId/topics
   */
  async getTopics(req, res) {
    try {
      const studentId = req.user.id;
      const pathname = req.url.split("?")[0];
      const subjectId = parseInt(pathname.split("/")[4]);

      if (!subjectId || isNaN(subjectId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid subject ID" }));
        return;
      }

      const topics = await studentService.getTopics(subjectId, studentId);

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
   * DELETE /api/student/subjects/:subjectId/topics/:topicId
   */
  async deleteTopic(req, res) {
    try {
      const studentId = req.user.id;
      const pathname = req.url.split("?")[0];
      const parts = pathname.split("/");
      const subjectId = parseInt(parts[4]);
      const topicId = parseInt(parts[6]);

      if (!subjectId || isNaN(subjectId) || !topicId || isNaN(topicId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid subject or topic ID" }));
        return;
      }

      const result = await studentService.deleteTopic(
        topicId,
        subjectId,
        studentId
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
   * POST /api/student/subjects/:subjectId/topics/:topicId/notes/create
   */
  async addModuleNote(req, res) {
    try {
      const data = await parseRequestBody(req);
      const { title, file_name, file_url, google_drive_file_id } = data;
      const studentId = req.user.id;
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

      const note = await studentService.addModuleNote(
        topicId,
        subjectId,
        studentId,
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
   * GET /api/student/subjects/:subjectId/topics/:topicId/notes
   */
  async getModuleNotes(req, res) {
    try {
      const studentId = req.user.id;
      const pathname = req.url.split("?")[0];
      const parts = pathname.split("/");
      const subjectId = parseInt(parts[4]);
      const topicId = parseInt(parts[6]);

      if (!subjectId || isNaN(subjectId) || !topicId || isNaN(topicId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid subject or topic ID" }));
        return;
      }

      const notes = await studentService.getModuleNotes(
        topicId,
        subjectId,
        studentId
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
   * DELETE /api/student/subjects/:subjectId/topics/:topicId/notes/:noteId
   */
  async deleteModuleNote(req, res) {
    try {
      const studentId = req.user.id;
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

      const result = await studentService.deleteModuleNote(
        noteId,
        topicId,
        subjectId,
        studentId
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }
}

module.exports = new StudentController();
