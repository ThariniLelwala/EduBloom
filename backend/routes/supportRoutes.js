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
    if (method === "POST" && pathname === "/api/support/tickets") {
      return applyMiddleware([verifyToken], supportController.createTicket)(req, res);
    }

    if (method === "GET" && pathname === "/api/support/my-tickets") {
      return applyMiddleware([verifyToken], supportController.getUserTickets)(req, res);
    }

    if (method === "GET" && pathname === "/api/support/tickets") {
      return applyMiddleware([verifyToken, requireRole("admin")], supportController.getAllTickets)(req, res);
    }

    if (method === "PUT" && pathname.match(/^\/api\/support\/tickets\/\d+$/)) {
      const ticketId = pathname.split("/").pop();
      req.params = { ticketId };
      return applyMiddleware([verifyToken, requireRole("admin")], supportController.updateTicketStatus)(req, res);
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Support route not found" }));
  } catch (err) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal server error" }));
  }
}

module.exports = handleSupportRoutes;