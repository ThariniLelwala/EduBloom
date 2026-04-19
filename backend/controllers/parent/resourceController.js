// controllers/parent/resourceController.js
const { parseRequestBody } = require("../../middleware/authMiddleware");
const db = require("../../db/db");

class ResourceController {
  /**
   * Add or update a resource recommendation for a student
   * POST /api/parent/resources/recommend
   * Body: { student_id, resource_type, resource_id }
   */
  async addRecommendation(req, res) {
    try {
      const data = await parseRequestBody(req);
      const { student_id, resource_type, resource_id } = data;
      const parent_id = req.user.id;

      if (!student_id || !resource_type || !resource_id) {
        return res.writeHead(400, { "Content-Type": "application/json" })
          .end(JSON.stringify({ error: "Missing required fields" }));
      }

      // Verify parent has access to this student
      const linkCheck = await db.query(
        `SELECT id FROM parent_student_links 
         WHERE parent_id = $1 AND student_id = $2`,
        [parent_id, student_id]
      );

      if (linkCheck.rows.length === 0) {
        return res.writeHead(403, { "Content-Type": "application/json" })
          .end(JSON.stringify({ error: "Not linked to this student" }));
      }

      // Upsert recommendation
      const result = await db.query(
        `INSERT INTO parent_resource_recommendations 
         (parent_id, student_id, resource_type, resource_id, recommended)
         VALUES ($1, $2, $3, $4, TRUE)
         ON CONFLICT (parent_id, student_id, resource_type, resource_id)
         DO UPDATE SET recommended = TRUE, created_at = NOW()
         RETURNING id`,
        [parent_id, student_id, resource_type, resource_id]
      );

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ 
        success: true, 
        id: result.rows[0].id,
        message: "Resource recommended" 
      }));
    } catch (err) {
      console.error("Add recommendation error:", err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Failed to add recommendation" }));
    }
  }

  /**
   * Get all recommendations for a student
   * GET /api/parent/resources/:studentId/recommendations
   */
  async getRecommendations(req, res) {
    try {
      const studentId = parseInt(req.url.split("/")[4]);
      const parent_id = req.user.id;

      // Verify parent has access to this student
      const linkCheck = await db.query(
        `SELECT id FROM parent_student_links 
         WHERE parent_id = $1 AND student_id = $2`,
        [parent_id, studentId]
      );

      if (linkCheck.rows.length === 0) {
        return res.writeHead(403, { "Content-Type": "application/json" })
          .end(JSON.stringify({ error: "Not linked to this student" }));
      }

      const result = await db.query(
        `SELECT id, resource_type, resource_id, recommended, created_at
         FROM parent_resource_recommendations 
         WHERE parent_id = $1 AND student_id = $2`,
        [parent_id, studentId]
      );

      const recommendations = {};
      result.rows.forEach(row => {
        recommendations[row.resource_id] = row.recommended;
      });

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(recommendations));
    } catch (err) {
      console.error("Get recommendations error:", err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Failed to get recommendations" }));
    }
  }

  /**
   * Remove a recommendation
   * DELETE /api/parent/resources/recommend/:id
   */
  async removeRecommendation(req, res) {
    try {
      const recId = parseInt(req.url.split("/")[5]);
      const parent_id = req.user.id;

      const result = await db.query(
        `DELETE FROM parent_resource_recommendations 
         WHERE id = $1 AND parent_id = $2
         RETURNING id`,
        [recId, parent_id]
      );

      if (result.rows.length === 0) {
        return res.writeHead(404, { "Content-Type": "application/json" })
          .end(JSON.stringify({ error: "Recommendation not found" }));
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, message: "Recommendation removed" }));
    } catch (err) {
      console.error("Remove recommendation error:", err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Failed to remove recommendation" }));
    }
  }

  /**
   * Remove recommendation by resource (alternative endpoint)
   * POST /api/parent/resources/remove-recommendation
   * Body: { student_id, resource_type, resource_id }
   */
  async removeRecommendationByResource(req, res) {
    try {
      const data = await parseRequestBody(req);
      const { student_id, resource_type, resource_id } = data;
      const parent_id = req.user.id;

      if (!student_id || !resource_type || !resource_id) {
        return res.writeHead(400, { "Content-Type": "application/json" })
          .end(JSON.stringify({ error: "Missing required fields" }));
      }

      const result = await db.query(
        `DELETE FROM parent_resource_recommendations 
         WHERE parent_id = $1 AND student_id = $2 
         AND resource_type = $3 AND resource_id = $4
         RETURNING id`,
        [parent_id, student_id, resource_type, parseInt(resource_id)]
      );

      if (result.rows.length === 0) {
        return res.writeHead(404, { "Content-Type": "application/json" })
          .end(JSON.stringify({ error: "Recommendation not found" }));
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, message: "Recommendation removed" }));
    } catch (err) {
      console.error("Remove recommendation error:", err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Failed to remove recommendation" }));
    }
  }
}

module.exports = new ResourceController();