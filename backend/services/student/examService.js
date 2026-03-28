// services/student/examService.js
const db = require("../../db/db");

class ExamService {
  async createTerm(studentId, name) {
    if (!studentId || !name) throw new Error("Student ID and name are required");
    const result = await db.query(
      "INSERT INTO exam_terms (student_id, name) VALUES ($1, $2) RETURNING *",
      [studentId, name]
    );
    return { ...result.rows[0], subjects: [] };
  }

  async getTerms(studentId) {
    const res = await db.query(
      "SELECT * FROM exam_terms WHERE student_id = $1 ORDER BY created_at ASC",
      [studentId]
    );
    for (let term of res.rows) {
      const subjects = await db.query(
        "SELECT * FROM exam_subjects WHERE term_id = $1 ORDER BY date ASC",
        [term.id]
      );
      term.subjects = subjects.rows;
    }
    return res.rows;
  }

  async getTerm(termId, studentId) {
    const res = await db.query("SELECT * FROM exam_terms WHERE id=$1 AND student_id=$2", [termId, studentId]);
    if (res.rows.length === 0) throw new Error("Exam term not found");
    const term = res.rows[0];
    const subjects = await db.query("SELECT * FROM exam_subjects WHERE term_id=$1 ORDER BY date ASC", [termId]);
    term.subjects = subjects.rows;
    return term;
  }

  async updateTerm(termId, studentId, name) {
    const res = await db.query(
      "UPDATE exam_terms SET name=$1, updated_at=NOW() WHERE id=$2 AND student_id=$3 RETURNING *",
      [name, termId, studentId]
    );
    if (res.rows.length === 0) throw new Error("Exam term not found");
    return res.rows[0];
  }

  async deleteTerm(termId, studentId) {
    const res = await db.query("DELETE FROM exam_terms WHERE id=$1 AND student_id=$2 RETURNING id", [termId, studentId]);
    if (res.rows.length === 0) throw new Error("Exam term not found");
    return { message: "Deleted" };
  }

  async createSubject(termId, studentId, name, mark) {
    const term = await db.query("SELECT id FROM exam_terms WHERE id=$1 AND student_id=$2", [termId, studentId]);
    if (term.rows.length === 0) throw new Error("Exam term not found");
    
    const res = await db.query(
      "INSERT INTO exam_subjects (term_id, name, mark) VALUES ($1, $2, $3) RETURNING *",
      [termId, name, mark]
    );
    return res.rows[0];
  }

  async updateSubject(subjectId, studentId, updates) {
    const subjectCheck = await db.query(`
      SELECT s.id FROM exam_subjects s 
      JOIN exam_terms t ON s.term_id = t.id 
      WHERE s.id=$1 AND t.student_id=$2`, [subjectId, studentId]);
    if (subjectCheck.rows.length === 0) throw new Error("Exam subject not found");

    const { name, mark } = updates;
    const res = await db.query(
      "UPDATE exam_subjects SET name=COALESCE($1, name), mark=COALESCE($2, mark), updated_at=NOW() WHERE id=$3 RETURNING *",
      [name, mark, subjectId]
    );
    return res.rows[0];
  }

  async deleteSubject(subjectId, studentId) {
    const subjectCheck = await db.query(`
      SELECT s.id FROM exam_subjects s 
      JOIN exam_terms t ON s.term_id = t.id 
      WHERE s.id=$1 AND t.student_id=$2`, [subjectId, studentId]);
    if (subjectCheck.rows.length === 0) throw new Error("Exam subject not found");
    
    await db.query("DELETE FROM exam_subjects WHERE id=$1", [subjectId]);
    return { message: "Deleted" };
  }
}

module.exports = new ExamService();
