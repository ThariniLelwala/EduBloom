// services/student/markService.js
const db = require("../../db/db");

class MarkService {
  async createSubject(studentId, name) {
    if (!studentId || !name) throw new Error("Student ID and name are required");
    const result = await db.query(
      "INSERT INTO mark_subjects (student_id, name) VALUES ($1, $2) RETURNING *",
      [studentId, name]
    );
    return { ...result.rows[0], tests: [] };
  }

  async getSubjects(studentId) {
    const res = await db.query(
      "SELECT * FROM mark_subjects WHERE student_id = $1 ORDER BY created_at ASC",
      [studentId]
    );
    for (let subj of res.rows) {
      const tests = await db.query(
        "SELECT * FROM mark_tests WHERE subject_id = $1 ORDER BY date ASC",
        [subj.id]
      );
      subj.tests = tests.rows;
    }
    return res.rows;
  }

  async getSubject(subjectId, studentId) {
    const res = await db.query("SELECT * FROM mark_subjects WHERE id=$1 AND student_id=$2", [subjectId, studentId]);
    if (res.rows.length === 0) throw new Error("Subject not found");
    const subj = res.rows[0];
    const tests = await db.query("SELECT * FROM mark_tests WHERE subject_id=$1 ORDER BY date ASC", [subjectId]);
    subj.tests = tests.rows;
    return subj;
  }

  async updateSubject(subjectId, studentId, name) {
    const res = await db.query(
      "UPDATE mark_subjects SET name=$1, updated_at=NOW() WHERE id=$2 AND student_id=$3 RETURNING *",
      [name, subjectId, studentId]
    );
    if (res.rows.length === 0) throw new Error("Subject not found");
    return res.rows[0];
  }

  async deleteSubject(subjectId, studentId) {
    const res = await db.query("DELETE FROM mark_subjects WHERE id=$1 AND student_id=$2 RETURNING id", [subjectId, studentId]);
    if (res.rows.length === 0) throw new Error("Subject not found");
    return { message: "Deleted" };
  }

  async createTest(subjectId, studentId, name, mark) {
    const subj = await db.query("SELECT id FROM mark_subjects WHERE id=$1 AND student_id=$2", [subjectId, studentId]);
    if (subj.rows.length === 0) throw new Error("Subject not found");
    
    const res = await db.query(
      "INSERT INTO mark_tests (subject_id, name, mark) VALUES ($1, $2, $3) RETURNING *",
      [subjectId, name, mark]
    );
    return res.rows[0];
  }

  async updateTest(testId, studentId, updates) {
    const testCheck = await db.query(`
      SELECT t.id FROM mark_tests t 
      JOIN mark_subjects s ON t.subject_id = s.id 
      WHERE t.id=$1 AND s.student_id=$2`, [testId, studentId]);
    if (testCheck.rows.length === 0) throw new Error("Test not found");

    const { name, mark } = updates;
    const res = await db.query(
      "UPDATE mark_tests SET name=COALESCE($1, name), mark=COALESCE($2, mark), updated_at=NOW() WHERE id=$3 RETURNING *",
      [name, mark, testId]
    );
    return res.rows[0];
  }

  async deleteTest(testId, studentId) {
    const testCheck = await db.query(`
      SELECT t.id FROM mark_tests t 
      JOIN mark_subjects s ON t.subject_id = s.id 
      WHERE t.id=$1 AND s.student_id=$2`, [testId, studentId]);
    if (testCheck.rows.length === 0) throw new Error("Test not found");
    
    await db.query("DELETE FROM mark_tests WHERE id=$1", [testId]);
    return { message: "Deleted" };
  }
}

module.exports = new MarkService();
