// Run migrations
const fs = require("fs");
const path = require("path");
const db = require("./db/db");

async function runMigrations() {
  try {
    console.log("Starting migrations...");

    const migrationsDir = path.join(__dirname, "db", "migrations");
    const migrationFiles = fs.readdirSync(migrationsDir).sort();

    for (const file of migrationFiles) {
      if (file.endsWith(".sql")) {
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, "utf-8");

        console.log(`Running migration: ${file}`);

        // Split by semicolon and execute each statement
        const statements = sql.split(";").filter((stmt) => stmt.trim());
        for (const statement of statements) {
          if (statement.trim()) {
            await db.query(statement);
          }
        }

        console.log(`✅ Migration completed: ${file}`);
      }
    }

    console.log("✅ All migrations completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration error:", err);
    process.exit(1);
  }
}

runMigrations();
