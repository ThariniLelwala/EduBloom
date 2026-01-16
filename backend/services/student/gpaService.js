// services/student/gpaService.js
const db = require("../../db/db");

// Default grade to GPA mapping
const defaultGradeToGPA = {
  "A+": 4.0,
  "A": 4.0,
  "A-": 3.7,
  "B+": 3.3,
  "B": 3.0,
  "B-": 2.7,
  "C+": 2.3,
  "C": 2.0,
  "C-": 1.7,
  "D+": 1.3,
  "D": 1.0,
  "F": 0.0,
};

class GpaService {
  /**
   * Create a new semester for a student
   */
  async createSemester(studentId, name) {
    if (!studentId || !name) {
      throw new Error("Student ID and semester name are required");
    }

    // Validate student exists
    const studentCheck = await db.query(
      "SELECT * FROM users WHERE id = $1 AND role = 'student'",
      [studentId]
    );

    if (studentCheck.rows.length === 0) {
      throw new Error("Student not found");
    }

    const result = await db.query(
      `INSERT INTO gpa_semesters (student_id, name)
       VALUES ($1, $2)
       RETURNING id, student_id, name, created_at, updated_at`,
      [studentId, name]
    );

    const semester = result.rows[0];
    semester.subjects = [];
    return semester;
  }

  /**
   * Get all semesters with subjects for a student
   */
  async getSemesters(studentId) {
    if (!studentId) {
      throw new Error("Student ID is required");
    }

    const result = await db.query(
      `SELECT id, name, created_at, updated_at
       FROM gpa_semesters
       WHERE student_id = $1
       ORDER BY created_at ASC`,
      [studentId]
    );

    // Get subjects for each semester
    for (let semester of result.rows) {
      const subjectsResult = await db.query(
        `SELECT id, semester_id, name, grade, credits, subject_order
         FROM gpa_subjects
         WHERE semester_id = $1
         ORDER BY subject_order ASC, created_at ASC`,
        [semester.id]
      );
      semester.subjects = subjectsResult.rows;
    }

    return result.rows;
  }

  /**
   * Get a specific semester with subjects
   */
  async getSemester(semesterId, studentId) {
    if (!semesterId || !studentId) {
      throw new Error("Semester ID and Student ID are required");
    }

    const result = await db.query(
      `SELECT id, name, created_at, updated_at
       FROM gpa_semesters
       WHERE id = $1 AND student_id = $2`,
      [semesterId, studentId]
    );

    if (result.rows.length === 0) {
      throw new Error("Semester not found");
    }

    const semester = result.rows[0];

    // Get subjects
    const subjectsResult = await db.query(
      `SELECT id, semester_id, name, grade, credits, subject_order
       FROM gpa_subjects
       WHERE semester_id = $1
       ORDER BY subject_order ASC, created_at ASC`,
      [semesterId]
    );
    semester.subjects = subjectsResult.rows;

    return semester;
  }

  /**
   * Update a semester
   */
  async updateSemester(semesterId, studentId, name) {
    if (!semesterId || !studentId || !name) {
      throw new Error("Semester ID, Student ID, and name are required");
    }

    // Verify ownership
    const semester = await db.query(
      "SELECT * FROM gpa_semesters WHERE id = $1 AND student_id = $2",
      [semesterId, studentId]
    );

    if (semester.rows.length === 0) {
      throw new Error("Semester not found");
    }

    const result = await db.query(
      `UPDATE gpa_semesters 
       SET name = $1, updated_at = NOW()
       WHERE id = $2 AND student_id = $3
       RETURNING id, name, created_at, updated_at`,
      [name, semesterId, studentId]
    );

    return result.rows[0];
  }

  /**
   * Delete a semester (cascades to subjects)
   */
  async deleteSemester(semesterId, studentId) {
    if (!semesterId || !studentId) {
      throw new Error("Semester ID and Student ID are required");
    }

    // Verify ownership
    const semester = await db.query(
      "SELECT * FROM gpa_semesters WHERE id = $1 AND student_id = $2",
      [semesterId, studentId]
    );

    if (semester.rows.length === 0) {
      throw new Error("Semester not found");
    }

    await db.query(
      "DELETE FROM gpa_semesters WHERE id = $1 AND student_id = $2",
      [semesterId, studentId]
    );

    return { message: "Semester deleted successfully" };
  }

