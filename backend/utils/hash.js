const crypto = require("crypto");

// Hash a password with optional salt
function hashPassword(password, salt = null) {
  if (!salt) {
    salt = crypto.randomBytes(16).toString("hex"); // generate 16-byte salt
  }
  const hashed = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return { hashed, salt };
}

// Verify password
function verifyPassword(password, storedHash, storedSalt) {
  const { hashed } = hashPassword(password, storedSalt);
  return hashed === storedHash;
}

module.exports = { hashPassword, verifyPassword };
