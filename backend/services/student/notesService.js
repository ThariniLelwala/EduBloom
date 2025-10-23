// services/student/notesService.js
const db = require("../../db/db");

class StudentNotesService {
  /**
   * Add a module note (PDF file)
   */
  async addModuleNote(
    topicId,
    subjectId,
    studentId,
    title,
    fileName,
    fileUrl = null,
    googleDriveFileId = null
  ) {
    if (!topicId || !subjectId || !studentId || !title || !fileName) {
      throw new Error(
        "Topic ID, Subject ID, Student ID, title, and file name are required"
      );
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

    const result = await db.query(
      `INSERT INTO module_notes (topic_id, title, file_name, file_url, google_drive_file_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, topic_id, title, file_name, file_url, google_drive_file_id, created_at, updated_at`,
      [topicId, title, fileName, fileUrl, googleDriveFileId]
    );

    return result.rows[0];
  }

  /**
   * Get module notes for a topic
   */
  async getModuleNotes(topicId, subjectId, studentId) {
    if (!topicId || !subjectId || !studentId) {
      throw new Error("Topic ID, Subject ID, and Student ID are required");
    }

    // Verify access
    const topicCheck = await db.query(
      `SELECT t.* FROM module_topics t
       JOIN module_subjects s ON t.subject_id = s.id
       WHERE t.id = $1 AND t.subject_id = $2 AND s.student_id = $3`,
      [topicId, subjectId, studentId]
    );

    if (topicCheck.rows.length === 0) {
      throw new Error("Topic not found");
    }

    const result = await db.query(
      `SELECT id, title, file_name, file_url, google_drive_file_id, created_at, updated_at
       FROM module_notes
       WHERE topic_id = $1
       ORDER BY created_at DESC`,
      [topicId]
    );

    return result.rows;
  }

  /**
   * Delete a module note
   */
  async deleteModuleNote(noteId, topicId, subjectId, studentId) {
    if (!noteId || !topicId || !subjectId || !studentId) {
      throw new Error("All IDs are required");
    }

    // Verify access
    const noteCheck = await db.query(
      `SELECT mn.* FROM module_notes mn
       JOIN module_topics t ON mn.topic_id = t.id
       JOIN module_subjects s ON t.subject_id = s.id
       WHERE mn.id = $1 AND mn.topic_id = $2 AND t.subject_id = $3 AND s.student_id = $4`,
      [noteId, topicId, subjectId, studentId]
    );

    if (noteCheck.rows.length === 0) {
      throw new Error("Module note not found");
    }

    await db.query("DELETE FROM module_notes WHERE id = $1", [noteId]);

    return { message: "Module note deleted successfully" };
  }
}

module.exports = new StudentNotesService();
