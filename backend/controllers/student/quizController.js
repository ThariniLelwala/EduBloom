// controllers/student/quizController.js
const quizService = require("../../services/student/quizService");
const { parseRequestBody } = require("../../middleware/authMiddleware");

class StudentQuizController {
  /**
   * Create a new quiz subject
   * POST /api/student/quizzes/subjects
   */
  async createSubject(req, res) {
    try {
      const data = await parseRequestBody(req);
      const result = await quizService.createQuizSubject(
        req.user.id,
        data.name,
        data.description
      );

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Get all quiz subjects for logged-in student
   * GET /api/student/quizzes/subjects
   */
  async getSubjects(req, res) {
    try {
      const result = await quizService.getQuizSubjects(req.user.id);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Get a specific quiz subject
   * GET /api/student/quizzes/subjects/:subjectId
   */
  async getSubject(req, res) {
    try {
      const subjectId = parseInt(req.url.split("/")[5]);
      const result = await quizService.getQuizSubject(
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
   * Update a quiz subject
   * PUT /api/student/quizzes/subjects/:subjectId
   */
  async updateSubject(req, res) {
    try {
      const subjectId = parseInt(req.url.split("/")[5]);
      const data = await parseRequestBody(req);
      const result = await quizService.updateQuizSubject(
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
   * Delete a quiz subject
   * DELETE /api/student/quizzes/subjects/:subjectId
   */
  async deleteSubject(req, res) {
    try {
      const subjectId = parseInt(req.url.split("/")[5]);
      const result = await quizService.deleteQuizSubject(
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
   * Create a new quiz set within a subject
   * POST /api/student/quizzes/subjects/:subjectId/sets
   */
  async createQuizSet(req, res) {
    try {
      const subjectId = parseInt(req.url.split("/")[5]);
      const data = await parseRequestBody(req);
      const result = await quizService.createQuizSet(
        subjectId,
        req.user.id,
        data.name,
        data.description
      );

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Get all quiz sets for a subject
   * GET /api/student/quizzes/subjects/:subjectId/sets
   */
  async getQuizSets(req, res) {
    try {
      const subjectId = parseInt(req.url.split("/")[5]);
      const result = await quizService.getQuizSets(
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
   * Get a specific quiz set with all questions
   * GET /api/student/quizzes/sets/:setId
   */
  async getQuizSet(req, res) {
    try {
      const setId = parseInt(req.url.split("/")[5]);
      const result = await quizService.getQuizSet(setId, req.user.id);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Update a quiz set
   * PUT /api/student/quizzes/sets/:setId
   */
  async updateQuizSet(req, res) {
    try {
      const setId = parseInt(req.url.split("/")[5]);
      const data = await parseRequestBody(req);
      const result = await quizService.updateQuizSet(
        setId,
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
   * Delete a quiz set
   * DELETE /api/student/quizzes/sets/:setId
   */
  async deleteQuizSet(req, res) {
    try {
      const setId = parseInt(req.url.split("/")[5]);
      const result = await quizService.deleteQuizSet(
        setId,
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
   * Create a new question in a quiz set
   * POST /api/student/quizzes/sets/:setId/questions
   */
  async createQuestion(req, res) {
    try {
      const setId = parseInt(req.url.split("/")[5]);
      const data = await parseRequestBody(req);
      const result = await quizService.createQuestion(
        setId,
        req.user.id,
        data.question_text,
        data.answers
      );

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Get all questions in a quiz set
   * GET /api/student/quizzes/sets/:setId/questions
   */
  async getQuestions(req, res) {
    try {
      const setId = parseInt(req.url.split("/")[5]);
      const result = await quizService.getQuestions(
        setId,
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
   * Update a question
   * PUT /api/student/quizzes/questions/:questionId
   */
  async updateQuestion(req, res) {
    try {
      const questionId = parseInt(req.url.split("/")[5]);
      const data = await parseRequestBody(req);
      const result = await quizService.updateQuestion(
        questionId,
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
   * Delete a question
   * DELETE /api/student/quizzes/questions/:questionId
   */
  async deleteQuestion(req, res) {
    try {
      const questionId = parseInt(req.url.split("/")[5]);
      const result = await quizService.deleteQuestion(
        questionId,
        req.user.id
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }
}

module.exports = new StudentQuizController();
