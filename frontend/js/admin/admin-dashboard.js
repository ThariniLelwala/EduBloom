// Admin Dashboard - Connected to Backend API

document.addEventListener("DOMContentLoaded", async () => {
  await loadDashboardData();
  bindDashboardEvents();
});

async function loadDashboardData() {
  await Promise.all([
    loadSystemOverview(),
    loadRecentActivity(),
    loadHelpdeskCount()
  ]);
}

async function loadSystemOverview() {
  try {
    const stats = await adminApi.getDashboardOverview();
    document.getElementById("total-users").textContent = stats.totalUsers || 0;
    document.getElementById("active-users").textContent = stats.activeUsers || 0;
    document.getElementById("total-forums").textContent = stats.totalForums || 0;
    document.getElementById("total-quizzes").textContent = stats.totalQuizzes || 0;
    document.getElementById("total-notes").textContent = stats.totalNotes || 0;
    document.getElementById("verifications-list").innerHTML = stats.pendingVerifications > 0
      ? `<li style="padding: 8px 0;">${stats.pendingVerifications} pending</li>`
      : `<li style="padding: 8px 0;">No pending</li>`;
  } catch (error) {
    console.error("Error loading system overview:", error);
  }
}

async function loadRecentActivity() {
  try {
    const activity = await adminApi.getDashboardActivity();
    const list = document.getElementById("recent-activity-list");
    if (!list) return;

    if (activity.length === 0) {
      list.innerHTML = `<li style="padding: 16px 0; text-align: center;">No recent activity</li>`;
      return;
    }

    list.innerHTML = "";
    activity.forEach(item => {
      const timeAgo = getTimeAgo(new Date(item.timestamp));
      list.innerHTML += `
        <li>
          <div style="display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
            <i class="fas fa-circle" style="font-size: 8px; color: rgba(255, 255, 255, 0.5);"></i>
            <div style="flex: 1;">
              <div style="font-weight: 600; font-size: 14px;">${item.user}</div>
              <div style="font-size: 12px; color: rgba(255, 255, 255, 0.6);">${item.action}</div>
            </div>
            <div style="font-size: 11px; color: rgba(255, 255, 255, 0.5);">${timeAgo}</div>
          </div>
        </li>
      `;
    });
  } catch (error) {
    console.error("Error loading activity:", error);
  }
}

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 }
  ];
  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
  }
  return 'Just now';
}

async function loadHelpdeskCount() {
  document.getElementById("helpdesk-count").textContent = "0";
}

function bindDashboardEvents() {
  const modal = document.getElementById("task-modal");
  document.getElementById("modal-close")?.addEventListener("click", () => modal?.classList.remove("show"));
  document.getElementById("modal-cancel")?.addEventListener("click", () => modal?.classList.remove("show"));
}

function updateWelcomeMessage() {
  const username = localStorage.getItem("username");
  const welcomeHeading = document.getElementById("welcome-heading");
  if (username && welcomeHeading) {
    welcomeHeading.textContent = `Welcome ${username}`;
  }
}
