// services/admin/helpService.js
const db = require("../../db/db");

class HelpService {
  // ========== FAQs ==========

  /**
   * Get all FAQs
   */
  async getAllFAQs() {
    const result = await db.query(`
      SELECT * FROM faqs ORDER BY created_at DESC
    `);
    return result.rows.map(row => ({
      id: row.id,
      question: row.question,
      answer: row.answer,
      createdAt: row.created_at
    }));
  }

  /**
   * Create FAQ
   */
  async createFAQ(question, answer) {
    const result = await db.query(
      `INSERT INTO faqs (question, answer) VALUES ($1, $2) RETURNING *`,
      [question, answer]
    );
    return result.rows[0];
  }

  /**
   * Delete FAQ
   */
  async deleteFAQ(id) {
    const result = await db.query(
      "DELETE FROM faqs WHERE id = $1 RETURNING id",
      [id]
    );
    if (result.rows.length === 0) {
      throw new Error("FAQ not found");
    }
    return { message: "FAQ deleted", id };
  }

  // ========== Help Requests ==========

  /**
   * Get all help requests
   */
  async getAllHelpRequests() {
    const result = await db.query(`
      SELECT hr.*, 
             u.username as user_name,
             ru.username as replied_by_name
      FROM help_requests hr
      LEFT JOIN users u ON hr.user_id = u.id
      LEFT JOIN users ru ON hr.replied_by = ru.id
      ORDER BY hr.created_at DESC
    `);
    return result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      user: row.user_name || 'Unknown',
      topic: row.topic,
      message: row.message,
      status: row.status,
      reply: row.reply,
      repliedBy: row.replied_by_name,
      repliedAt: row.replied_at,
      createdAt: row.created_at,
      date: row.created_at ? row.created_at.toISOString().split('T')[0] : ''
    }));
  }

  /**
   * Get help request by ID
   */
  async getHelpRequestById(id) {
    const result = await db.query(`
      SELECT hr.*, 
             u.username as user_name,
             ru.username as replied_by_name
      FROM help_requests hr
      LEFT JOIN users u ON hr.user_id = u.id
      LEFT JOIN users ru ON hr.replied_by = ru.id
      WHERE hr.id = $1
    `, [id]);
    if (result.rows.length === 0) {
      throw new Error("Help request not found");
    }
    const row = result.rows[0];
    return {
      id: row.id,
      userId: row.user_id,
      user: row.user_name || 'Unknown',
      topic: row.topic,
      message: row.message,
      status: row.status,
      reply: row.reply,
      repliedBy: row.replied_by_name,
      repliedAt: row.replied_at,
      createdAt: row.created_at,
      date: row.created_at ? row.created_at.toISOString().split('T')[0] : ''
    };
  }

  /**
   * Reply to help request
   */
  async replyToHelpRequest(id, reply, repliedBy) {
    const result = await db.query(
      `UPDATE help_requests 
       SET reply = $1, status = 'replied', replied_by = $2, replied_at = NOW()
       WHERE id = $3 RETURNING *`,
      [reply, repliedBy, id]
    );
    if (result.rows.length === 0) {
      throw new Error("Help request not found");
    }
    return result.rows[0];
  }

  /**
   * Update help request status
   */
  async updateHelpRequestStatus(id, status) {
    const result = await db.query(
      `UPDATE help_requests SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );
    if (result.rows.length === 0) {
      throw new Error("Help request not found");
    }
    return result.rows[0];
  }
}

module.exports = new HelpService();