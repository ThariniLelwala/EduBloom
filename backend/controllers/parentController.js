// controllers/parentController.js
const db = require("../db/db");

// Get all children linked to a parent
async function getChildren(req, res) {
  try {
    const parentId = req.user.id; // From auth middleware

    const result = await db.query(
      `SELECT u.id, u.username, u.email, u.student_type
       FROM users u
       INNER JOIN parent_student_links psl ON u.id = psl.student_id
       WHERE psl.parent_id = $1 AND psl.status = 'accepted'`,
      [parentId]
    );

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ children: result.rows }));
  } catch (err) {
    console.error("Error fetching children:", err);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Failed to fetch children" }));
  }
}

// Get a specific child's data
async function getChildData(req, res) {
  try {
    const parentId = req.user.id;
    const childId = req.url.split("/").pop(); // Extract child ID from URL

    // Verify parent-child relationship
    const linkResult = await db.query(
      `SELECT * FROM parent_student_links 
       WHERE parent_id = $1 AND student_id = $2 AND status = 'accepted'`,
      [parentId, childId]
    );

    if (linkResult.rows.length === 0) {
      res.writeHead(403, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Unauthorized access to child data" }));
      return;
    }

    // Fetch child's information
    const childResult = await db.query(
      `SELECT id, username, email, student_type FROM users WHERE id = $1`,
      [childId]
    );

    if (childResult.rows.length === 0) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Child not found" }));
      return;
    }

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ child: childResult.rows[0] }));
  } catch (err) {
    console.error("Error fetching child data:", err);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Failed to fetch child data" }));
  }
}

// Get child's subjects
async function getChildSubjects(req, res) {
  try {
    const parentId = req.user.id;
    const childId = req.url.split("/")[3]; // /api/parent/children/:childId/subjects

    // Verify parent-child relationship
    const linkResult = await db.query(
      `SELECT * FROM parent_student_links 
       WHERE parent_id = $1 AND student_id = $2 AND status = 'accepted'`,
      [parentId, childId]
    );

    if (linkResult.rows.length === 0) {
      res.writeHead(403, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Unauthorized access" }));
      return;
    }

    // Fetch child's subjects
    const result = await db.query(
      `SELECT * FROM module_subjects WHERE student_id = $1`,
      [childId]
    );

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ subjects: result.rows }));
  } catch (err) {
    console.error("Error fetching child subjects:", err);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Failed to fetch subjects" }));
  }
}

module.exports = {
  getChildren,
  getChildData,
  getChildSubjects,
};
