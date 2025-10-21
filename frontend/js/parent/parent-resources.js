// Parent Resources Page JavaScript

document.addEventListener("DOMContentLoaded", function () {
  initializeParentResources();
});

let selectedResources = [];
let currentViewedResource = null;

function initializeParentResources() {
  loadResourceStats();
  loadChildActivity();
  loadSelectedResources();
  setupEventListeners();
  setupModalListeners();
  initCustomSelects();
  // Set default filter to show all resources
  filterByType("all");
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

  // Load child's usage stats
  const resourcesAccessed =
    localStorage.getItem("childResourcesAccessed") || 12;
  const forumsParticipated =
    localStorage.getItem("childForumsParticipated") || 3;
  const quizzesCompleted = localStorage.getItem("childQuizzesCompleted") || 8;

  document.getElementById("resources-accessed").textContent = resourcesAccessed;
  document.getElementById("forums-participated").textContent =
    forumsParticipated;
  document.getElementById("quizzes-completed").textContent = quizzesCompleted;
}

function loadChildActivity() {
  // Load child's recent activity (could be from API/localStorage)
  const activityList = document.getElementById("child-activity");

  // For now, keep static content, but could be dynamic
  // This would typically load from child's activity log
}

function loadSelectedResources() {
  // Load previously selected resources from localStorage
  const saved = localStorage.getItem("parentSelectedResources");
  if (saved) {
    selectedResources = JSON.parse(saved);
    updateSelectedResourcesDisplay();
  }
}

function setupEventListeners() {
  // Modal event listeners
  setupModalListeners();
}

function setupModalListeners() {
  // Recommendation modal
  document
    .getElementById("recommendation-modal-close")
    .addEventListener("click", closeRecommendationModal);
  document
    .getElementById("recommendation-cancel")
    .addEventListener("click", closeRecommendationModal);
  document
    .getElementById("recommendation-confirm")
    .addEventListener("click", confirmRecommendation);

  // Resource view modal
  document
    .getElementById("resource-view-modal-close")
    .addEventListener("click", closeResourceViewModal);
  document
    .getElementById("resource-view-cancel")
    .addEventListener("click", closeResourceViewModal);
}

