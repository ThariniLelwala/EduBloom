const {
  verifyToken,
  requireRole,
  applyMiddleware,
} = require("../middleware/authMiddleware");

const supportController = require("../controllers/supportController");

function handleSupportRoutes(req, res) {
  const pathname = req.url.split("?")[0];
  const method = req.method;

  try {
    // Create help request: POST /api/support/tickets
    if (method === "POST" && pathname === "/api/support/tickets") {
      return applyMiddleware([verifyToken], supportController.createTicket)(req, res);
    }

    // Get user's help requests: GET /api/support/my-tickets
    if (method === "GET" && pathname === "/api/support/my-tickets") {
      return applyMiddleware([verifyToken], supportController.getUserTickets)(req, res);
    }

    // Get all help requests (admin): GET /api/support/tickets
    if (method === "GET" && pathname === "/api/support/tickets") {
      return applyMiddleware([verifyToken, requireRole("admin")], supportController.getAllTickets)(req, res);
    }

    // Update help request status: PUT /api/support/tickets/:id
    if (method === "PUT" && pathname.match(/^\/api\/support\/tickets\/\d+$/)) {
      const ticketId = pathname.split("/").pop();
      req.params = { ticketId };
      return applyMiddleware([verifyToken], supportController.updateTicketStatus)(req, res);
    }

    // Add message to help request: POST /api/support/tickets/:id/messages
    if (method === "POST" && pathname.match(/^\/api\/support\/tickets\/\d+\/messages$/)) {
      const ticketId = pathname.split("/").slice(-2)[0];
      req.params = { ticketId };
      console.log("POST /api/support/tickets/:id/messages - Adding message to ticket:", ticketId);
      return applyMiddleware([verifyToken], supportController.addMessage)(req, res);
    }

    // Get messages for help request: GET /api/support/tickets/:id/messages
    if (method === "GET" && pathname.match(/^\/api\/support\/tickets\/\d+\/messages$/)) {
      const ticketId = pathname.split("/").slice(-2)[0];
      req.params = { ticketId };
      return applyMiddleware([verifyToken], supportController.getTicketMessages)(req, res);
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Support route not found" }));
  } catch (err) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
}

module.exports = handleSupportRoutes;