// controllers/parentController.js
const db = require("../db/db");
const { parseRequestBody } = require("../middleware/authMiddleware");

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

// Request link to a new child
async function requestChildLink(req, res) {
  try {
    const parentId = req.user.id;
    const data = await parseRequestBody(req);
    const { studentIdentifier } = data;

    if (!studentIdentifier) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Student identifier is required" }));
      return;
    }

    // Find student by ID or username
    let studentRow = null;
    if (/^\d+$/.test(String(studentIdentifier))) {
      const result = await db.query(
        "SELECT * FROM users WHERE id = $1 AND role = 'student' AND student_type = 'school'",
        [Number(studentIdentifier)]
      );
      studentRow = result.rows[0];
    } else {
      const result = await db.query(
        "SELECT * FROM users WHERE username = $1 AND role = 'student' AND student_type = 'school'",
        [studentIdentifier]
      );
      studentRow = result.rows[0];
    }

    if (!studentRow) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "School student not found with provided identifier" }));
      return;
    }

    // Check if student already has 2 accepted parents
    const acceptedParentsCount = await db.query(
      `SELECT COUNT(*) as count FROM parent_student_links 
       WHERE student_id = $1 AND status = 'accepted'`,
      [studentRow.id]
    );

    if (parseInt(acceptedParentsCount.rows[0].count) >= 2) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Student already has the maximum of 2 linked parents" }));
      return;
    }

    // Check if link already exists
    const existingLink = await db.query(
      `SELECT * FROM parent_student_links 
       WHERE parent_id = $1 AND student_id = $2`,
      [parentId, studentRow.id]
    );

    if (existingLink.rows.length > 0) {
      const status = existingLink.rows[0].status;
      if (status === 'accepted') {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Already linked to this student" }));
        return;
      } else if (status === 'pending') {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Link request already pending" }));
        return;
      }
    }

    // Create pending link
    await db.query(
      `INSERT INTO parent_student_links (parent_id, student_id, status)
       VALUES ($1, $2, 'pending')`,
      [parentId, studentRow.id]
    );

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Link request sent successfully" }));
  } catch (err) {
    console.error("Error requesting child link:", err);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Failed to send link request" }));
  }
}

// Remove student link
async function removeStudentLink(req, res) {
  try {
    const parentId = req.user.id;
    const data = await parseRequestBody(req);
    const { studentId } = data;

    if (!studentId) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Student ID is required" }));
      return;
    }

    // Verify that the link exists and belongs to this parent
    const linkResult = await db.query(
      `SELECT * FROM parent_student_links 
       WHERE parent_id = $1 AND student_id = $2`,
      [parentId, studentId]
    );

    if (linkResult.rows.length === 0) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Link not found" }));
      return;
    }

    // Delete the link
    await db.query(
      `DELETE FROM parent_student_links WHERE parent_id = $1 AND student_id = $2`,
      [parentId, studentId]
    );

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Student link removed successfully" }));
  } catch (err) {
    console.error("Error removing student link:", err);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Failed to remove student link" }));
  }
}

module.exports = {
  getChildren,
  getChildData,
  getChildSubjects,
  requestChildLink,
  removeStudentLink,
};
