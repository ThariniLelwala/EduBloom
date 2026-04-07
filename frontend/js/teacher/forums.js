// Teacher Forums Page JavaScript

document.addEventListener("DOMContentLoaded", function () {
  loadForums();
  loadAvailableTags();
  bindEvents();
});

let currentForumId = null;
let selectedTags = [];
const authToken = localStorage.getItem("authToken");

// Load and display all published forums
async function loadForums() {
  try {
    const response = await fetch("/api/teacher/forums", {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) throw new Error("Failed to load forums");

    const forums = await response.json();
    displayForums(forums);
  } catch (error) {
    console.error("Error loading forums:", error);
    displayForums([]);
  }
}

// Display forums in the grid
function displayForums(forums) {
  const container = document.getElementById("forums-container");

  if (!forums || forums.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-users"></i>
        <h3>No Discussions Yet</h3>
        <p>Be the first to start a discussion topic!</p>
        <button class="btn-primary" onclick="document.getElementById('create-post-btn').click()">
          Start Discussion
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = "";
  forums.forEach((forum) => {
    const forumCard = document.createElement("div");
    forumCard.className = "forum-card";
    forumCard.innerHTML = `
      <div class="forum-header">
        <div class="forum-meta">
          <span class="forum-author">${forum.author || "Teacher"}</span>
          <span class="forum-date">${formatDate(forum.created_at)}</span>
        </div>
        <div class="forum-stats">
          <span><i class="fas fa-eye"></i> ${forum.views || 0}</span>
          <span><i class="fas fa-reply"></i> ${forum.reply_count || 0}</span>
        </div>
      </div>
      <div class="forum-title">${forum.title}</div>
      <div class="forum-description">${forum.description}</div>
      <div class="forum-tags">
        ${(forum.tags || [])
          .map((tag) => `<span class="tag">${tag}</span>`)
          .join("")}
      </div>
      <div class="forum-actions">
        <button class="btn-secondary view-forum-btn" data-forum-id="${
          forum.id
        }">
          <i class="fas fa-eye"></i> View Discussion
        </button>
      </div>
    `;

    // Add click handler for viewing forum
    forumCard.querySelector(".view-forum-btn").addEventListener("click", () => {
      viewForum(forum.id);
    });

    container.appendChild(forumCard);
  });
}

// Load available tags for filtering
async function loadAvailableTags() {
  try {
    const response = await fetch("/api/teacher/forums/tags", {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) throw new Error("Failed to load tags");

    const tags = await response.json();
    const filterTags = document.querySelector(".filter-tags");
    
    // Keep the "All Topics" button
    const allBtn = filterTags.querySelector("[data-tag='all']");
    filterTags.innerHTML = "";
    filterTags.appendChild(allBtn);

    tags.slice(0, 5).forEach((tag) => {
      const tagButton = document.createElement("button");
      tagButton.className = "filter-tag";
      tagButton.textContent = tag;
      tagButton.dataset.tag = tag;
      tagButton.addEventListener("click", () => filterByTag(tag));
      filterTags.appendChild(tagButton);
    });
  } catch (error) {
    console.error("Error loading tags:", error);
  }
}

// Filter forums by tag
async function filterByTag(tag) {
  const buttons = document.querySelectorAll(".filter-tag");
  buttons.forEach((btn) => btn.classList.remove("active"));

  const targetBtn = document.querySelector(`[data-tag='${tag}']`);
  if (targetBtn) targetBtn.classList.add("active");

  try {
    const response = await fetch("/api/teacher/forums", {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    if (!response.ok) throw new Error("Failed to load forums");
    const forums = await response.json();

    if (tag === "all") {
      displayForums(forums);
    } else {
      const filteredForums = forums.filter((forum) =>
        (forum.tags || []).includes(tag)
      );
      displayForums(filteredForums);
    }
  } catch (error) {
    console.error("Error filtering forums:", error);
  }
}

// Search forums
async function searchForums(query) {
  try {
    const response = await fetch("/api/teacher/forums", {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    if (!response.ok) throw new Error("Failed to load forums");
    const forums = await response.json();

    const filteredForums = forums.filter(
      (forum) =>
        forum.title.toLowerCase().includes(query.toLowerCase()) ||
        forum.description.toLowerCase().includes(query.toLowerCase()) ||
        (forum.tags || []).some((tag) =>
          tag.toLowerCase().includes(query.toLowerCase())
        )
    );
    displayForums(filteredForums);
  } catch (error) {
    console.error("Error searching forums:", error);
  }
}

// View forum details and replies
async function viewForum(forumId) {
  try {
    const response = await fetch(`/api/teacher/forums/${forumId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) throw new Error("Failed to load forum details");

    const forum = await response.json();
    currentForumId = forumId;

    // Increment view count via API
    fetch(`/api/teacher/forums/${forumId}/view`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }).catch(err => console.error("Error incrementing views:", err));

    const modal = document.getElementById("forum-detail-modal");
    const title = document.getElementById("forum-detail-title");
    const content = document.getElementById("forum-detail-content");

    title.textContent = forum.title;

    const replies = forum.replies || [];

    content.innerHTML = `
      <div class="original-post">
        <div class="post-header">
          <span class="post-author">${forum.author || "Teacher"}</span>
          <span class="post-date">${formatDate(forum.created_at)}</span>
        </div>
        <div class="post-content">${forum.description}</div>
        <div class="post-tags">
          ${(forum.tags || [])
            .map((tag) => `<span class="tag">${tag}</span>`)
            .join("")}
        </div>
      </div>

      <div class="replies-section">
        <h3>Replies (${replies.length})</h3>
        <div class="replies-list">
          ${
            replies.length === 0
              ? '<p class="no-replies">No replies yet. Be the first to respond!</p>'
              : replies
                  .map(
                    (reply) => `
              <div class="reply-item">
                <div class="reply-header">
                  <span class="reply-author">${reply.author}</span>
                  <span class="reply-date">${formatDate(reply.created_at)}</span>
                </div>
                <div class="reply-content">${reply.content}</div>
              </div>
            `
                  )
                  .join("")
          }
        </div>
      </div>
    `;

    modal.classList.add("show");
  } catch (error) {
    console.error("Error loading forum details:", error);
    alert("Could not load forum details.");
  }
}

// Create new discussion post
async function createPost() {
  const title = document.getElementById("post-title").value.trim();
  const content = document.getElementById("post-content").value.trim();

  if (!title || !content) {
    alert("Please fill in both title and content.");
    return;
  }

  if (selectedTags.length === 0) {
    alert("Please select at least one tag.");
    return;
  }

  try {
    const response = await fetch("/api/teacher/forums/create", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        description: content,
        tags: [...selectedTags],
        published: true,
      }),
    });

    if (!response.ok) throw new Error("Failed to create post");

    document.getElementById("post-modal").classList.remove("show");
    resetPostModal();
    loadForums();
    loadAvailableTags();
  } catch (error) {
    console.error("Error creating post:", error);
    alert("Error creating post. Please try again.");
  }
}

// Submit reply to forum
async function submitReply() {
  const content = document.getElementById("reply-content").value.trim();

  if (!content) {
    alert("Please enter a reply.");
    return;
  }

  try {
    const response = await fetch(`/api/teacher/forums/${currentForumId}/replies`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) throw new Error("Failed to post reply");

    // Refresh the forum view
    viewForum(currentForumId);
    document.getElementById("reply-content").value = "";
    
    // Also update main list reply count in background
    loadForums();
  } catch (error) {
    console.error("Error posting reply:", error);
    alert("Error posting reply. Please try again.");
  }
}

// Bind event listeners
function bindEvents() {
  // Create post modal
  const postModal = document.getElementById("post-modal");
  const createBtn = document.getElementById("create-post-btn");
  const closeBtn = document.getElementById("modal-close");
  const cancelBtn = document.getElementById("cancel-post-btn");
  const submitBtn = document.getElementById("submit-post-btn");

  createBtn.addEventListener("click", () => {
    loadTagsForSelection();
    postModal.classList.add("show");
    document.getElementById("post-title").focus();
  });

  [closeBtn, cancelBtn].forEach((btn) => {
    btn.addEventListener("click", () => {
      postModal.classList.remove("show");
      resetPostModal();
    });
  });

  submitBtn.addEventListener("click", createPost);

  // Forum detail modal
  const detailModal = document.getElementById("forum-detail-modal");
  const detailClose = document.getElementById("forum-detail-close");

  detailClose.addEventListener("click", () => {
    detailModal.classList.remove("show");
    currentForumId = null;
  });

  // Reply functionality
  document
    .getElementById("submit-reply-btn")
    .addEventListener("click", submitReply);

  // Search functionality
  const searchInput = document.getElementById("search-input");
  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.trim();
    if (query.length > 2) {
      searchForums(query);
    } else if (query.length === 0) {
      loadForums();
    }
  });

  // Filter by all topics
  document
    .querySelector("[data-tag='all']")
    .addEventListener("click", () => filterByTag("all"));
}

// Load tags for selection in create post modal (from all existing tags)
async function loadTagsForSelection() {
  try {
    const response = await fetch("/api/teacher/forums/tags", {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) throw new Error("Failed to load tags");

    const tags = await response.json();
    const tagsSelection = document.querySelector(".tags-selection");
    tagsSelection.innerHTML = "";

    if (tags.length === 0) {
      // Allow adding a new tag placeholder if needed, or just let them create posts first
      tagsSelection.innerHTML = "<p>No existing tags. You can add tags in the Management page.</p>";
      // For simplicity in this UI, we'll just show some defaults if empty
      const defaults = ["General", "Question", "Resource"];
      defaults.forEach(tag => {
        const tagElement = document.createElement("span");
        tagElement.className = "selectable-tag";
        tagElement.textContent = tag;
        tagElement.addEventListener("click", () => toggleTagSelection(tag, tagElement));
        tagsSelection.appendChild(tagElement);
      });
      return;
    }

    tags.forEach((tag) => {
      const tagElement = document.createElement("span");
      tagElement.className = "selectable-tag";
      tagElement.textContent = tag;
      tagElement.addEventListener("click", () =>
        toggleTagSelection(tag, tagElement)
      );
      tagsSelection.appendChild(tagElement);
    });
  } catch (error) {
    console.error("Error loading tags for selection:", error);
  }
}

// Toggle tag selection
function toggleTagSelection(tag, element) {
  if (selectedTags.includes(tag)) {
    selectedTags = selectedTags.filter((t) => t !== tag);
    element.classList.remove("selected");
  } else {
    selectedTags.push(tag);
    element.classList.add("selected");
  }
}

// Reset post modal
function resetPostModal() {
  document.getElementById("post-title").value = "";
  document.getElementById("post-content").value = "";
  selectedTags = [];
  document.querySelectorAll(".selectable-tag").forEach((tag) => {
    tag.classList.remove("selected");
  });
}

// Utility functions
function formatDate(dateString) {
  if (!dateString) return "Date unknown";
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
}
