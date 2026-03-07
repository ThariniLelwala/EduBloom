// services/student/diaryService.js
const db = require("../../db/db");

class DiaryService {
  /**
   * Create a new diary entry
   */
  async createEntry(studentId, entryData) {
    if (!studentId) {
      throw new Error("Student ID is required");
    }

    const { text, theme, font, mood, energy, date } = entryData;

    if (!text) {
      throw new Error("Entry text is required");
    }

    const result = await db.query(
      `INSERT INTO student_diary_entries 
       (student_id, text, theme, font, mood, energy, entry_date, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, NOW()), NOW(), NOW())
       RETURNING id, student_id, text, theme, font, mood, energy, entry_date, created_at, updated_at`,
      [
        studentId,
        text,
        theme || "default",
        font || "'Indie Flower', cursive",
        mood || null,
        energy || null,
        date || null,
      ]
    );

    return result.rows[0];
  }

  /**
   * Get all diary entries for a student
   */
  async getEntries(studentId) {
    if (!studentId) {
      throw new Error("Student ID is required");
    }

    const result = await db.query(
      `SELECT id, student_id, text, theme, font, mood, energy, entry_date, created_at, updated_at
       FROM student_diary_entries
       WHERE student_id = $1
       ORDER BY entry_date DESC`,
      [studentId]
    );

    return result.rows;
  }

  /**
   * Update a diary entry
   */
  async updateEntry(studentId, entryId, updates) {
    if (!studentId || !entryId) {
      throw new Error("Student ID and Entry ID are required");
    }

    const { text, theme, font, mood, energy, date } = updates;

    // Verify ownership
    const entry = await db.query(
      "SELECT * FROM student_diary_entries WHERE id = $1 AND student_id = $2",
      [entryId, studentId]
    );

    if (entry.rows.length === 0) {
      throw new Error("Diary entry not found or access denied");
    }

    const result = await db.query(
      `UPDATE student_diary_entries
       SET text = COALESCE($1, text),
           theme = COALESCE($2, theme),
           font = COALESCE($3, font),
           mood = $4, -- Allow nullifying
           energy = $5, -- Allow nullifying
           entry_date = COALESCE($6, entry_date),
           updated_at = NOW()
       WHERE id = $7 AND student_id = $8
       RETURNING id, student_id, text, theme, font, mood, energy, entry_date, created_at, updated_at`,
      [text, theme, font, mood, energy, date, entryId, studentId]
    );

    return result.rows[0];
  }

  /**
   * Delete a diary entry
   */
  async deleteEntry(studentId, entryId) {
    if (!studentId || !entryId) {
      throw new Error("Student ID and Entry ID are required");
    }

    const result = await db.query(
      "DELETE FROM student_diary_entries WHERE id = $1 AND student_id = $2 RETURNING id",
      [entryId, studentId]
    );

    if (result.rows.length === 0) {
      throw new Error("Diary entry not found or access denied");
    }

    return true;
  }
}

module.exports = new DiaryService();
