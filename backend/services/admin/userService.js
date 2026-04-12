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
      SELECT u.id, u.username, u.email, u.role, u.firstname, u.lastname, u.student_type, u.created_at, COALESCE(u.status, 'active') as status,
      (SELECT reason FROM user_deletion_logs WHERE deleted_user_id = u.id ORDER BY created_at DESC LIMIT 1) as suspension_reason,
      (SELECT u2.username FROM user_deletion_logs dl JOIN users u2 ON dl.deleted_by = u2.id WHERE dl.deleted_user_id = u.id ORDER BY dl.created_at DESC LIMIT 1) as suspended_by_admin
      FROM users u
    `;
    const params = [];
    let paramIndex = 1;

    // Build WHERE clause for filters
    const conditions = [];

    // Filter by status
    if (filters.status) {
      conditions.push(`COALESCE(u.status, 'active') = $${paramIndex}`);
      params.push(filters.status);
      paramIndex++;
    }

    // Filter by role
    if (filters.role) {
      conditions.push(`u.role = $${paramIndex}`);
      params.push(filters.role);
      paramIndex++;
    }

    // Filter by student type (for students)
    if (filters.student_type) {
      conditions.push(`u.student_type = $${paramIndex}`);
      params.push(filters.student_type);
      paramIndex++;
    }

    // Search by username or email
    if (filters.search) {
      conditions.push(
        `(u.username ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex} OR u.firstname ILIKE $${paramIndex} OR u.lastname ILIKE $${paramIndex})`
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
    query += ` ORDER BY u.created_at DESC`;

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

    // Count suspended users from status column
    const suspendedResult = await db.query(
      "SELECT COUNT(*) as count FROM users WHERE status = 'suspended'"
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
   * Suspend a user with password verification
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

    // Log suspension with reason
    await db.query(
      "INSERT INTO user_deletion_logs (deleted_user_id, deleted_username, deleted_role, reason, deleted_by) VALUES ($1, $2, $3, $4, $5)",
      [user.id, user.username, user.role, reason || "No reason provided", adminUser.id]
    );

    // Suspend user (update status)
    await db.query(
      "UPDATE users SET status = 'suspended' WHERE id = $1",
      [userId]
    );

    return {
      message: `User ${user.username} suspended successfully`,
      suspendedUserId: userId,
    };
  }

  /**
   * Suspend multiple users with password verification
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

    // Get users to be suspended for logging
    const usersToSuspend = await db.query(
      "SELECT id, username, role FROM users WHERE id = ANY($1)",
      [userIds]
    );

    // Log suspensions
    for (const user of usersToSuspend.rows) {
      await db.query(
        "INSERT INTO user_deletion_logs (deleted_user_id, deleted_username, deleted_role, reason, deleted_by) VALUES ($1, $2, $3, $4, $5)",
        [user.id, user.username, user.role, reason || "No reason provided", adminUser.id]
      );
    }

    // Suspend multiple users
    await db.query(
      "UPDATE users SET status = 'suspended' WHERE id = ANY($1)",
      [userIds]
    );

    return {
      message: `${usersToSuspend.rows.length} users suspended successfully`,
      suspendedCount: usersToSuspend.rows.length,
      suspendedUserIds: userIds,
    };
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
   * Suspend a user
   */
  async suspendUser(userId, reason = null) {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const result = await db.query(
      "UPDATE users SET status = 'suspended' WHERE id = $1 RETURNING id, username",
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error("User not found");
    }

    return {
      message: "User suspended successfully",
      userId,
      reason,
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
