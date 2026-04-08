// controllers/teacher/forumController.js
const forumService = require("../../services/teacher/forumService");
const { parseRequestBody } = require("../../middleware/authMiddleware");

class ForumController {
  /**
   * Get all published forums
   * GET /api/teacher/forums
   */
  async getAllForums(req, res) {
    try {
      const forums = await forumService.getAllForums();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(forums));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Get forums created by the current teacher
   * GET /api/teacher/forums/my
   */
  async getMyForums(req, res) {
    try {
      const teacherId = req.user.id;
      const forums = await forumService.getTeacherForums(teacherId);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(forums));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Get a single forum with replies
   * GET /api/teacher/forums/:postId
   */
  async getForum(req, res) {
    try {
      const pathname = req.url.split("?")[0];
      const postId = parseInt(pathname.split("/")[4]);

      if (isNaN(postId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid post ID" }));
        return;
      }

      const forum = await forumService.getForumById(postId);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(forum));
    } catch (err) {
      res.writeHead(err.message === "Forum not found" ? 404 : 500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Create a new forum post
   * POST /api/teacher/forums/create
   */
  async createForum(req, res) {
    try {
      const teacherId = req.user.id;
      const data = await parseRequestBody(req);
      const { title, description, tags, published, targetGrade } = data;

      if (!title || !description) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Title and description are required" }));
        return;
      }

      const forum = await forumService.createForum(teacherId, title, description, tags, published, targetGrade);
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(forum));
    } catch (err) {
      console.error("[ForumController] createForum error:", err.message, err.stack);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Update an existing forum post
   * PUT /api/teacher/forums/:postId
   */
  async updateForum(req, res) {
    try {
      const teacherId = req.user.id;
      const pathname = req.url.split("?")[0];
      const postId = parseInt(pathname.split("/")[4]);
      const data = await parseRequestBody(req);
      const { title, description, tags, published } = data;

      if (isNaN(postId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid post ID" }));
        return;
      }

      const result = await forumService.updateForum(postId, teacherId, title, description, tags, published);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(err.message.includes("unauthorized") ? 403 : 500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Delete a forum post
   * DELETE /api/teacher/forums/:postId
   */
  async deleteForum(req, res) {
    try {
      const teacherId = req.user.id;
      const pathname = req.url.split("?")[0];
      const postId = parseInt(pathname.split("/")[4]);

      if (isNaN(postId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid post ID" }));
        return;
      }

      const result = await forumService.deleteForum(postId, teacherId);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(err.message.includes("unauthorized") ? 403 : 500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Add a reply to a forum post
   * POST /api/teacher/forums/:postId/replies
   */
  async addReply(req, res) {
    try {
      const userId = req.user.id;
      const pathname = req.url.split("?")[0];
      const postId = parseInt(pathname.split("/")[4]);
      const data = await parseRequestBody(req);
      const { content } = data;

      if (isNaN(postId) || !content) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid post ID or empty content" }));
        return;
      }

      const reply = await forumService.addReply(postId, userId, content);
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(reply));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Delete a reply
   * DELETE /api/teacher/forums/:postId/replies/:replyId
   */
  async deleteReply(req, res) {
    try {
      const userId = req.user.id;
      const role = req.user.role;
      const pathname = req.url.split("?")[0];
      const parts = pathname.split("/");
      const replyId = parseInt(parts[6]);

      if (isNaN(replyId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid reply ID" }));
        return;
      }

      const result = await forumService.deleteReply(replyId, userId, role);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      res.writeHead(err.message.includes("unauthorized") ? 403 : 500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Increment forum view count
   * POST /api/teacher/forums/:postId/view
   */
  async incrementViews(req, res) {
    try {
      const pathname = req.url.split("?")[0];
      const postId = parseInt(pathname.split("/")[4]);

      if (isNaN(postId)) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid post ID" }));
        return;
      }

      await forumService.incrementViews(postId);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true }));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Get all unique tags
   * GET /api/teacher/forums/tags
   */
  async getTags(req, res) {
    try {
      const tags = await forumService.getAvailableTags();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(tags));
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }
}

module.exports = new ForumController();
