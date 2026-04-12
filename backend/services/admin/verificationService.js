// services/admin/verificationService.js
const db = require("../../db/db");

class VerificationService {
  async getPending() {
    const result = await db.query(`
      SELECT v.*, u.username, u.email, u.firstname, u.lastname
      FROM teacher_verifications v
      JOIN users u ON v.user_id = u.id
      WHERE v.status = 'pending'
      ORDER BY v.submitted_at DESC
    `);
    return result.rows;
  }

  async getAll(status) {
    let query = `
      SELECT v.*, u.username, u.email, u.firstname, u.lastname
      FROM teacher_verifications v
      JOIN users u ON v.user_id = u.id
    `;
    if (status) query += ` WHERE v.status = '${status}'`;
    query += " ORDER BY v.submitted_at DESC";
    const result = await db.query(query);
    return result.rows;
  }

  async getById(id) {
    const result = await db.query(`
      SELECT v.*, u.username, u.email, u.firstname, u.lastname
      FROM teacher_verifications v
      JOIN users u ON v.user_id = u.id
      WHERE v.id = $1
    `, [id]);
    if (result.rows.length === 0) throw new Error("Verification not found");
    return result.rows[0];
  }

  async approve(id) {
    await db.query(`
      UPDATE teacher_verifications SET status = 'verified', verified_at = NOW(), updated_at = NOW()
      WHERE id = $1 AND status = 'pending'
    `, [id]);
    return { message: "Verification approved" };
  }

  async reject(id, reason) {
    await db.query(`
      UPDATE teacher_verifications SET status = 'rejected', rejection_reason = $2, reviewed_at = NOW(), updated_at = NOW()
      WHERE id = $1 AND status = 'pending'
    `, [id, reason]);
    return { message: "Verification rejected" };
  }

  async getStats() {
    const result = await db.query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'verified') as verified,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected
      FROM teacher_verifications
    `);
    return result.rows[0];
  }
}

module.exports = new VerificationService();
