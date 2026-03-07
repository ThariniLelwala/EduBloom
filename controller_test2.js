const db = require('./backend/db/db');
const todoController = require('./backend/controllers/student/todoController');

// Mock req and res for getTodos
const req = {
  user: { id: 1 }
};

const res = {
  writeHead: (code, headers) => console.log('Status:', code),
  end: (data) => console.log('Response:', data)
};

async function runTest() {
  console.log("Testing getTodos...");
  await todoController.getTodos(req, res);
  process.exit();
}

runTest();
