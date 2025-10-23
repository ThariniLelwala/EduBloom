// services/teacher/notesService.js
const db = require("../../db/db");

class NotesService {
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

module.exports = new NotesService();
