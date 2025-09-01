// services/authService.js
const db = require("../db/db");
const { hashPassword, verifyPassword } = require("../utils/hash");
const { generateToken } = require("../utils/token");

class AuthService {
  // Universal registration for all roles
  // services/authService.js
  async register(userData) {
    const {
      username,
      email,
      password,
      role,
      student_type,
      student_identifier,
    } = userData;

    if (!username || !email || !password || !role) {
      throw new Error("Missing required fields");
    }

    // Validate role
    if (!["student", "teacher", "parent", "admin"].includes(role)) {
      throw new Error("Invalid role");
    }

    // Check if email or username already exists
    const existing = await db.query(
      "SELECT * FROM users WHERE email = $1 OR username = $2",
      [email, username]
    );
    if (existing.rows.length > 0) {
      throw new Error("Email or username already registered");
    }

    // Role-specific validations
    if (role === "student" && !student_type) {
      throw new Error("Student type is required for students");
    }

    // 🔑 Validate parent-student link **before creating parent account**
    if (role === "parent" && student_identifier) {
      let studentRow = null;

      if (/^\d+$/.test(String(student_identifier))) {
        const result = await db.query(
          "SELECT * FROM users WHERE id = $1 AND role = 'student' AND student_type = 'school'",
          [Number(student_identifier)]
        );
        studentRow = result.rows[0];
      } else {
        const result = await db.query(
          "SELECT * FROM users WHERE username = $1 AND role = 'student' AND student_type = 'school'",
          [student_identifier]
        );
        studentRow = result.rows[0];
      }

      if (!studentRow) {
        throw new Error("Invalid student identifier: No school student found");
      }
    }

    // Hash password
    const { hashed, salt } = hashPassword(password);

    // ✅ Create user only after validation passes
    const userResult = await db.query(
      `INSERT INTO users (username, email, password, salt, role, student_type)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, username, email, role, student_type`,
      [username, email, hashed, salt, role, student_type || null]
    );

    const user = userResult.rows[0];
    let linkCreated = false;

    // ✅ Now safely create parent-student link
    if (role === "parent" && student_identifier) {
      linkCreated = await this.createParentStudentLink(
        user.id,
        student_identifier
      );
    }

    return { user, linkCreated };
  }

  // Universal login for all roles
  async login(credentials) {
    const { username, email, password } = credentials;

    if ((!username && !email) || !password) {
      throw new Error("Missing login credentials");
    }

    // Find user by username or email
    let query, params;
    if (email) {
      query = "SELECT * FROM users WHERE email = $1";
      params = [email];
    } else {
      query = "SELECT * FROM users WHERE username = $1";
      params = [username];
    }

    const result = await db.query(query, params);
    if (result.rows.length === 0) {
      throw new Error("User not found");
    }

    const user = result.rows[0];

    if (!verifyPassword(password, user.password, user.salt)) {
      throw new Error("Invalid password");
    }

    // Generate and save token
    const token = generateToken();
    await db.query("UPDATE users SET token = $1 WHERE id = $2", [
      token,
      user.id,
    ]);

    // Role-specific data
    let additionalData = {};

    if (user.role === "parent") {
      // Check if parent has accepted links for access control
      const linkResult = await db.query(
        "SELECT * FROM parent_student_links WHERE parent_id = $1 AND status = 'accepted' LIMIT 1",
        [user.id]
      );
      additionalData.hasAccess = linkResult.rows.length > 0;
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      student_type: user.student_type,
      token,
      ...additionalData,
    };
  }

  // Helper method for parent-student linking
  async createParentStudentLink(parentId, studentIdentifier) {
    let studentRow = null;

    // Find student by ID or username
    if (/^\d+$/.test(String(studentIdentifier))) {
      const result = await db.query(
        "SELECT * FROM users WHERE id = $1 AND role = 'student' AND student_type = 'school'",
        [Number(studentIdentifier)]
      );
      studentRow = result.rows[0];
    } else {
      const result = await db.query(
        "SELECT * FROM users WHERE username = $1 AND role = 'student' AND student_type = 'school'",
        [studentIdentifier]
      );
      studentRow = result.rows[0];
    }

    if (!studentRow) {
      throw new Error("School student not found with provided identifier");
    }

    // Create pending link
    try {
      await db.query(
        `INSERT INTO parent_student_links (parent_id, student_id, status)
         VALUES ($1, $2, 'pending')`,
        [parentId, studentRow.id]
      );
      return true;
    } catch (err) {
      // Link might already exist
      console.log("Link might already exist:", err.message);
      return false;
    }
  }

  // Verify token and get user data
  async verifyToken(token) {
    const result = await db.query(
      "SELECT id, username, email, role, student_type FROM users WHERE token = $1",
      [token]
    );

    if (result.rows.length === 0) {
      throw new Error("Invalid token");
    }

    return result.rows[0];
  }

  // Parent-student link management
  async listPendingParentRequests(studentId) {
    const result = await db.query(
      `SELECT pl.id, pl.parent_id, pl.created_at, u.username as parent_username, u.email as parent_email
       FROM parent_student_links pl
       JOIN users u ON pl.parent_id = u.id
       WHERE pl.student_id = $1 AND pl.status = 'pending'`,
      [studentId]
    );
    return result.rows;
  }

  async respondToParentRequest(linkId, action, studentId) {
    if (!["accept", "reject"].includes(action)) {
      throw new Error("Invalid action");
    }

    // Verify the link belongs to the student
    const linkCheck = await db.query(
      "SELECT * FROM parent_student_links WHERE id = $1 AND student_id = $2",
      [linkId, studentId]
    );

    if (linkCheck.rows.length === 0) {
      throw new Error("Link request not found");
    }

    const status = action === "accept" ? "accepted" : "rejected";
    await db.query(
      "UPDATE parent_student_links SET status = $1 WHERE id = $2",
      [status, linkId]
    );

    return { message: `Parent request ${action}ed successfully` };
  }
}

module.exports = new AuthService();
