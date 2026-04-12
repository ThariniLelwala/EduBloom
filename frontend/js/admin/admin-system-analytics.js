// System Analytics - Connected to Backend API

document.addEventListener("DOMContentLoaded", async () => {
  await loadSystemAnalyticsStats();
  await initializeCharts();
  await loadMostActiveUsers();
});

async function loadSystemAnalyticsStats() {
  try {
    const stats = await adminApi.getAnalyticsOverview();
    document.getElementById("active-users-count").textContent = stats.activeUsers || 0;
    document.getElementById("active-forums-count").textContent = stats.activeForums || 0;
    document.getElementById("new-registrations-count").textContent = stats.newRegistrations || 0;
    document.getElementById("today-logins-count").textContent = stats.todayLogins || 0;
  } catch (error) {
    console.error("Error loading stats:", error);
  }
}

async function initializeCharts() {
  await Promise.all([
    initializeUserGrowthChart(),
    initializeDailyLoginsChart(),
    initializeContentUploadingChart(),
    initializeBusiestTimesChart()
  ]);
}

async function initializeUserGrowthChart() {
  const ctx = document.getElementById("user-growth-chart");
  if (!ctx) return;

  try {
    const data = await adminApi.getUserGrowthData();
    new Chart(ctx, {
      type: "line",
      data: {
        labels: data.labels || ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"],
        datasets: [{
          label: "New Users",
          data: data.data || [0, 0, 0, 0, 0, 0],
          borderColor: "rgba(255, 255, 255, 0.8)",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: "rgba(255, 255, 255, 0.9)"
        }]
      },
      options: getChartOptions()
    });
  } catch (error) {
    console.error("Error loading user growth chart:", error);
  }
}

async function initializeDailyLoginsChart() {
  const ctx = document.getElementById("daily-logins-chart");
  if (!ctx) return;

  try {
    const data = await adminApi.getDailyLoginsData();
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: data.labels || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [{
          label: "Daily Activity",
          data: data.data || [0, 0, 0, 0, 0, 0, 0],
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          borderColor: "rgba(255, 255, 255, 0.8)",
          borderWidth: 1.5,
          borderRadius: 6
        }]
      },
      options: getChartOptions()
    });
  } catch (error) {
    console.error("Error loading daily logins chart:", error);
  }
}

async function initializeContentUploadingChart() {
  const ctx = document.getElementById("content-uploading-chart");
  if (!ctx) return;

  try {
    const data = await adminApi.getContentDistributionData();
    new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: data.labels || ['Quizzes', 'Notes', 'Forums'],
        datasets: [{
          data: data.data || [1, 1, 1],
          backgroundColor: [
            "rgba(255, 255, 255, 0.3)",
            "rgba(255, 255, 255, 0.5)",
            "rgba(255, 255, 255, 0.2)"
          ],
          borderColor: "rgba(255, 255, 255, 0.8)",
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: "rgba(255, 255, 255, 0.8)", padding: 16 }
          }
        }
      }
    });
  } catch (error) {
    console.error("Error loading content chart:", error);
  }
}

async function initializeBusiestTimesChart() {
  const ctx = document.getElementById("busiest-times-chart");
  if (!ctx) return;

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["6AM", "9AM", "12PM", "3PM", "6PM", "9PM"],
      datasets: [{
        label: "Activity Level",
        data: [45, 82, 95, 88, 120, 72],
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        borderColor: "rgba(255, 255, 255, 0.8)",
        borderWidth: 1.5,
        borderRadius: 6
      }]
    },
    options: getChartOptions()
  });
}

function getChartOptions() {
  return {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { labels: { color: "rgba(255, 255, 255, 0.8)" } }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: "rgba(255, 255, 255, 0.6)" },
        grid: { color: "rgba(255, 255, 255, 0.05)" }
      },
      x: {
        ticks: { color: "rgba(255, 255, 255, 0.6)" },
        grid: { color: "rgba(255, 255, 255, 0.05)" }
      }
    }
  };
}

async function loadMostActiveUsers() {
  const container = document.getElementById("most-active-users-container");
  if (!container) return;

  try {
    const users = await adminApi.getMostActiveUsers();
    container.innerHTML = "";

    if (users.length === 0) {
      container.innerHTML = '<p style="padding: 16px; text-align: center; color: rgba(255,255,255,0.6);">No activity data yet</p>';
      return;
    }

    users.forEach(user => {
      container.innerHTML += `
        <div class="active-user-item">
          <div class="active-user-info">
            <div class="active-user-avatar">
              <i class="fas ${user.icon || 'fa-user'}"></i>
            </div>
            <div class="active-user-details">
              <div class="active-user-name">${user.name}</div>
              <div class="active-user-role">${user.role}</div>
            </div>
          </div>
          <div class="active-user-activity">
            <i class="fas fa-zap activity-icon"></i>
            <span>${user.activityCount || 0} actions</span>
          </div>
        </div>
      `;
    });
  } catch (error) {
    console.error("Error loading active users:", error);
    container.innerHTML = '<p style="padding: 16px; text-align: center; color: rgba(255,255,255,0.6);">Unable to load data</p>';
  }
}
