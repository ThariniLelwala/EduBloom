// services/student/quizService.js
const db = require("../../db/db");

class StudentQuizService {
  /**
   * Create a new quiz subject for a student
   */
  async createQuizSubject(studentId, name, description = null) {
    if (!studentId || !name) {
      throw new Error("Student ID and subject name are required");
    }

    // Validate student exists
    const studentCheck = await db.query(
      "SELECT * FROM users WHERE id = $1 AND role = 'student'",
      [studentId]
    );

    if (studentCheck.rows.length === 0) {
      throw new Error("Student not found");
    }

    // Check if subject already exists for this student
    const existing = await db.query(
      "SELECT * FROM student_quiz_subjects WHERE student_id = $1 AND name = $2",
      [studentId, name]
    );

    if (existing.rows.length > 0) {
      throw new Error("Subject already exists with this name");
    }

    const result = await db.query(
      `INSERT INTO student_quiz_subjects (student_id, name, description)
       VALUES ($1, $2, $3)
       RETURNING id, student_id, name, description, created_at, updated_at`,
      [studentId, name, description]
    );

    return result.rows[0];
  }

  /**
   * Get all quiz subjects for a student
   */
  async getQuizSubjects(studentId) {
    if (!studentId) {
      throw new Error("Student ID is required");
    }

    const result = await db.query(
      `SELECT id, name, description, created_at, updated_at
       FROM student_quiz_subjects
       WHERE student_id = $1
       ORDER BY created_at DESC`,
      [studentId]
    );

    return result.rows;
  }

  /**
   * Get a specific quiz subject
   */
  async getQuizSubject(subjectId, studentId) {
    if (!subjectId || !studentId) {
      throw new Error("Subject ID and Student ID are required");
    }

    const result = await db.query(
      `SELECT id, name, description, created_at, updated_at
       FROM student_quiz_subjects
       WHERE id = $1 AND student_id = $2`,
      [subjectId, studentId]
    );

    if (result.rows.length === 0) {
      throw new Error("Subject not found");
    }

    return result.rows[0];
  }

  /**
   * Update a quiz subject
   */
  async updateQuizSubject(subjectId, studentId, updates) {
    if (!subjectId || !studentId) {
      throw new Error("Subject ID and Student ID are required");
    }

    const { name, description } = updates;

    // Verify ownership
    const subject = await db.query(
      "SELECT * FROM student_quiz_subjects WHERE id = $1 AND student_id = $2",
      [subjectId, studentId]
    );

    if (subject.rows.length === 0) {
      throw new Error("Subject not found");
    }

    const result = await db.query(
      `UPDATE student_quiz_subjects 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           updated_at = NOW()
       WHERE id = $3 AND student_id = $4
       RETURNING id, name, description, created_at, updated_at`,
      [name, description, subjectId, studentId]
    );

    return result.rows[0];
  }

  /**
   * Delete a quiz subject (cascades to quiz sets and questions)
   */
  async deleteQuizSubject(subjectId, studentId) {
    if (!subjectId || !studentId) {
      throw new Error("Subject ID and Student ID are required");
    }

    // Verify ownership
    const subject = await db.query(
      "SELECT * FROM student_quiz_subjects WHERE id = $1 AND student_id = $2",
      [subjectId, studentId]
    );

    if (subject.rows.length === 0) {
      throw new Error("Subject not found");
    }

    await db.query(
      "DELETE FROM student_quiz_subjects WHERE id = $1 AND student_id = $2",
      [subjectId, studentId]
    );

    return { message: "Subject deleted successfully" };
  }

