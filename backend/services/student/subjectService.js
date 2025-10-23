// services/student/subjectService.js
const db = require("../../db/db");

class StudentSubjectService {
  /**
   * Create a new subject for a student
   */
  async createSubject(studentId, subjectName, description = null) {
    if (!studentId || !subjectName) {
      throw new Error("Student ID and subject name are required");
    }

    // Validate student exists and is a student
    const studentCheck = await db.query(
      "SELECT * FROM users WHERE id = $1 AND role = 'student'",
      [studentId]
    );

    if (studentCheck.rows.length === 0) {
      throw new Error("Student not found");
    }

    // Check if subject already exists for this student
    const existingSubject = await db.query(
      "SELECT * FROM module_subjects WHERE student_id = $1 AND name = $2",
      [studentId, subjectName]
    );

    if (existingSubject.rows.length > 0) {
      throw new Error("Subject already exists with this name");
    }

    // Create the subject
    const result = await db.query(
      `INSERT INTO module_subjects (student_id, name, description)
       VALUES ($1, $2, $3)
       RETURNING id, student_id, name, description, created_at, updated_at`,
      [studentId, subjectName, description]
    );

    return result.rows[0];
  }

  /**
   * Get all subjects for a student
   */
  async getStudentSubjects(studentId) {
    if (!studentId) {
      throw new Error("Student ID is required");
    }

    const result = await db.query(
      `SELECT id, name, description, created_at, updated_at
       FROM module_subjects
       WHERE student_id = $1
       ORDER BY created_at DESC`,
      [studentId]
    );

    return result.rows;
  }

  /**
   * Get a specific subject with its topics
   */
  async getSubjectWithTopics(subjectId, studentId) {
    if (!subjectId || !studentId) {
      throw new Error("Subject ID and Student ID are required");
    }

    // Verify the subject belongs to the student
    const subjectCheck = await db.query(
      "SELECT * FROM module_subjects WHERE id = $1 AND student_id = $2",
      [subjectId, studentId]
    );

    if (subjectCheck.rows.length === 0) {
      throw new Error("Subject not found");
    }

    const subject = subjectCheck.rows[0];

    // Get topics for this subject
    const topicsResult = await db.query(
      `SELECT id, name, description, created_at, updated_at
       FROM module_topics
       WHERE subject_id = $1
       ORDER BY created_at DESC`,
      [subjectId]
    );

    subject.topics = topicsResult.rows;
    return subject;
  }

  /**
   * Update a subject
   */
  async updateSubject(subjectId, studentId, updates) {
    if (!subjectId || !studentId) {
      throw new Error("Subject ID and Student ID are required");
    }

    // Verify the subject belongs to the student
    const subjectCheck = await db.query(
      "SELECT * FROM module_subjects WHERE id = $1 AND student_id = $2",
      [subjectId, studentId]
    );

    if (subjectCheck.rows.length === 0) {
      throw new Error("Subject not found");
    }

    const { name, description } = updates;
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (name !== undefined) {
      updateFields.push(`name = $${paramCount}`);
      updateValues.push(name);
      paramCount++;
    }

    if (description !== undefined) {
      updateFields.push(`description = $${paramCount}`);
      updateValues.push(description);
      paramCount++;
    }

    updateFields.push(`updated_at = NOW()`);

    if (updateFields.length === 1) {
      throw new Error("No valid fields to update");
    }

    updateValues.push(subjectId);

    const result = await db.query(
      `UPDATE module_subjects
       SET ${updateFields.join(", ")}
       WHERE id = $${paramCount}
       RETURNING id, student_id, name, description, created_at, updated_at`,
      updateValues
    );

    return result.rows[0];
  }

  /**
   * Delete a subject
   */
  async deleteSubject(subjectId, studentId) {
    if (!subjectId || !studentId) {
      throw new Error("Subject ID and Student ID are required");
    }

    // Verify the subject belongs to the student
    const subjectCheck = await db.query(
      "SELECT * FROM module_subjects WHERE id = $1 AND student_id = $2",
      [subjectId, studentId]
    );

    if (subjectCheck.rows.length === 0) {
      throw new Error("Subject not found");
    }

    // Delete will cascade to topics and module_notes
    await db.query("DELETE FROM module_subjects WHERE id = $1", [subjectId]);

    return { message: "Subject deleted successfully" };
  }

  /**
   * Create a topic within a subject
   */
  async createTopic(subjectId, studentId, topicName, description = null) {
    if (!subjectId || !studentId || !topicName) {
      throw new Error("Subject ID, Student ID, and topic name are required");
    }

    // Verify the subject belongs to the student
    const subjectCheck = await db.query(
      "SELECT * FROM module_subjects WHERE id = $1 AND student_id = $2",
      [subjectId, studentId]
    );

    if (subjectCheck.rows.length === 0) {
      throw new Error("Subject not found");
    }

    // Check if topic already exists
    const existingTopic = await db.query(
      "SELECT * FROM module_topics WHERE subject_id = $1 AND name = $2",
      [subjectId, topicName]
    );

    if (existingTopic.rows.length > 0) {
      throw new Error("Topic already exists with this name");
    }

    const result = await db.query(
      `INSERT INTO module_topics (subject_id, name, description)
       VALUES ($1, $2, $3)
       RETURNING id, subject_id, name, description, created_at, updated_at`,
      [subjectId, topicName, description]
    );

    return result.rows[0];
  }

  /**
   * Get topics for a subject
   */
  async getTopics(subjectId, studentId) {
    if (!subjectId || !studentId) {
      throw new Error("Subject ID and Student ID are required");
    }

    // Verify the subject belongs to the student
    const subjectCheck = await db.query(
      "SELECT * FROM module_subjects WHERE id = $1 AND student_id = $2",
      [subjectId, studentId]
    );

    if (subjectCheck.rows.length === 0) {
      throw new Error("Subject not found");
    }

    const result = await db.query(
      `SELECT id, name, description, created_at, updated_at
       FROM module_topics
       WHERE subject_id = $1
       ORDER BY created_at DESC`,
      [subjectId]
    );

    return result.rows;
  }

  /**
   * Delete a topic
   */
  async deleteTopic(topicId, subjectId, studentId) {
    if (!topicId || !subjectId || !studentId) {
      throw new Error("Topic ID, Subject ID, and Student ID are required");
    }

    // Verify the topic belongs to the subject and student
    const topicCheck = await db.query(
      `SELECT t.* FROM module_topics t
       JOIN module_subjects s ON t.subject_id = s.id
       WHERE t.id = $1 AND t.subject_id = $2 AND s.student_id = $3`,
      [topicId, subjectId, studentId]
    );

    if (topicCheck.rows.length === 0) {
      throw new Error("Topic not found");
    }

    await db.query("DELETE FROM module_topics WHERE id = $1", [topicId]);

    return { message: "Topic deleted successfully" };
  }
}

module.exports = new StudentSubjectService();
