// services/teacher/subjectService.js
const db = require("../../db/db");

class SubjectService {
  /**
   * Create a new subject for a teacher
   */
  async createSubject(teacherId, subjectName, description = null) {
    if (!teacherId || !subjectName) {
      throw new Error("Teacher ID and subject name are required");
    }

    // Validate teacher exists and is a teacher
    const teacherCheck = await db.query(
      "SELECT * FROM users WHERE id = $1 AND role = 'teacher'",
      [teacherId]
    );

    if (teacherCheck.rows.length === 0) {
      throw new Error("Teacher not found");
    }

    // Check if subject already exists for this teacher
    const existingSubject = await db.query(
      "SELECT * FROM teacher_module_subjects WHERE teacher_id = $1 AND name = $2",
      [teacherId, subjectName]
    );

    if (existingSubject.rows.length > 0) {
      throw new Error("Subject already exists with this name");
    }

    // Create the subject
    const result = await db.query(
      `INSERT INTO teacher_module_subjects (teacher_id, name, description)
       VALUES ($1, $2, $3)
       RETURNING id, teacher_id, name, description, created_at, updated_at`,
      [teacherId, subjectName, description]
    );

    return result.rows[0];
  }

  /**
   * Get all subjects for a teacher
   */
  async getTeacherSubjects(teacherId) {
    if (!teacherId) {
      throw new Error("Teacher ID is required");
    }

    const result = await db.query(
      `SELECT id, name, description, created_at, updated_at
       FROM teacher_module_subjects
       WHERE teacher_id = $1
       ORDER BY created_at DESC`,
      [teacherId]
    );

    return result.rows;
  }

  /**
   * Get a specific subject with its topics
   */
  async getSubjectWithTopics(subjectId, teacherId) {
    if (!subjectId || !teacherId) {
      throw new Error("Subject ID and Teacher ID are required");
    }

    // Verify the subject belongs to the teacher
    const subjectCheck = await db.query(
      "SELECT * FROM teacher_module_subjects WHERE id = $1 AND teacher_id = $2",
      [subjectId, teacherId]
    );

    if (subjectCheck.rows.length === 0) {
      throw new Error("Subject not found");
    }

    const subject = subjectCheck.rows[0];

    // Get topics for this subject
    const topicsResult = await db.query(
      `SELECT id, name, description, created_at, updated_at
       FROM teacher_module_topics
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
  async updateSubject(subjectId, teacherId, updates) {
    if (!subjectId || !teacherId) {
      throw new Error("Subject ID and Teacher ID are required");
    }

    // Verify the subject belongs to the teacher
    const subjectCheck = await db.query(
      "SELECT * FROM teacher_module_subjects WHERE id = $1 AND teacher_id = $2",
      [subjectId, teacherId]
    );

    if (subjectCheck.rows.length === 0) {
      throw new Error("Subject not found or unauthorized");
    }

    const { name, description } = updates;

    // Build update query dynamically
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

    if (updateFields.length === 0) {
      return subjectCheck.rows[0];
    }

    updateFields.push(`updated_at = NOW()`);
    updateValues.push(subjectId);

    const result = await db.query(
      `UPDATE teacher_module_subjects
       SET ${updateFields.join(", ")}
       WHERE id = $${paramCount}
       RETURNING id, teacher_id, name, description, created_at, updated_at`,
      updateValues
    );

    return result.rows[0];
  }

  /**
   * Delete a subject and all its topics/notes
   */
  async deleteSubject(subjectId, teacherId) {
    if (!subjectId || !teacherId) {
      throw new Error("Subject ID and Teacher ID are required");
    }

    // Verify the subject belongs to the teacher
    const subjectCheck = await db.query(
      "SELECT * FROM teacher_module_subjects WHERE id = $1 AND teacher_id = $2",
      [subjectId, teacherId]
    );

    if (subjectCheck.rows.length === 0) {
      throw new Error("Subject not found or unauthorized");
    }

    // Delete the subject (cascading delete will handle topics and notes)
    const result = await db.query(
      "DELETE FROM teacher_module_subjects WHERE id = $1 RETURNING id",
      [subjectId]
    );

    return {
      message: "Subject deleted successfully",
      deletedSubjectId: result.rows[0].id,
    };
  }

  /**
   * Create a topic within a subject
   */
  async createTopic(subjectId, teacherId, topicName, description = null) {
    if (!subjectId || !teacherId || !topicName) {
      throw new Error("Subject ID, Teacher ID, and topic name are required");
    }

    // Verify the subject belongs to the teacher
    const subjectCheck = await db.query(
      "SELECT * FROM teacher_module_subjects WHERE id = $1 AND teacher_id = $2",
      [subjectId, teacherId]
    );

    if (subjectCheck.rows.length === 0) {
      throw new Error("Subject not found or unauthorized");
    }

    // Check if topic already exists
    const existingTopic = await db.query(
      "SELECT * FROM teacher_module_topics WHERE subject_id = $1 AND name = $2",
      [subjectId, topicName]
    );

    if (existingTopic.rows.length > 0) {
      throw new Error("Topic already exists with this name");
    }

    // Create the topic
    const result = await db.query(
      `INSERT INTO teacher_module_topics (subject_id, name, description)
       VALUES ($1, $2, $3)
       RETURNING id, subject_id, name, description, created_at, updated_at`,
      [subjectId, topicName, description]
    );

    return result.rows[0];
  }

  /**
   * Get topics for a subject
   */
  async getTopics(subjectId, teacherId) {
    if (!subjectId || !teacherId) {
      throw new Error("Subject ID and Teacher ID are required");
    }

    // Verify the subject belongs to the teacher
    const subjectCheck = await db.query(
      "SELECT * FROM teacher_module_subjects WHERE id = $1 AND teacher_id = $2",
      [subjectId, teacherId]
    );

    if (subjectCheck.rows.length === 0) {
      throw new Error("Subject not found or unauthorized");
    }

    const result = await db.query(
      `SELECT id, subject_id, name, description, created_at, updated_at
       FROM teacher_module_topics
       WHERE subject_id = $1
       ORDER BY created_at DESC`,
      [subjectId]
    );

    return result.rows;
  }

  /**
   * Delete a topic
   */
  async deleteTopic(topicId, subjectId, teacherId) {
    if (!topicId || !subjectId || !teacherId) {
      throw new Error("Topic ID, Subject ID, and Teacher ID are required");
    }

    // Verify the subject belongs to the teacher
    const subjectCheck = await db.query(
      "SELECT * FROM teacher_module_subjects WHERE id = $1 AND teacher_id = $2",
      [subjectId, teacherId]
    );

    if (subjectCheck.rows.length === 0) {
      throw new Error("Subject not found or unauthorized");
    }

    // Verify the topic belongs to the subject
    const topicCheck = await db.query(
      "SELECT * FROM teacher_module_topics WHERE id = $1 AND subject_id = $2",
      [topicId, subjectId]
    );

    if (topicCheck.rows.length === 0) {
      throw new Error("Topic not found");
    }

    // Delete the topic (cascading delete will handle notes)
    const result = await db.query(
      "DELETE FROM teacher_module_topics WHERE id = $1 RETURNING id",
      [topicId]
    );

    return {
      message: "Topic deleted successfully",
      deletedTopicId: result.rows[0].id,
    };
  }
}

module.exports = new SubjectService();
