const http = require('http');

// Get a real token by querying the DB
const db = require('./backend/db/db');

async function testHttp() {
  try {
    const userResult = await db.query("SELECT email FROM users WHERE role = 'student' LIMIT 1");
    if (userResult.rows.length === 0) {
      console.log("No student found");
      process.exit(1);
    }
    const email = userResult.rows[0].email;
    
    // Generate a valid token using the backend's token util
    const { generateToken } = require('./backend/utils/token');
    const token = generateToken({ id: 1, email: email, role: 'student' });
    
    console.log("Generated token:", token);

    const data = JSON.stringify({
      type: 'todo',
      text: 'HTTP Test Event',
      expiresAt: '2026-02-28'
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/student/todos/create',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': data.length
      }
    };

    const req = http.request(options, res => {
      console.log(`statusCode: ${res.statusCode}`);
      res.on('data', d => {
        process.stdout.write(d);
      });
      res.on('end', () => {
        console.log('\nRequest finished.');
        
        // Wait then check DB
        setTimeout(async () => {
           const db = require('./backend/db/db');
           const todos = await db.query("SELECT * FROM student_todos ORDER BY id DESC LIMIT 1");
           console.log("DB Latest Row:", todos.rows[0]);
           process.exit(0);
        }, 1000);
      });
    });

    req.on('error', error => {
      console.error(error);
      process.exit(1);
    });

    req.write(data);
    req.end();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

testHttp();
