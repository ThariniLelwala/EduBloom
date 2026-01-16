// controllers/student/gpaController.js
const gpaService = require("../../services/student/gpaService");
const { parseRequestBody } = require("../../middleware/authMiddleware");

class GpaController {
  /**
   * Create a new semester
   * POST /api/student/gpa/semesters
   */
  async createSemester(req, res) {
    try {
      const data = await parseRequestBody(req);
      const result = await gpaService.createSemester(
        req.user.id,
        data.name
      );

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Get all semesters with subjects for logged-in student
   * GET /api/student/gpa/semesters
   */
  async getSemesters(req, res) {
    try {
      const result = await gpaService.getSemesters(req.user.id);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Get a specific semester with subjects
   * GET /api/student/gpa/semesters/:semesterId
   */
  async getSemester(req, res) {
    try {
      const semesterId = parseInt(req.url.split("/")[5]);
      const result = await gpaService.getSemester(
        semesterId,
        req.user.id
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Update a semester
   * PUT /api/student/gpa/semesters/:semesterId
   */
  async updateSemester(req, res) {
    try {
      const semesterId = parseInt(req.url.split("/")[5]);
      const data = await parseRequestBody(req);
      const result = await gpaService.updateSemester(
        semesterId,
        req.user.id,
        data.name
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Delete a semester
   * DELETE /api/student/gpa/semesters/:semesterId
   */
  async deleteSemester(req, res) {
    try {
      const semesterId = parseInt(req.url.split("/")[5]);
      const result = await gpaService.deleteSemester(
        semesterId,
        req.user.id
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Create a new subject within a semester
   * POST /api/student/gpa/semesters/:semesterId/subjects
   */
  async createSubject(req, res) {
    try {
      const semesterId = parseInt(req.url.split("/")[5]);
      const data = await parseRequestBody(req);
      const result = await gpaService.createSubject(
        semesterId,
        req.user.id,
        data.name,
        data.grade,
        data.credits
      );

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Update a subject
   * PUT /api/student/gpa/subjects/:subjectId
   */
  async updateSubject(req, res) {
    try {
      const subjectId = parseInt(req.url.split("/")[5]);
      const data = await parseRequestBody(req);
      const result = await gpaService.updateSubject(
        subjectId,
        req.user.id,
        data
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Delete a subject
   * DELETE /api/student/gpa/subjects/:subjectId
   */
  async deleteSubject(req, res) {
    try {
      const subjectId = parseInt(req.url.split("/")[5]);
      const result = await gpaService.deleteSubject(
        subjectId,
        req.user.id
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Get grade mappings
   * GET /api/student/gpa/grade-mappings
   */
  async getGradeMappings(req, res) {
    try {
      const result = await gpaService.getGradeMappings(req.user.id);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Update grade mappings
   * PUT /api/student/gpa/grade-mappings
   */
  async updateGradeMappings(req, res) {
    try {
      const data = await parseRequestBody(req);
      const result = await gpaService.updateGradeMappings(
        req.user.id,
        data.mappings
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }
}

module.exports = new GpaController();
