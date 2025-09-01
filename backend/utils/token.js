const crypto = require("crypto");

// Generate random string token
function generateToken() {
  return crypto.randomBytes(24).toString("hex");
}

module.exports = { generateToken };
