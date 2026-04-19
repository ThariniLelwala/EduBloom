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
        console.log("Creating help request for user:", userId, { topic, message, role });

        if (!topic || !message) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Topic and message are required" }));
          return;
        }

        const result = await db.query(
          `INSERT INTO help_requests (user_id, topic, message, status, created_at)
           VALUES ($1, $2, $3, 'pending', NOW())
           RETURNING id, user_id, topic, message, status, created_at`,
          [userId, topic, message]
        );

        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, ticket: result.rows[0] }));
      } catch (error) {
        console.error("Error creating help request:", error);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Failed to create help request" }));
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
      `SELECT id, topic, message, status, reply, created_at
       FROM help_requests
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    ).then((result) => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ tickets: result.rows }));
    }).catch((error) => {
      console.error("Error fetching help requests:", error);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Failed to fetch help requests" }));
    });
  },

  getAllTickets(req, res) {
    const limit = parseInt(req.query?.limit) || 50;
    const offset = parseInt(req.query?.offset) || 0;

    db.query(`SELECT COUNT(*) as total FROM help_requests`)
      .then((countResult) => {
        return db.query(
          `SELECT hr.id, hr.user_id, u.username, u.email, hr.topic, hr.message, hr.status, hr.reply, hr.replied_by, hr.created_at
           FROM help_requests hr
           LEFT JOIN users u ON hr.user_id = u.id
           ORDER BY hr.created_at DESC
           LIMIT $1 OFFSET $2`,
          [limit, offset]
        );
      })
      .then((result) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ tickets: result.rows }));
      })
      .catch((error) => {
        console.error("Error fetching all help requests:", error);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Failed to fetch help requests" }));
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

        if (!status || !["pending", "replied", "resolved"].includes(status)) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Valid status is required" }));
          return;
        }

        const result = await db.query(
          `UPDATE help_requests
           SET status = $1
           WHERE id = $2
           RETURNING id, status`,
          [status, ticketId]
        );

        if (result.rows.length === 0) {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Help request not found" }));
          return;
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, ticket: result.rows[0] }));
      } catch (error) {
        console.error("Error updating help request:", error);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Failed to update help request" }));
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