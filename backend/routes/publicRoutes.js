// routes/publicRoutes.js
const db = require("../db/db");

const handlePublicRoutes = (req, res) => {
  const pathname = req.url.split("?")[0];
  const method = req.method;

  // Get all announcements - public endpoint
  if (method === "GET" && pathname === "/api/announcements") {
    return getAnnouncements(req, res);
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

module.exports = handlePublicRoutes;
