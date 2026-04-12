// routes/publicRoutes.js
const db = require("../db/db");

const handlePublicRoutes = (req, res) => {
  const pathname = req.url.split("?")[0];
  const method = req.method;

  // Get all announcements - public endpoint
  if (method === "GET" && pathname === "/api/announcements") {
    return getAnnouncements(req, res);
  }

  // Get FAQs by role - public endpoint
  if (method === "GET" && pathname === "/api/faqs") {
    return getFAQs(req, res);
  }

  return null;
};

async function getAnnouncements(req, res) {
  try {
    const result = await db.query(`
      SELECT a.id, a.title, a.message, a.created_at,
             u.username as author_username, u.firstname as author_firstname, u.lastname as author_lastname
      FROM announcements a
      JOIN users u ON a.author_id = u.id
      ORDER BY a.created_at DESC
    `);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ announcements: result.rows }));
  } catch (err) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Failed to fetch announcements" }));
  }
}

async function getFAQs(req, res) {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const role = url.searchParams.get("role");
    const validRoles = ["admin", "teacher", "student", "parent"];

    let query = "SELECT * FROM faqs WHERE target_role IS NULL";
    let params = [];

    if (role && validRoles.includes(role)) {
      query = "SELECT * FROM faqs WHERE target_role IS NULL OR target_role = $1";
      params = [role];
    }

    query += " ORDER BY created_at DESC";

    const result = await db.query(query, params);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ faqs: result.rows }));
  } catch (err) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Failed to fetch FAQs" }));
  }
}

module.exports = handlePublicRoutes;
