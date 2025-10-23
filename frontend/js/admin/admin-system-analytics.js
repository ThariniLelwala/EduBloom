// System Analytics Statistics Functions

// Load all system analytics statistics
function loadSystemAnalyticsStats() {
  loadActiveUsers();
  loadActiveForums();
  loadNewRegistrations();
  loadTodayLogins();
}

function loadActiveUsers() {
  const activeUsersCount = getActiveUsersCount();
  const element = document.getElementById("active-users-count");
  if (element) {
    element.textContent = activeUsersCount;
  }
}

function getActiveUsersCount() {
  // Get active users from localStorage or return simulated data
  const activeUsers = JSON.parse(localStorage.getItem("activeUsers")) || [];
  return activeUsers.length || 142;
}

function loadActiveForums() {
  const activeForumsCount = getActiveForumsCount();
  const element = document.getElementById("active-forums-count");
  if (element) {
    element.textContent = activeForumsCount;
  }
}

function getActiveForumsCount() {
  // Get active forums from localStorage or return simulated data
  const activeForums = JSON.parse(localStorage.getItem("activeForums")) || [];
  return activeForums.length || 18;
}

function loadNewRegistrations() {
  const newRegistrationsCount = getNewRegistrationsCount();
  const element = document.getElementById("new-registrations-count");
  if (element) {
    element.textContent = newRegistrationsCount;
  }
}

function getNewRegistrationsCount() {
  // Get new registrations from localStorage or return simulated data
  const newRegistrations =
    JSON.parse(localStorage.getItem("newRegistrations")) || [];
  return newRegistrations.length || 23;
}

function loadTodayLogins() {
  const todayLoginsCount = getTodayLoginsCount();
  const element = document.getElementById("today-logins-count");
  if (element) {
    element.textContent = todayLoginsCount;
  }
}

function getTodayLoginsCount() {
  // Get today's logins from localStorage or return simulated data
  const todayLogins = JSON.parse(localStorage.getItem("todayLogins")) || [];
  return todayLogins.length || 87;
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  loadSystemAnalyticsStats();
  initializeCharts();
  loadMostActiveUsers();
});

// ===== Chart Initialization =====

function initializeCharts() {
  initializeUserGrowthChart();
  initializeDailyLoginsChart();
  initializeContentUploadingChart();
  initializeBusiestTimesChart();
}

// User Growth Chart
function initializeUserGrowthChart() {
  const ctx = document.getElementById("user-growth-chart");
  if (!ctx) return;

  new Chart(ctx, {
    type: "line",
    data: {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"],
      datasets: [
        {
          label: "New Users",
          data: [12, 19, 15, 25, 22, 30],
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
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          labels: {
            color: "rgba(255, 255, 255, 0.8)",
            font: {
              size: 12,
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: "rgba(255, 255, 255, 0.6)",
          },
          grid: {
            color: "rgba(255, 255, 255, 0.05)",
          },
        },
        x: {
          ticks: {
            color: "rgba(255, 255, 255, 0.6)",
          },
          grid: {
            color: "rgba(255, 255, 255, 0.05)",
          },
        },
      },
    },
  });
}

// Daily Logins Chart
function initializeDailyLoginsChart() {
  const ctx = document.getElementById("daily-logins-chart");
  if (!ctx) return;

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [
        {
          label: "Daily Logins",
          data: [65, 72, 58, 85, 92, 78, 88],
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          borderColor: "rgba(255, 255, 255, 0.8)",
          borderWidth: 1.5,
          borderRadius: 6,
          hoverBackgroundColor: "rgba(255, 255, 255, 0.3)",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          labels: {
            color: "rgba(255, 255, 255, 0.8)",
            font: {
              size: 12,
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: "rgba(255, 255, 255, 0.6)",
          },
          grid: {
            color: "rgba(255, 255, 255, 0.05)",
          },
        },
        x: {
          ticks: {
            color: "rgba(255, 255, 255, 0.6)",
          },
          grid: {
            color: "rgba(255, 255, 255, 0.05)",
          },
        },
      },
    },
  });
}

// Content Uploading Trend Chart
function initializeContentUploadingChart() {
  const ctx = document.getElementById("content-uploading-chart");
  if (!ctx) return;

  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Quizzes", "Notes", "Forums"],
      datasets: [
        {
          data: [35, 45, 20],
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
            font: {
              size: 12,
            },
            padding: 16,
          },
        },
      },
    },
  });
}

// Busiest Times of the Day Chart
function initializeBusiestTimesChart() {
  const ctx = document.getElementById("busiest-times-chart");
  if (!ctx) return;

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["6AM", "9AM", "12PM", "3PM", "6PM", "9PM"],
      datasets: [
        {
          label: "Active Users",
          data: [45, 82, 95, 88, 120, 72],
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          borderColor: "rgba(255, 255, 255, 0.8)",
          borderWidth: 1.5,
          borderRadius: 6,
          hoverBackgroundColor: "rgba(255, 255, 255, 0.3)",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          labels: {
            color: "rgba(255, 255, 255, 0.8)",
            font: {
              size: 12,
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: "rgba(255, 255, 255, 0.6)",
          },
          grid: {
            color: "rgba(255, 255, 255, 0.05)",
          },
        },
        x: {
          ticks: {
            color: "rgba(255, 255, 255, 0.6)",
          },
          grid: {
            color: "rgba(255, 255, 255, 0.05)",
          },
        },
      },
    },
  });
}

// ===== Most Active Users =====

function loadMostActiveUsers() {
  const mostActiveUsers = getMostActiveUsers();
  renderMostActiveUsers(mostActiveUsers);
}

function getMostActiveUsers() {
  const users = localStorage.getItem("users")
    ? JSON.parse(localStorage.getItem("users"))
    : getDefaultMostActiveUsers();
  return users;
}

function getDefaultMostActiveUsers() {
  return [
    {
      id: 1,
      name: "Alex Johnson",
      role: "student",
      activityCount: 156,
      icon: "fa-user-graduate",
    },
    {
      id: 2,
      name: "Sarah Williams",
      role: "teacher",
      activityCount: 142,
      icon: "fa-chalkboard-user",
    },
    {
      id: 3,
      name: "Mike Chen",
      role: "student",
      activityCount: 128,
      icon: "fa-user-graduate",
    },
    {
      id: 4,
      name: "Emma Davis",
      role: "teacher",
      activityCount: 115,
      icon: "fa-chalkboard-user",
    },
    {
      id: 5,
      name: "James Wilson",
      role: "parent",
      activityCount: 98,
      icon: "fa-people-roof",
    },
  ];
}

function renderMostActiveUsers(users) {
  const container = document.getElementById("most-active-users-container");
  if (!container) return;

  container.innerHTML = "";

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
          <div class="active-user-role">${user.role}</div>
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
