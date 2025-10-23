// Forums Page JavaScript

document.addEventListener("DOMContentLoaded", function () {
  initializeForums();
});

let currentForumId = null;

function initializeForums() {
  // Load dynamic data if available
  loadForums();
  loadForumStats();
  loadUserStats();
  loadPendingTopics();

  // Set up event listeners
  setupForumInteractions();

  // Initialize custom selects
  if (typeof initCustomSelects === "function") {
    initCustomSelects();
  }
}

function loadForums() {
  const forums = getTeacherForums().filter((f) => f.published);
  const container = document.getElementById("available-forums");

  if (forums.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 24px; color: rgba(255, 255, 255, 0.6);">
        <i class="fas fa-comments" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
        <p>No forums available</p>
        <small>Check back later for new discussions</small>
      </div>
    `;
    return;
  }

  container.innerHTML = "";
  forums.forEach((forum) => {
    const forumCard = document.createElement("div");
    forumCard.className = "topic-item";
    forumCard.setAttribute("data-forum-id", forum.id);
    forumCard.innerHTML = `
      <div class="topic-header">
        <span class="topic-title">${forum.title}</span>
        <span class="topic-category">${forum.tags.join(", ")}</span>
      </div>
      <div class="topic-meta">
        <span class="topic-author">by ${forum.author}</span>
        <span class="topic-stats">
          <i class="fas fa-calendar"></i> ${formatDate(forum.createdAt)} •
          <i class="fas fa-reply"></i> ${forum.replies.length}
        </span>
      </div>
      <div class="topic-preview">${forum.description}</div>
    `;

    forumCard.addEventListener("click", () => openForumDetail(forum.id));
    container.appendChild(forumCard);
  });
}

function getTeacherForums() {
  return JSON.parse(localStorage.getItem("teacher_forums")) || [];
}

function loadForumStats() {
  const forums = getTeacherForums().filter((f) => f.published);
  const totalTopics = forums.length;
  document.getElementById("total-topics").textContent = totalTopics;

  // Simulate active users (in real app, track unique users)
  const activeUsers = Math.min(totalTopics * 2 + 10, 50);
  document.getElementById("active-users").textContent = activeUsers;
}

function openForumDetail(forumId) {
  const forums = getTeacherForums();
  const forum = forums.find((f) => f.id === forumId);
  if (!forum) return;

  currentForumId = forumId;

  document.getElementById("forum-detail-title").textContent = forum.title;
  document.getElementById("forum-author").textContent = `by ${forum.author}`;
  document.getElementById("forum-date").textContent = formatDate(
    forum.createdAt
  );
  document.getElementById("forum-description").textContent = forum.description;

  // Display tags
  const tagsContainer = document.getElementById("forum-tags");
  tagsContainer.innerHTML = forum.tags
    .map((tag) => `<span class="tag-item">${tag}</span>`)
    .join("");

  // Display replies
  loadReplies(forum.replies);

  const modal = document.getElementById("forum-detail-modal");
  modal.classList.add("show");
}

function loadReplies(replies) {
  const container = document.getElementById("replies-list");
  if (replies.length === 0) {
    container.innerHTML =
      '<p style="color: rgba(255, 255, 255, 0.6); text-align: center; padding: 20px;">No replies yet. Be the first to reply!</p>';
    return;
  }

  container.innerHTML = replies
    .map(
      (reply) => `
    <div class="reply-item">
      <div class="reply-header">
        <span class="reply-author">${reply.author}</span>
        <span class="reply-date">${formatDate(reply.createdAt)}</span>
      </div>
      <div class="reply-content">${reply.content}</div>
    </div>
  `
    )
    .join("");
}

function addReply() {
  const content = document.getElementById("reply-content").value.trim();
  if (!content) {
    showNotification("Please enter a reply", "error");
    return;
  }

  const forums = getTeacherForums();
  const forum = forums.find((f) => f.id === currentForumId);
  if (!forum) return;

  const reply = {
    id: Date.now(),
    content,
    author: localStorage.getItem("username") || "Student",
    createdAt: new Date().toISOString(),
  };

  forum.replies.push(reply);
  saveTeacherForums(forums);

  document.getElementById("reply-content").value = "";
  loadReplies(forum.replies);
  loadForums(); // Update the forum list with new reply count
  showNotification("Reply posted successfully!", "success");
}

function saveTeacherForums(forums) {
  localStorage.setItem("teacher_forums", JSON.stringify(forums));
}

function closeForumModal() {
  const modal = document.getElementById("forum-detail-modal");
  modal.classList.remove("show");
  currentForumId = null;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function loadPendingTopics() {
  const pendingTopics = JSON.parse(
    localStorage.getItem("pendingTopics") || "[]"
  );
  const pendingContainer = document.getElementById("pending-topics");

  if (pendingTopics.length === 0) {
    pendingContainer.innerHTML =
      '<p style="color: rgba(255, 255, 255, 0.6); text-align: center; padding: 20px;">No topics pending approval</p>';
    return;
  }

  pendingContainer.innerHTML = "";

  pendingTopics.forEach((topic) => {
    const topicElement = document.createElement("div");
    topicElement.className = "pending-topic-item";
    topicElement.innerHTML = `
            <div class="pending-topic-header">
                <span class="pending-topic-title">${topic.title}</span>
                <span class="pending-status ${topic.status}">${
      topic.status
    }</span>
            </div>
            <div class="pending-topic-meta">
                <span class="pending-category">${topic.category}</span>
                <span class="pending-date">${new Date(
                  topic.createdAt
                ).toLocaleDateString()}</span>
            </div>
        `;
    pendingContainer.appendChild(topicElement);
  });
}

function setupForumInteractions() {
  // Topic click handlers are now handled in loadForums
}

function createNewTopic() {
  const modal = document.getElementById("create-topic-modal");
  modal.classList.add("show");
}

function closeModal() {
  const modal = document.getElementById("create-topic-modal");
  modal.classList.remove("show");
}

function submitTopic() {
  const title = document.getElementById("topic-title").value.trim();
  const category = document.getElementById("topic-category").value;
  const content = document.getElementById("topic-content").value.trim();

  if (!title || !category || !content) {
    showNotification("Please fill in all fields", "error");
    return;
  }

  // Create topic object with pending status
  const newTopic = {
    id: Date.now(),
    title: title,
    category: category,
    content: content,
    author: "Current User", // In real app, get from user session
    status: "pending", // pending, approved, rejected
    createdAt: new Date().toISOString(),
    views: 0,
    replies: 0,
  };

  // Save to localStorage (in real app, this would be sent to server)
  const pendingTopics = JSON.parse(
    localStorage.getItem("pendingTopics") || "[]"
  );
  pendingTopics.push(newTopic);
  localStorage.setItem("pendingTopics", JSON.stringify(pendingTopics));

  // Update user stats
  const currentTopics = parseInt(localStorage.getItem("userTopics") || 0);
  localStorage.setItem("userTopics", currentTopics + 1);

  // Reset form and close modal
  document.getElementById("topic-title").value = "";
  document.getElementById("topic-category").value = "";
  document.getElementById("topic-content").value = "";
  closeModal();

  // Show success message with pending status
  showNotification("Topic submitted for admin approval!", "info");

  // Refresh stats and show pending topics
  loadUserStats();
  loadPendingTopics();
}

function filterByCategory(category) {
  // Here you would filter the topics list by category
  showNotification(`Filtering by ${category}`, "info");

  // For now, just highlight the selected category
  const categories = document.querySelectorAll(".category-item");
  categories.forEach((cat) => cat.classList.remove("active"));

  event.currentTarget.classList.add("active");
}

function openTopic(topicTitle) {
  showNotification(`Opening topic: ${topicTitle}`, "info");
  // Here you would navigate to the specific topic page
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

  // Adjust color based on type
  if (type === "error") {
    notification.style.background = "rgba(239, 68, 68, 0.9)";
  } else if (type === "success") {
    notification.style.background = "rgba(34, 197, 94, 0.9)";
  }

  document.body.appendChild(notification);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Close modal when clicking outside
document.addEventListener("click", function (e) {
  const createModal = document.getElementById("create-topic-modal");
  const forumModal = document.getElementById("forum-detail-modal");
  if (e.target === createModal) {
    closeModal();
  }
  if (e.target === forumModal) {
    closeForumModal();
  }
});

// Handle escape key
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeModal();
    closeForumModal();
  }
});

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
    .category-item.active {
        background: rgba(255, 255, 255, 0.1);
        border-left: 3px solid var(--color-white);
    }
`;
document.head.appendChild(style);

// Simulate admin approval (for testing purposes)
function approveTopic(topicId) {
  const pendingTopics = JSON.parse(
    localStorage.getItem("pendingTopics") || "[]"
  );
  const topicIndex = pendingTopics.findIndex((topic) => topic.id === topicId);

  if (topicIndex !== -1) {
    pendingTopics[topicIndex].status = "approved";
    localStorage.setItem("pendingTopics", JSON.stringify(pendingTopics));

    // Move to approved topics
    const approvedTopics = JSON.parse(
      localStorage.getItem("approvedTopics") || "[]"
    );
    approvedTopics.push(pendingTopics[topicIndex]);
    localStorage.setItem("approvedTopics", JSON.stringify(approvedTopics));

    // Remove from pending
    pendingTopics.splice(topicIndex, 1);
    localStorage.setItem("pendingTopics", JSON.stringify(pendingTopics));

    loadPendingTopics();
    showNotification("Topic approved!", "success");
  }
}

// Add click handler for pending topics (simulate approval)
document.addEventListener("click", async function (e) {
  if (e.target.closest(".pending-topic-item")) {
    const topicItem = e.target.closest(".pending-topic-item");
    const topicTitle = topicItem.querySelector(
      ".pending-topic-title"
    ).textContent;

    // For demo purposes, show approval option
    const confirmed = await showConfirmation(
      `Approve topic: "${topicTitle}"? (Demo - In real app, only admins can do this)`,
      "Approve Topic"
    );
    if (confirmed) {
      // In real app, this would be done by admin only
      const pendingTopics = JSON.parse(
        localStorage.getItem("pendingTopics") || "[]"
      );
      const topic = pendingTopics.find((t) => t.title === topicTitle);
      if (topic) {
        approveTopic(topic.id);
      }
    }
  }
});
