// middleware/authMiddleware.js
const authService = require("../services/authService");

// Middleware to verify token and get user
async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("No token provided");
    }

    const token = authHeader.split(" ")[1];
    const user = await authService.verifyToken(token);
    req.user = user;
    next();
  } catch (err) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: err.message }));
  }
}

// Middleware to check if user has specific role
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Authentication required" }));
      return;
    }

    if (req.user.role !== role) {
      res.writeHead(403, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Insufficient permissions" }));
      return;
    }

    next();
  };
}

// Middleware to check multiple roles
function requireAnyRole(roles) {
  return (req, res, next) => {
    if (!req.user) {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Authentication required" }));
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.writeHead(403, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Insufficient permissions" }));
      return;
    }

    next();
  };
}

// Middleware to check if user is authenticated (any role)
function requireAuth(req, res, next) {
  if (!req.user) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Authentication required" }));
    return;
  }
  next();
}

// Helper function to apply middleware chain
function applyMiddleware(middlewares, handler) {
  return async (req, res) => {
    let index = 0;

    function next() {
      if (index < middlewares.length) {
        const middleware = middlewares[index++];
        middleware(req, res, next);
      } else {
        handler(req, res);
      }
    }

    next();
  };
}

// Helper function to parse request body
function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const parsed = JSON.parse(body);
        resolve(parsed);
      } catch (err) {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", (err) => reject(err));
  });
}

module.exports = {
  verifyToken,
  requireRole,
  requireAnyRole,
  requireAuth,
  applyMiddleware,
  parseRequestBody,
};
