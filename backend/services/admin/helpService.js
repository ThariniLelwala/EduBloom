// services/admin/helpService.js
const db = require("../../db/db");

class HelpService {
  async getAllFAQs() {
    const result = await db.query(
      "SELECT * FROM faqs ORDER BY created_at DESC"
    );
    return result.rows;
  }

  async createFAQ(question, answer) {
    const result = await db.query(
      "INSERT INTO faqs (question, answer) VALUES ($1, $2) RETURNING *",
      [question, answer]
    );
    return result.rows[0];
  }

  async updateFAQ(id, question, answer) {
    const result = await db.query(
      "UPDATE faqs SET question = $2, answer = $3 WHERE id = $1 RETURNING *",
      [id, question, answer]
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

  async replyToRequest(id, reply) {
    const result = await db.query(
      "UPDATE help_requests SET reply = $2, status = 'replied', updated_at = NOW() WHERE id = $1 RETURNING *",
      [id, reply]
    );
    if (result.rows.length === 0) throw new Error("Request not found");
    return result.rows[0];
  }
}

module.exports = new HelpService();
