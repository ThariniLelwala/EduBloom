// services/admin/userService.js
const db = require("../../db/db");
const { hashPassword, verifyPassword } = require("../../utils/hash");
const { generateToken } = require("../../utils/token");

class UserService {
  /**
   * Get all users with optional filtering and searching (includes admins)
   */
  async getAllUsers(filters = {}) {
    let query = `
      SELECT id, username, email, role, firstname, lastname, student_type, created_at
      FROM users
    `;
    const params = [];
    let paramIndex = 1;

    // Build WHERE clause for filters
    const conditions = [];

    // Filter by role
    if (filters.role) {
      conditions.push(`role = $${paramIndex}`);
      params.push(filters.role);
      paramIndex++;
    }

    // Filter by student type (for students)
    if (filters.student_type) {
      conditions.push(`student_type = $${paramIndex}`);
      params.push(filters.student_type);
      paramIndex++;
    }

    // Search by username or email
    if (filters.search) {
      conditions.push(
        `(username ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR firstname ILIKE $${paramIndex} OR lastname ILIKE $${paramIndex})`
      );
      params.push(`%${filters.search}%`);
      params.push(`%${filters.search}%`);
      params.push(`%${filters.search}%`);
      params.push(`%${filters.search}%`);
      paramIndex += 4;
    }

    // Add WHERE clause if there are conditions
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    // Sort by created_at descending (newest first)
    query += ` ORDER BY created_at DESC`;

    const result = await db.query(query, params);
    return result.rows;
  }

  /**
   * Get user count statistics (includes admins)
   */
  async getUserStatistics() {
    const totalResult = await db.query("SELECT COUNT(*) as count FROM users");

    const studentResult = await db.query(
      "SELECT COUNT(*) as count FROM users WHERE role = 'student'"
    );

    const teacherResult = await db.query(
      "SELECT COUNT(*) as count FROM users WHERE role = 'teacher'"
    );

    const parentResult = await db.query(
      "SELECT COUNT(*) as count FROM users WHERE role = 'parent'"
    );

    const adminResult = await db.query(
      "SELECT COUNT(*) as count FROM users WHERE role = 'admin'"
    );

    // Count registrations from today (all roles)
    const todayResult = await db.query(
      "SELECT COUNT(*) as count FROM users WHERE DATE(created_at) = CURRENT_DATE"
    );

    // Count suspended users from suspended_users table
    const suspendedResult = await db.query(
      "SELECT COUNT(*) as count FROM suspended_users"
    );

    return {
      total: parseInt(totalResult.rows[0].count),
      students: parseInt(studentResult.rows[0].count),
      teachers: parseInt(teacherResult.rows[0].count),
      parents: parseInt(parentResult.rows[0].count),
      admins: parseInt(adminResult.rows[0].count),
      todayRegistrations: parseInt(todayResult.rows[0].count),
      suspended: parseInt(suspendedResult.rows[0].count),
    };
  }

  /**
   * Get user by ID with complete information (including password and salt for auth verification)
   */
  async getUserById(userId) {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const result = await db.query(
      `SELECT id, username, email, role, firstname, lastname, birthday, student_type, password, salt, created_at
       FROM users
       WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error("User not found");
    }

    return result.rows[0];
  }

  /**
   * Suspend a user - move to suspended_users table
   */
  async deleteUser(userId, adminUser, password, reason = null) {
    if (!userId) {
      throw new Error("User ID is required");
    }

    if (!password) {
      throw new Error("Password is required for suspension");
    }

    // Verify admin password
    if (!adminUser.password || !adminUser.salt) {
      throw new Error("Admin credentials invalid");
    }

    const isPasswordValid = verifyPassword(
      password,
      adminUser.password,
      adminUser.salt
    );
    if (!isPasswordValid) {
      throw new Error("Invalid password");
    }

    // Prevent admin from suspending their own account
    if (userId === adminUser.id) {
      throw new Error("You cannot suspend your own admin account");
    }

    // Check if user exists
    const userCheck = await db.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);

    if (userCheck.rows.length === 0) {
      throw new Error("User not found");
    }

    const user = userCheck.rows[0];

    // Move user to suspended_users table
    await db.query(
      `INSERT INTO suspended_users (original_user_id, username, email, password, salt, role, student_type, firstname, lastname, birthday, created_at, suspended_by, reason)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [user.id, user.username, user.email, user.password, user.salt, user.role, user.student_type, user.firstname, user.lastname, user.birthday, user.created_at, adminUser.id, reason || "No reason provided"]
    );

    // Delete user from users table
    await db.query("DELETE FROM users WHERE id = $1", [userId]);

    return {
      message: `User ${user.username} suspended and removed from system`,
      suspendedUserId: userId,
    };
  }

