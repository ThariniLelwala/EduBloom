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

    return {
      total: parseInt(totalResult.rows[0].count),
      students: parseInt(studentResult.rows[0].count),
      teachers: parseInt(teacherResult.rows[0].count),
      parents: parseInt(parentResult.rows[0].count),
      admins: parseInt(adminResult.rows[0].count),
      todayRegistrations: parseInt(todayResult.rows[0].count),
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
   * Delete a user and all related data with password verification
   */
  async deleteUser(userId, adminUser, password) {
    if (!userId) {
      throw new Error("User ID is required");
    }

    if (!password) {
      throw new Error("Password is required for deletion");
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

    // Prevent admin from deleting their own account
    if (userId === adminUser.id) {
      throw new Error("You cannot delete your own admin account");
    }

    // Check if user exists
    const userCheck = await db.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);

    if (userCheck.rows.length === 0) {
      throw new Error("User not found");
    }

    const user = userCheck.rows[0];

    // Delete user (cascades delete related data due to ON DELETE CASCADE)
    // This now allows deleting admins, just not the current admin
    const result = await db.query(
      "DELETE FROM users WHERE id = $1 RETURNING id",
      [userId]
    );

    return {
      message: `User ${user.username} deleted successfully`,
      deletedUserId: result.rows[0].id,
    };
  }

  /**
   * Delete multiple users with password verification
   */
  async deleteMultipleUsers(userIds, adminUser, password) {
    if (!Array.isArray(userIds) || userIds.length === 0) {
      throw new Error("User IDs array is required");
    }

    if (!password) {
      throw new Error("Password is required for deletion");
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

    // Prevent admin from deleting their own account
    if (userIds.includes(adminUser.id)) {
      throw new Error("You cannot delete your own admin account");
    }

    // Delete multiple users (now allows deleting admins, just not the current admin)
    const result = await db.query(
      "DELETE FROM users WHERE id = ANY($1) RETURNING id",
      [userIds]
    );

    return {
      message: `${result.rows.length} users deleted successfully`,
      deletedCount: result.rows.length,
      deletedUserIds: result.rows.map((r) => r.id),
    };
  }

  /**
   * Suspend a user (for future feature - sets status)
   */
  async suspendUser(userId, reason = null) {
    if (!userId) {
      throw new Error("User ID is required");
    }

    // This could be implemented with a status column in the future
    // For now, we'll just mark as a note
    return {
      message: "User suspension feature to be implemented",
      userId,
    };
  }

  /**
   * Get user role distribution (includes admins)
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
   * Get recent registrations (includes admins)
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
   * Create a new admin user
   */
  async createAdmin(adminData) {
    const { firstname, lastname, birthday, username, email, password } =
      adminData;

    // Validate required fields
    if (
      !firstname ||
      !lastname ||
      !birthday ||
      !username ||
      !email ||
      !password
    ) {
      throw new Error("All fields are required");
    }

    // Check if email or username already exists
    const existing = await db.query(
      "SELECT * FROM users WHERE email = $1 OR username = $2",
      [email, username]
    );
    if (existing.rows.length > 0) {
      throw new Error("Email or username already registered");
    }

    // Validate password format (8+ chars, uppercase, number, special char)
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      throw new Error(
        "Password must be at least 8 chars with uppercase, number, and special character"
      );
    }

    // Validate age (18+)
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    if (age < 18) {
      throw new Error("Admin must be at least 18 years old");
    }

    // Hash password
    const { hashed, salt } = hashPassword(password);

    // Generate token for the new admin
    const token = generateToken({ username, email, role: "admin" });

    // Create admin user
    const result = await db.query(
      `INSERT INTO users (username, email, password, salt, token, role, firstname, lastname, birthday, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
       RETURNING id, username, email, role, firstname, lastname, birthday, created_at`,
      [
        username,
        email,
        hashed,
        salt,
        token,
        "admin",
        firstname,
        lastname,
        birthday,
      ]
    );

    return result.rows[0];
  }
}

module.exports = new UserService();
