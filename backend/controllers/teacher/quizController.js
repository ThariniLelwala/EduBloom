// controllers/teacher/quizController.js
const quizService = require("../../services/teacher/quizService");
const { parseRequestBody } = require("../../middleware/authMiddleware");
const authService = require("../../services/authService");

class QuizController {
  /**
   * Create a new quiz subject
   * POST /api/teacher/quiz/subjects
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
   * Get all quiz subjects for logged-in teacher
   * GET /api/teacher/quiz/subjects
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
   * GET /api/teacher/quiz/subjects/:subjectId
   */
  async getSubject(req, res) {
    try {
      const subjectId = parseInt(req.url.split("/")[5]);
      const result = await quizService.getQuizSubject(subjectId, req.user.id);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Update a quiz subject
   * PUT /api/teacher/quiz/subjects/:subjectId
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
   * DELETE /api/teacher/quiz/subjects/:subjectId
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
   * POST /api/teacher/quiz/subjects/:subjectId/quiz-sets
   */
  async createQuizSet(req, res) {
    try {
      const subjectId = parseInt(req.url.split("/")[5]);
      const data = await parseRequestBody(req);
      const result = await quizService.createQuizSet(
        subjectId,
        data.name,
        data.description,
        data.is_published
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
   * GET /api/teacher/quiz/subjects/:subjectId/quiz-sets
   */
  async getQuizSets(req, res) {
    try {
      const subjectId = parseInt(req.url.split("/")[5]);
      const result = await quizService.getQuizSets(subjectId);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Get a specific quiz set with all questions and answers
   * GET /api/teacher/quiz/quiz-sets/:quizSetId
   */
  async getQuizSet(req, res) {
    try {
      const quizSetId = parseInt(req.url.split("/")[5]);
      const result = await quizService.getQuizSet(quizSetId);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Update a quiz set
   * PUT /api/teacher/quiz/quiz-sets/:quizSetId
   */
  async updateQuizSet(req, res) {
    try {
      const quizSetId = parseInt(req.url.split("/")[5]);
      const data = await parseRequestBody(req);
      const result = await quizService.updateQuizSet(quizSetId, data);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Delete a quiz set
   * DELETE /api/teacher/quiz/quiz-sets/:quizSetId
   */
  async deleteQuizSet(req, res) {
    try {
      const quizSetId = parseInt(req.url.split("/")[5]);
      const result = await quizService.deleteQuizSet(quizSetId);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Create a new question in a quiz set
   * POST /api/teacher/quiz/quiz-sets/:quizSetId/questions
   */
  async createQuestion(req, res) {
    try {
      const quizSetId = parseInt(req.url.split("/")[5]);
      const data = await parseRequestBody(req);
      const result = await quizService.createQuestion(
        quizSetId,
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
   * GET /api/teacher/quiz/quiz-sets/:quizSetId/questions
   */
  async getQuestions(req, res) {
    try {
      const quizSetId = parseInt(req.url.split("/")[5]);
      const result = await quizService.getQuestions(quizSetId);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Get a specific question
   * GET /api/teacher/quiz/questions/:questionId
   */
  async getQuestion(req, res) {
    try {
      const questionId = parseInt(req.url.split("/")[5]);
      const result = await quizService.getQuestion(questionId);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Update a question
   * PUT /api/teacher/quiz/questions/:questionId
   */
  async updateQuestion(req, res) {
    try {
      const questionId = parseInt(req.url.split("/")[5]);
      const data = await parseRequestBody(req);
      const result = await quizService.updateQuestion(questionId, data);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Delete a question
   * DELETE /api/teacher/quiz/questions/:questionId
   */
  async deleteQuestion(req, res) {
    try {
      const questionId = parseInt(req.url.split("/")[5]);
      const result = await quizService.deleteQuestion(questionId);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Reorder questions in a quiz set
   * PUT /api/teacher/quiz/quiz-sets/:quizSetId/reorder-questions
   */
  async reorderQuestions(req, res) {
    try {
      const quizSetId = parseInt(req.url.split("/")[5]);
      const data = await parseRequestBody(req);
      const result = await quizService.reorderQuestions(
        quizSetId,
        data.question_ids
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }
}

module.exports = new QuizController();
