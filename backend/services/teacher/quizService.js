// services/teacher/quizService.js
const db = require("../../db/db");

class QuizService {
  /**
   * Create a new quiz subject for a teacher
   */
  async createQuizSubject(teacherId, name, description = null) {
    if (!teacherId || !name) {
      throw new Error("Teacher ID and subject name are required");
    }

    // Validate teacher exists
    const teacherCheck = await db.query(
      "SELECT * FROM users WHERE id = $1 AND role = 'teacher'",
      [teacherId]
    );

    if (teacherCheck.rows.length === 0) {
      throw new Error("Teacher not found");
    }

    // Check if subject already exists for this teacher
    const existing = await db.query(
      "SELECT * FROM quiz_subjects WHERE teacher_id = $1 AND name = $2",
      [teacherId, name]
    );

    if (existing.rows.length > 0) {
      throw new Error("Subject already exists with this name");
    }

    const result = await db.query(
      `INSERT INTO quiz_subjects (teacher_id, name, description)
       VALUES ($1, $2, $3)
       RETURNING id, teacher_id, name, description, created_at, updated_at`,
      [teacherId, name, description]
    );

    return result.rows[0];
  }

  /**
   * Get all quiz subjects for a teacher
   */
  async getQuizSubjects(teacherId) {
    if (!teacherId) {
      throw new Error("Teacher ID is required");
    }

    const result = await db.query(
      `SELECT id, name, description, created_at, updated_at
       FROM quiz_subjects
       WHERE teacher_id = $1
       ORDER BY created_at DESC`,
      [teacherId]
    );

    return result.rows;
  }

  /**
   * Get a specific quiz subject with count of quizzes
   */
  async getQuizSubject(subjectId, teacherId) {
    if (!subjectId || !teacherId) {
      throw new Error("Subject ID and Teacher ID are required");
    }

    const result = await db.query(
      `SELECT id, name, description, created_at, updated_at
       FROM quiz_subjects
       WHERE id = $1 AND teacher_id = $2`,
      [subjectId, teacherId]
    );

    if (result.rows.length === 0) {
      throw new Error("Subject not found");
    }

    return result.rows[0];
  }

  /**
   * Update a quiz subject
   */
  async updateQuizSubject(subjectId, teacherId, updates) {
    if (!subjectId || !teacherId) {
      throw new Error("Subject ID and Teacher ID are required");
    }

    const { name, description } = updates;

    // Verify ownership
    const subject = await db.query(
      "SELECT * FROM quiz_subjects WHERE id = $1 AND teacher_id = $2",
      [subjectId, teacherId]
    );

    if (subject.rows.length === 0) {
      throw new Error("Subject not found");
    }

    const result = await db.query(
      `UPDATE quiz_subjects 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           updated_at = NOW()
       WHERE id = $3 AND teacher_id = $4
       RETURNING id, name, description, created_at, updated_at`,
      [name, description, subjectId, teacherId]
    );

    return result.rows[0];
  }

  /**
   * Delete a quiz subject (cascades to quiz sets and questions)
   */
  async deleteQuizSubject(subjectId, teacherId) {
    if (!subjectId || !teacherId) {
      throw new Error("Subject ID and Teacher ID are required");
    }

    // Verify ownership
    const subject = await db.query(
      "SELECT * FROM quiz_subjects WHERE id = $1 AND teacher_id = $2",
      [subjectId, teacherId]
    );

    if (subject.rows.length === 0) {
      throw new Error("Subject not found");
    }

    await db.query(
      "DELETE FROM quiz_subjects WHERE id = $1 AND teacher_id = $2",
      [subjectId, teacherId]
    );

    return { message: "Subject deleted successfully" };
  }

  /**
   * Create a new quiz set (quiz/test) within a subject
   */
  async createQuizSet(
    subjectId,
    name,
    description = null,
    isPublished = false
  ) {
    if (!subjectId || !name) {
      throw new Error("Subject ID and quiz name are required");
    }

    // Verify subject exists
    const subject = await db.query(
      "SELECT * FROM quiz_subjects WHERE id = $1",
      [subjectId]
    );

    if (subject.rows.length === 0) {
      throw new Error("Subject not found");
    }

    // Check if quiz set already exists
    const existing = await db.query(
      "SELECT * FROM quiz_sets WHERE subject_id = $1 AND name = $2",
      [subjectId, name]
    );

    if (existing.rows.length > 0) {
      throw new Error("Quiz set already exists with this name");
    }

    const result = await db.query(
      `INSERT INTO quiz_sets (subject_id, name, description, is_published)
       VALUES ($1, $2, $3, $4)
       RETURNING id, subject_id, name, description, is_published, created_at, updated_at`,
      [subjectId, name, description, isPublished]
    );

    return result.rows[0];
  }

