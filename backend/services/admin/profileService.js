// services/admin/profileService.js
const db = require("../../db/db");
const { hashPassword, verifyPassword } = require("../../utils/hash");

class ProfileService {
  async getById(userId) {
    const result = await db.query(
      `SELECT id, username, email, role, firstname, lastname, birthday, student_type, created_at
       FROM users WHERE id = $1`,
      [userId]
    );
    if (result.rows.length === 0) throw new Error("User not found");
    return result.rows[0];
  }

  async update(userId, data) {
    const { firstname, lastname, email } = data;
    const updates = [];
    const params = [];
    let i = 1;

    if (firstname !== undefined) { updates.push(`firstname = $${i++}`); params.push(firstname); }
    if (lastname !== undefined) { updates.push(`lastname = $${i++}`); params.push(lastname); }
    if (email !== undefined) { updates.push(`email = $${i++}`); params.push(email); }

    if (updates.length === 0) throw new Error("No fields to update");

    params.push(userId);
    const result = await db.query(
      `UPDATE users SET ${updates.join(", ")} WHERE id = $${i} RETURNING id, username, email, role, firstname, lastname, birthday`,
      params
    );
    if (result.rows.length === 0) throw new Error("User not found");
    return result.rows[0];
  }

  async changePassword(userId, oldPassword, newPassword) {
    const user = await db.query(
      `SELECT password, salt FROM users WHERE id = $1`,
      [userId]
    );
    if (user.rows.length === 0) throw new Error("User not found");

    const isValid = verifyPassword(oldPassword, user.rows[0].password, user.rows[0].salt);
    if (!isValid) throw new Error("Current password is incorrect");

    const { hashed, salt } = hashPassword(newPassword);
    await db.query(
      `UPDATE users SET password = $1, salt = $2 WHERE id = $3`,
      [hashed, salt, userId]
    );
    return { message: "Password changed successfully" };
  }
}

module.exports = new ProfileService();
