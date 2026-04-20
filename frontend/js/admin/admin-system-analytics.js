// System Analytics - Connected to Backend API

// Chart references
let charts = {};

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  loadSystemAnalytics();
});

async function loadSystemAnalytics() {
  try {
    const data = await adminApi.getSystemAnalytics();
    
    // 1. Update Overview Stats
    updateOverviewStats(data.overviewStats);

    // 2. Initialize/Update Charts
    initializeCharts(data.chartData);

    // 3. Render Most Active Users
    renderMostActiveUsers(data.mostActiveUsers);

  } catch (error) {
    console.error("Failed to load system analytics:", error);
    // Display fallback or error message state if needed
    document.getElementById("active-users-count").textContent = "Error";
    document.getElementById("active-forums-count").textContent = "Error";
    document.getElementById("new-registrations-count").textContent = "Error";
  }
}

function updateOverviewStats(stats) {
  const activeUsersEl = document.getElementById("active-users-count");
  if (activeUsersEl) activeUsersEl.textContent = stats.activeUsers;

  const activeForumsEl = document.getElementById("active-forums-count");
  if (activeForumsEl) activeForumsEl.textContent = stats.activeForums;

  const newRegEl = document.getElementById("new-registrations-count");
  if (newRegEl) newRegEl.textContent = stats.newRegistrations;
}

// ===== Chart Initialization =====

function initializeCharts(chartData) {
  initializeUserGrowthChart(chartData.userGrowth);
  initializeContentUploadingChart(chartData.contentUploading);
}

// User Growth Chart
function initializeUserGrowthChart(data) {
  const ctx = document.getElementById("user-growth-chart");
  if (!ctx) return;

  if (charts.userGrowth) charts.userGrowth.destroy();

  charts.userGrowth = new Chart(ctx, {
    type: "line",
    data: {
      labels: data.labels,
      datasets: [
        {
          label: "New Users",
          data: data.data,
          borderColor: "rgba(255, 255, 255, 0.8)",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: "rgba(255, 255, 255, 0.9)",
          pointBorderColor: "rgba(255, 255, 255, 0.8)",
          pointRadius: 5,
          pointHoverRadius: 7,
        },
      ],
    },
    options: getChartOptions()
  });
}

// Content Uploading Trend Chart
function initializeContentUploadingChart(data) {
  const ctx = document.getElementById("content-uploading-chart");
  if (!ctx) return;

  if (charts.contentUploading) charts.contentUploading.destroy();

  charts.contentUploading = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Quizzes", "Notes", "Forums"],
      datasets: [
        {
          data: data,
          backgroundColor: [
            "rgba(255, 255, 255, 0.3)",
            "rgba(255, 255, 255, 0.5)",
            "rgba(255, 255, 255, 0.2)",
          ],
          borderColor: [
            "rgba(255, 255, 255, 0.8)",
            "rgba(255, 255, 255, 0.8)",
            "rgba(255, 255, 255, 0.8)",
          ],
          borderWidth: 2,
          hoverBackgroundColor: [
            "rgba(255, 255, 255, 0.4)",
            "rgba(255, 255, 255, 0.6)",
            "rgba(255, 255, 255, 0.3)",
          ],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "rgba(255, 255, 255, 0.8)",
            font: { size: 12 },
            padding: 16,
          },
        },
      },
    },
  });
}

function getChartOptions() {
  return {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        labels: {
          color: "rgba(255, 255, 255, 0.8)",
          font: { size: 12 },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: "rgba(255, 255, 255, 0.6)" },
        grid: { color: "rgba(255, 255, 255, 0.05)" },
      },
      x: {
        ticks: { color: "rgba(255, 255, 255, 0.6)" },
        grid: { color: "rgba(255, 255, 255, 0.05)" },
      },
    },
  };
}

// ===== Most Active Users =====

function renderMostActiveUsers(users) {
  const container = document.getElementById("most-active-users-container");
  if (!container) return;

  container.innerHTML = "";
  
  if (!users || users.length === 0) {
    container.innerHTML = '<div style="color: rgba(255,255,255,0.6); text-align: center; padding: 20px;">No user activity recorded yet.</div>';
    return;
  }

  users.forEach((user) => {
    const userItem = document.createElement("div");
    userItem.className = "active-user-item";
    userItem.innerHTML = `
      <div class="active-user-info">
        <div class="active-user-avatar">
          <i class="fas ${user.icon}"></i>
        </div>
        <div class="active-user-details">
          <div class="active-user-name">${user.name}</div>
          <div class="active-user-role text-capitalize">${user.role}</div>
        </div>
      </div>
      <div class="active-user-activity">
        <i class="fas fa-zap activity-icon"></i>
        <span>${user.activityCount} actions</span>
      </div>
    `;
    container.appendChild(userItem);
  });
}
