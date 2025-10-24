// Admin Dashboard initialization and main functions
document.addEventListener("DOMContentLoaded", function () {
  loadDashboardTasks();
  updateWelcomeMessage();
  loadSystemOverview();
  loadPendingApprovals();
  loadHelpdeskCount();
  loadRecentActivity();
});

// Update welcome message with admin's name
function updateWelcomeMessage() {
  const username = localStorage.getItem("username");
  const welcomeHeading = document.getElementById("welcome-heading");
  if (username) {
    welcomeHeading.textContent = `Welcome ${username}`;
  }
}
