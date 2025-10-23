// controllers/teacherController.js
const teacherService = require("../services/teacherService");
const { parseRequestBody } = require("../middleware/authMiddleware");

class TeacherController {
  /**
   * Create a new subject
   * POST /api/teacher/subjects/create
   */
  async createSubject(req, res) {
    try {
      const data = await parseRequestBody(req);
      const { name, description } = data;
      const teacherId = req.user.id;

      if (!name) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Subject name is required" }));
        return;
      }

      const subject = await teacherService.createSubject(
        teacherId,
        name,
        description || null
      );

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Subject created successfully",
          subject,
        })
      );
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Get all subjects for the teacher
   * GET /api/teacher/subjects
   */
  async getSubjects(req, res) {
    try {
      const teacherId = req.user.id;
      const subjects = await teacherService.getTeacherSubjects(teacherId);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Subjects retrieved successfully",
          subjects,
        })
      );
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Get a specific subject with its topics
   * GET /api/teacher/subjects/:subjectId
   */
  async getSubject(req, res) {
    try {
      const teacherId = req.user.id;
      const pathname = req.url.split("?")[0];
      const subjectId = parseInt(pathname.split("/").pop());

      if (!subjectId || isNaN(subjectId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid subject ID" }));
        return;
      }

      const subject = await teacherService.getSubjectWithTopics(
        subjectId,
        teacherId
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Subject retrieved successfully",
          subject,
        })
      );
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Update a subject
   * PUT /api/teacher/subjects/:subjectId
   */
  async updateSubject(req, res) {
    try {
      const data = await parseRequestBody(req);
      const teacherId = req.user.id;
      const pathname = req.url.split("?")[0];
      const subjectId = parseInt(pathname.split("/").pop());

      if (!subjectId || isNaN(subjectId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid subject ID" }));
        return;
      }

      const subject = await teacherService.updateSubject(
        subjectId,
        teacherId,
        data
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Subject updated successfully",
          subject,
        })
      );
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Delete a subject
   * DELETE /api/teacher/subjects/:subjectId
   */
  async deleteSubject(req, res) {
    try {
      const teacherId = req.user.id;
      const pathname = req.url.split("?")[0];
      const subjectId = parseInt(pathname.split("/").pop());

      if (!subjectId || isNaN(subjectId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid subject ID" }));
        return;
      }

      const result = await teacherService.deleteSubject(subjectId, teacherId);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Create a topic within a subject
   * POST /api/teacher/subjects/:subjectId/topics/create
   */
  async createTopic(req, res) {
    try {
      const data = await parseRequestBody(req);
      const { name, description } = data;
      const teacherId = req.user.id;
      const pathname = req.url.split("?")[0];
      const subjectId = parseInt(pathname.split("/")[4]);

      if (!subjectId || isNaN(subjectId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid subject ID" }));
        return;
      }

      if (!name) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Topic name is required" }));
        return;
      }

      const topic = await teacherService.createTopic(
        subjectId,
        teacherId,
        name,
        description || null
      );

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Topic created successfully",
          topic,
        })
      );
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Get topics for a subject
   * GET /api/teacher/subjects/:subjectId/topics
   */
  async getTopics(req, res) {
    try {
      const teacherId = req.user.id;
      const pathname = req.url.split("?")[0];
      const subjectId = parseInt(pathname.split("/")[4]);

      if (!subjectId || isNaN(subjectId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid subject ID" }));
        return;
      }

      const topics = await teacherService.getTopics(subjectId, teacherId);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Topics retrieved successfully",
          topics,
        })
      );
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Delete a topic
   * DELETE /api/teacher/subjects/:subjectId/topics/:topicId
   */
  async deleteTopic(req, res) {
    try {
      const teacherId = req.user.id;
      const pathname = req.url.split("?")[0];
      const parts = pathname.split("/");
      const subjectId = parseInt(parts[4]);
      const topicId = parseInt(parts[6]);

      if (!subjectId || isNaN(subjectId) || !topicId || isNaN(topicId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid subject or topic ID" }));
        return;
      }

      const result = await teacherService.deleteTopic(
        topicId,
        subjectId,
        teacherId
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Add a module note (PDF file)
   * POST /api/teacher/subjects/:subjectId/topics/:topicId/notes/create
   */
  async addModuleNote(req, res) {
    try {
      const data = await parseRequestBody(req);
      const { title, file_name, file_url, google_drive_file_id } = data;
      const teacherId = req.user.id;
      const pathname = req.url.split("?")[0];
      const parts = pathname.split("/");
      const subjectId = parseInt(parts[4]);
      const topicId = parseInt(parts[6]);

      if (!subjectId || isNaN(subjectId) || !topicId || isNaN(topicId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid subject or topic ID" }));
        return;
      }

      if (!title || !file_name) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Title and file name are required" }));
        return;
      }

      const note = await teacherService.addModuleNote(
        topicId,
        subjectId,
        teacherId,
        title,
        file_name,
        file_url || null,
        google_drive_file_id || null
      );

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Module note added successfully",
          note,
        })
      );
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Get module notes for a topic
   * GET /api/teacher/subjects/:subjectId/topics/:topicId/notes
   */
  async getModuleNotes(req, res) {
    try {
      const teacherId = req.user.id;
      const pathname = req.url.split("?")[0];
      const parts = pathname.split("/");
      const subjectId = parseInt(parts[4]);
      const topicId = parseInt(parts[6]);

      if (!subjectId || isNaN(subjectId) || !topicId || isNaN(topicId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid subject or topic ID" }));
        return;
      }

      const notes = await teacherService.getModuleNotes(
        topicId,
        subjectId,
        teacherId
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Module notes retrieved successfully",
          notes,
        })
      );
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Delete a module note
   * DELETE /api/teacher/subjects/:subjectId/topics/:topicId/notes/:noteId
   */
  async deleteModuleNote(req, res) {
    try {
      const teacherId = req.user.id;
      const pathname = req.url.split("?")[0];
      const parts = pathname.split("/");
      const subjectId = parseInt(parts[4]);
      const topicId = parseInt(parts[6]);
      const noteId = parseInt(parts[8]);

      if (
        !subjectId ||
        isNaN(subjectId) ||
        !topicId ||
        isNaN(topicId) ||
        !noteId ||
        isNaN(noteId)
      ) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid IDs" }));
        return;
      }

      const result = await teacherService.deleteModuleNote(
        noteId,
        topicId,
        subjectId,
        teacherId
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Update note visibility (public/private)
   * PUT /api/teacher/notes/:noteId/visibility
   */
  async updateNoteVisibility(req, res) {
    try {
      const data = await parseRequestBody(req);
      const { is_public } = data;
      const teacherId = req.user.id;
      const pathname = req.url.split("?")[0];
      const noteId = parseInt(pathname.split("/")[4]);

      if (!noteId || isNaN(noteId) || is_public === undefined) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ error: "Invalid note ID or visibility status" })
        );
        return;
      }

      const note = await teacherService.updateNoteVisibility(
        noteId,
        teacherId,
        is_public
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Note visibility updated successfully",
          note,
        })
      );
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Get public notes by teacher (for students)
   * GET /api/teacher/:teacherId/notes/public
   */
  async getPublicNotes(req, res) {
    try {
      const pathname = req.url.split("?")[0];
      const teacherId = parseInt(pathname.split("/")[3]);

      if (!teacherId || isNaN(teacherId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid teacher ID" }));
        return;
      }

      const notes = await teacherService.getPublicNotesByTeacher(teacherId);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Public notes retrieved successfully",
          notes,
        })
      );
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  // Get teacher verification status
  async getVerificationStatus(req, res) {
    try {
      const userId = req.user.id;

      const result = await require("../db/db").query(
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
      const db = require("../db/db");

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

  // Helper method to parse multipart/form-data from buffer
  parseMultipartFormDataFromBuffer(buffer, contentType) {
    try {
      // Extract boundary from Content-Type header - remove quotes if present
      const boundaryMatch = contentType.match(/boundary=([^\s;,]+)/);
      if (!boundaryMatch) {
        throw new Error(
          "No boundary found in multipart form-data. Content-Type: " +
            contentType
        );
      }

      let boundary = boundaryMatch[1];
      // Remove quotes if present
      boundary = boundary.replace(/^"|"$/g, "");

      const bodyString = buffer.toString("binary");
      const boundaryStr = `--${boundary}`;

      console.log(
        "   Boundary string:",
        `--${boundary}`.substring(0, 30) + "..."
      );

      const parts = bodyString.split(boundaryStr);

      console.log("   Total parts found:", parts.length);

      const fields = {};
      let file = null;
      let fileName = null;

      for (let i = 1; i < parts.length; i++) {
        let part = parts[i];

        // Skip if part only contains closing boundary
        if (part.trim() === "--" || part.trim() === "") continue;

        // Remove leading CRLF
        if (part.startsWith("\r\n")) {
          part = part.substring(2);
        }

        // Split headers from content using double CRLF
        const headerEndIndex = part.indexOf("\r\n\r\n");
        if (headerEndIndex === -1) {
          console.log("   Skipping part - no header end found");
          continue;
        }

        const headerString = part.substring(0, headerEndIndex);
        let content = part.substring(headerEndIndex + 4);

        // Remove trailing CRLF before next boundary
        if (content.endsWith("\r\n")) {
          content = content.substring(0, content.length - 2);
        }

        // Parse Content-Disposition header
        const dispositionMatch = headerString.match(
          /Content-Disposition:\s*form-data;\s*name="([^"]+)"(?:;\s*filename="([^"]+)")?/i
        );

        if (!dispositionMatch) {
          console.log("   Skipping part - no disposition found");
          continue;
        }

        const fieldName = dispositionMatch[1];
        const uploadedFileName = dispositionMatch[2];

        console.log(
          `   Part: name="${fieldName}", fileName="${
            uploadedFileName || "N/A"
          }"`
        );

        if (uploadedFileName) {
          // This is a file field
          file = Buffer.from(content, "binary");
          fileName = uploadedFileName;
          console.log(`   File size: ${file.length} bytes`);
        } else {
          // This is a regular form field
          fields[fieldName] = content;
          console.log(`   Field value length: ${content.length}`);
        }
      }

      console.log(
        "   Parse result - Fields:",
        Object.keys(fields),
        "File:",
        fileName ? "yes" : "no"
      );

      return {
        fields,
        file,
        fileName,
      };
    } catch (err) {
      console.error("Error parsing multipart form data:", err);
      throw err;
    }
  }

  // Admin: Get pending verification requests
  async getPendingVerifications(req, res) {
    try {
      const db = require("../db/db");

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
      const db = require("../db/db");
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
      const db = require("../db/db");
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
      const db = require("../db/db");
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
      const db = require("../db/db");

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
      const db = require("../db/db");

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

module.exports = new TeacherController();
