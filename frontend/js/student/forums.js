// Forums Page JavaScript - University Students Only
// Connected to backend: /api/student/forums/*

let currentForumId = null;
let forumsData = [];

document.addEventListener("DOMContentLoaded", async () => {
  if (!isUniversityStudent()) {
    window.location.href = "resource-forums.html";
    return;
  }

  checkAuth();
  await Promise.all([
    loadForums(),
    loadStats(),
  ]);
});

function checkAuth() {
  const token = localStorage.getItem("authToken");
  if (!token) {
    window.location.href = "../../login.html";
  }
}

// ========== DATA LOADING ==========

async function loadForums() {
  const container = document.getElementById("available-forums");
  container.innerHTML = '<p style="text-align: center; padding: 20px; color: rgba(255,255,255,0.6);">Loading forums...</p>';

  try {
    const token = localStorage.getItem("authToken");
    const response = await fetch("/api/student/forums", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch forums");
    forumsData = await response.json();
  } catch (error) {
    console.error("Error loading forums:", error);
    forumsData = [];
  }

  const forums = forumsData.filter(f => f.published);
  renderForums(forums);
  updateCategoryCounts(forums);
}

async function loadStats() {
  try {
    const token = localStorage.getItem("authToken");
    const response = await fetch("/api/student/forums/stats", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch stats");
    const stats = await response.json();

    document.getElementById("total-topics").textContent = stats.totalTopics || 0;
    document.getElementById("active-users").textContent = stats.activeUsers || 0;
    document.getElementById("user-topics").textContent = stats.myTopics || 0;
    document.getElementById("user-posts").textContent = stats.myReplies || 0;
  } catch (error) {
    console.error("Error loading stats:", error);
    document.getElementById("total-topics").textContent = "0";
    document.getElementById("active-users").textContent = "0";
    document.getElementById("user-topics").textContent = "0";
    document.getElementById("user-posts").textContent = "0";
  }
}

// ========== DISPLAY FUNCTIONS ==========

function renderForums(forums) {
  const container = document.getElementById("available-forums");

  if (forums.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 24px; color: rgba(255, 255, 255, 0.6);">
        <i class="fas fa-comments" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
        <p>No forums yet</p>
        <small>Create your first forum discussion!</small>
      </div>
    `;
    return;
  }

  container.innerHTML = "";
  forums.forEach(forum => {
    const views = forum.views || 0;
    const card = document.createElement("div");
    card.className = "topic-item";
    card.dataset.forumId = forum.id;
    card.innerHTML = `
      <div class="topic-header">
        <span class="topic-title">${forum.title}</span>
        <span class="topic-category">${forum.tags ? forum.tags.join(", ") : ""}</span>
      </div>
      <div class="topic-meta">
        <span class="topic-author">by ${forum.author}</span>
        <span class="topic-stats">
          <i class="fas fa-eye"></i> ${views} views •
          <i class="fas fa-reply"></i> ${forum.reply_count || 0}
        </span>
      </div>
      <div class="topic-preview">${forum.description}</div>
    `;
    card.addEventListener("click", () => openForumDetail(forum.id));
    container.appendChild(card);
  });
}

function updateCategoryCounts(forums) {
  const categories = { resources: 0, general: 0, questions: 0 };

  forums.forEach(forum => {
    if (forum.tags && Array.isArray(forum.tags)) {
      forum.tags.forEach(tag => {
        const lower = tag.toLowerCase();
        if (lower.includes("resource")) categories.resources++;
        else if (lower.includes("question") || lower.includes("q&a")) categories.questions++;
        else categories.general++;
      });
    } else {
      categories.general++;
    }
  });

  const counters = document.querySelectorAll(".category-count");
  if (counters.length >= 3) {
    counters[0].textContent = categories.resources;
    counters[1].textContent = categories.general;
    counters[2].textContent = categories.questions;
  }
}

// ========== FORUM DETAIL ==========

function openForumDetail(forumId) {
  const forum = forumsData.find(f => f.id === forumId);
  if (!forum) return;

  // Increment view count
  try {
    const token = localStorage.getItem("authToken");
    fetch(`/api/student/forums/${forumId}/view`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err) {
    console.error("Error incrementing view count:", err);
  }

  currentForumId = forumId;
  document.getElementById("forum-detail-title").textContent = forum.title;
  document.getElementById("forum-author").textContent = `by ${forum.author}`;
  document.getElementById("forum-date").textContent = formatDate(forum.created_at);
  document.getElementById("forum-description").textContent = forum.description;

  const tagsContainer = document.getElementById("forum-tags");
  tagsContainer.innerHTML = forum.tags && Array.isArray(forum.tags)
    ? forum.tags.map(tag => `<span class="tag-item">${tag}</span>`).join("")
    : "";

  fetchReplies(forumId);
  document.getElementById("forum-detail-modal").classList.add("show");
}

async function fetchReplies(forumId) {
  const container = document.getElementById("replies-list");
  container.innerHTML = '<p style="text-align: center; padding: 20px;">Loading replies...</p>';

  try {
    const token = localStorage.getItem("authToken");
    const response = await fetch(`/api/student/forums/${forumId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error("Failed to fetch forum");
    const forum = await response.json();
    loadReplies(forum.replies || []);
  } catch (error) {
    console.error("Error fetching replies:", error);
    container.innerHTML = '<p style="color: rgba(255,255,255,0.6);">Failed to load replies</p>';
  }
}

function loadReplies(replies) {
  const container = document.getElementById("replies-list");
  if (replies.length === 0) {
    container.innerHTML = '<p style="color: rgba(255,255,255,0.6); text-align: center; padding: 20px;">No replies yet. Be the first to reply!</p>';
    return;
  }

  container.innerHTML = replies.map(reply => `
    <div class="reply-item">
      <div class="reply-header">
        <span class="reply-author">${reply.author}</span>
        <span class="reply-date">${formatDate(reply.created_at)}</span>
      </div>
      <div class="reply-content">${reply.content}</div>
    </div>
  `).join("");
}

// ========== REPLY ==========

async function addReply() {
  const content = document.getElementById("reply-content").value.trim();
  if (!content) {
    showNotification("Please enter a reply", "error");
    return;
  }

  try {
    const token = localStorage.getItem("authToken");
    const response = await fetch(`/api/student/forums/${currentForumId}/replies`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) throw new Error("Failed to post reply");

    document.getElementById("reply-content").value = "";
    fetchReplies(currentForumId);
    loadForums();
    loadStats();
    showNotification("Reply posted successfully!", "success");
  } catch (error) {
    console.error("Error posting reply:", error);
    showNotification("Failed to post reply", "error");
  }
}

// ========== CREATE TOPIC ==========

function createNewTopic() {
  const modal = document.getElementById("create-topic-modal");
  modal.classList.add("show");
}

function closeModal() {
  const modal = document.getElementById("create-topic-modal");
  modal.classList.remove("show");
}

async function submitTopic() {
  const title = document.getElementById("topic-title").value.trim();
  const content = document.getElementById("topic-content").value.trim();
  const tagsInput = document.getElementById("topic-tags").value.trim();

  if (!title || !content) {
    showNotification("Please fill in title and description", "error");
    return;
  }

  const tags = tagsInput
    ? tagsInput.split(",").map(t => t.trim()).filter(t => t)
    : [];

  try {
    const token = localStorage.getItem("authToken");
    const response = await fetch("/api/student/forums/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, description: content, tags }),
    });

    if (!response.ok) throw new Error("Failed to create forum");

    document.getElementById("topic-title").value = "";
    document.getElementById("topic-content").value = "";
    document.getElementById("topic-tags").value = "";
    closeModal();
    await Promise.all([loadForums(), loadStats()]);
    showNotification("Forum created successfully!", "success");
  } catch (error) {
    console.error("Error creating forum:", error);
    showNotification("Failed to create forum", "error");
  }
}

// ========== CATEGORY FILTER ==========

function filterByCategory(category) {
  const forums = forumsData.filter(f => f.published);

  if (!category) {
    renderForums(forums);
    return;
  }

  const filtered = forums.filter(forum => {
    if (!forum.tags || !Array.isArray(forum.tags)) {
      return category === "general";
    }
    return forum.tags.some(tag => tag.toLowerCase().includes(category.toLowerCase()));
  });

  renderForums(filtered);
}

// ========== MODAL CONTROLS ==========

function closeForumModal() {
  document.getElementById("forum-detail-modal").classList.remove("show");
  currentForumId = null;
}

// ========== UTILITIES ==========

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed; top: 20px; right: 20px;
    background: ${type === "error" ? "rgba(239,68,68,0.9)" : "rgba(74,222,128,0.9)"};
    color: white; padding: 12px 20px; border-radius: 8px;
    font-weight: 500; z-index: 1000;
  `;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

// Close modals on outside click
document.addEventListener("click", (e) => {
  const createModal = document.getElementById("create-topic-modal");
  const forumModal = document.getElementById("forum-detail-modal");
  if (e.target === createModal) closeModal();
  if (e.target === forumModal) closeForumModal();
});

// Close modal on Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModal();
    closeForumModal();
  }
});