  /**
   * Create a new quiz set within a subject
   */
  async createQuizSet(subjectId, studentId, name, description = null) {
    if (!subjectId || !studentId || !name) {
      throw new Error("Subject ID, Student ID, and quiz name are required");
    }

    // Verify subject belongs to student
    const subject = await db.query(
      "SELECT * FROM student_quiz_subjects WHERE id = $1 AND student_id = $2",
      [subjectId, studentId]
    );

    if (subject.rows.length === 0) {
      throw new Error("Subject not found");
    }

    // Check if quiz set already exists
    const existing = await db.query(
      "SELECT * FROM student_quiz_sets WHERE subject_id = $1 AND name = $2",
      [subjectId, name]
    );

    if (existing.rows.length > 0) {
      throw new Error("Quiz set already exists with this name");
    }

    const result = await db.query(
      `INSERT INTO student_quiz_sets (subject_id, name, description)
       VALUES ($1, $2, $3)
       RETURNING id, subject_id, name, description, created_at, updated_at`,
      [subjectId, name, description]
    );

    return result.rows[0];
  }

  /**
   * Get all quiz sets for a subject
   */
  async getQuizSets(subjectId, studentId) {
    if (!subjectId || !studentId) {
      throw new Error("Subject ID and Student ID are required");
    }

    // Verify subject belongs to student
    const subject = await db.query(
      "SELECT * FROM student_quiz_subjects WHERE id = $1 AND student_id = $2",
      [subjectId, studentId]
    );

    if (subject.rows.length === 0) {
      throw new Error("Subject not found");
    }

    const result = await db.query(
      `SELECT id, subject_id, name, description, created_at, updated_at
       FROM student_quiz_sets
       WHERE subject_id = $1
       ORDER BY created_at DESC`,
      [subjectId]
    );

    // Get question count for each quiz set
    for (let quizSet of result.rows) {
      const countResult = await db.query(
        "SELECT COUNT(*) as count FROM student_quiz_questions WHERE quiz_set_id = $1",
        [quizSet.id]
      );
      quizSet.question_count = parseInt(countResult.rows[0].count);
    }

    return result.rows;
  }

  /**
   * Get a specific quiz set with all questions and answers
   */
  async getQuizSet(quizSetId, studentId) {
    if (!quizSetId || !studentId) {
      throw new Error("Quiz Set ID and Student ID are required");
    }

    const quizResult = await db.query(
      `SELECT qs.id, qs.subject_id, qs.name, qs.description, qs.created_at, qs.updated_at
       FROM student_quiz_sets qs
       JOIN student_quiz_subjects qsubj ON qs.subject_id = qsubj.id
       WHERE qs.id = $1 AND qsubj.student_id = $2`,
      [quizSetId, studentId]
    );

    if (quizResult.rows.length === 0) {
      throw new Error("Quiz set not found");
    }

    const quizSet = quizResult.rows[0];

    // Get all questions with answers
    const questionsResult = await db.query(
      `SELECT id, quiz_set_id, question_text, question_order, created_at, updated_at
       FROM student_quiz_questions
       WHERE quiz_set_id = $1
       ORDER BY question_order ASC, created_at ASC`,
      [quizSetId]
    );

    for (let question of questionsResult.rows) {
      const answersResult = await db.query(
        `SELECT id, question_id, answer_text, is_correct, answer_order
         FROM student_quiz_answers
         WHERE question_id = $1
         ORDER BY answer_order ASC`,
        [question.id]
      );
      question.answers = answersResult.rows;
    }

    quizSet.questions = questionsResult.rows;
    return quizSet;
  }

  /**
   * Update a quiz set
   */
  async updateQuizSet(quizSetId, studentId, updates) {
    if (!quizSetId || !studentId) {
      throw new Error("Quiz Set ID and Student ID are required");
    }

    const { name, description } = updates;

    // Verify ownership through subject
    const quizCheck = await db.query(
      `SELECT qs.* FROM student_quiz_sets qs
       JOIN student_quiz_subjects qsubj ON qs.subject_id = qsubj.id
       WHERE qs.id = $1 AND qsubj.student_id = $2`,
      [quizSetId, studentId]
    );

    if (quizCheck.rows.length === 0) {
      throw new Error("Quiz set not found");
    }

    const result = await db.query(
      `UPDATE student_quiz_sets 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           updated_at = NOW()
       WHERE id = $3
       RETURNING id, subject_id, name, description, created_at, updated_at`,
      [name, description, quizSetId]
    );

    return result.rows[0];
  }

