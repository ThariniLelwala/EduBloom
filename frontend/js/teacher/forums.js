// Teacher Forums Page JavaScript

document.addEventListener("DOMContentLoaded", function () {
  loadForums();
  loadAvailableTags();
  bindEvents();
});

let currentForumId = null;
let selectedTags = [];

// Load and display all published forums
function loadForums() {
  // Load teacher-created forums
  const teacherForums =
    JSON.parse(localStorage.getItem("teacher_forums")) || [];

  // Load shared forums from quiz.json (if any exist)
  fetch("../../data/quiz.json")
    .then((response) => response.json())
    .then((data) => {
      // For now, we'll focus on teacher-created forums
      // In a real app, you might have separate forum data
      displayForums(teacherForums.filter((forum) => forum.published));
    })
    .catch((error) => {
      console.error("Error loading quiz data:", error);
      displayForums(teacherForums.filter((forum) => forum.published));
    });
}

// Display forums in the grid
function displayForums(forums) {
  const container = document.getElementById("forums-container");

  if (forums.length === 0) {
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
  forums.forEach((forum, index) => {
    const forumCard = document.createElement("div");
    forumCard.className = "forum-card";
    forumCard.innerHTML = `
      <div class="forum-header">
        <div class="forum-meta">
          <span class="forum-author">${forum.author || "Teacher"}</span>
          <span class="forum-date">${formatDate(forum.createdAt)}</span>
        </div>
        <div class="forum-stats">
          <span><i class="fas fa-eye"></i> ${getForumViews(forum.id)}</span>
          <span><i class="fas fa-reply"></i> ${getForumReplies(forum.id)}</span>
        </div>
      </div>
      <div class="forum-title">${forum.title}</div>
      <div class="forum-description">${forum.description}</div>
      <div class="forum-tags">
        ${forum.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
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
function loadAvailableTags() {
  const teacherForums =
    JSON.parse(localStorage.getItem("teacher_forums")) || [];
  const allTags = new Set();

  teacherForums.forEach((forum) => {
    forum.tags.forEach((tag) => allTags.add(tag));
  });

  const filterTags = document.querySelector(".filter-tags");
  const existingButtons = filterTags.querySelectorAll(
    ".filter-tag:not(.active)"
  );
  existingButtons.forEach((btn) => btn.remove());

  Array.from(allTags)
    .slice(0, 5)
    .forEach((tag) => {
      const tagButton = document.createElement("button");
      tagButton.className = "filter-tag";
      tagButton.textContent = tag;
      tagButton.dataset.tag = tag;
      tagButton.addEventListener("click", () => filterByTag(tag));
      filterTags.appendChild(tagButton);
    });
}

// Filter forums by tag
function filterByTag(tag) {
  const buttons = document.querySelectorAll(".filter-tag");
  buttons.forEach((btn) => btn.classList.remove("active"));

  if (tag === "all") {
    document.querySelector("[data-tag='all']").classList.add("active");
    loadForums();
  } else {
    document.querySelector(`[data-tag='${tag}']`).classList.add("active");
    const teacherForums =
      JSON.parse(localStorage.getItem("teacher_forums")) || [];
    const filteredForums = teacherForums.filter(
      (forum) => forum.published && forum.tags.includes(tag)
    );
    displayForums(filteredForums);
  }
}

// Search forums
function searchForums(query) {
  const teacherForums =
    JSON.parse(localStorage.getItem("teacher_forums")) || [];
  const filteredForums = teacherForums.filter(
    (forum) =>
      forum.published &&
      (forum.title.toLowerCase().includes(query.toLowerCase()) ||
        forum.description.toLowerCase().includes(query.toLowerCase()) ||
        forum.tags.some((tag) =>
          tag.toLowerCase().includes(query.toLowerCase())
        ))
  );
  displayForums(filteredForums);
}

// View forum details and replies
function viewForum(forumId) {
  const teacherForums =
    JSON.parse(localStorage.getItem("teacher_forums")) || [];
  const forum = teacherForums.find((f) => f.id === forumId);

  if (!forum) return;

  currentForumId = forumId;

  // Increment view count
  incrementForumViews(forumId);

  const modal = document.getElementById("forum-detail-modal");
  const title = document.getElementById("forum-detail-title");
  const content = document.getElementById("forum-detail-content");

  title.textContent = forum.title;

  // Load forum content and replies
  const replies = getForumRepliesData(forumId);

  content.innerHTML = `
    <div class="original-post">
      <div class="post-header">
        <span class="post-author">${forum.author || "Teacher"}</span>
        <span class="post-date">${formatDate(forum.createdAt)}</span>
      </div>
      <div class="post-content">${forum.description}</div>
      <div class="post-tags">
        ${forum.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
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
                <span class="reply-date">${formatDate(reply.createdAt)}</span>
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
}

// Create new discussion post
function createPost() {
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

  const post = {
    id: Date.now(),
    title,
    description: content,
    tags: [...selectedTags],
    published: true,
    createdAt: new Date().toISOString(),
    author: localStorage.getItem("username") || "Teacher",
    views: 0,
    replies: [],
  };

  const teacherForums =
    JSON.parse(localStorage.getItem("teacher_forums")) || [];
  teacherForums.push(post);
  localStorage.setItem("teacher_forums", JSON.stringify(teacherForums));

  document.getElementById("post-modal").classList.remove("show");
  resetPostModal();
  loadForums();
  loadAvailableTags();
}

// Submit reply to forum
function submitReply() {
  const content = document.getElementById("reply-content").value.trim();

  if (!content) {
    alert("Please enter a reply.");
    return;
  }

  const reply = {
    id: Date.now(),
    content,
    author: localStorage.getItem("username") || "Teacher",
    createdAt: new Date().toISOString(),
  };

  // Save reply to forum
  const teacherForums =
    JSON.parse(localStorage.getItem("teacher_forums")) || [];
  const forumIndex = teacherForums.findIndex((f) => f.id === currentForumId);

  if (forumIndex !== -1) {
    if (!teacherForums[forumIndex].replies) {
      teacherForums[forumIndex].replies = [];
    }
    teacherForums[forumIndex].replies.push(reply);
    localStorage.setItem("teacher_forums", JSON.stringify(teacherForums));

    // Refresh the forum view
    viewForum(currentForumId);
    document.getElementById("reply-content").value = "";
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

// Load tags for selection in create post modal
function loadTagsForSelection() {
  const teacherForums =
    JSON.parse(localStorage.getItem("teacher_forums")) || [];
  const allTags = new Set();

  teacherForums.forEach((forum) => {
    forum.tags.forEach((tag) => allTags.add(tag));
  });

  const tagsSelection = document.querySelector(".tags-selection");
  tagsSelection.innerHTML = "";

  if (allTags.size === 0) {
    tagsSelection.innerHTML =
      "<p>No tags available. Tags will be created when you create forums.</p>";
    return;
  }

  Array.from(allTags).forEach((tag) => {
    const tagElement = document.createElement("span");
    tagElement.className = "selectable-tag";
    tagElement.textContent = tag;
    tagElement.addEventListener("click", () =>
      toggleTagSelection(tag, tagElement)
    );
    tagsSelection.appendChild(tagElement);
  });
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
function getForumViews(forumId) {
  // In a real app, this would be stored in a database
  const views = localStorage.getItem(`forum_views_${forumId}`);
  return views ? parseInt(views) : 0;
}

function incrementForumViews(forumId) {
  const currentViews = getForumViews(forumId);
  localStorage.setItem(`forum_views_${forumId}`, currentViews + 1);
}

function getForumReplies(forumId) {
  const teacherForums =
    JSON.parse(localStorage.getItem("teacher_forums")) || [];
  const forum = teacherForums.find((f) => f.id === forumId);
  return forum && forum.replies ? forum.replies.length : 0;
}

function getForumRepliesData(forumId) {
  const teacherForums =
    JSON.parse(localStorage.getItem("teacher_forums")) || [];
  const forum = teacherForums.find((f) => f.id === forumId);
  return forum && forum.replies ? forum.replies : [];
}

function formatDate(dateString) {
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
