// controllers/authController.js
const authService = require("../services/authService");
const { parseRequestBody } = require("../middleware/authMiddleware");
const db = require("../db/db");

class AuthController {
  async register(req, res) {
    try {
      const data = await parseRequestBody(req);
      const result = await authService.register(data);

      let message = `${result.user.role} registration successful`;
      if (result.user.role === "parent" && result.linkCreated) {
        message = "Parent registered and link request sent to student";
      }

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message,
          user: {
            id: result.user.id,
            username: result.user.username,
            email: result.user.email,
            role: result.user.role,
            student_type: result.user.student_type,
            firstname: result.user.firstname,
            lastname: result.user.lastname,
            birthday: result.user.birthday,
          },
        })
      );
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async login(req, res) {
    try {
      const data = await parseRequestBody(req);
      const result = await authService.login(data);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Login successful",
          user: result,
        })
      );
    } catch (err) {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async logout(req, res) {
    try {
      const user = req.user;

      // Clear token from database
      await db.query("UPDATE users SET token = NULL WHERE id = $1", [user.id]);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Logout successful" }));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async getProfile(req, res) {
    try {
      const user = req.user;

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            student_type: user.student_type,
            firstname: user.firstname,
            lastname: user.lastname,
            birthday: user.birthday,
          },
        })
      );
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async listPendingRequests(req, res) {
    try {
      const data = await parseRequestBody(req);
      const { student_id } = data;

      if (!student_id) {
        throw new Error("Student ID is required");
      }

      const requests = await authService.listPendingParentRequests(student_id);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ requests }));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async respondToRequest(req, res) {
    try {
      const data = await parseRequestBody(req);
      const { link_id, action, student_id } = data;

      if (!link_id || !action || !student_id) {
        throw new Error("Missing required fields");
      }

      const result = await authService.respondToParentRequest(
        link_id,
        action,
        student_id
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async changePassword(req, res) {
    try {
      const data = await parseRequestBody(req);
      const { oldPassword, newPassword } = data;
      const user = req.user;

      if (!oldPassword || !newPassword) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ error: "Both old and new passwords are required" })
        );
        return;
      }

      const result = await authService.changePassword(
        user.id,
        oldPassword,
        newPassword
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async getLinkedParents(req, res) {
    try {
      const user = req.user;

      // Get all accepted parent-student links for this student
      const result = await db.query(
        `SELECT u.id, u.username as parent_username, u.email as parent_email, psl.id as link_id, psl.status, psl.created_at
         FROM users u
         INNER JOIN parent_student_links psl ON u.id = psl.parent_id
         WHERE psl.student_id = $1 AND psl.status = 'accepted'
         ORDER BY psl.created_at DESC`,
        [user.id]
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ parents: result.rows }));
    } catch (err) {
      console.error("Error fetching linked parents:", err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Failed to fetch linked parents" }));
    }
  }

  async removeParentLink(req, res) {
    try {
      const user = req.user;
      const data = await parseRequestBody(req);
      const { linkId } = data;

      if (!linkId) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Link ID is required" }));
        return;
      }

      // Verify that this link belongs to the current student
      const verifyResult = await db.query(
        `SELECT * FROM parent_student_links WHERE id = $1 AND student_id = $2`,
        [linkId, user.id]
      );

      if (verifyResult.rows.length === 0) {
        res.writeHead(403, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Unauthorized to remove this link" }));
        return;
      }

      // Delete the link
      await db.query(`DELETE FROM parent_student_links WHERE id = $1`, [
        linkId,
      ]);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Parent link removed successfully" }));
    } catch (err) {
      console.error("Error removing parent link:", err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Failed to remove parent link" }));
    }
  }

  async getPendingParentRequests(req, res) {
    try {
      const user = req.user;

      // Get all pending parent-student links for this student
      const result = await db.query(
        `SELECT u.id, u.username as parent_username, u.email as parent_email, psl.id, psl.created_at
         FROM users u
         INNER JOIN parent_student_links psl ON u.id = psl.parent_id
         WHERE psl.student_id = $1 AND psl.status = 'pending'
         ORDER BY psl.created_at DESC`,
        [user.id]
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ pendingRequests: result.rows }));
    } catch (err) {
      console.error("Error fetching pending parent requests:", err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({ error: "Failed to fetch pending parent requests" })
      );
    }
  }

  async acceptParentLink(req, res) {
    try {
      const user = req.user;
      const data = await parseRequestBody(req);
      const { linkId } = data;

      if (!linkId) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Link ID is required" }));
        return;
      }

      // Verify that this link belongs to the current student and is pending
      const verifyResult = await db.query(
        `SELECT psl.*, u.username as parent_username, u.email as parent_email 
         FROM parent_student_links psl
         JOIN users u ON psl.parent_id = u.id
         WHERE psl.id = $1 AND psl.student_id = $2 AND psl.status = 'pending'`,
        [linkId, user.id]
      );

      if (verifyResult.rows.length === 0) {
        res.writeHead(403, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Unauthorized or link not pending" }));
        return;
      }

      // Check if student already has 2 accepted parents
      const acceptedParentsCount = await db.query(
        `SELECT COUNT(*) as count FROM parent_student_links 
         WHERE student_id = $1 AND status = 'accepted'`,
        [user.id]
      );

      if (parseInt(acceptedParentsCount.rows[0].count) >= 2) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: "You can only have a maximum of 2 linked parents",
          })
        );
        return;
      }

      // Update the link status to accepted
      await db.query(
        `UPDATE parent_student_links SET status = 'accepted', updated_at = NOW() WHERE id = $1`,
        [linkId]
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Parent link accepted successfully" }));
    } catch (err) {
      console.error("Error accepting parent link:", err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Failed to accept parent link" }));
    }
  }

  async rejectParentLink(req, res) {
    try {
      const user = req.user;
      const data = await parseRequestBody(req);
      const { linkId } = data;

      if (!linkId) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Link ID is required" }));
        return;
      }

      // Verify that this link belongs to the current student and is pending
      const verifyResult = await db.query(
        `SELECT * FROM parent_student_links WHERE id = $1 AND student_id = $2 AND status = 'pending'`,
        [linkId, user.id]
      );

      if (verifyResult.rows.length === 0) {
        res.writeHead(403, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Unauthorized or link not pending" }));
        return;
      }

      // Update the link status to rejected
      await db.query(
        `UPDATE parent_student_links SET status = 'rejected', updated_at = NOW() WHERE id = $1`,
        [linkId]
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Parent link rejected successfully" }));
    } catch (err) {
      console.error("Error rejecting parent link:", err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Failed to reject parent link" }));
    }
  }
}

module.exports = new AuthController();
