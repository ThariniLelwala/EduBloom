// Resource Forums Page - For School Students to view Teacher Forums

let currentForumId = null;
let forumsData = [];

document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  handleURLParams();
  loadForums();
  setupSearch();
});

function handleURLParams() {
  const params = new URLSearchParams(window.location.search);
  const forumId = params.get("forumId");
  if (forumId) {
    setTimeout(() => openForumDetail(forumId), 100);
  }
}

function checkAuth() {
  const token = localStorage.getItem("authToken");
  if (!token) {
    window.location.href = "../../login.html";
  }
}

async function loadForums() {
  const container = document.getElementById("available-forums");
  container.innerHTML = '<p style="text-align: center; padding: 20px; color: rgba(255,255,255,0.6);">Loading forums...</p>';
  
  try {
    const token = localStorage.getItem("authToken");
    const response = await fetch("/api/public/forums", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch forums");
    const data = await response.json();
    forumsData = Array.isArray(data) ? data : (data.forums || []);
  } catch (error) {
    console.error("Error loading forums:", error);
    forumsData = [];
  }

  loadStatsFromForums(forumsData.filter(f => f.published));
  renderForums(forumsData.filter(f => f.published));
}

function renderForums(forums) {
  const container = document.getElementById("available-forums");
  const searchTerm = document.getElementById("forum-search").value;
  const gradeFilter = document.getElementById("forum-grade-filter").value;
  
  if (forums.length === 0) {
    if (searchTerm || gradeFilter) {
      container.innerHTML = `
        <div class="no-results-message">
          <i class="fas fa-search"></i>
          <p>No forums match your filters</p>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div style="text-align: center; padding: 24px; color: rgba(255, 255, 255, 0.6);">
          <i class="fas fa-comments" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
          <p>No forums available</p>
          <small>Check back later for new discussions</small>
        </div>
      `;
    }
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

function setupSearch() {
  const searchInput = document.getElementById("forum-search");
  const gradeFilter = document.getElementById("forum-grade-filter");
  
  searchInput.addEventListener("input", (e) => {
    applyFilters();
  });
  
  gradeFilter.addEventListener("change", () => {
    applyFilters();
  });
}

function applyFilters() {
  const searchTerm = document.getElementById("forum-search").value;
  const gradeFilter = document.getElementById("forum-grade-filter").value;
  const term = searchTerm.toLowerCase().trim();
  const grade = gradeFilter ? parseInt(gradeFilter) : null;
  
  let forums = forumsData.filter(f => f.published);
  
  if (grade) {
    forums = forums.filter(f => f.target_grade === grade);
  }
  
  if (!term) {
    renderForums(forums);
    loadStatsFromForums(forums);
    return;
  }
  
  const filtered = forums.filter(forum => {
    const titleMatch = (forum.title || "").toLowerCase().includes(term);
    const descMatch = (forum.description || "").toLowerCase().includes(term);
    const tagMatch = (forum.tags || []).some(tag => tag.toLowerCase().includes(term));
    return titleMatch || descMatch || tagMatch;
  });
  
  renderForums(filtered);
  loadStatsFromForums(filtered);
}

function loadStatsFromForums(forums) {
  const activeDiscussions = forums.filter(f => (f.reply_count || 0) > 0).length;
  document.getElementById("total-topics").textContent = forums.length;
  document.getElementById("active-users").textContent = activeDiscussions;
}

async function openForumDetail(forumId) {
  const forum = forumsData.find(f => f.id == forumId);
  if (!forum) return;

  // Increment view count
  try {
    const token = localStorage.getItem("authToken");
    await fetch(`/api/public/forums/${forumId}/view`, {
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
    const response = await fetch(`/api/teacher/forums/${forumId}`, {
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

async function addReply() {
  const content = document.getElementById("reply-content").value.trim();
  if (!content) {
    showNotification("Please enter a reply", "error");
    return;
  }

  try {
    const token = localStorage.getItem("authToken");
    const response = await fetch(`/api/teacher/forums/${currentForumId}/replies`, {
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
    showNotification("Reply posted successfully!", "success");
  } catch (error) {
    console.error("Error posting reply:", error);
    showNotification("Failed to post reply", "error");
  }
}

function closeForumModal() {
  document.getElementById("forum-detail-modal").classList.remove("show");
  currentForumId = null;
}

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

// Close modal on outside click
document.addEventListener("click", (e) => {
  const modal = document.getElementById("forum-detail-modal");
  if (e.target === modal) closeForumModal();
});

// Close modal on Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeForumModal();
});
