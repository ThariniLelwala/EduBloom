const db = require("./db/db");

(async () => {
  try {
    console.log("Checking if teacher_verifications table exists...");
    const result = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'teacher_verifications'
      );
    `);

    if (result.rows[0].exists) {
      console.log("✅ Table EXISTS in the database!");
    } else {
      console.log("❌ Table DOES NOT exist. Creating table now...");

      await db.query(`
        CREATE TABLE IF NOT EXISTS teacher_verifications (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
          appointment_letter BYTEA,
          message TEXT,
          submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          verified_at TIMESTAMP,
          reviewed_at TIMESTAMP,
          rejection_reason TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      console.log("✅ Table created successfully!");

      // Create indexes
      await db.query(
        `CREATE INDEX IF NOT EXISTS idx_teacher_verifications_user_id ON teacher_verifications(user_id);`
      );
      await db.query(
        `CREATE INDEX IF NOT EXISTS idx_teacher_verifications_status ON teacher_verifications(status);`
      );
      await db.query(
        `CREATE INDEX IF NOT EXISTS idx_teacher_verifications_submitted_at ON teacher_verifications(submitted_at DESC);`
      );

      console.log("✅ Indexes created successfully!");
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
  process.exit(0);
})();
