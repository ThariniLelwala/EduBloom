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
      const { name } = data;

      if (!name) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Semester name is required" }));
        return;
      }

      if (name.length > 100) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Semester name must be 100 characters or less" }));
        return;
      }

      const result = await gpaService.createSemester(
        req.user.id,
        name
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

      if (!semesterId || isNaN(semesterId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid semester ID" }));
        return;
      }

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

      if (!semesterId || isNaN(semesterId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid semester ID" }));
        return;
      }

      if (data.name && data.name.length > 100) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Semester name must be 100 characters or less" }));
        return;
      }

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

      if (!semesterId || isNaN(semesterId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid semester ID" }));
        return;
      }

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
      const { name, grade, credits } = data;

      if (!semesterId || isNaN(semesterId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid semester ID" }));
        return;
      }

      if (!name) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Subject name is required" }));
        return;
      }

      if (name.length > 100) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Subject name must be 100 characters or less" }));
        return;
      }

      if (!grade) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Grade is required" }));
        return;
      }

      const validGrades = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F"];
      if (!validGrades.includes(grade)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Grade must be a valid letter grade (A+ to F)" }));
        return;
      }

      if (credits === undefined || credits === null) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Credits is required" }));
        return;
      }

      const creditsNum = parseFloat(credits);
      if (isNaN(creditsNum) || creditsNum < 0.5 || creditsNum > 10) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Credits must be between 0.5 and 10" }));
        return;
      }

      const result = await gpaService.createSubject(
        semesterId,
        req.user.id,
        name,
        grade,
        creditsNum
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

      if (!subjectId || isNaN(subjectId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid subject ID" }));
        return;
      }

      if (data.name && data.name.length > 100) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Subject name must be 100 characters or less" }));
        return;
      }

      if (data.grade) {
        const validGrades = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F"];
        if (!validGrades.includes(data.grade)) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Grade must be a valid letter grade (A+ to F)" }));
          return;
        }
      }

      if (data.credits !== undefined && data.credits !== null) {
        const creditsNum = parseFloat(data.credits);
        if (isNaN(creditsNum) || creditsNum < 0.5 || creditsNum > 10) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Credits must be between 0.5 and 10" }));
          return;
        }
      }

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

      if (!subjectId || isNaN(subjectId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid subject ID" }));
        return;
      }

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
      const { mappings } = data;

      if (!mappings || typeof mappings !== "object") {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Mappings object is required" }));
        return;
      }

      const validGrades = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F"];
      for (const [grade, value] of Object.entries(mappings)) {
        if (!validGrades.includes(grade)) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: `Invalid grade: ${grade}` }));
          return;
        }
        if (typeof value !== "number" || value < 0 || value > 4) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: `Invalid GPA value for grade ${grade}` }));
          return;
        }
      }

      const result = await gpaService.updateGradeMappings(
        req.user.id,
        mappings
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
