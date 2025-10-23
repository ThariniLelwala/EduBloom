// controllers/teacher/verificationController.js
const { parseRequestBody } = require("../../middleware/authMiddleware");

class VerificationController {
  // Get teacher verification status
  async getVerificationStatus(req, res) {
    try {
      const userId = req.user.id;

      const result = await require("../../db/db").query(
        `SELECT id, status, message, appointment_letter, file_name, verified_at, submitted_at, reviewed_at, rejection_reason 
         FROM teacher_verifications 
         WHERE user_id = $1
         ORDER BY submitted_at DESC
         LIMIT 1`,
        [userId]
      );

      if (result.rows.length === 0) {
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ verification: null }));
      }

      // Include file existence info
      const verification = result.rows[0];
      verification.hasFile = verification.appointment_letter ? true : false;

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ verification }));
    } catch (err) {
      console.error("Error fetching verification status:", err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Failed to fetch verification status" }));
    }
  }

  // Request verification
  async requestVerification(req, res) {
    try {
      console.log("🔍 Request verification received");

      if (!req.user) {
        console.log("❌ No user in request - authentication failed");
        res.writeHead(401, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Not authenticated" }));
      }

      const userId = req.user.id;
      const db = require("../../db/db");

      console.log("   User ID:", userId);

      // Collect request body
      let bodyBuffer = Buffer.alloc(0);

      await new Promise((resolve, reject) => {
        req.on("data", (chunk) => {
          bodyBuffer = Buffer.concat([bodyBuffer, chunk]);
        });

        req.on("end", () => {
          resolve();
        });
        req.on("error", reject);
      });

      console.log("   Total buffer size:", bodyBuffer.length);

      // Parse JSON body
      const data = JSON.parse(bodyBuffer.toString());
      console.log(
        "   Parsed JSON - Message length:",
        data.verificationMessage?.length || 0
      );
      console.log("   Has file:", !!data.appointmentLetter);

      let fileBuffer = null;
      let fileName = null;

      if (data.appointmentLetter && data.appointmentLetter.data) {
        // Convert base64 to buffer
        fileName = data.appointmentLetter.filename;
        fileBuffer = Buffer.from(data.appointmentLetter.data, "base64");
        console.log("   File name:", fileName);
        console.log("   File size:", fileBuffer.length, "bytes");
      }

      // Check if there's already a pending verification request
      console.log("   Checking for existing pending requests...");
      const pendingCheck = await db.query(
        `SELECT id FROM teacher_verifications WHERE user_id = $1 AND status = 'pending'`,
        [userId]
      );

      if (pendingCheck.rows.length > 0) {
        console.log("   ⚠️  Pending request already exists");
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({
            error: "You already have a pending verification request",
          })
        );
      }

      // Insert verification request
      console.log("   Inserting verification request...");
      const result = await db.query(
        `INSERT INTO teacher_verifications (user_id, status, submitted_at, message, appointment_letter, file_name)
         VALUES ($1, $2, NOW(), $3, $4, $5)
         RETURNING id, status, submitted_at`,
        [
          userId,
          "pending",
          data.verificationMessage || "",
          fileBuffer,
          fileName,
        ]
      );

      console.log(
        "   ✅ Verification request created - ID:",
        result.rows[0].id
      );

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Verification request submitted successfully",
          verification: result.rows[0],
        })
      );
    } catch (err) {
      console.error("❌ Error submitting verification request:");
      console.error("   Message:", err.message);
      console.error("   Stack:", err.stack);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: "Failed to submit verification request: " + err.message,
        })
      );
    }
  }

  // Admin: Get pending verification requests
  async getPendingVerifications(req, res) {
    try {
      const db = require("../../db/db");

      const result = await db.query(
        `SELECT v.id, v.user_id, u.username, u.email, v.status, v.submitted_at, v.message
         FROM teacher_verifications v
         JOIN users u ON v.user_id = u.id
         WHERE v.status = 'pending'
         ORDER BY v.submitted_at ASC`
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ verifications: result.rows }));
    } catch (err) {
      console.error("Error fetching pending verifications:", err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: "Failed to fetch pending verifications",
        })
      );
    }
  }

  // Admin: Approve verification
  async approveVerification(req, res) {
    try {
      const db = require("../../db/db");
      const data = await parseRequestBody(req);
      const { verificationId } = data;

      if (!verificationId) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({ error: "Verification ID is required" })
        );
      }

      // Get the verification request
      const verification = await db.query(
        `SELECT user_id FROM teacher_verifications WHERE id = $1`,
        [verificationId]
      );

      if (verification.rows.length === 0) {
        res.writeHead(404, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({ error: "Verification request not found" })
        );
      }

      // Update verification status
      await db.query(
        `UPDATE teacher_verifications 
         SET status = 'verified', verified_at = NOW(), reviewed_at = NOW()
         WHERE id = $1`,
        [verificationId]
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Teacher verification approved successfully",
        })
      );
    } catch (err) {
      console.error("Error approving verification:", err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: "Failed to approve verification",
        })
      );
    }
  }

  // Admin: Reject verification
  async rejectVerification(req, res) {
    try {
      const db = require("../../db/db");
      const data = await parseRequestBody(req);
      const { verificationId, rejectionReason } = data;

      if (!verificationId) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({ error: "Verification ID is required" })
        );
      }

      // Get the verification request
      const verification = await db.query(
        `SELECT user_id FROM teacher_verifications WHERE id = $1`,
        [verificationId]
      );

      if (verification.rows.length === 0) {
        res.writeHead(404, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({ error: "Verification request not found" })
        );
      }

      // Update verification status
      await db.query(
        `UPDATE teacher_verifications 
         SET status = 'rejected', rejection_reason = $1, reviewed_at = NOW()
         WHERE id = $2`,
        [rejectionReason || "No reason provided", verificationId]
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Teacher verification rejected successfully",
        })
      );
    } catch (err) {
      console.error("Error rejecting verification:", err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: "Failed to reject verification",
        })
      );
    }
  }

  // Update verification request (for pending status only)
  async updateVerification(req, res) {
    try {
      const userId = req.user.id;
      const db = require("../../db/db");
      const data = await parseRequestBody(req);

      // Check if verification exists and is pending
      const verification = await db.query(
        `SELECT id, status FROM teacher_verifications WHERE user_id = $1 AND status = 'pending'`,
        [userId]
      );

      if (verification.rows.length === 0) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({
            error: "No pending verification request found",
          })
        );
      }

      // Update verification request
      const result = await db.query(
        `UPDATE teacher_verifications 
         SET message = $1
         WHERE user_id = $2 AND status = 'pending'
         RETURNING id, status, submitted_at`,
        [data.verificationMessage || "", userId]
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Verification request updated successfully",
          verification: result.rows[0],
        })
      );
    } catch (err) {
      console.error("Error updating verification request:", err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: "Failed to update verification request",
        })
      );
    }
  }

  // Delete verification request (for pending status only)
  async deleteVerification(req, res) {
    try {
      const userId = req.user.id;
      const db = require("../../db/db");

      // Check if verification exists and is pending
      const verification = await db.query(
        `SELECT id, status FROM teacher_verifications WHERE user_id = $1 AND status = 'pending'`,
        [userId]
      );

      if (verification.rows.length === 0) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({
            error: "No pending verification request found",
          })
        );
      }

      // Delete verification request
      await db.query(
        `DELETE FROM teacher_verifications WHERE user_id = $1 AND status = 'pending'`,
        [userId]
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Verification request deleted successfully",
        })
      );
    } catch (err) {
      console.error("Error deleting verification request:", err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: "Failed to delete verification request",
        })
      );
    }
  }

  // Download verification file
  async downloadVerificationFile(req, res) {
    try {
      const userId = req.user.id;
      const db = require("../../db/db");

      // Get the verification record with file
      const result = await db.query(
        `SELECT id, appointment_letter, file_name 
         FROM teacher_verifications 
         WHERE user_id = $1
         ORDER BY submitted_at DESC
         LIMIT 1`,
        [userId]
      );

      if (result.rows.length === 0) {
        res.writeHead(404, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({ error: "No verification request found" })
        );
      }

      const verification = result.rows[0];

      if (!verification.appointment_letter) {
        res.writeHead(404, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({ error: "No file attached to verification request" })
        );
      }

      // Get file buffer and determine content type
      const fileBuffer = verification.appointment_letter;
      const fileName = verification.file_name || "appointment_letter";

      // Determine content type based on file extension
      let contentType = "application/octet-stream";
      if (fileName.endsWith(".pdf")) {
        contentType = "application/pdf";
      } else if (fileName.endsWith(".doc") || fileName.endsWith(".docx")) {
        contentType =
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      } else if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
        contentType = "image/jpeg";
      } else if (fileName.endsWith(".png")) {
        contentType = "image/png";
      }

      // Set response headers
      res.writeHead(200, {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": fileBuffer.length,
      });

      res.end(fileBuffer);
    } catch (err) {
      console.error("Error downloading verification file:", err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: "Failed to download verification file",
        })
      );
    }
  }
}

module.exports = new VerificationController();
