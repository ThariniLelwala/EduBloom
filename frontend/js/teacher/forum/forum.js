// Teacher Forum Management JavaScript

const authToken = localStorage.getItem("authToken");

document.addEventListener("DOMContentLoaded", function () {
  loadForums();
  loadCategories();
  loadStats();
  bindEvents();
});

let currentTags = [];
let currentFilter = "all";
let currentEditTags = [];

async function loadForums() {
  try {
    const response = await fetch("/api/teacher/forums/my", {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) throw new Error("Failed to load your forums");

    const forums = await response.json();
    const container = document.getElementById("my-forums");

    // Filter forums based on current filter
    let filteredForums = forums;
    if (currentFilter === "published") {
      filteredForums = forums.filter((f) => f.published && !f.archived);
    } else if (currentFilter === "draft") {
      filteredForums = forums.filter((f) => !f.published && !f.archived);
    } else if (currentFilter === "archived") {
      filteredForums = forums.filter((f) => f.archived);
    }

    if (filteredForums.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 24px; color: rgba(255, 255, 255, 0.6);">
          <i class="fas fa-comments" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
          <p>No forums found</p>
          <small>${
            currentFilter === "all"
              ? "Create your first forum to start discussions with students"
              : `No ${currentFilter} forums`
          }</small>
        </div>
      `;
      return;
    }

    container.innerHTML = "";
    filteredForums.forEach((forum) => {
      const forumCard = document.createElement("div");
      forumCard.className = "topic-item";
      forumCard.innerHTML = `
        <div class="topic-header">
          <span class="topic-title">${forum.title}</span>
          <span class="topic-category ${
            forum.archived ? "archived" : (forum.published ? "published" : "draft")
          }">${forum.archived ? "Archived" : (forum.published ? "Published" : "Draft")}</span>
        </div>
        <div class="topic-meta">
          <span class="topic-author">by ${forum.author}</span>
          <span class="topic-stats">
            <i class="fas fa-calendar"></i> ${formatDate(forum.created_at)}
          </span>
        </div>
        <div class="topic-preview">${forum.description}</div>
      `;

      // Add click handler to open forum details
      forumCard.addEventListener("click", () => {
        openForumDetail(forum);
      });

      container.appendChild(forumCard);
    });
  } catch (error) {
    console.error("Error loading forums:", error);
  }
}

// Bind event listeners
function bindEvents() {
  const modal = document.getElementById("forum-modal");
  const createBtn = document.getElementById("create-forum-btn");
  const closeBtn = document.getElementById("modal-close");
  const cancelBtn = document.getElementById("cancel-btn");
  const saveBtn = document.getElementById("save-forum-btn");
  const addTagBtn = document.getElementById("add-tag-btn");
  const tagInput = document.getElementById("tag-input");

  // Open create modal
  createBtn.addEventListener("click", () => {
    resetModal();
    document.getElementById("modal-title").textContent = "Create New Forum";
    modal.classList.add("show");
    document.getElementById("forum-title").focus();
  });

  // Close modal
  [closeBtn, cancelBtn].forEach((btn) => {
    btn.addEventListener("click", () => {
      modal.classList.remove("show");
      resetModal();
    });
  });

  // Save forum
  saveBtn.addEventListener("click", () => {
    saveForum();
  });

  // Add tag
  addTagBtn.addEventListener("click", () => {
    addTag();
  });

  // Add tag on Enter key
  tagInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  });

  // Edit tag events
  const editAddTagBtn = document.getElementById("edit-add-tag-btn");
  const editTagInput = document.getElementById("edit-tag-input");

  if (editAddTagBtn) {
    editAddTagBtn.addEventListener("click", () => {
      addEditTag();
    });
  }

  if (editTagInput) {
    editTagInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addEditTag();
      }
    });
  }

  // Close dropdowns when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".dropdown")) {
      document
        .querySelectorAll(".dropdown")
        .forEach((dd) => (dd.style.display = "none"));
    }
  });
}

// Add a tag to the current forum
function addTag() {
  const tagInput = document.getElementById("tag-input");
  const tagValue = tagInput.value.trim();

  if (!tagValue) return;

  const tagRegex = /^[a-zA-Z\s]+$/;
  if (!tagRegex.test(tagValue)) {
    alert("Tags can only contain letters and spaces.");
    return;
  }

  if (tagValue.length > 20) {
    alert("Tags cannot exceed 20 characters.");
    return;
  }

  if (currentTags.includes(tagValue.toLowerCase())) {
    alert("This tag already exists.");
    return;
  }

  currentTags.push(tagValue.toLowerCase());
  updateTagsDisplay();
  tagInput.value = "";
  tagInput.focus();
}

// Update tags display
function updateTagsDisplay() {
  const tagsList = document.getElementById("tags-list");
  tagsList.innerHTML = currentTags
    .map(
      (tag) => `
    <span class="tag-item">
      ${tag}
      <i class="fas fa-times remove-tag" onclick="removeTag('${tag}')"></i>
    </span>
  `
    )
    .join("");
}

// Remove a tag
function removeTag(tagToRemove) {
  currentTags = currentTags.filter((tag) => tag !== tagToRemove);
  updateTagsDisplay();
}

// Save forum
async function saveForum() {
  const title = document.getElementById("forum-title").value.trim();
  const description = document.getElementById("forum-description").value.trim();
  const published = document.getElementById("publish-checkbox").checked;

  if (!title || !description || currentTags.length === 0) {
    alert("Please fill in all fields and add at least one tag.");
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
        description,
        tags: [...currentTags],
        published,
      }),
    });

    if (!response.ok) throw new Error("Failed to create forum");

    document.getElementById("forum-modal").classList.remove("show");
    resetModal();
    loadForums();
    loadCategories();
    loadStats();
  } catch (error) {
    console.error("Error saving forum:", error);
    alert("Error creating forum. Please try again.");
  }
}

// Load category counts
async function loadCategories() {
  try {
    const response = await fetch("/api/teacher/forums/my", {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    if (!response.ok) return;
    const forums = await response.json();

    const allCount = forums.length;
    const publishedCount = forums.filter((f) => f.published && !f.archived).length;
    const draftCount = forums.filter((f) => !f.published && !f.archived).length;
    const archivedCount = forums.filter((f) => f.archived).length;

    document.getElementById("all-count").textContent = allCount;
    document.getElementById("published-count").textContent = publishedCount;
    document.getElementById("draft-count").textContent = draftCount;
    document.getElementById("archived-count").textContent = archivedCount;

    // Set active category
    document.querySelectorAll(".category-item").forEach((item) => {
      item.classList.remove("active");
    });
    const activeCategory = document.querySelector(
      `[onclick*="filterByCategory('${currentFilter}')"]`
    );
    if (activeCategory) {
      activeCategory.classList.add("active");
    }
  } catch (error) {
    console.error("Error loading categories:", error);
  }
}

// Load forum statistics
async function loadStats() {
  try {
    const response = await fetch("/api/teacher/forums/my", {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    if (!response.ok) return;
    const forums = await response.json();

    const totalForums = forums.length;
    const publishedForums = forums.filter((f) => f.published && !f.archived).length;
    const draftForums = forums.filter((f) => !f.published && !f.archived).length;
    const archivedForums = forums.filter((f) => f.archived).length;
    const totalReplies = forums.reduce((total, forum) => total + (forum.reply_count || 0), 0);

    document.getElementById("total-forums").textContent = totalForums;
    document.getElementById("published-forums").textContent = publishedForums;
    document.getElementById("draft-forums").textContent = draftForums;
    document.getElementById("total-replies").textContent = totalReplies;
    
    // Add archived to stats if we want (optional but better to align with categories)
    const statsGrid = document.querySelector(".stats-grid");
    if (statsGrid && !document.getElementById("archived-forums")) {
        const archivedStat = document.createElement("div");
        archivedStat.className = "stat-item";
        archivedStat.innerHTML = `
            <div class="stat-number" id="archived-forums">${archivedForums}</div>
            <div class="stat-label">Archived</div>
        `;
        statsGrid.appendChild(archivedStat);
    } else if (document.getElementById("archived-forums")) {
        document.getElementById("archived-forums").textContent = archivedForums;
    }
  } catch (error) {
    console.error("Error loading stats:", error);
  }
}

// Filter forums by category
function filterByCategory(category, event) {
  currentFilter = category;
  loadForums();

  document.querySelectorAll(".category-item").forEach((item) => {
    item.classList.remove("active");
  });
  if (event && event.currentTarget) {
    event.currentTarget.classList.add("active");
  } else if (event && event.target) {
     event.target.closest(".category-item")?.classList.add("active");
  }
}

// Open forum detail modal
async function openForumDetail(forum) {
  try {
    const response = await fetch(`/api/teacher/forums/${forum.id}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    if (!response.ok) throw new Error("Failed to load forum details");
    const detailedForum = await response.json();

    document.getElementById("forum-title-display").textContent = detailedForum.title;
    document.getElementById("forum-description-display").textContent = detailedForum.description;
    document.getElementById("forum-author").textContent = `by ${detailedForum.author}`;
    document.getElementById("forum-date").textContent = formatDate(detailedForum.created_at);

    const tagsContainer = document.getElementById("forum-tags");
    tagsContainer.innerHTML = (detailedForum.tags || [])
      .map((tag) => `<span class="tag-item">${tag}</span>`)
      .join("");

    document.getElementById("forum-detail-modal").classList.add("show");
    document.getElementById("forum-detail-modal").dataset.forumId = detailedForum.id;
    document.getElementById("forum-detail-modal").dataset.replyCount = detailedForum.replies ? detailedForum.replies.length : 0;

    // Set up delete button listener
    const deleteBtn = document.getElementById("delete-forum-btn");
    if (deleteBtn) {
      deleteBtn.onclick = () => {
        const forumId = detailedForum.id;
        const replyCount = detailedForum.replies ? detailedForum.replies.length : 0;
        deleteForum(forumId, replyCount);
      };
    }

    loadReplies(detailedForum.replies, detailedForum.id);
  } catch (error) {
    console.error("Error opening forum detail:", error);
  }
}

// Close forum modal
function closeForumModal() {
  document.getElementById("forum-detail-modal").classList.remove("show");
  cancelEdit();
}

// Load replies from data
function loadReplies(replies, forumId) {
  const repliesList = document.getElementById("replies-list");

  if (!replies || replies.length === 0) {
    repliesList.innerHTML = `
      <div style="text-align: center; padding: 24px; color: rgba(255, 255, 255, 0.6);">
        <i class="fas fa-comments" style="font-size: 24px; margin-bottom: 8px; opacity: 0.5;"></i>
        <p>No replies yet</p>
        <small>Be the first to reply to this forum</small>
      </div>
    `;
    return;
  }

  repliesList.innerHTML = replies
    .map(
      (reply) => `
    <div class="reply-item">
      <div class="reply-header">
        <span class="reply-author">${reply.author}</span>
        <span class="reply-date">${formatDate(reply.created_at)}</span>
        <div class="reply-actions">
          <button class="btn-icon delete-btn" onclick="deleteReply(${forumId}, ${reply.id})" title="Delete reply">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
      <div class="reply-content">${reply.content}</div>
    </div>
  `
    )
    .join("");
}

// Add reply to forum
async function addReply() {
  const replyContent = document.getElementById("reply-content").value.trim();
  const forumId = document.getElementById("forum-detail-modal").dataset.forumId;

  if (!replyContent) {
    alert("Please enter a reply.");
    return;
  }

  try {
    const response = await fetch(`/api/teacher/forums/${forumId}/replies`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: replyContent }),
    });

    if (!response.ok) throw new Error("Failed to post reply");

    // Reload forum details
    const refreshedResponse = await fetch(`/api/teacher/forums/${forumId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const refreshedForum = await refreshedResponse.json();
    loadReplies(refreshedForum.replies, forumId);
    document.getElementById("reply-content").value = "";
  } catch (error) {
    console.error("Error adding reply:", error);
  }
}

// Delete reply
async function deleteReply(forumId, replyId) {
  if (!confirm("Are you sure you want to delete this reply?")) return;

  try {
    const response = await fetch(`/api/teacher/forums/${forumId}/replies/${replyId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) throw new Error("Failed to delete reply");

    // Reload forum details
    const refreshedResponse = await fetch(`/api/teacher/forums/${forumId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const refreshedForum = await refreshedResponse.json();
    loadReplies(refreshedForum.replies, forumId);
  } catch (error) {
    console.error("Error deleting reply:", error);
  }
}

// Edit forum inline
async function editForum() {
  const forumId = document.getElementById("forum-detail-modal").dataset.forumId;
  try {
    const response = await fetch(`/api/teacher/forums/${forumId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const forum = await response.json();

    document.getElementById("edit-forum-title").value = forum.title;
    document.getElementById("edit-forum-description").value = forum.description;
    currentEditTags = [...(forum.tags || [])];
    updateEditTagsDisplay();

    if (document.getElementById("forum-content")) document.getElementById("forum-content").style.display = "none";
    if (document.getElementById("forum-actions")) document.getElementById("forum-actions").style.display = "none";
    if (document.getElementById("forum-edit")) document.getElementById("forum-edit").style.display = "block";
  } catch (error) {
    console.error("Error preping edit:", error);
  }
}

// Cancel edit
function cancelEdit() {
  if (document.getElementById("forum-content")) document.getElementById("forum-content").style.display = "block";
  if (document.getElementById("forum-actions")) document.getElementById("forum-actions").style.display = "block";
  if (document.getElementById("forum-edit")) document.getElementById("forum-edit").style.display = "none";
}

// Save forum edit
async function saveForumEdit() {
  const forumId = document.getElementById("forum-detail-modal").dataset.forumId;
  const title = document.getElementById("edit-forum-title").value.trim();
  const description = document.getElementById("edit-forum-description").value.trim();

  if (!title || !description || currentEditTags.length === 0) {
    alert("Please fill in all fields and add at least one tag.");
    return;
  }

  try {
    const response = await fetch(`/api/teacher/forums/${forumId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        description,
        tags: [...currentEditTags],
        published: true, // Assuming published if editing in this view
      }),
    });

    if (!response.ok) throw new Error("Failed to update forum");

    closeForumModal();
    loadForums();
    loadCategories();
    loadStats();
  } catch (error) {
    console.error("Error updating forum:", error);
  }
}

// Toggle forum publish status
async function toggleForumStatus(index) {
  // Not explicitly implemented in UI buttons yet but for completeness:
  // This would involve a PUT request to the API
}

// Delete forum
async function deleteForum(forumId, replyCount) {
  let message = "Are you sure you want to delete this forum? This action cannot be undone.";
  let confirmTitle = "Confirm Deletion";

  if (replyCount > 0) {
    message = `This forum has ${replyCount} replies and cannot be fully deleted. It will be archived instead. Archived forums are hidden from students but remain available for your records. Do you want to archive this forum?`;
    confirmTitle = "Confirm Archive";
  }

  if (!confirm(message)) return;

  try {
    const response = await fetch(`/api/teacher/forums/${forumId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) throw new Error("Failed to delete forum");

    loadForums();
    loadCategories();
    loadStats();
  } catch (error) {
    console.error("Error deleting forum:", error);
  }
}

// Tag management for edit form
function addEditTag() {
  const tagInput = document.getElementById("edit-tag-input");
  const tagValue = tagInput?.value.trim();
  if (!tagValue) return;

  if (currentEditTags.includes(tagValue.toLowerCase())) return;

  currentEditTags.push(tagValue.toLowerCase());
  updateEditTagsDisplay();
  if (tagInput) tagInput.value = "";
}

function updateEditTagsDisplay() {
  const tagsList = document.getElementById("edit-tags-list");
  if (!tagsList) return;
  tagsList.innerHTML = currentEditTags
    .map(
      (tag) => `
    <span class="tag-item">
      ${tag}
      <i class="fas fa-times remove-tag" onclick="removeEditTag('${tag}')"></i>
    </span>
  `
    )
    .join("");
}

function removeEditTag(tagToRemove) {
  currentEditTags = currentEditTags.filter((tag) => tag !== tagToRemove);
  updateEditTagsDisplay();
}

// Reset modal to initial state
function resetModal() {
  document.getElementById("forum-title").value = "";
  document.getElementById("forum-description").value = "";
  document.getElementById("publish-checkbox").checked = true;
  document.getElementById("tag-input").value = "";
  currentTags = [];
  updateTagsDisplay();
}

function formatDate(dateString) {
  if (!dateString) return "Date unknown";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
