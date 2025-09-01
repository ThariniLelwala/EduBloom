// db/db-init.js
const db = require("./db");

async function initializeDatabase() {
  try {
    console.log("Initializing database...");

    // Users table (with salt and token fields)
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        salt VARCHAR(255) NOT NULL,
        token VARCHAR(255),
        role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'teacher', 'student', 'parent')),
        student_type VARCHAR(20) CHECK (student_type IN ('university', 'school') OR student_type IS NULL),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Parent-Student Links table
    await db.query(`
      CREATE TABLE IF NOT EXISTS parent_student_links (
        id SERIAL PRIMARY KEY,
        parent_id INT REFERENCES users(id) ON DELETE CASCADE,
        student_id INT REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(parent_id, student_id)
      );
    `);

    // Create indexes for better performance
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    `);

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    `);

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_parent_student_links_status ON parent_student_links(status);
    `);

    console.log("✅ Database tables and indexes created successfully");

    // Check if admin user exists, if not create one
    const adminCheck = await db.query(
      "SELECT * FROM users WHERE role = 'admin' LIMIT 1"
    );
    if (adminCheck.rows.length === 0) {
      const { hashPassword } = require("../utils/hash");
      const { hashed, salt } = hashPassword("admin123"); // Change this password!

      await db.query(
        `INSERT INTO users (username, email, password, salt, role)
         VALUES ($1, $2, $3, $4, $5)`,
        ["admin", "admin@edubloom.com", hashed, salt, "admin"]
      );
      console.log(
        "✅ Default admin user created (username: admin, password: admin123)"
      );
      console.log("⚠️  Please change the admin password after first login!");
    }
  } catch (err) {
    console.error("❌ Error initializing database:", err);
  }
}

// Run initialization
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log("Database initialization completed");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Database initialization failed:", err);
      process.exit(1);
    });
}

module.exports = { initializeDatabase };
