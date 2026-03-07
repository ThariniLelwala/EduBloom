const db = require('./backend/db/db');

async function checkDb() {
  try {
    console.log("Checking DB connection...");
    const time = await db.query('SELECT NOW()');
    console.log("DB Connected:", time.rows[0]);

    console.log("Checking pomodoro_sessions table...");
    const table = await db.query("SELECT * FROM information_schema.tables WHERE table_name = 'pomodoro_sessions'");
    if (table.rows.length > 0) {
      console.log("Table 'pomodoro_sessions' exists.");
      
      const columns = await db.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'pomodoro_sessions'");
      console.log("Columns:", columns.rows.map(c => `${c.column_name} (${c.data_type})`).join(", "));
    } else {
      console.log("Table 'pomodoro_sessions' DOES NOT exist.");
    }
  } catch (err) {
    console.error("DB Check Failed:", err);
  } finally {
    process.exit();
  }
}

checkDb();
