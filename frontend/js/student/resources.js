// Resources Page JavaScript

document.addEventListener("DOMContentLoaded", function () {
  initializeResources();
});

function initializeResources() {
  // Load dynamic data if available
  loadResourceStats();
  loadRecentActivity();

  // Set up event listeners for buttons
  setupNavigation();
}

function loadResourceStats() {
  // Load forum statistics
  const activeForums = localStorage.getItem("activeForums") || 5;
  document.getElementById("active-forums").textContent = activeForums;

  // Load notes count
  const notesCount = localStorage.getItem("notesCount") || 24;
  document.getElementById("notes-count").textContent = notesCount;

  // Load quiz count
  const quizCount = localStorage.getItem("quizCount") || 18;
  document.getElementById("quiz-count").textContent = quizCount;
}

function loadRecentActivity() {
  // This could load from localStorage or an API
  // For now, we'll keep the static content
  const activityList = document.getElementById("recent-activity");

  // Example of dynamic loading (commented out for now)
  /*
    const activities = JSON.parse(localStorage.getItem('recentActivities')) || [];
    if (activities.length > 0) {
        activityList.innerHTML = '';
        activities.forEach(activity => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            activityItem.innerHTML = `
                <i class="${activity.icon}"></i>
                <span>${activity.description}</span>
                <small>${activity.time}</small>
            `;
            activityList.appendChild(activityItem);
        });
    }
    */
}

function setupNavigation() {
  // Navigation functions for different resource types
  window.openForums = function () {
    // Navigate to teacher forums section
    showNotification("Opening Teacher Forums...", "info");
    // For now, we'll show coming soon message
    setTimeout(() => {
      showNotification("Teacher Forums feature coming soon!", "info");
    }, 1000);
  };

  window.openTeacherNotes = function () {
    // Navigate to teacher notes section
    showNotification("Opening Teacher Notes...", "info");
    // For now, show coming soon message since these are teacher-uploaded
    setTimeout(() => {
      showNotification("Teacher Notes feature coming soon!", "info");
    }, 1000);
  };

  window.openTeacherQuizzes = function () {
    // Navigate to teacher quizzes section
    showNotification("Opening Teacher Quizzes...", "info");
    // For now, show coming soon message since these are teacher-created
    setTimeout(() => {
      showNotification("Teacher Quizzes feature coming soon!", "info");
    }, 1000);
  };
}

function showNotification(message, type = "info") {
  // Create a simple notification
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(74, 222, 128, 0.9);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;

  document.body.appendChild(notification);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Add notification animations to the page
const style = document.createElement("style");
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Forum topics interaction
document.addEventListener("click", function (e) {
  if (e.target.closest(".forum-topic")) {
    const topic = e.target.closest(".forum-topic");
    const topicTitle = topic.querySelector(".topic-title").textContent;
    showNotification(`Opening forum: ${topicTitle}`, "info");
  }
});

// Subject notes interaction
document.addEventListener("click", function (e) {
  if (e.target.closest(".subject-note")) {
    const subject = e.target.closest(".subject-note");
    const subjectName = subject.querySelector(".subject-name").textContent;
    showNotification(`Opening teacher notes for ${subjectName}`, "info");
    // Could navigate to specific subject teacher notes
  }
});

// Subject quizzes interaction
document.addEventListener("click", function (e) {
  if (e.target.closest(".subject-quiz")) {
    const subject = e.target.closest(".subject-quiz");
    const subjectName = subject.querySelector(".subject-name").textContent;
    showNotification(`Opening teacher quizzes for ${subjectName}`, "info");
    // Could navigate to specific subject teacher quizzes
  }
});
