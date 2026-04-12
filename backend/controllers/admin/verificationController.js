// controllers/admin/verificationController.js
const verificationService = require("../../services/admin/verificationService");
const { parseRequestBody } = require("../../middleware/authMiddleware");
const db = require("../../db/db");

class VerificationController {
  async getPending(req, res) {
    try {
      const data = await verificationService.getPending();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ verifications: data }));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async getAll(req, res) {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const status = url.searchParams.get("status");
      const data = await verificationService.getAll(status);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ verifications: data }));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async getById(req, res) {
    try {
      const id = parseInt(req.url.split("/")[4]);
      const data = await verificationService.getById(id);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ verification: data }));
    } catch (err) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async approve(req, res) {
    try {
      const id = parseInt(req.url.split("/")[4]);
      const result = await verificationService.approve(id);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async reject(req, res) {
    try {
      const id = parseInt(req.url.split("/")[4]);
      const { reason } = await parseRequestBody(req);
      const result = await verificationService.reject(id, reason);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async getStats(req, res) {
    try {
      const stats = await verificationService.getStats();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(stats));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async download(req, res) {
    try {
      const id = parseInt(req.url.split("/")[4]);

      const result = await db.query(
        `SELECT id, appointment_letter, file_name 
         FROM teacher_verifications 
         WHERE id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        res.writeHead(404, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Verification not found" }));
      }

      const verification = result.rows[0];

      if (!verification.appointment_letter) {
        res.writeHead(404, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "No file attached" }));
      }

      const fileBuffer = verification.appointment_letter;
      const fileName = verification.file_name || "appointment_letter";

      let contentType = "application/octet-stream";
      if (fileName.endsWith(".pdf")) {
        contentType = "application/pdf";
      } else if (fileName.endsWith(".doc") || fileName.endsWith(".docx")) {
        contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      } else if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
        contentType = "image/jpeg";
      } else if (fileName.endsWith(".png")) {
        contentType = "image/png";
      }

      res.writeHead(200, {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": fileBuffer.length,
      });

      res.end(fileBuffer);
    } catch (err) {
      console.error("Error downloading verification file:", err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Failed to download verification file" }));
    }
  }
}

module.exports = new VerificationController();
