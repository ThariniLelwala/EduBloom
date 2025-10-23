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

    // Subjects table
    await db.query(`
      CREATE TABLE IF NOT EXISTS module_subjects (
        id SERIAL PRIMARY KEY,
        student_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Topics table (sub-categories within subjects)
    await db.query(`
      CREATE TABLE IF NOT EXISTS module_topics (
        id SERIAL PRIMARY KEY,
        subject_id INT NOT NULL REFERENCES module_subjects(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Module Notes table (PDF files from Google Drive)
    await db.query(`
      CREATE TABLE IF NOT EXISTS module_notes (
        id SERIAL PRIMARY KEY,
        topic_id INT NOT NULL REFERENCES module_topics(id) ON DELETE CASCADE,
        title VARCHAR(150) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_url VARCHAR(500),
        google_drive_file_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create indexes for better performance
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_module_subjects_student_id ON module_subjects(student_id);
    `);

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_module_topics_subject_id ON module_topics(subject_id);
    `);

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_module_notes_topic_id ON module_notes(topic_id);
    `);

    // Teacher Module Subjects table
    await db.query(`
      CREATE TABLE IF NOT EXISTS teacher_module_subjects (
        id SERIAL PRIMARY KEY,
        teacher_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Teacher Module Topics table
    await db.query(`
      CREATE TABLE IF NOT EXISTS teacher_module_topics (
        id SERIAL PRIMARY KEY,
        subject_id INT NOT NULL REFERENCES teacher_module_subjects(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Teacher Module Notes table (with public visibility)
    await db.query(`
      CREATE TABLE IF NOT EXISTS teacher_module_notes (
        id SERIAL PRIMARY KEY,
        topic_id INT NOT NULL REFERENCES teacher_module_topics(id) ON DELETE CASCADE,
        title VARCHAR(150) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_url VARCHAR(500),
        google_drive_file_id VARCHAR(255),
        is_public BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create indexes for better performance
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_teacher_module_subjects_teacher_id ON teacher_module_subjects(teacher_id);
    `);

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_teacher_module_topics_subject_id ON teacher_module_topics(subject_id);
    `);

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_teacher_module_notes_topic_id ON teacher_module_notes(topic_id);
    `);

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_teacher_module_notes_is_public ON teacher_module_notes(is_public);
    `);

    // Teacher Verifications table
    await db.query(`
      CREATE TABLE IF NOT EXISTS teacher_verifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
        appointment_letter BYTEA,
        file_name VARCHAR(255),
        message TEXT,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        verified_at TIMESTAMP,
        reviewed_at TIMESTAMP,
        rejection_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_teacher_verifications_user_id ON teacher_verifications(user_id);
    `);

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_teacher_verifications_status ON teacher_verifications(status);
    `);

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_teacher_verifications_submitted_at ON teacher_verifications(submitted_at DESC);
    `);

    // Quiz Subjects table (created by teachers)
    await db.query(`
      CREATE TABLE IF NOT EXISTS quiz_subjects (
        id SERIAL PRIMARY KEY,
        teacher_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(150) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Quiz Sets table (quizzes/tests within a subject)
    await db.query(`
      CREATE TABLE IF NOT EXISTS quiz_sets (
        id SERIAL PRIMARY KEY,
        subject_id INT NOT NULL REFERENCES quiz_subjects(id) ON DELETE CASCADE,
        name VARCHAR(150) NOT NULL,
        description TEXT,
        is_published BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Quiz Questions table
    await db.query(`
      CREATE TABLE IF NOT EXISTS quiz_questions (
        id SERIAL PRIMARY KEY,
        quiz_set_id INT NOT NULL REFERENCES quiz_sets(id) ON DELETE CASCADE,
        question_text VARCHAR(1000) NOT NULL,
        question_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Quiz Answers table (options for each question)
    await db.query(`
      CREATE TABLE IF NOT EXISTS quiz_answers (
        id SERIAL PRIMARY KEY,
        question_id INT NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
        answer_text VARCHAR(500) NOT NULL,
        is_correct BOOLEAN DEFAULT FALSE,
        answer_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create indexes for better performance
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_quiz_subjects_teacher_id ON quiz_subjects(teacher_id);
    `);

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_quiz_sets_subject_id ON quiz_sets(subject_id);
    `);

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_quiz_sets_is_published ON quiz_sets(is_published);
    `);

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_set_id ON quiz_questions(quiz_set_id);
    `);

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_quiz_answers_question_id ON quiz_answers(question_id);
    `);

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_quiz_answers_is_correct ON quiz_answers(is_correct);
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