function filterByType(type) {
  // Update active button
  document.querySelectorAll(".resource-type-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  document.querySelector(`[data-type="${type}"]`).classList.add("active");

  // Show/hide resource cards based on type
  const resourceCards = document.querySelectorAll(".resource-card");

  if (type === "all") {
    resourceCards.forEach((card) => {
      card.style.display = "block";
    });
  } else {
    resourceCards.forEach((card) => {
      if (card.dataset.type === type) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });
  }

  showNotification(
    `Showing ${type === "all" ? "all resources" : type}`,
    "info"
  );
}

function viewResource(type, title, description) {
  // Store current resource info for selection
  currentViewedResource = { type, title, description };

  // Update modal content
  document.getElementById("resource-view-title").textContent = title;
  document.getElementById("resource-description").textContent = description;

  // Update type badge
  const typeBadge = document.getElementById("resource-type-badge");
  const typeIcon = getResourceIcon(type);
  typeBadge.innerHTML = `<i class="fas fa-${typeIcon}"></i> ${
    type.charAt(0).toUpperCase() + type.slice(1)
  }`;

  // Update stats based on type
  const stat1 = document.getElementById("resource-stat-1");
  const stat2 = document.getElementById("resource-stat-2");

  switch (type) {
    case "forum":
      stat1.textContent = "Active Discussions";
      stat2.textContent = "Peer Learning";
      break;
    case "note":
      stat1.textContent = "Teacher Created";
      stat2.textContent = "Structured Content";
      break;
    case "quiz":
      stat1.textContent = "Practice Questions";
      stat2.textContent = "Progress Tracking";
      break;
  }

  // Generate preview content
  const previewContent = document.getElementById("preview-content");
  previewContent.innerHTML = generatePreviewContent(type, title);

  // Show modal
  document.getElementById("resource-view-modal").classList.add("show");
}

function generatePreviewContent(type, title) {
  switch (type) {
    case "forum":
      return `
        <div class="forum-preview">
          <div class="preview-section">
            <h5>Recent Discussions:</h5>
            <div class="discussion-item">
              <span class="discussion-title">Getting started with ${
                title.split(" - ")[0]
              }</span>
              <span class="discussion-meta">5 replies • 2 hours ago</span>
            </div>
            <div class="discussion-item">
              <span class="discussion-title">Help with homework problems</span>
              <span class="discussion-meta">12 replies • Yesterday</span>
            </div>
          </div>
        </div>
      `;
    case "note":
      return `
        <div class="notes-preview">
          <div class="preview-section">
            <h5>Table of Contents:</h5>
            <ul>
              <li>Introduction</li>
              <li>Key Concepts</li>
              <li>Practice Examples</li>
              <li>Summary</li>
            </ul>
          </div>
          <div class="preview-note">
            <p><strong>Sample Content:</strong> This comprehensive guide covers all essential topics with clear explanations and practical examples.</p>
          </div>
        </div>
      `;
    case "quiz":
      return `
        <div class="quiz-preview">
          <div class="preview-section">
            <h5>Quiz Overview:</h5>
            <div class="quiz-info">
              <span>Multiple Choice Questions</span>
              <span>Timed Assessment</span>
              <span>Instant Feedback</span>
            </div>
          </div>
          <div class="sample-question">
            <p><strong>Sample Question:</strong></p>
            <p>What is the fundamental concept being tested in this quiz?</p>
            <div class="options">
              <div class="option">A) Basic understanding</div>
              <div class="option">B) Advanced application</div>
              <div class="option correct">C) Core knowledge assessment</div>
            </div>
          </div>
        </div>
      `;
    default:
      return "<p>Preview not available for this resource type.</p>";
  }
}

function closeResourceViewModal() {
  document.getElementById("resource-view-modal").classList.remove("show");
  currentViewedResource = null;
}

function selectFromView() {
  if (currentViewedResource) {
    selectResource(currentViewedResource.type, currentViewedResource.title);
    closeResourceViewModal();
  }
}

function selectResource(type, title) {
  const resource = {
    type: type,
    title: title,
    selectedAt: new Date().toISOString(),
    id: Date.now(),
  };

  // Check if already selected
  const existing = selectedResources.find(
    (r) => r.title === title && r.type === type
  );
  if (existing) {
    showNotification("Resource already selected!", "warning");
    return;
  }

  selectedResources.push(resource);
  updateSelectedResourcesDisplay();
  saveSelectedResources();

  showNotification(`"${title}" added to selection!`, "success");
}

function updateSelectedResourcesDisplay() {
  const container = document.getElementById("selected-resources");

  if (selectedResources.length === 0) {
    container.innerHTML =
      '<p class="empty-message">No resources selected yet</p>';
    return;
  }

  container.innerHTML = "";

  selectedResources.forEach((resource) => {
    const item = document.createElement("div");
    item.className = "selected-item";
    item.innerHTML = `
      <div class="selected-info">
        <i class="fas fa-${getResourceIcon(resource.type)}"></i>
        <span>${resource.title}</span>
      </div>
      <button class="btn-remove" onclick="removeResource(${resource.id})">
        <i class="fas fa-times"></i>
      </button>
    `;
    container.appendChild(item);
  });
}

function getResourceIcon(type) {
  switch (type) {
    case "forum":
      return "comments";
    case "note":
      return "file-alt";
    case "quiz":
      return "brain";
    default:
      return "file";
  }
}

function removeResource(id) {
  selectedResources = selectedResources.filter((r) => r.id !== id);
  updateSelectedResourcesDisplay();
  saveSelectedResources();
  showNotification("Resource removed from selection", "info");
}

function clearSelection() {
  if (selectedResources.length === 0) {
    showNotification("No resources to clear", "info");
    return;
  }

  if (confirm("Are you sure you want to clear all selected resources?")) {
    selectedResources = [];
    updateSelectedResourcesDisplay();
    saveSelectedResources();
    showNotification("Selection cleared", "info");
  }
}

function saveSelectedResources() {
  localStorage.setItem(
    "parentSelectedResources",
    JSON.stringify(selectedResources)
  );
}

function recommendResources() {
  if (selectedResources.length === 0) {
    showNotification("Please select at least one resource first", "warning");
    return;
  }

  // Show recommendation modal
  const modal = document.getElementById("recommendation-modal");
  const summary = document.getElementById("selected-summary");

  summary.innerHTML = `
    <h4>Selected Resources (${selectedResources.length}):</h4>
    <ul>
      ${selectedResources
        .map(
          (r) =>
            `<li><i class="fas fa-${getResourceIcon(r.type)}"></i> ${
              r.title
            }</li>`
        )
        .join("")}
    </ul>
  `;

  modal.classList.add("show");
}

function closeRecommendationModal() {
  document.getElementById("recommendation-modal").classList.remove("show");
}

function confirmRecommendation() {
  const sendNotification = document.getElementById("send-notification").checked;
  const addToSchedule = document.getElementById("add-to-schedule").checked;

  // Here you would typically send to backend API
  // For now, we'll simulate and store locally

  const recommendation = {
    resources: selectedResources,
    sendNotification: sendNotification,
    addToSchedule: addToSchedule,
    recommendedAt: new Date().toISOString(),
    parentId: "current-parent", // Would come from auth
    childId: "current-child", // Would come from selection
  };

  // Save to localStorage (in real app, this would be an API call)
  const recommendations = JSON.parse(
    localStorage.getItem("parentRecommendations") || "[]"
  );
  recommendations.push(recommendation);
  localStorage.setItem(
    "parentRecommendations",
    JSON.stringify(recommendations)
  );

  // Add to child's recommended resources
  const childRecommended = JSON.parse(
    localStorage.getItem("childRecommendedResources") || "[]"
  );
  selectedResources.forEach((resource) => {
    childRecommended.push({
      ...resource,
      recommendedBy: "parent",
      status: "pending", // pending, viewed, completed
    });
  });
  localStorage.setItem(
    "childRecommendedResources",
    JSON.stringify(childRecommended)
  );

  // Clear selection
  selectedResources = [];
  updateSelectedResourcesDisplay();
  saveSelectedResources();

  closeRecommendationModal();

  let message = "Resources recommended to your child!";
  if (sendNotification) message += " Notification sent.";
  if (addToSchedule) message += " Added to schedule.";

  showNotification(message, "success");
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
        background: ${getNotificationColor(type)};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
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

function getNotificationColor(type) {
  switch (type) {
    case "success":
      return "rgba(34, 197, 94, 0.9)";
    case "warning":
      return "rgba(251, 191, 36, 0.9)";
    case "error":
      return "rgba(239, 68, 68, 0.9)";
    default:
      return "rgba(74, 222, 128, 0.9)";
  }
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
