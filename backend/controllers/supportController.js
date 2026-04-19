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

        // Also insert the initial message into the messages table for the conversation thread
        const ticketId = result.rows[0].id;
        await db.query(
          `INSERT INTO help_request_messages (help_request_id, user_id, message, is_admin, created_at)
           VALUES ($1, $2, $3, FALSE, NOW())`,
          [ticketId, userId, message]
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

    console.log("Fetching tickets for user:", userId);

    db.query(
      `SELECT id, topic, message, status, reply, created_at
       FROM help_requests
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    ).then(async (result) => {
      console.log("Tickets fetched successfully:", result.rows.length, "tickets");
      
      const tickets = await Promise.all(result.rows.map(async (ticket) => {
        try {
          const messagesResult = await db.query(
            `SELECT id, message, is_admin, created_at, user_id
             FROM help_request_messages
             WHERE help_request_id = $1
             ORDER BY created_at ASC`,
            [ticket.id]
          );
          return {
            ...ticket,
            messages: messagesResult.rows
          };
        } catch (msgError) {
          console.error("Error fetching messages for ticket:", ticket.id, msgError);
          if (msgError.code === '42P01') {
            console.error("help_request_messages table does not exist. Please run database initialization.");
          }
          return {
            ...ticket,
            messages: []
          };
        }
      }));
      
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ tickets }));
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
    const userId = req.user.id;
    const userRole = req.user.role;
    let bodyBuffer = Buffer.alloc(0);

    req.on("data", (chunk) => {
      bodyBuffer = Buffer.concat([bodyBuffer, chunk]);
    });

    req.on("end", async () => {
      try {
        const data = JSON.parse(bodyBuffer.toString());
        const { status } = data;

        if (!status || !["pending", "replied", "resolution_proposed", "resolved"].includes(status)) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Valid status is required" }));
          return;
        }

        // Check if user owns the ticket or is admin
        const ticketCheck = await db.query(
          `SELECT user_id FROM help_requests WHERE id = $1`,
          [ticketId]
        );

        if (ticketCheck.rows.length === 0) {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Help request not found" }));
          return;
        }

        const ticketOwnerId = ticketCheck.rows[0].user_id;
        
        // Only allow ticket owner or admin to update status
        if (ticketOwnerId !== userId && userRole !== 'admin') {
          res.writeHead(403, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "You can only update your own help requests" }));
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
  },

  addMessage(req, res) {
    const ticketId = req.params?.ticketId;
    let bodyBuffer = Buffer.alloc(0);

    req.on("data", (chunk) => {
      bodyBuffer = Buffer.concat([bodyBuffer, chunk]);
    });

    req.on("end", async () => {
      try {
        const data = JSON.parse(bodyBuffer.toString());
        const { message, is_admin } = data;
        const userId = req.user.id;

        console.log("=== ADD MESSAGE DEBUG ===");
        console.log("Ticket ID:", ticketId);
        console.log("User ID:", userId);
        console.log("Message:", message);
        console.log("is_admin:", is_admin);
        console.log("is_admin type:", typeof is_admin);
        console.log("Parsed data:", data);

        if (!message) {
          console.log("ERROR: Message is required");
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Message is required" }));
          return;
        }

        console.log("Attempting to insert message into database...");
        
        const result = await db.query(
          `INSERT INTO help_request_messages (help_request_id, user_id, message, is_admin)
           VALUES ($1, $2, $3, $4)
           RETURNING id, message, is_admin, created_at`,
          [ticketId, userId, message, is_admin === true]
        );

        console.log("✓ Message inserted successfully:", result.rows[0]);
        console.log("========================");

        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, message: result.rows[0] }));
      } catch (error) {
        console.error("✗ ERROR adding message:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        console.error("Error detail:", error.detail);
        
        if (error.code === '42P01') {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "help_request_messages table does not exist. Please run database initialization." }));
        } else {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Failed to add message: " + error.message }));
        }
      }
    });

    req.on("error", (err) => {
      console.error("✗ Request error:", err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Request error" }));
    });
  },

  getTicketMessages(req, res) {
    const ticketId = req.params?.ticketId;

    console.log("Fetching messages for ticket:", ticketId);
    
    db.query(
      `SELECT id, message, is_admin, created_at, user_id,
       CASE WHEN is_admin THEN (SELECT username FROM users WHERE id = user_id) 
            ELSE (SELECT username FROM users WHERE id = user_id) END as sender_name
       FROM help_request_messages
       WHERE help_request_id = $1
       ORDER BY created_at ASC`,
      [ticketId]
    ).then((result) => {
      console.log("Messages fetched successfully:", result.rows.length, "messages");
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ messages: result.rows }));
    }).catch((error) => {
      console.error("Error fetching messages:", error);
      if (error.code === '42P01') {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "help_request_messages table does not exist. Please run database initialization." }));
      } else {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Failed to fetch messages" }));
      }
    });
  }
};

module.exports = supportController;