  /**
   * Get all quiz sets for a subject
   */
  async getQuizSets(subjectId) {
    if (!subjectId) {
      throw new Error("Subject ID is required");
    }

    const result = await db.query(
      `SELECT id, subject_id, name, description, is_published, created_at, updated_at
       FROM quiz_sets
       WHERE subject_id = $1
       ORDER BY created_at DESC`,
      [subjectId]
    );

    // Get question count for each quiz
    for (let quiz of result.rows) {
      const countResult = await db.query(
        "SELECT COUNT(*) FROM quiz_questions WHERE quiz_set_id = $1",
        [quiz.id]
      );
      quiz.question_count = parseInt(countResult.rows[0].count);
    }

    return result.rows;
  }

  /**
   * Get a specific quiz set with its questions and answers
   */
  async getQuizSet(quizSetId) {
    if (!quizSetId) {
      throw new Error("Quiz Set ID is required");
    }

    const quizResult = await db.query(
      `SELECT id, subject_id, name, description, is_published, created_at, updated_at
       FROM quiz_sets
       WHERE id = $1`,
      [quizSetId]
    );

    if (quizResult.rows.length === 0) {
      throw new Error("Quiz set not found");
    }

    const quiz = quizResult.rows[0];

    // Get questions with answers
    const questionsResult = await db.query(
      `SELECT id, quiz_set_id, question_text, question_order, created_at, updated_at
       FROM quiz_questions
       WHERE quiz_set_id = $1
       ORDER BY question_order ASC, created_at ASC`,
      [quizSetId]
    );

    for (let question of questionsResult.rows) {
      const answersResult = await db.query(
        `SELECT id, question_id, answer_text, is_correct, answer_order
         FROM quiz_answers
         WHERE question_id = $1
         ORDER BY answer_order ASC, created_at ASC`,
        [question.id]
      );
      question.answers = answersResult.rows;
    }

    quiz.questions = questionsResult.rows;
    return quiz;
  }

  /**
   * Update a quiz set
   */
  async updateQuizSet(quizSetId, updates) {
    if (!quizSetId) {
      throw new Error("Quiz Set ID is required");
    }

    const { name, description, is_published } = updates;

    const result = await db.query(
      `UPDATE quiz_sets
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           is_published = COALESCE($3, is_published),
           updated_at = NOW()
       WHERE id = $4
       RETURNING id, subject_id, name, description, is_published, created_at, updated_at`,
      [name, description, is_published, quizSetId]
    );

    if (result.rows.length === 0) {
      throw new Error("Quiz set not found");
    }

    return result.rows[0];
  }

  /**
   * Delete a quiz set
   */
  async deleteQuizSet(quizSetId) {
    if (!quizSetId) {
      throw new Error("Quiz Set ID is required");
    }

    const result = await db.query(
      "DELETE FROM quiz_sets WHERE id = $1 RETURNING id",
      [quizSetId]
    );

    if (result.rows.length === 0) {
      throw new Error("Quiz set not found");
    }

    return { message: "Quiz set deleted successfully" };
  }

  /**
   * Create a new question in a quiz set
   */
  async createQuestion(quizSetId, questionText, answers = []) {
    if (!quizSetId || !questionText) {
      throw new Error("Quiz Set ID and question text are required");
    }

    if (!Array.isArray(answers) || answers.length < 2) {
      throw new Error("At least 2 answers are required");
    }

    // Verify quiz set exists
    const quiz = await db.query("SELECT * FROM quiz_sets WHERE id = $1", [
      quizSetId,
    ]);

    if (quiz.rows.length === 0) {
      throw new Error("Quiz set not found");
    }

    // Get next question order
    const orderResult = await db.query(
      "SELECT MAX(question_order) FROM quiz_questions WHERE quiz_set_id = $1",
      [quizSetId]
    );

    const nextOrder = (orderResult.rows[0].max || 0) + 1;

    // Create question
    const questionResult = await db.query(
      `INSERT INTO quiz_questions (quiz_set_id, question_text, question_order)
       VALUES ($1, $2, $3)
       RETURNING id, quiz_set_id, question_text, question_order, created_at, updated_at`,
      [quizSetId, questionText, nextOrder]
    );

    const question = questionResult.rows[0];

    // Create answers
    question.answers = [];
    for (let i = 0; i < answers.length; i++) {
      const answerResult = await db.query(
        `INSERT INTO quiz_answers (question_id, answer_text, is_correct, answer_order)
         VALUES ($1, $2, $3, $4)
         RETURNING id, question_id, answer_text, is_correct, answer_order`,
        [question.id, answers[i].text, answers[i].is_correct || false, i]
      );
      question.answers.push(answerResult.rows[0]);
    }

    return question;
  }