  /**
   * Suspend multiple users
   */
  async deleteMultipleUsers(userIds, adminUser, password, reason = null) {
    if (!Array.isArray(userIds) || userIds.length === 0) {
      throw new Error("User IDs array is required");
    }

    if (!password) {
      throw new Error("Password is required for suspension");
    }

    // Verify admin password
    if (!adminUser.password || !adminUser.salt) {
      throw new Error("Admin credentials invalid");
    }

    const isPasswordValid = verifyPassword(
      password,
      adminUser.password,
      adminUser.salt
    );
    if (!isPasswordValid) {
      throw new Error("Invalid password");
    }

    // Prevent admin from suspending their own account
    if (userIds.includes(adminUser.id)) {
      throw new Error("You cannot suspend your own admin account");
    }

    // Get users to be suspended
    const usersToSuspend = await db.query(
      "SELECT * FROM users WHERE id = ANY($1)",
      [userIds]
    );

    // Move each user to suspended_users table
    for (const user of usersToSuspend.rows) {
      await db.query(
        `INSERT INTO suspended_users (original_user_id, username, email, password, salt, role, student_type, firstname, lastname, birthday, created_at, suspended_by, reason)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [user.id, user.username, user.email, user.password, user.salt, user.role, user.student_type, user.firstname, user.lastname, user.birthday, user.created_at, adminUser.id, reason || "No reason provided"]
      );
    }

    // Delete users from users table
    await db.query("DELETE FROM users WHERE id = ANY($1)", [userIds]);

    return {
      message: `${usersToSuspend.rows.length} users suspended and removed from system`,
      suspendedCount: usersToSuspend.rows.length,
      suspendedUserIds: userIds,
    };
  }

  /**
   * Get all suspended users
   */
  async getSuspendedUsers() {
    const result = await db.query(`
      SELECT su.*, u.username as suspended_by_admin
      FROM suspended_users su
      LEFT JOIN users u ON su.suspended_by = u.id
      ORDER BY su.suspended_at DESC
    `);
    return result.rows;
  }

  /**
   * Update user information
   */
  async updateUser(userId, updateData) {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const allowedFields = ["firstname", "lastname", "email", "username", "role", "student_type"];
    const updates = [];
    const params = [];
    let paramIndex = 1;

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        updates.push(`${field} = $${paramIndex}`);
        params.push(updateData[field]);
        paramIndex++;
      }
    }

    if (updates.length === 0) {
      throw new Error("No valid fields to update");
    }

    params.push(userId);
    const result = await db.query(
      `UPDATE users SET ${updates.join(", ")} WHERE id = $${paramIndex}
       RETURNING id, username, email, role, firstname, lastname, student_type, created_at`,
      params
    );

    if (result.rows.length === 0) {
      throw new Error("User not found");
    }

    return result.rows[0];
  }

  /**
   * Create a new admin user
   */
  async createAdmin(adminData) {
    const { firstname, lastname, birthday, username, email, password } = adminData;

    if (!firstname || !lastname || !birthday || !username || !email || !password) {
      throw new Error("All fields are required");
    }

    // Check if username already exists
    const usernameCheck = await db.query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );
    if (usernameCheck.rows.length > 0) {
      throw new Error("Username already exists");
    }

    // Check if email already exists
    const emailCheck = await db.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );
    if (emailCheck.rows.length > 0) {
      throw new Error("Email already exists");
    }

    // Hash password
    const { hashPassword } = require("../../utils/hash");
    const { hashed, salt } = hashPassword(password);

    const result = await db.query(
      `INSERT INTO users (username, email, password, salt, role, firstname, lastname, birthday)
       VALUES ($1, $2, $3, $4, 'admin', $5, $6, $7)
       RETURNING id, username, email, role, firstname, lastname, created_at`,
      [username, email, hashed, salt, firstname, lastname, birthday]
    );

    return result.rows[0];
  }

  /**
   * Get role distribution
   */
  async getRoleDistribution() {
    const result = await db.query(`
      SELECT role, COUNT(*) as count
      FROM users
      GROUP BY role
      ORDER BY count DESC
    `);
    return result.rows;
  }

  /**
   * Get recent registrations
   */
  async getRecentRegistrations(limit = 10) {
    const result = await db.query(
      `SELECT id, username, email, role, firstname, lastname, created_at
       FROM users
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  }

  /**
   * Get user login information by username
   */
  async getUserLoginInfo(username) {
    const result = await db.query(
      `SELECT id, username, email, password, salt, role, firstname, lastname, status
       FROM users
       WHERE username = $1`,
      [username]
    );
    return result.rows[0];
  }

  /**
   * Update user token
   */
  async updateUserToken(userId, token) {
    await db.query(
      "UPDATE users SET token = $2 WHERE id = $1",
      [userId, token]
    );
  }

  /**
   * Get user by token
   */
  async getUserByToken(token) {
    const result = await db.query(
      `SELECT id, username, email, role, firstname, lastname, student_type
       FROM users
       WHERE token = $1`,
      [token]
    );
    return result.rows[0];
  }

  /**
   * Clear user token (logout)
   */
  async clearUserToken(userId) {
    await db.query(
      "UPDATE users SET token = NULL WHERE id = $1",
      [userId]
    );
  }
}

module.exports = new UserService();