  /**
   * Delete a quiz set
   */
  async deleteQuizSet(quizSetId, studentId) {
    if (!quizSetId || !studentId) {
      throw new Error("Quiz Set ID and Student ID are required");
    }

    // Verify ownership through subject
    const quizCheck = await db.query(
      `SELECT qs.* FROM student_quiz_sets qs
       JOIN student_quiz_subjects qsubj ON qs.subject_id = qsubj.id
       WHERE qs.id = $1 AND qsubj.student_id = $2`,
      [quizSetId, studentId]
    );

    if (quizCheck.rows.length === 0) {
      throw new Error("Quiz set not found");
    }

    await db.query("DELETE FROM student_quiz_sets WHERE id = $1", [quizSetId]);

    return { message: "Quiz set deleted successfully" };
  }

  /**
   * Create a new question in a quiz set
   */
  async createQuestion(quizSetId, studentId, questionText, answers = []) {
    if (!quizSetId || !studentId || !questionText) {
      throw new Error("Quiz Set ID, Student ID, and question text are required");
    }

    if (!Array.isArray(answers) || answers.length < 2) {
      throw new Error("At least 2 answers are required");
    }

    // Verify ownership through subject
    const quizCheck = await db.query(
      `SELECT qs.* FROM student_quiz_sets qs
       JOIN student_quiz_subjects qsubj ON qs.subject_id = qsubj.id
       WHERE qs.id = $1 AND qsubj.student_id = $2`,
      [quizSetId, studentId]
    );

    if (quizCheck.rows.length === 0) {
      throw new Error("Quiz set not found");
    }

    // Get next question order
    const orderResult = await db.query(
      "SELECT MAX(question_order) FROM student_quiz_questions WHERE quiz_set_id = $1",
      [quizSetId]
    );

    const nextOrder = (orderResult.rows[0].max || 0) + 1;

    // Create question
    const questionResult = await db.query(
      `INSERT INTO student_quiz_questions (quiz_set_id, question_text, question_order)
       VALUES ($1, $2, $3)
       RETURNING id, quiz_set_id, question_text, question_order, created_at, updated_at`,
      [quizSetId, questionText, nextOrder]
    );

    const question = questionResult.rows[0];

    // Create answers
    question.answers = [];
    for (let i = 0; i < answers.length; i++) {
      const answerResult = await db.query(
        `INSERT INTO student_quiz_answers (question_id, answer_text, is_correct, answer_order)
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
  async getQuestions(quizSetId, studentId) {
    if (!quizSetId || !studentId) {
      throw new Error("Quiz Set ID and Student ID are required");
    }

    // Verify ownership through subject
    const quizCheck = await db.query(
      `SELECT qs.* FROM student_quiz_sets qs
       JOIN student_quiz_subjects qsubj ON qs.subject_id = qsubj.id
       WHERE qs.id = $1 AND qsubj.student_id = $2`,
      [quizSetId, studentId]
    );

    if (quizCheck.rows.length === 0) {
      throw new Error("Quiz set not found");
    }

    const result = await db.query(
      `SELECT id, quiz_set_id, question_text, question_order, created_at, updated_at
       FROM student_quiz_questions
       WHERE quiz_set_id = $1
       ORDER BY question_order ASC, created_at ASC`,
      [quizSetId]
    );

    // Get answers for each question
    for (let question of result.rows) {
      const answersResult = await db.query(
        `SELECT id, question_id, answer_text, is_correct, answer_order
         FROM student_quiz_answers
         WHERE question_id = $1
         ORDER BY answer_order ASC`,
        [question.id]
      );
      question.answers = answersResult.rows;
    }

    return result.rows;
  }

  /**
   * Update a question
   */
  async updateQuestion(questionId, studentId, updates) {
    if (!questionId || !studentId) {
      throw new Error("Question ID and Student ID are required");
    }

    const { question_text, answers } = updates;

    // Verify ownership through subject
    const questionCheck = await db.query(
      `SELECT qq.* FROM student_quiz_questions qq
       JOIN student_quiz_sets qs ON qq.quiz_set_id = qs.id
       JOIN student_quiz_subjects qsubj ON qs.subject_id = qsubj.id
       WHERE qq.id = $1 AND qsubj.student_id = $2`,
      [questionId, studentId]
    );

    if (questionCheck.rows.length === 0) {
      throw new Error("Question not found");
    }

    // Update question text
    const result = await db.query(
      `UPDATE student_quiz_questions
       SET question_text = COALESCE($1, question_text),
           updated_at = NOW()
       WHERE id = $2
       RETURNING id, quiz_set_id, question_text, question_order, created_at, updated_at`,
      [question_text, questionId]
    );

    const question = result.rows[0];

    // Update answers if provided
    if (answers && Array.isArray(answers)) {
      // Delete existing answers
      await db.query("DELETE FROM student_quiz_answers WHERE question_id = $1", [
        questionId,
      ]);

      // Insert new answers
      question.answers = [];
      for (let i = 0; i < answers.length; i++) {
        const answerResult = await db.query(
          `INSERT INTO student_quiz_answers (question_id, answer_text, is_correct, answer_order)
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
         FROM student_quiz_answers
         WHERE question_id = $1
         ORDER BY answer_order ASC`,
        [questionId]
      );
      question.answers = answersResult.rows;
    }

    return question;
  }

  /**
   * Delete a question
   */
  async deleteQuestion(questionId, studentId) {
    if (!questionId || !studentId) {
      throw new Error("Question ID and Student ID are required");
    }

    // Verify ownership through subject
    const questionCheck = await db.query(
      `SELECT qq.* FROM student_quiz_questions qq
       JOIN student_quiz_sets qs ON qq.quiz_set_id = qs.id
       JOIN student_quiz_subjects qsubj ON qs.subject_id = qsubj.id
       WHERE qq.id = $1 AND qsubj.student_id = $2`,
      [questionId, studentId]
    );

    if (questionCheck.rows.length === 0) {
      throw new Error("Question not found");
    }

    await db.query("DELETE FROM student_quiz_questions WHERE id = $1", [questionId]);

    return { message: "Question deleted successfully" };
  }

  /**
   * Submit a quiz attempt (save results)
   */
  async submitQuizAttempt(studentId, quizSetIds, totalQuestions, correctAnswers, answers, startedAt) {
    if (!studentId || !quizSetIds || !Array.isArray(quizSetIds)) {
      throw new Error("Student ID and quiz set IDs are required");
    }

    if (totalQuestions === undefined || correctAnswers === undefined) {
      throw new Error("Total questions and correct answers count are required");
    }

    const scorePercentage = totalQuestions > 0 
      ? Math.round((correctAnswers / totalQuestions) * 10000) / 100 
      : 0;

    const result = await db.query(
      `INSERT INTO student_quiz_attempts 
       (student_id, quiz_set_ids, total_questions, correct_answers, score_percentage, answers, started_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, student_id, quiz_set_ids, total_questions, correct_answers, score_percentage, 
                 answers, started_at, completed_at, created_at`,
      [studentId, quizSetIds, totalQuestions, correctAnswers, scorePercentage, 
       JSON.stringify(answers || []), startedAt || null]
    );

    return result.rows[0];
  }

  /**
   * Get all quiz attempts for a student
   */
  async getQuizAttempts(studentId, limit = 50) {
    if (!studentId) {
      throw new Error("Student ID is required");
    }

    const result = await db.query(
      `SELECT id, student_id, quiz_set_ids, total_questions, correct_answers, 
              score_percentage, started_at, completed_at, created_at
       FROM student_quiz_attempts
       WHERE student_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [studentId, limit || 50]
    );

    // Get quiz names for each attempt
    for (let attempt of result.rows) {
      if (attempt.quiz_set_ids && attempt.quiz_set_ids.length > 0) {
        const quizNames = [];
        for (const quizSetId of attempt.quiz_set_ids) {
          const quizResult = await db.query(
            `SELECT name FROM student_quiz_sets WHERE id = $1`,
            [quizSetId]
          );
          if (quizResult.rows.length > 0) {
            quizNames.push(quizResult.rows[0].name);
          }
        }
        attempt.quiz_names = quizNames;
      } else {
        attempt.quiz_names = [];
      }
    }

    return result.rows;
  }

  /**
   * Get a specific quiz attempt
   */
  async getQuizAttempt(attemptId, studentId) {
    if (!attemptId || !studentId) {
      throw new Error("Attempt ID and Student ID are required");
    }

    const result = await db.query(
      `SELECT id, student_id, quiz_set_ids, total_questions, correct_answers, 
              score_percentage, answers, started_at, completed_at, created_at
       FROM student_quiz_attempts
       WHERE id = $1 AND student_id = $2`,
      [attemptId, studentId]
    );

    if (result.rows.length === 0) {
      throw new Error("Quiz attempt not found");
    }

    const attempt = result.rows[0];

    // Get quiz names for the attempt
    if (attempt.quiz_set_ids && attempt.quiz_set_ids.length > 0) {
      const quizNames = [];
      for (const quizSetId of attempt.quiz_set_ids) {
        const quizResult = await db.query(
          `SELECT name FROM student_quiz_sets WHERE id = $1`,
          [quizSetId]
        );
        if (quizResult.rows.length > 0) {
          quizNames.push(quizResult.rows[0].name);
        }
      }
      attempt.quiz_names = quizNames;
    } else {
      attempt.quiz_names = [];
    }

    return attempt;
  }

  /**
   * Get quiz attempts for specific quiz sets
   */
  async getQuizAttemptsBySets(studentId, quizSetIds) {
    if (!studentId || !quizSetIds || !Array.isArray(quizSetIds)) {
      throw new Error("Student ID and quiz set IDs are required");
    }

    const result = await db.query(
      `SELECT id, student_id, quiz_set_ids, total_questions, correct_answers, 
              score_percentage, started_at, completed_at, created_at
       FROM student_quiz_attempts
       WHERE student_id = $1 AND quiz_set_ids && $2::int[]
       ORDER BY created_at DESC`,
      [studentId, quizSetIds]
    );

    // Get quiz names for each attempt
    for (let attempt of result.rows) {
      if (attempt.quiz_set_ids && attempt.quiz_set_ids.length > 0) {
        const quizNames = [];
        for (const quizSetId of attempt.quiz_set_ids) {
          const quizResult = await db.query(
            `SELECT name FROM student_quiz_sets WHERE id = $1`,
            [quizSetId]
          );
          if (quizResult.rows.length > 0) {
            quizNames.push(quizResult.rows[0].name);
          }
        }
        attempt.quiz_names = quizNames;
      } else {
        attempt.quiz_names = [];
      }
    }

    return result.rows;
  }

  /**
   * Get quiz stats (best score, average score, total attempts)
   */
  async getQuizStats(studentId) {
    if (!studentId) {
      throw new Error("Student ID is required");
    }

    const result = await db.query(
      `SELECT 
        COUNT(*) as total_attempts,
        COALESCE(AVG(score_percentage), 0) as average_score,
        COALESCE(MAX(score_percentage), 0) as best_score,
        COALESCE(SUM(correct_answers), 0) as total_correct,
        COALESCE(SUM(total_questions), 0) as total_questions
       FROM student_quiz_attempts
       WHERE student_id = $1`,
      [studentId]
    );

    return {
      totalAttempts: parseInt(result.rows[0].total_attempts) || 0,
      averageScore: parseFloat(result.rows[0].average_score) || 0,
      bestScore: parseFloat(result.rows[0].best_score) || 0,
      totalCorrect: parseInt(result.rows[0].total_correct) || 0,
      totalQuestions: parseInt(result.rows[0].total_questions) || 0
    };
  }
}

module.exports = new StudentQuizService();
