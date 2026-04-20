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
      const { name, description } = data;

      if (!name) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Name is required" }));
        return;
      }

      if (name.length > 100) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Name must be 100 characters or less" }));
        return;
      }

      if (description && description.length > 500) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Description must be 500 characters or less" }));
        return;
      }

      const result = await quizService.createQuizSubject(
        req.user.id,
        name,
        description || null
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

      if (!subjectId || isNaN(subjectId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid subject ID" }));
        return;
      }

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

      if (!subjectId || isNaN(subjectId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid subject ID" }));
        return;
      }

      if (data.name && data.name.length > 100) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Name must be 100 characters or less" }));
        return;
      }

      if (data.description && data.description.length > 500) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Description must be 500 characters or less" }));
        return;
      }

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

      if (!subjectId || isNaN(subjectId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid subject ID" }));
        return;
      }

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

      if (!subjectId || isNaN(subjectId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid subject ID" }));
        return;
      }

      if (!data.name) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Name is required" }));
        return;
      }

      if (data.name.length > 100) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Name must be 100 characters or less" }));
        return;
      }

      if (data.description && data.description.length > 500) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Description must be 500 characters or less" }));
        return;
      }

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

      if (!subjectId || isNaN(subjectId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid subject ID" }));
        return;
      }

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

      if (!setId || isNaN(setId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid set ID" }));
        return;
      }

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

      if (!setId || isNaN(setId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid set ID" }));
        return;
      }

      if (data.name && data.name.length > 100) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Name must be 100 characters or less" }));
        return;
      }

      if (data.description && data.description.length > 500) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Description must be 500 characters or less" }));
        return;
      }

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

      if (!setId || isNaN(setId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid set ID" }));
        return;
      }

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

      if (!setId || isNaN(setId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid set ID" }));
        return;
      }

      if (!data.question_text) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Question text is required" }));
        return;
      }

      if (data.question_text.length > 1000) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Question text must be 1000 characters or less" }));
        return;
      }

      if (!data.answers || !Array.isArray(data.answers)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Answers array is required" }));
        return;
      }

      if (data.answers.length < 2) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "At least 2 answers are required" }));
        return;
      }

      if (data.correct_answer_index === undefined || data.correct_answer_index === null) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Correct answer index is required" }));
        return;
      }

      if (data.correct_answer_index < 0 || data.correct_answer_index >= data.answers.length) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid correct answer index" }));
        return;
      }

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

      if (!setId || isNaN(setId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid set ID" }));
        return;
      }

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

      if (!questionId || isNaN(questionId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid question ID" }));
        return;
      }

      if (data.question_text && data.question_text.length > 1000) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Question text must be 1000 characters or less" }));
        return;
      }

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

      if (!questionId || isNaN(questionId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid question ID" }));
        return;
      }

      const result = await quizService.deleteQuestion(
        questionId,
        req.user.id
      );

    res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Question deleted successfully" }));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Submit a quiz attempt (save results)
   * POST /api/student/quizzes/attempts
   */
  async submitAttempt(req, res) {
    try {
      const data = await parseRequestBody(req);

      if (!data.quizSetIds || !Array.isArray(data.quizSetIds)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "quizSetIds array is required" }));
        return;
      }

      if (data.quizSetIds.length === 0) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "At least one quiz set is required" }));
        return;
      }

      if (typeof data.totalQuestions !== "number" || data.totalQuestions <= 0) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "totalQuestions must be a positive number" }));
        return;
      }

      if (typeof data.correctAnswers !== "number" || data.correctAnswers < 0) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "correctAnswers must be a non-negative number" }));
        return;
      }

      const result = await quizService.submitQuizAttempt(
        req.user.id,
        data.quizSetIds,
        data.totalQuestions,
        data.correctAnswers,
        data.answers,
        data.startedAt
      );

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Get all quiz attempts for the logged-in student
   * GET /api/student/quizzes/attempts
   */
  async getAttempts(req, res) {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      let limit = parseInt(url.searchParams.get("limit")) || 50;

      if (limit > 100) {
        limit = 100;
      }
      if (limit < 1) {
        limit = 1;
      }

      const result = await quizService.getQuizAttempts(req.user.id, limit);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Get a specific quiz attempt
   * GET /api/student/quizzes/attempts/:attemptId
   */
  async getAttempt(req, res) {
    try {
      const attemptId = parseInt(req.url.split("/")[5]);

      if (!attemptId || isNaN(attemptId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid attempt ID" }));
        return;
      }

      const result = await quizService.getQuizAttempt(attemptId, req.user.id);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Get quiz attempts for specific quiz sets
   * GET /api/student/quizzes/attempts/sets
   */
  async getAttemptsBySets(req, res) {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const setIdsParam = url.searchParams.get("setIds");
      const quizSetIds = setIdsParam ? setIdsParam.split(",").map(id => parseInt(id)) : [];
      
      const result = await quizService.getQuizAttemptsBySets(req.user.id, quizSetIds);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Get quiz stats for the logged-in student
   * GET /api/student/quizzes/stats
   */
  async getStats(req, res) {
    try {
      const result = await quizService.getQuizStats(req.user.id);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }
}

module.exports = new StudentQuizController();
