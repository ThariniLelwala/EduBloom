const db = require('./backend/db/db');

async function checkTodos() {
  try {
    const todos = await db.query("SELECT id, type, text, expires_at, created_at FROM student_todos ORDER BY id DESC LIMIT 5");
    console.log("Recent Todos:");
    todos.rows.forEach(t => {
      console.log(`- ID: ${t.id}, Text: "${t.text}", Expires: ${t.expires_at}, Created: ${t.created_at}`);
    });
  } catch (err) {
    console.error("Failed:", err);
  } finally {
    process.exit();
  }
}

checkTodos();
