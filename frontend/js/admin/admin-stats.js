// Admin Statistics, Approvals, and Activity Functions

// Load system overview statistics
function loadSystemOverview() {
  // Total users
  const totalUsers = getTotalUsersCount();
  document.getElementById("total-users").textContent = totalUsers;

  // Active users
  const activeUsers = getActiveUsersCount();
  document.getElementById("active-users").textContent = activeUsers;

  // Total forums
  const totalForums = getTotalForumsCount();
  document.getElementById("total-forums").textContent = totalForums;

  // Total quizzes
  const totalQuizzes = getTotalQuizzesCount();
  document.getElementById("total-quizzes").textContent = totalQuizzes;

  // Total notes
  const totalNotes = getTotalNotesCount();
  document.getElementById("total-notes").textContent = totalNotes;
}

function getTotalUsersCount() {
  // Count users from localStorage or return simulated data
  const students = JSON.parse(localStorage.getItem("students")) || [];
  const teachers = JSON.parse(localStorage.getItem("teachers")) || [];
  const parents = JSON.parse(localStorage.getItem("parents")) || [];
  return students.length + teachers.length + parents.length || 45;
}

function getActiveUsersCount() {
  // Simulate active users
  return Math.floor(Math.random() * 20) + 8;
}

function getTotalForumsCount() {
  // Count forums from localStorage
  const forums = JSON.parse(localStorage.getItem("forums")) || [];
  return forums.length || 12;
}

function getTotalQuizzesCount() {
  // Count quizzes from localStorage
  const quizzes = JSON.parse(localStorage.getItem("quizzes")) || [];
  return quizzes.length || 28;
}

function getTotalNotesCount() {
  // Count notes from localStorage
  const notes = JSON.parse(localStorage.getItem("notes")) || [];
  return notes.length || 35;
}

// Load pending verifications
function loadPendingApprovals() {
  const verificationsList = document.getElementById("verifications-list");
  if (!verificationsList) return;

  // Get pending verifications from backend or simulate
  const pendingItems = [
    {
      id: 1,
      teacher: "John Doe",
      type: "Certification",
      date: "2025-10-20",
    },
    {
      id: 2,
      teacher: "Sarah Smith",
      type: "Material Review",
      date: "2025-10-21",
    },
    {
      id: 3,
      teacher: "Mike Johnson",
      type: "Profile Verification",
      date: "2025-10-22",
    },
  ];

  verificationsList.innerHTML = "";

  if (pendingItems.length === 0) {
    verificationsList.innerHTML = `<li>No pending verifications</li>`;
    return;
  }

  pendingItems.slice(0, 3).forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
        <div>
          <div style="font-weight: 600;">${item.teacher}</div>
          <div style="font-size: 12px; color: rgba(255, 255, 255, 0.6);">${item.type}</div>
        </div>
        <div style="font-size: 12px; color: rgba(255, 255, 255, 0.6);">${item.date}</div>
      </div>
    `;
    verificationsList.appendChild(li);
  });
}

// Load helpdesk issue count
function loadHelpdeskCount() {
  const helpdeskCount = getHelpdeskIssueCount();
  const countElement = document.getElementById("helpdesk-count");
  if (countElement) {
    countElement.textContent = helpdeskCount;
  }
}

function getHelpdeskIssueCount() {
  // Count help desk issues from localStorage
  const issues = JSON.parse(localStorage.getItem("helpdesk_issues")) || [];
  return issues.length || 5;
}

// Load recent activity
function loadRecentActivity() {
  const activityList = document.getElementById("recent-activity-list");
  if (!activityList) return;

  // Get recent activities from backend or simulate
  const recentActivities = [
    {
      id: 1,
      user: "John Doe",
      action: "Created new quiz",
      timestamp: "2 hours ago",
      icon: "fas fa-plus-circle",
    },
    {
      id: 2,
      user: "Sarah Smith",
      action: "Uploaded course materials",
      timestamp: "4 hours ago",
      icon: "fas fa-upload",
    },
    {
      id: 3,
      user: "Mike Johnson",
      action: "Posted in forum",
      timestamp: "6 hours ago",
      icon: "fas fa-comments",
    },
    {
      id: 4,
      user: "Emily Brown",
      action: "Completed a quiz",
      timestamp: "8 hours ago",
      icon: "fas fa-check-circle",
    },
    {
      id: 5,
      user: "Alex Davis",
      action: "Submitted assignment",
      timestamp: "10 hours ago",
      icon: "fas fa-file-upload",
    },
  ];

  activityList.innerHTML = "";

  if (recentActivities.length === 0) {
    activityList.innerHTML = `<li style="padding: 16px 0; text-align: center; color: rgba(255, 255, 255, 0.6);">No recent activity</li>`;
    return;
  }

  recentActivities.forEach((activity) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
        <i class="${activity.icon}" style="font-size: 18px; color: rgba(255, 255, 255, 0.7);"></i>
        <div style="flex: 1;">
          <div style="font-weight: 600; font-size: 14px;">${activity.user}</div>
          <div style="font-size: 12px; color: rgba(255, 255, 255, 0.6);">${activity.action}</div>
        </div>
        <div style="font-size: 11px; color: rgba(255, 255, 255, 0.5); text-align: right;">${activity.timestamp}</div>
      </div>
    `;
    activityList.appendChild(li);
  });
}
