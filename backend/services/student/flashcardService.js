// services/student/flashcardService.js
const db = require("../../db/db");

class FlashcardService {
  /**
   * Create a new flashcard subject for a student
   */
  async createFlashcardSubject(studentId, name, description = null) {
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
      "SELECT * FROM flashcard_subjects WHERE student_id = $1 AND name = $2",
      [studentId, name]
    );

    if (existing.rows.length > 0) {
      throw new Error("Subject already exists with this name");
    }

    const result = await db.query(
      `INSERT INTO flashcard_subjects (student_id, name, description)
       VALUES ($1, $2, $3)
       RETURNING id, student_id, name, description, created_at, updated_at`,
      [studentId, name, description]
    );

    return result.rows[0];
  }

  /**
   * Get all flashcard subjects for a student
   */
  async getFlashcardSubjects(studentId) {
    if (!studentId) {
      throw new Error("Student ID is required");
    }

    const result = await db.query(
      `SELECT id, name, description, created_at, updated_at
       FROM flashcard_subjects
       WHERE student_id = $1
       ORDER BY created_at DESC`,
      [studentId]
    );

    return result.rows;
  }

  /**
   * Get a specific flashcard subject
   */
  async getFlashcardSubject(subjectId, studentId) {
    if (!subjectId || !studentId) {
      throw new Error("Subject ID and Student ID are required");
    }

    const result = await db.query(
      `SELECT id, name, description, created_at, updated_at
       FROM flashcard_subjects
       WHERE id = $1 AND student_id = $2`,
      [subjectId, studentId]
    );

    if (result.rows.length === 0) {
      throw new Error("Subject not found");
    }

    return result.rows[0];
  }

  /**
   * Update a flashcard subject
   */
  async updateFlashcardSubject(subjectId, studentId, updates) {
    if (!subjectId || !studentId) {
      throw new Error("Subject ID and Student ID are required");
    }

    const { name, description } = updates;

    // Verify ownership
    const subject = await db.query(
      "SELECT * FROM flashcard_subjects WHERE id = $1 AND student_id = $2",
      [subjectId, studentId]
    );

    if (subject.rows.length === 0) {
      throw new Error("Subject not found");
    }

    const result = await db.query(
      `UPDATE flashcard_subjects 
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
   * Delete a flashcard subject (cascades to sets and items)
   */
  async deleteFlashcardSubject(subjectId, studentId) {
    if (!subjectId || !studentId) {
      throw new Error("Subject ID and Student ID are required");
    }

    // Verify ownership
    const subject = await db.query(
      "SELECT * FROM flashcard_subjects WHERE id = $1 AND student_id = $2",
      [subjectId, studentId]
    );

    if (subject.rows.length === 0) {
      throw new Error("Subject not found");
    }

    await db.query(
      "DELETE FROM flashcard_subjects WHERE id = $1 AND student_id = $2",
      [subjectId, studentId]
    );

    return { message: "Subject deleted successfully" };
  }

  /**
   * Create a new flashcard set within a subject
   */
  async createFlashcardSet(subjectId, studentId, name, description = null) {
    if (!subjectId || !studentId || !name) {
      throw new Error("Subject ID, Student ID, and set name are required");
    }

    // Verify subject belongs to student
    const subject = await db.query(
      "SELECT * FROM flashcard_subjects WHERE id = $1 AND student_id = $2",
      [subjectId, studentId]
    );

    if (subject.rows.length === 0) {
      throw new Error("Subject not found");
    }

    // Check if set already exists
    const existing = await db.query(
      "SELECT * FROM flashcard_sets WHERE subject_id = $1 AND name = $2",
      [subjectId, name]
    );

    if (existing.rows.length > 0) {
      throw new Error("Flashcard set already exists with this name");
    }

    const result = await db.query(
      `INSERT INTO flashcard_sets (subject_id, name, description)
       VALUES ($1, $2, $3)
       RETURNING id, subject_id, name, description, created_at, updated_at`,
      [subjectId, name, description]
    );

    return result.rows[0];
  }

  /**
   * Get all flashcard sets for a subject
   */
  async getFlashcardSets(subjectId, studentId) {
    if (!subjectId || !studentId) {
      throw new Error("Subject ID and Student ID are required");
    }

    // Verify subject belongs to student
    const subject = await db.query(
      "SELECT * FROM flashcard_subjects WHERE id = $1 AND student_id = $2",
      [subjectId, studentId]
    );

    if (subject.rows.length === 0) {
      throw new Error("Subject not found");
    }

    const result = await db.query(
      `SELECT id, subject_id, name, description, created_at, updated_at
       FROM flashcard_sets
       WHERE subject_id = $1
       ORDER BY created_at DESC`,
      [subjectId]
    );

    // Get item count for each set
    for (let set of result.rows) {
      const countResult = await db.query(
        "SELECT COUNT(*) as count FROM flashcard_items WHERE flashcard_set_id = $1",
        [set.id]
      );
      set.item_count = parseInt(countResult.rows[0].count);
    }

    return result.rows;
  }

  /**
   * Get a specific flashcard set with all items
   */
  async getFlashcardSet(setId, studentId) {
    if (!setId || !studentId) {
      throw new Error("Set ID and Student ID are required");
    }

    const setResult = await db.query(
      `SELECT fs.id, fs.subject_id, fs.name, fs.description, fs.created_at, fs.updated_at
       FROM flashcard_sets fs
       JOIN flashcard_subjects fsubj ON fs.subject_id = fsubj.id
       WHERE fs.id = $1 AND fsubj.student_id = $2`,
      [setId, studentId]
    );

    if (setResult.rows.length === 0) {
      throw new Error("Flashcard set not found");
    }

    const set = setResult.rows[0];

    // Get all items in the set
    const itemsResult = await db.query(
      `SELECT id, flashcard_set_id, question, answer, item_order, created_at, updated_at
       FROM flashcard_items
       WHERE flashcard_set_id = $1
       ORDER BY item_order ASC, created_at ASC`,
      [setId]
    );

    set.items = itemsResult.rows;
    return set;
  }

  /**
   * Update a flashcard set
   */
  async updateFlashcardSet(setId, studentId, updates) {
    if (!setId || !studentId) {
      throw new Error("Set ID and Student ID are required");
    }

    const { name, description } = updates;

    // Verify ownership through subject
    const setCheck = await db.query(
      `SELECT fs.* FROM flashcard_sets fs
       JOIN flashcard_subjects fsubj ON fs.subject_id = fsubj.id
       WHERE fs.id = $1 AND fsubj.student_id = $2`,
      [setId, studentId]
    );

    if (setCheck.rows.length === 0) {
      throw new Error("Flashcard set not found");
    }

    const result = await db.query(
      `UPDATE flashcard_sets 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           updated_at = NOW()
       WHERE id = $3
       RETURNING id, subject_id, name, description, created_at, updated_at`,
      [name, description, setId]
    );

    return result.rows[0];
  }

  /**
   * Delete a flashcard set
   */
  async deleteFlashcardSet(setId, studentId) {
    if (!setId || !studentId) {
      throw new Error("Set ID and Student ID are required");
    }

    // Verify ownership through subject
    const setCheck = await db.query(
      `SELECT fs.* FROM flashcard_sets fs
       JOIN flashcard_subjects fsubj ON fs.subject_id = fsubj.id
       WHERE fs.id = $1 AND fsubj.student_id = $2`,
      [setId, studentId]
    );

    if (setCheck.rows.length === 0) {
      throw new Error("Flashcard set not found");
    }

    await db.query("DELETE FROM flashcard_sets WHERE id = $1", [setId]);

    return { message: "Flashcard set deleted successfully" };
  }

  /**
   * Create a new flashcard item within a set
   */
  async createFlashcardItem(setId, studentId, question, answer, itemOrder = 0) {
    if (!setId || !studentId || !question || !answer) {
      throw new Error("Set ID, Student ID, question, and answer are required");
    }

    // Verify ownership through subject
    const setCheck = await db.query(
      `SELECT fs.* FROM flashcard_sets fs
       JOIN flashcard_subjects fsubj ON fs.subject_id = fsubj.id
       WHERE fs.id = $1 AND fsubj.student_id = $2`,
      [setId, studentId]
    );

    if (setCheck.rows.length === 0) {
      throw new Error("Flashcard set not found");
    }

    const result = await db.query(
      `INSERT INTO flashcard_items (flashcard_set_id, question, answer, item_order)
       VALUES ($1, $2, $3, $4)
       RETURNING id, flashcard_set_id, question, answer, item_order, created_at, updated_at`,
      [setId, question, answer, itemOrder]
    );

    return result.rows[0];
  }

  /**
   * Get all items in a flashcard set
   */
  async getFlashcardItems(setId, studentId) {
    if (!setId || !studentId) {
      throw new Error("Set ID and Student ID are required");
    }

    // Verify ownership through subject
    const setCheck = await db.query(
      `SELECT fs.* FROM flashcard_sets fs
       JOIN flashcard_subjects fsubj ON fs.subject_id = fsubj.id
       WHERE fs.id = $1 AND fsubj.student_id = $2`,
      [setId, studentId]
    );

    if (setCheck.rows.length === 0) {
      throw new Error("Flashcard set not found");
    }

    const result = await db.query(
      `SELECT id, flashcard_set_id, question, answer, item_order, created_at, updated_at
       FROM flashcard_items
       WHERE flashcard_set_id = $1
       ORDER BY item_order ASC, created_at ASC`,
      [setId]
    );

    return result.rows;
  }

  /**
   * Update a flashcard item
   */
  async updateFlashcardItem(itemId, setId, studentId, updates) {
    if (!itemId || !setId || !studentId) {
      throw new Error("Item ID, Set ID, and Student ID are required");
    }

    const { question, answer, item_order } = updates;

    // Verify ownership through subject
    const itemCheck = await db.query(
      `SELECT fi.* FROM flashcard_items fi
       JOIN flashcard_sets fs ON fi.flashcard_set_id = fs.id
       JOIN flashcard_subjects fsubj ON fs.subject_id = fsubj.id
       WHERE fi.id = $1 AND fi.flashcard_set_id = $2 AND fsubj.student_id = $3`,
      [itemId, setId, studentId]
    );

    if (itemCheck.rows.length === 0) {
      throw new Error("Flashcard item not found");
    }

    const result = await db.query(
      `UPDATE flashcard_items 
       SET question = COALESCE($1, question),
           answer = COALESCE($2, answer),
           item_order = COALESCE($3, item_order),
           updated_at = NOW()
       WHERE id = $4
       RETURNING id, flashcard_set_id, question, answer, item_order, created_at, updated_at`,
      [question, answer, item_order, itemId]
    );

    return result.rows[0];
  }

  /**
   * Delete a flashcard item
   */
  async deleteFlashcardItem(itemId, setId, studentId) {
    if (!itemId || !setId || !studentId) {
      throw new Error("Item ID, Set ID, and Student ID are required");
    }

    // Verify ownership through subject
    const itemCheck = await db.query(
      `SELECT fi.* FROM flashcard_items fi
       JOIN flashcard_sets fs ON fi.flashcard_set_id = fs.id
       JOIN flashcard_subjects fsubj ON fs.subject_id = fsubj.id
       WHERE fi.id = $1 AND fi.flashcard_set_id = $2 AND fsubj.student_id = $3`,
      [itemId, setId, studentId]
    );

    if (itemCheck.rows.length === 0) {
      throw new Error("Flashcard item not found");
    }

    await db.query("DELETE FROM flashcard_items WHERE id = $1", [itemId]);

    return { message: "Flashcard item deleted successfully" };
  }

  /**
   * Reorder flashcard items in a set
   */
  async reorderFlashcardItems(setId, studentId, itemIds) {
    if (!setId || !studentId || !itemIds || itemIds.length === 0) {
      throw new Error("Set ID, Student ID, and item IDs are required");
    }

    // Verify ownership
    const setCheck = await db.query(
      `SELECT fs.* FROM flashcard_sets fs
       JOIN flashcard_subjects fsubj ON fs.subject_id = fsubj.id
       WHERE fs.id = $1 AND fsubj.student_id = $2`,
      [setId, studentId]
    );

    if (setCheck.rows.length === 0) {
      throw new Error("Flashcard set not found");
    }

    // Update order for each item
    for (let i = 0; i < itemIds.length; i++) {
      await db.query(
        "UPDATE flashcard_items SET item_order = $1 WHERE id = $2",
        [i, itemIds[i]]
      );
    }

    return { message: "Items reordered successfully" };
  }
}

module.exports = new FlashcardService();
