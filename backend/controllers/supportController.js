const db = require("../db/db");

const supportController = {
  createTicket(req, res) {
    // Manually collect request body like other controllers
    let bodyBuffer = Buffer.alloc(0);

    req.on("data", (chunk) => {
      bodyBuffer = Buffer.concat([bodyBuffer, chunk]);
    });

    req.on("end", async () => {
      try {
        const data = JSON.parse(bodyBuffer.toString());
        const { topic, message, role } = data;
        const userId = req.user.id;
        console.log("Creating ticket for user:", userId, { topic, message, role });

        if (!topic || !message) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Topic and message are required" }));
          return;
        }

        const result = await db.query(
          `INSERT INTO support_tickets (user_id, role, topic, message, status, created_at, updated_at)
           VALUES ($1, $2, $3, $4, 'pending', NOW(), NOW())
           RETURNING id, user_id, role, topic, message, status, created_at`,
          [userId, role || "student", topic, message]
        );

        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, ticket: result.rows[0] }));
      } catch (error) {
        console.error("Error creating support ticket:", error);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Failed to create support ticket" }));
      }
    });

    req.on("error", (err) => {
      console.error("Request error:", err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Request error" }));
    });
  },

  getUserTickets(req, res) {
    const userId = req.user.id;

    db.query(
      `SELECT id, role, topic, message, status, created_at, updated_at
       FROM support_tickets
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    ).then((result) => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ tickets: result.rows }));
    }).catch((error) => {
      console.error("Error fetching support tickets:", error);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Failed to fetch support tickets" }));
    });
  },

  getAllTickets(req, res) {
    const limit = parseInt(req.query?.limit) || 50;
    const offset = parseInt(req.query?.offset) || 0;

    db.query(`SELECT COUNT(*) as total FROM support_tickets`)
      .then((countResult) => {
        return db.query(
          `SELECT st.id, st.user_id, u.username, u.email, st.role, st.topic, st.message, st.status, st.created_at, st.updated_at
           FROM support_tickets st
           JOIN users u ON st.user_id = u.id
           ORDER BY st.created_at DESC
           LIMIT $1 OFFSET $2`,
          [limit, offset]
        );
      })
      .then((result) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ tickets: result.rows }));
      })
      .catch((error) => {
        console.error("Error fetching all support tickets:", error);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Failed to fetch support tickets" }));
      });
  },

  updateTicketStatus(req, res) {
    const ticketId = req.params?.ticketId;
    let bodyBuffer = Buffer.alloc(0);

    req.on("data", (chunk) => {
      bodyBuffer = Buffer.concat([bodyBuffer, chunk]);
    });

    req.on("end", async () => {
      try {
        const data = JSON.parse(bodyBuffer.toString());
        const { status } = data;

        if (!status || !["pending", "in_progress", "resolved", "closed"].includes(status)) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Valid status is required" }));
          return;
        }

        const result = await db.query(
          `UPDATE support_tickets
           SET status = $1, updated_at = NOW()
           WHERE id = $2
           RETURNING id, status, updated_at`,
          [status, ticketId]
        );

        if (result.rows.length === 0) {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Ticket not found" }));
          return;
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, ticket: result.rows[0] }));
      } catch (error) {
        console.error("Error updating support ticket:", error);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Failed to update support ticket" }));
      }
    });

    req.on("error", (err) => {
      console.error("Request error:", err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Request error" }));
    });
  }
};

module.exports = supportController;