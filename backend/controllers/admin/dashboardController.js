// controllers/admin/dashboardController.js
const dashboardService = require("../../services/admin/dashboardService");

class DashboardController {
  async getOverview(req, res) {
    try {
      const stats = await dashboardService.getOverviewStats();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(stats));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }

  async getRecentActivity(req, res) {
    try {
      const activity = await dashboardService.getRecentActivity();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ activity }));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  }
}

module.exports = new DashboardController();
