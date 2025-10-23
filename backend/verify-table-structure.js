const db = require("./db/db");

(async () => {
  try {
    console.log("Fetching table structure for teacher_verifications...\n");
    const result = await db.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'teacher_verifications'
      ORDER BY ordinal_position;
    `);

    if (result.rows.length > 0) {
      console.log("✅ Table structure:");
      console.table(result.rows);

      // Check indexes
      console.log("\n📊 Checking indexes...\n");
      const indexResult = await db.query(`
        SELECT indexname FROM pg_indexes 
        WHERE tablename = 'teacher_verifications';
      `);

      console.log("Indexes:");
      console.table(indexResult.rows);
    } else {
      console.log("❌ Table not found");
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
  process.exit(0);
})();