  /**
   * Get all questions in a quiz set
   */
  async getQuestions(quizSetId) {
    if (!quizSetId) {
      throw new Error("Quiz Set ID is required");
    }

    const result = await db.query(
      `SELECT id, quiz_set_id, question_text, question_order, created_at, updated_at
       FROM quiz_questions
       WHERE quiz_set_id = $1
       ORDER BY question_order ASC, created_at ASC`,
      [quizSetId]
    );

    // Get answers for each question
    for (let question of result.rows) {
      const answersResult = await db.query(
        `SELECT id, question_id, answer_text, is_correct, answer_order
         FROM quiz_answers
         WHERE question_id = $1
         ORDER BY answer_order ASC, created_at ASC`,
        [question.id]
      );
      question.answers = answersResult.rows;
    }

    return result.rows;
  }

  /**
   * Get a specific question with its answers
   */
  async getQuestion(questionId) {
    if (!questionId) {
      throw new Error("Question ID is required");
    }

    const result = await db.query(
      `SELECT id, quiz_set_id, question_text, question_order, created_at, updated_at
       FROM quiz_questions
       WHERE id = $1`,
      [questionId]
    );

    if (result.rows.length === 0) {
      throw new Error("Question not found");
    }

    const question = result.rows[0];

    // Get answers
    const answersResult = await db.query(
      `SELECT id, question_id, answer_text, is_correct, answer_order
       FROM quiz_answers
       WHERE question_id = $1
       ORDER BY answer_order ASC, created_at ASC`,
      [questionId]
    );

    question.answers = answersResult.rows;
    return question;
  }

  /**
   * Update a question
   */
  async updateQuestion(questionId, updates) {
    if (!questionId) {
      throw new Error("Question ID is required");
    }

    const { question_text, answers } = updates;

    // Update question text
    const result = await db.query(
      `UPDATE quiz_questions
       SET question_text = COALESCE($1, question_text),
           updated_at = NOW()
       WHERE id = $2
       RETURNING id, quiz_set_id, question_text, question_order, created_at, updated_at`,
      [question_text, questionId]
    );

    if (result.rows.length === 0) {
      throw new Error("Question not found");
    }

    const question = result.rows[0];

    // Update answers if provided
    if (answers && Array.isArray(answers)) {
      // Delete existing answers
      await db.query("DELETE FROM quiz_answers WHERE question_id = $1", [
        questionId,
      ]);

      // Insert new answers
      question.answers = [];
      for (let i = 0; i < answers.length; i++) {
        const answerResult = await db.query(
          `INSERT INTO quiz_answers (question_id, answer_text, is_correct, answer_order)
           VALUES ($1, $2, $3, $4)
           RETURNING id, question_id, answer_text, is_correct, answer_order`,
          [questionId, answers[i].text, answers[i].is_correct || false, i]
        );
        question.answers.push(answerResult.rows[0]);
      }
    } else {
      // Just fetch existing answers
      const answersResult = await db.query(
        `SELECT id, question_id, answer_text, is_correct, answer_order
         FROM quiz_answers
         WHERE question_id = $1
         ORDER BY answer_order ASC, created_at ASC`,
        [questionId]
      );
      question.answers = answersResult.rows;
    }

    return question;
  }

  /**
   * Delete a question
   */
  async deleteQuestion(questionId) {
    if (!questionId) {
      throw new Error("Question ID is required");
    }

    const result = await db.query(
      "DELETE FROM quiz_questions WHERE id = $1 RETURNING id",
      [questionId]
    );

    if (result.rows.length === 0) {
      throw new Error("Question not found");
    }

    return { message: "Question deleted successfully" };
  }

  /**
   * Reorder questions in a quiz set
   */
  async reorderQuestions(quizSetId, questionIds) {
    if (!quizSetId || !Array.isArray(questionIds)) {
      throw new Error("Quiz Set ID and question IDs array are required");
    }

    // Update question order
    for (let i = 0; i < questionIds.length; i++) {
      await db.query(
        "UPDATE quiz_questions SET question_order = $1 WHERE id = $2",
        [i, questionIds[i]]
      );
    }

    return { message: "Questions reordered successfully" };
  }
}

module.exports = new QuizService();
