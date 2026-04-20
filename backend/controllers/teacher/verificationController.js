// controllers/teacher/verificationController.js
const { parseRequestBody } = require("../../middleware/authMiddleware");

// Constants for verification system
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const COOL_DOWN_PERIOD = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
const FILE_RETENTION_PERIOD = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

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

      verification = result.rows[0];
      verification.has_file = verification.appointment_letter ? true : false;
      const verification = result.rows[0];
      verification.has_file = verification.appointment_letter ? true : false;

      // Calculate resubmit availability for rejected verifications
      if (verification.status === 'rejected' && verification.reviewed_at) {
        const timeSinceRejection = Date.now() - new Date(verification.reviewed_at).getTime();
        verification.can_resubmit = timeSinceRejection >= COOL_DOWN_PERIOD;
        
        if (!verification.can_resubmit) {
          verification.resubmit_available_at = new Date(new Date(verification.reviewed_at).getTime() + COOL_DOWN_PERIOD).toISOString();
        } else {
          verification.resubmit_available_at = null;
        }
      } else {
        verification.can_resubmit = false;
        verification.resubmit_available_at = null;
      }

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
      if (!req.user) {
        res.writeHead(401, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Not authenticated" }));
      }

      const userId = req.user.id;
      const db = require("../../db/db");

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

      // Parse JSON body
      const data = JSON.parse(bodyBuffer.toString());

      let fileBuffer = null;
      let fileName = null;

      if (data.appointmentLetter && data.appointmentLetter.data) {
        fileName = data.appointmentLetter.filename;
        // Strip data URL prefix if present (e.g., "data:application/pdf;base64,")
        let base64Data = data.appointmentLetter.data;
        const commaIndex = base64Data.indexOf(",");
        if (commaIndex !== -1) {
          base64Data = base64Data.substring(commaIndex + 1);
        }
        fileBuffer = Buffer.from(base64Data, "base64");
      }

      // File size validation
      if (fileBuffer && fileBuffer.length > MAX_FILE_SIZE) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({
            error: "File size exceeds 2MB limit",
          })
        );
      }

      // File type validation
      if (fileName && !fileName.toLowerCase().endsWith('.pdf')) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({
            error: "Only PDF files are allowed",
          })
        );
      }

      // Check if there's already a pending verification request
      const pendingCheck = await db.query(
        `SELECT id FROM teacher_verifications WHERE user_id = $1 AND status = 'pending'`,
        [userId]
      );

      if (pendingCheck.rows.length > 0) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({
            error: "You already have a pending verification request",
          })
        );
      }

      // Check cool down period for rejected verifications
      const recentRejection = await db.query(
        `SELECT reviewed_at FROM teacher_verifications 
         WHERE user_id = $1 AND status = 'rejected' 
         ORDER BY reviewed_at DESC LIMIT 1`,
        [userId]
      );

      if (recentRejection.rows.length > 0) {
        const timeSinceRejection = Date.now() - new Date(recentRejection.rows[0].reviewed_at).getTime();
        if (timeSinceRejection < COOL_DOWN_PERIOD) {
          const daysRemaining = Math.ceil((COOL_DOWN_PERIOD - timeSinceRejection) / (24 * 60 * 60 * 1000));
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(
            JSON.stringify({
              error: `Please wait ${daysRemaining} days before resubmitting`,
            })
          );
        }
      }

      // Insert verification request
      const result = await db.query(
        `INSERT INTO teacher_verifications (user_id, status, submitted_at, message, appointment_letter, file_name)
         VALUES ($1, 'pending', NOW(), $2, $3, $4)
         RETURNING id, status, submitted_at`,
        [
          userId,
          data.verificationMessage || "",
          fileBuffer,
          fileName
        ]
      );

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Verification request submitted successfully",
          verification: result.rows[0],
        })
      );
    } catch (err) {
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
        `SELECT v.id, v.user_id, u.username, u.email, v.status, v.submitted_at, v.message, v.file_name
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

  // Admin: Get verification details
  async getVerificationDetails(req, res) {
    try {
      const verificationId = req.params?.verificationId;
      const db = require("../../db/db");

      const result = await db.query(
        `SELECT v.id, v.user_id, u.username, u.email, v.status, v.submitted_at, v.message, v.file_name, v.appointment_letter
         FROM teacher_verifications v
         JOIN users u ON v.user_id = u.id
         WHERE v.id = $1`,
        [verificationId]
      );

      if (result.rows.length === 0) {
        res.writeHead(404, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({ error: "Verification not found" })
        );
      }

      const verification = result.rows[0];
      verification.has_file = verification.appointment_letter ? true : false;

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ verification }));
    } catch (err) {
      console.error("Error fetching verification details:", err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: "Failed to fetch verification details",
        })
      );
    }
  }

  // Admin: Approve verification
  async approveVerification(req, res) {
    try {
      const db = require("../../db/db");
      const data = req.body || {};
      const verificationId = data.verificationId;

      if (!verificationId) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({ error: "Verification ID is required" })
        );
      }

      const verification = await db.query(
        `SELECT user_id, status FROM teacher_verifications WHERE id = $1`,
        [verificationId]
      );

      if (verification.rows.length === 0) {
        res.writeHead(404, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({ error: "Verification request not found" })
        );
      }

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
          error: "Failed to approve verification: " + err.message,
        })
      );
    }
  }

  // Admin: Reject verification
  async rejectVerification(req, res) {
    try {
      const db = require("../../db/db");
      const data = req.body || {};
      const verificationId = data.verificationId;
      const rejectionReason = data.rejectionReason;

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
      const verificationId = req.params?.verificationId;
      const userId = req.user.id;
      const db = require("../../db/db");

      // Get the verification record with file
      const result = await db.query(
        `SELECT v.appointment_letter, v.file_name, v.user_id, u.username 
         FROM teacher_verifications v
         JOIN users u ON v.user_id = u.id
         WHERE v.id = $1`,
        [verificationId]
      );

      if (result.rows.length === 0) {
        res.writeHead(404, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({ error: "Verification not found" })
        );
      }

      const verification = result.rows[0];

      if (!verification.appointment_letter) {
        res.writeHead(404, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({ error: "No file attached to verification request" })
        );
      }

      // Get file buffer
      const fileBuffer = verification.appointment_letter;
      const fileName = verification.file_name || "verification.pdf";

      // Set response headers - force download only, no inline
      res.writeHead(200, {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="verification_${verificationId}.pdf"`,
        "Content-Length": fileBuffer.length,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
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

  // Clean up old rejected verification files
  async cleanupOldVerifications() {
    try {
      const db = require("../../db/db");
      const cutoffDate = new Date(Date.now() - FILE_RETENTION_PERIOD);
      
      const result = await db.query(
        `DELETE FROM teacher_verifications 
         WHERE status = 'rejected' 
         AND reviewed_at < $1
         RETURNING id, file_name`,
        [cutoffDate]
      );
      
      console.log(`Cleaned up ${result.rows.length} old rejected verification files`);
      
      // Log cleanup activity
      result.rows.forEach(file => {
        console.log(`Deleted verification file: ${file.file_name} (ID: ${file.id})`);
      });

      return { success: true, deletedCount: result.rows.length };
    } catch (err) {
      console.error("Error cleaning up old verifications:", err);
      return { success: false, error: err.message };
    }
  }
}

module.exports = new VerificationController();
