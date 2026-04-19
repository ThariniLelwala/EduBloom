// controllers/admin/helpController.js
const helpService = require("../../services/admin/helpService");

class HelpController {
  // ========== FAQs ==========

  /**
   * Get all FAQs
   * GET /api/admin/help/faqs
   */
  async getAllFAQs(req, res) {
    try {
      const faqs = await helpService.getAllFAQs();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ faqs }));
    } catch (err) {
      console.error("getAllFAQs error:", err);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ faqs: [] }));
    }
  }

  /**
   * Create FAQ
   * POST /api/admin/help/faqs
   */
  async createFAQ(req, res) {
    try {
      const { question, answer } = req.body || {};
      if (!question || !answer) {
        throw new Error("Question and answer are required");
      }
      const faq = await helpService.createFAQ(question, answer);
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ faq }));
    } catch (err) {
      console.error("createFAQ error:", err);
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Delete FAQ
   * DELETE /api/admin/help/faqs/:id
   */
  async deleteFAQ(req, res) {
    try {
      let pathname = req.url.split("?")[0];
      if (pathname.endsWith("/") && pathname.length > 1) {
        pathname = pathname.slice(0, -1);
      }
      const match = pathname.match(/\/api\/admin\/help\/faqs\/(\d+)$/);
      if (!match) {
        throw new Error("Invalid FAQ ID");
      }
      const id = parseInt(match[1]);
      const result = await helpService.deleteFAQ(id);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result));
    } catch (err) {
      console.error("deleteFAQ error:", err);
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  // ========== Help Requests ==========

  /**
   * Get all help requests
   * GET /api/admin/help/requests
   */
  async getAllHelpRequests(req, res) {
    try {
      const requests = await helpService.getAllHelpRequests();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ requests }));
    } catch (err) {
      console.error("getAllHelpRequests error:", err);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ requests: [] }));
    }
  }

  /**
   * Get help request by ID
   * GET /api/admin/help/requests/:id
   */
  async getHelpRequest(req, res) {
    try {
      let pathname = req.url.split("?")[0];
      if (pathname.endsWith("/") && pathname.length > 1) {
        pathname = pathname.slice(0, -1);
      }
      const match = pathname.match(/\/api\/admin\/help\/requests\/(\d+)$/);
      if (!match) {
        throw new Error("Invalid request ID");
      }
      const id = parseInt(match[1]);
      const request = await helpService.getHelpRequestById(id);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ request }));
    } catch (err) {
      console.error("getHelpRequest error:", err);
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Reply to help request
   * POST /api/admin/help/requests/:id/reply
   */
  async replyToHelpRequest(req, res) {
    try {
      let pathname = req.url.split("?")[0];
      if (pathname.endsWith("/") && pathname.length > 1) {
        pathname = pathname.slice(0, -1);
      }
      const match = pathname.match(/\/api\/admin\/help\/requests\/(\d+)\/reply$/);
      if (!match) {
        throw new Error("Invalid request ID");
      }
      const id = parseInt(match[1]);
      const { reply } = req.body || {};
      if (!reply) {
        throw new Error("Reply is required");
      }
      const repliedBy = req.user?.id || null;
      const result = await helpService.replyToHelpRequest(id, reply, repliedBy);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Reply sent", request: result }));
    } catch (err) {
      console.error("replyToHelpRequest error:", err);
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  /**
   * Update help request status
   * PUT /api/admin/help/requests/:id/status
   */
  async updateHelpRequestStatus(req, res) {
    try {
      let pathname = req.url.split("?")[0];
      if (pathname.endsWith("/") && pathname.length > 1) {
        pathname = pathname.slice(0, -1);
      }
      const match = pathname.match(/\/api\/admin\/help\/requests\/(\d+)\/status$/);
      if (!match) {
        throw new Error("Invalid request ID");
      }
      const id = parseInt(match[1]);
      const { status } = req.body || {};
      if (!status) {
        throw new Error("Status is required");
      }
      const result = await helpService.updateHelpRequestStatus(id, status);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Status updated", request: result }));
    } catch (err) {
      console.error("updateHelpRequestStatus error:", err);
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }
}

module.exports = new HelpController();