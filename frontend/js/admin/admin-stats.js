// Admin Statistics, Approvals, and Activity Functions

// Load system overview statistics
async function loadSystemOverview() {
  try {
    const data = await adminApi.getSystemAnalytics();
    
    // Total users
    const totalUsersEl = document.getElementById("total-users");
    if (totalUsersEl) totalUsersEl.textContent = data.overviewStats.activeUsers || 0;
    
    // Active users
    const activeUsersEl = document.getElementById("active-users");
    if (activeUsersEl) activeUsersEl.textContent = data.mostActiveUsers ? data.mostActiveUsers.length : 0;
    
    // Total forums
    const totalForumsEl = document.getElementById("total-forums");
    if (totalForumsEl) totalForumsEl.textContent = data.overviewStats.activeForums || 0;
    
    // Total quizzes
    const totalQuizzesEl = document.getElementById("total-quizzes");
    if (totalQuizzesEl) totalQuizzesEl.textContent = (data.chartData && data.chartData.contentUploading) ? data.chartData.contentUploading[0] : 0;
    
    // Total notes
    const totalNotesEl = document.getElementById("total-notes");
    if (totalNotesEl) totalNotesEl.textContent = (data.chartData && data.chartData.contentUploading) ? data.chartData.contentUploading[1] : 0;

  } catch (error) {
    console.error("Failed to load system overview:", error);
  }
}

// Load pending verifications
async function loadPendingApprovals() {
  const verificationsList = document.getElementById("verifications-list") || document.getElementById("approvals-list");
  if (!verificationsList) return;

  try {
    const pendingItems = await adminApi.getPendingVerifications();
    
    verificationsList.innerHTML = "";

    if (!pendingItems || pendingItems.length === 0) {
      verificationsList.innerHTML = `<li>No pending verifications</li>`;
      return;
    }

    pendingItems.slice(0, 3).forEach((item) => {
      const li = document.createElement("li");
      const dateStr = new Date(item.submitted_at).toLocaleDateString();
      li.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
          <div>
            <div style="font-weight: 600;">${item.username}</div>
            <div style="font-size: 12px; color: rgba(255, 255, 255, 0.6);">${item.email}</div>
          </div>
          <div style="font-size: 12px; color: rgba(255, 255, 255, 0.6);">${dateStr}</div>
        </div>
      `;
      verificationsList.appendChild(li);
    });
  } catch (error) {
    console.error("Failed to load pending verifications:", error);
    verificationsList.innerHTML = `<li>Unable to load verifications</li>`;
  }
}

// Load helpdesk issue count
async function loadHelpdeskCount() {
  try {
    const requests = await adminApi.getAllHelpRequests();
    const countElement = document.getElementById("helpdesk-count");
    if (countElement) {
      // Pending statuses might be 'pending' or 'open'
      const pendingRequests = requests.filter(r => r.status === 'pending' || r.status === 'open');
      countElement.textContent = pendingRequests.length;
    }
  } catch (error) {
    console.error("Failed to load helpdesk count:", error);
  }
}

// Load recent activity
async function loadRecentActivity() {
  const activityList = document.getElementById("recent-activity-list");
  if (!activityList) return;

  try {
    const data = await adminApi.getSystemAnalytics();
    const recentActivities = data.mostActiveUsers || [];

    activityList.innerHTML = "";

    if (recentActivities.length === 0) {
      activityList.innerHTML = `<li style="padding: 16px 0; text-align: center; color: rgba(255, 255, 255, 0.6);">No recent activity</li>`;
      return;
    }

    recentActivities.forEach((activity) => {
      const li = document.createElement("li");
      // Use fallback icon if not provided
      const icon = activity.icon || "fa-user";
      li.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
          <i class="fas ${icon}" style="font-size: 18px; color: rgba(255, 255, 255, 0.7);"></i>
          <div style="flex: 1;">
            <div style="font-weight: 600; font-size: 14px;">${activity.name || activity.username || "Unknown"}</div>
            <div style="font-size: 12px; color: rgba(255, 255, 255, 0.6);">Highly active ${activity.role}</div>
          </div>
          <div style="font-size: 11px; color: rgba(255, 255, 255, 0.5); text-align: right;">Top user</div>
        </div>
      `;
      activityList.appendChild(li);
    });
  } catch (error) {
    console.error("Failed to load recent activity:", error);
  }
}
