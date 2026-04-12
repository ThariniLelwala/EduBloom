// controllers/admin/analyticsController.js
const analyticsService = require("../../services/admin/analyticsService");

class AnalyticsController {
  async getOverview(req, res) {
    try {
      const stats = await analyticsService.getOverviewStats();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(stats));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async getUserGrowth(req, res) {
    try {
      const data = await analyticsService.getUserGrowth();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(data));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async getDailyLogins(req, res) {
    try {
      const data = await analyticsService.getDailyLogins();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(data));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async getContentDistribution(req, res) {
    try {
      const data = await analyticsService.getContentDistribution();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(data));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async getMostActiveUsers(req, res) {
    try {
      const users = await analyticsService.getMostActiveUsers();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ users }));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }
}

module.exports = new AnalyticsController();
