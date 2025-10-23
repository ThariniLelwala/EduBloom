// controllers/student/subjectController.js
const subjectService = require("../../services/student/subjectService");
const { parseRequestBody } = require("../../middleware/authMiddleware");

class StudentSubjectController {
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

      const subject = await subjectService.createSubject(
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
      const subjects = await subjectService.getStudentSubjects(studentId);

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

      const subject = await subjectService.getSubjectWithTopics(
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

      const subject = await subjectService.updateSubject(
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

      const result = await subjectService.deleteSubject(subjectId, studentId);

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

      const topic = await subjectService.createTopic(
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

      const topics = await subjectService.getTopics(subjectId, studentId);

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

      const result = await subjectService.deleteTopic(
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

module.exports = new StudentSubjectController();