  /**
   * Create a new subject within a semester
   */
  async createSubject(semesterId, studentId, name, grade, credits) {
    if (!semesterId || !studentId || !name || !grade) {
      throw new Error("Semester ID, Student ID, name, and grade are required");
    }

    // Verify semester belongs to student
    const semester = await db.query(
      "SELECT * FROM gpa_semesters WHERE id = $1 AND student_id = $2",
      [semesterId, studentId]
    );

    if (semester.rows.length === 0) {
      throw new Error("Semester not found");
    }

    // Get next subject order
    const orderResult = await db.query(
      "SELECT MAX(subject_order) FROM gpa_subjects WHERE semester_id = $1",
      [semesterId]
    );
    const nextOrder = (orderResult.rows[0].max || 0) + 1;

    const result = await db.query(
      `INSERT INTO gpa_subjects (semester_id, name, grade, credits, subject_order)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, semester_id, name, grade, credits, subject_order, created_at, updated_at`,
      [semesterId, name, grade, credits || 0, nextOrder]
    );

    return result.rows[0];
  }

  /**
   * Update a subject
   */
  async updateSubject(subjectId, studentId, updates) {
    if (!subjectId || !studentId) {
      throw new Error("Subject ID and Student ID are required");
    }

    const { name, grade, credits } = updates;

    // Verify ownership through semester
    const subjectCheck = await db.query(
      `SELECT gs.* FROM gpa_subjects gs
       JOIN gpa_semesters sem ON gs.semester_id = sem.id
       WHERE gs.id = $1 AND sem.student_id = $2`,
      [subjectId, studentId]
    );

    if (subjectCheck.rows.length === 0) {
      throw new Error("Subject not found");
    }

    const result = await db.query(
      `UPDATE gpa_subjects 
       SET name = COALESCE($1, name),
           grade = COALESCE($2, grade),
           credits = COALESCE($3, credits),
           updated_at = NOW()
       WHERE id = $4
       RETURNING id, semester_id, name, grade, credits, subject_order, created_at, updated_at`,
      [name, grade, credits, subjectId]
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

    // Verify ownership through semester
    const subjectCheck = await db.query(
      `SELECT gs.* FROM gpa_subjects gs
       JOIN gpa_semesters sem ON gs.semester_id = sem.id
       WHERE gs.id = $1 AND sem.student_id = $2`,
      [subjectId, studentId]
    );

    if (subjectCheck.rows.length === 0) {
      throw new Error("Subject not found");
    }

    await db.query("DELETE FROM gpa_subjects WHERE id = $1", [subjectId]);

    return { message: "Subject deleted successfully" };
  }

  /**
   * Get grade mappings for a student (returns defaults if none set)
   */
  async getGradeMappings(studentId) {
    if (!studentId) {
      throw new Error("Student ID is required");
    }

    const result = await db.query(
      `SELECT grade_key, gpa_value
       FROM gpa_grade_mappings
       WHERE student_id = $1`,
      [studentId]
    );

    // Start with defaults and override with custom mappings
    const mappings = { ...defaultGradeToGPA };
    result.rows.forEach((row) => {
      mappings[row.grade_key] = parseFloat(row.gpa_value);
    });

    return mappings;
  }

  /**
   * Update grade mappings for a student
   */
  async updateGradeMappings(studentId, mappings) {
    if (!studentId || !mappings) {
      throw new Error("Student ID and mappings are required");
    }

    // Upsert each mapping
    for (const [gradeKey, gpaValue] of Object.entries(mappings)) {
      await db.query(
        `INSERT INTO gpa_grade_mappings (student_id, grade_key, gpa_value)
         VALUES ($1, $2, $3)
         ON CONFLICT (student_id, grade_key) 
         DO UPDATE SET gpa_value = $3, updated_at = NOW()`,
        [studentId, gradeKey, gpaValue]
      );
    }

    return await this.getGradeMappings(studentId);
  }
}

module.exports = new GpaService();
