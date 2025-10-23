// services/teacherService.js
const db = require("../db/db");

class TeacherService {
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

  /**
   * Add a module note (PDF file)
   */
  async addModuleNote(
    topicId,
    subjectId,
    teacherId,
    title,
    fileName,
    fileUrl = null,
    googleDriveFileId = null
  ) {
    if (!topicId || !subjectId || !teacherId || !title || !fileName) {
      throw new Error(
        "Topic ID, Subject ID, Teacher ID, title, and file name are required"
      );
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

    // Add the module note
    const result = await db.query(
      `INSERT INTO teacher_module_notes (topic_id, title, file_name, file_url, google_drive_file_id, is_public)
       VALUES ($1, $2, $3, $4, $5, FALSE)
       RETURNING id, topic_id, title, file_name, file_url, google_drive_file_id, is_public, created_at, updated_at`,
      [topicId, title, fileName, fileUrl, googleDriveFileId]
    );

    return result.rows[0];
  }

  /**
   * Get module notes for a topic
   */
  async getModuleNotes(topicId, subjectId, teacherId) {
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

    const result = await db.query(
      `SELECT id, topic_id, title, file_name, file_url, google_drive_file_id, is_public, created_at, updated_at
       FROM teacher_module_notes
       WHERE topic_id = $1
       ORDER BY created_at DESC`,
      [topicId]
    );

    return result.rows;
  }

  /**
   * Delete a module note
   */
  async deleteModuleNote(noteId, topicId, subjectId, teacherId) {
    if (!noteId || !topicId || !subjectId || !teacherId) {
      throw new Error(
        "Note ID, Topic ID, Subject ID, and Teacher ID are required"
      );
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

    // Verify the note belongs to the topic
    const noteCheck = await db.query(
      "SELECT * FROM teacher_module_notes WHERE id = $1 AND topic_id = $2",
      [noteId, topicId]
    );

    if (noteCheck.rows.length === 0) {
      throw new Error("Note not found");
    }

    // Delete the note
    const result = await db.query(
      "DELETE FROM teacher_module_notes WHERE id = $1 RETURNING id",
      [noteId]
    );

    return {
      message: "Note deleted successfully",
      deletedNoteId: result.rows[0].id,
    };
  }

  /**
   * Update module note visibility (public/private)
   */
  async updateNoteVisibility(noteId, teacherId, isPublic) {
    if (
      noteId === undefined ||
      teacherId === undefined ||
      isPublic === undefined
    ) {
      throw new Error(
        "Note ID, Teacher ID, and visibility status are required"
      );
    }

    // Verify the note belongs to this teacher
    const noteCheck = await db.query(
      `SELECT tmn.* FROM teacher_module_notes tmn
       INNER JOIN teacher_module_topics tmt ON tmn.topic_id = tmt.id
       INNER JOIN teacher_module_subjects tms ON tmt.subject_id = tms.id
       WHERE tmn.id = $1 AND tms.teacher_id = $2`,
      [noteId, teacherId]
    );

    if (noteCheck.rows.length === 0) {
      throw new Error("Note not found or unauthorized");
    }

    // Update the note visibility
    const result = await db.query(
      `UPDATE teacher_module_notes
       SET is_public = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, topic_id, title, file_name, file_url, google_drive_file_id, is_public, created_at, updated_at`,
      [isPublic, noteId]
    );

    return result.rows[0];
  }

  /**
   * Get public notes by teacher (for students to access)
   */
  async getPublicNotesByTeacher(teacherId) {
    if (!teacherId) {
      throw new Error("Teacher ID is required");
    }

    const result = await db.query(
      `SELECT tmn.id, tmn.title, tmn.file_name, tmn.file_url, tmn.google_drive_file_id,
              tmt.name as topic_name, tms.name as subject_name, tms.id as subject_id
       FROM teacher_module_notes tmn
       INNER JOIN teacher_module_topics tmt ON tmn.topic_id = tmt.id
       INNER JOIN teacher_module_subjects tms ON tmt.subject_id = tms.id
       WHERE tms.teacher_id = $1 AND tmn.is_public = TRUE
       ORDER BY tmn.created_at DESC`,
      [teacherId]
    );

    return result.rows;
  }
}

module.exports = new TeacherService();
