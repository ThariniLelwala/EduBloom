// services/admin/helpService.js
const db = require("../../db/db");

class HelpService {
  async getAllFAQs() {
    const result = await db.query(
      "SELECT * FROM faqs ORDER BY created_at DESC"
    );
    return result.rows;
  }

  async getFAQsByRole(role) {
    const validRoles = ["admin", "teacher", "student", "parent"];
    let query = "SELECT * FROM faqs WHERE target_role IS NULL OR target_role = $1";
    let params = [role];

    if (role && validRoles.includes(role)) {
      query = "SELECT * FROM faqs WHERE target_role IS NULL OR target_role = $1 ORDER BY created_at DESC";
      params = [role];
    } else {
      query = "SELECT * FROM faqs WHERE target_role IS NULL ORDER BY created_at DESC";
      params = [];
    }

    const result = await db.query(query, params);
    return result.rows;
  }

  async createFAQ(question, answer, targetRole = null) {
    const validRoles = ["admin", "teacher", "student", "parent", null];
    if (targetRole !== null && !validRoles.includes(targetRole)) {
      targetRole = null;
    }
    const result = await db.query(
      "INSERT INTO faqs (question, answer, target_role) VALUES ($1, $2, $3) RETURNING *",
      [question, answer, targetRole]
    );
    return result.rows[0];
  }

  async updateFAQ(id, question, answer, targetRole = null) {
    const validRoles = ["admin", "teacher", "student", "parent", null];
    if (targetRole !== null && !validRoles.includes(targetRole)) {
      targetRole = null;
    }
    const result = await db.query(
      "UPDATE faqs SET question = $2, answer = $3, target_role = $4, updated_at = NOW() WHERE id = $1 RETURNING *",
      [id, question, answer, targetRole]
    );
    if (result.rows.length === 0) throw new Error("FAQ not found");
    return result.rows[0];
  }

  async deleteFAQ(id) {
    const result = await db.query(
      "DELETE FROM faqs WHERE id = $1 RETURNING id",
      [id]
    );
    if (result.rows.length === 0) throw new Error("FAQ not found");
    return { id };
  }

  async getAllRequests(status) {
    let query = `
      SELECT hr.*, u.username, u.firstname, u.lastname
      FROM help_requests hr
      JOIN users u ON hr.user_id = u.id
    `;
    const params = [];
    if (status) {
      query += " WHERE hr.status = $1";
      params.push(status);
    }
    query += " ORDER BY hr.created_at DESC";
    
    const result = await db.query(query, params);
    return result.rows;
  }

  async createRequest(userId, topic, message) {
    const result = await db.query(
      "INSERT INTO help_requests (user_id, topic, message) VALUES ($1, $2, $3) RETURNING *",
      [userId, topic, message]
    );
    return result.rows[0];
  }

  async getRequestsByUser(userId) {
    const result = await db.query(
      "SELECT * FROM help_requests WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );
    return result.rows;
  }

  async replyToRequest(id, reply) {
    const result = await db.query(
      "UPDATE help_requests SET reply = $2, status = 'replied', updated_at = NOW() WHERE id = $1 RETURNING *",
      [id, reply]
    );
    if (result.rows.length === 0) throw new Error("Request not found");
    return result.rows[0];
  }

  async resolveRequest(id) {
    const result = await db.query(
      "UPDATE help_requests SET status = 'resolved', updated_at = NOW() WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) throw new Error("Request not found");
    return result.rows[0];
  }
}

module.exports = new HelpService();
