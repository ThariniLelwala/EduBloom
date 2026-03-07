const todoController = require('./backend/controllers/student/todoController');

// Mock req and res
const req = {
  user: { id: 1 }, // Assuming user 1 exists, otherwise we change this to a valid one
  headers: { 'content-type': 'application/json' },
  bodyData: '{"type":"todo","text":"Mock Test","expiresAt":"2026-02-23"}',
  on: function(event, callback) {
    if (event === 'data') callback(Buffer.from(this.bodyData));
    if (event === 'end') callback();
  }
};

const res = {
  writeHead: (code, headers) => console.log('Status:', code),
  end: (data) => console.log('Response:', data)
};

async function runTest() {
  console.log("Running controller test...");
  await todoController.createTodo(req, res);
  
  // Wait a sec for DB, then query
  setTimeout(async () => {
     const db = require('./backend/db/db');
     const todos = await db.query("SELECT * FROM student_todos ORDER BY id DESC LIMIT 1");
     console.log("DB Latest Row:", todos.rows[0]);
     process.exit(0);
  }, 1000);
}

runTest();
