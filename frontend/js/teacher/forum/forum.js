// Teacher Forum Management JavaScript

document.addEventListener("DOMContentLoaded", function () {
  loadForums();
  loadCategories();
  loadStats();
  bindEvents();
});

let currentTags = [];
let currentFilter = "all";
let currentEditTags = [];
function loadForums() {
  const forums = getForums();
  const container = document.getElementById("my-forums");

  // Filter forums based on current filter
  let filteredForums = forums;
  if (currentFilter === "published") {
    filteredForums = forums.filter((f) => f.published);
  } else if (currentFilter === "draft") {
    filteredForums = forums.filter((f) => !f.published);
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
  filteredForums.forEach((forum, index) => {
    const forumCard = document.createElement("div");
    forumCard.className = "topic-item";
    forumCard.innerHTML = `
      <div class="topic-header">
        <span class="topic-title">${forum.title}</span>
        <span class="topic-category ${
          forum.published ? "published" : "draft"
        }">${forum.published ? "Published" : "Draft"}</span>
      </div>
      <div class="topic-meta">
        <span class="topic-author">by ${forum.author}</span>
        <span class="topic-stats">
          <i class="fas fa-calendar"></i> ${formatDate(forum.createdAt)}
        </span>
      </div>
      <div class="topic-preview">${forum.description}</div>
    `;

    // Add click handler to open forum details
    forumCard.addEventListener("click", () => {
      openForumDetail(forums.indexOf(forum));
    });

    container.appendChild(forumCard);
  });
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

  editAddTagBtn.addEventListener("click", () => {
    addEditTag();
  });

  editTagInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addEditTag();
    }
  });

  // Close dropdowns when clicking outside
  document.addEventListener("click", () => {
    document
      .querySelectorAll(".dropdown")
      .forEach((dd) => (dd.style.display = "none"));
  });
}

// Add a tag to the current forum
function addTag() {
  const tagInput = document.getElementById("tag-input");
  const tagValue = tagInput.value.trim();

  if (!tagValue) return;

  // Validate tag: letters only, max 20 characters
  const tagRegex = /^[a-zA-Z\s]+$/;
  if (!tagRegex.test(tagValue)) {
    alert("Tags can only contain letters and spaces.");
    return;
  }

  if (tagValue.length > 20) {
    alert("Tags cannot exceed 20 characters.");
    return;
  }

  // Check for duplicates
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
function saveForum() {
  const title = document.getElementById("forum-title").value.trim();
  const description = document.getElementById("forum-description").value.trim();
  const published = document.getElementById("publish-checkbox").checked;

  if (!title) {
    alert("Please enter a forum title.");
    return;
  }

  if (!description) {
    alert("Please enter a forum description.");
    return;
  }

  if (currentTags.length === 0) {
    alert("Please add at least one tag.");
    return;
  }

  const forum = {
    id: Date.now(),
    title,
    description,
    tags: [...currentTags],
    published,
    createdAt: new Date().toISOString(),
    author: localStorage.getItem("username") || "Teacher",
    replies: [],
  };

  const forums = getForums();
  forums.push(forum);
  saveForums(forums);

  document.getElementById("forum-modal").classList.remove("show");
  resetModal();
  loadForums();
}

// Edit forum
function editForum(index) {
  const forums = getForums();
  const forum = forums[index];

  document.getElementById("modal-title").textContent = "Edit Forum";
  document.getElementById("forum-title").value = forum.title;
  document.getElementById("forum-description").value = forum.description;
  document.getElementById("publish-checkbox").checked = forum.published;

  currentTags = [...forum.tags];
  updateTagsDisplay();

  const modal = document.getElementById("forum-modal");
  modal.classList.add("show");

  // Update save button to handle edit
  const saveBtn = document.getElementById("save-forum-btn");
  const originalHandler = saveBtn.onclick;
  saveBtn.textContent = "Update Forum";
  saveBtn.onclick = () => {
    updateForum(index);
    saveBtn.onclick = originalHandler;
    saveBtn.textContent = "Create Forum";
  };
}

// Update forum
function updateForum(index) {
  const title = document.getElementById("forum-title").value.trim();
  const description = document.getElementById("forum-description").value.trim();
  const published = document.getElementById("publish-checkbox").checked;

  if (!title || !description || currentTags.length === 0) {
    alert("Please fill in all fields and add at least one tag.");
    return;
  }

  const forums = getForums();
  forums[index] = {
    ...forums[index],
    title,
    description,
    tags: [...currentTags],
    published,
  };

  saveForums(forums);
  document.getElementById("forum-modal").classList.remove("show");
  resetModal();
  loadForums();
  loadCategories();
  loadStats();
}

// Load category counts
function loadCategories() {
  const forums = getForums();
  const allCount = forums.length;
  const publishedCount = forums.filter((f) => f.published).length;
  const draftCount = forums.filter((f) => !f.published).length;

  document.getElementById("all-count").textContent = allCount;
  document.getElementById("published-count").textContent = publishedCount;
  document.getElementById("draft-count").textContent = draftCount;

  // Set active category
  document.querySelectorAll(".category-item").forEach((item) => {
    item.classList.remove("active");
  });
  const activeCategory = document.querySelector(
    `[onclick="filterByCategory('${currentFilter}')"]`
  );
  if (activeCategory) {
    activeCategory.classList.add("active");
  }
}

// Load forum statistics
function loadStats() {
  const forums = getForums();
  const totalForums = forums.length;
  const publishedForums = forums.filter((f) => f.published).length;
  const draftForums = forums.filter((f) => !f.published).length;

  // Calculate total replies from all forums
  const totalReplies = forums.reduce((total, forum) => {
    return total + (forum.replies ? forum.replies.length : 0);
  }, 0);

  document.getElementById("total-forums").textContent = totalForums;
  document.getElementById("published-forums").textContent = publishedForums;
  document.getElementById("draft-forums").textContent = draftForums;
  document.getElementById("total-replies").textContent = totalReplies;
}

// Filter forums by category
function filterByCategory(category, event) {
  currentFilter = category;
  loadForums();

  // Update active category styling
  document.querySelectorAll(".category-item").forEach((item) => {
    item.classList.remove("active");
  });
  if (event && event.target) {
    event.target.closest(".category-item").classList.add("active");
  }
}

// Toggle forum publish status
function toggleForumStatus(index) {
  const forums = getForums();
  forums[index].published = !forums[index].published;
  saveForums(forums);
  loadForums();
  loadCategories();
  loadStats();
}

// Delete forum
function deleteForum(index) {
  if (
    confirm(
      "Are you sure you want to delete this forum? This action cannot be undone."
    )
  ) {
    const forums = getForums();
    forums.splice(index, 1);
    saveForums(forums);
    loadForums();
    loadCategories();
    loadStats();
  }
}

// Open forum detail modal
function openForumDetail(index) {
  const forums = getForums();
  const forum = forums[index];

  // Populate modal with forum data
  document.getElementById("forum-title-display").textContent = forum.title;
  document.getElementById("forum-description-display").textContent =
    forum.description;
  document.getElementById("forum-author").textContent = `by ${forum.author}`;
  document.getElementById("forum-date").textContent = formatDate(
    forum.createdAt
  );

  // Display tags
  const tagsContainer = document.getElementById("forum-tags");
  tagsContainer.innerHTML = forum.tags
    .map((tag) => `<span class="tag-item">${tag}</span>`)
    .join("");

  // Show modal
  document.getElementById("forum-detail-modal").classList.add("show");

  // Load replies
  loadReplies(index);

  // Store current forum index for editing
  document.getElementById("forum-detail-modal").dataset.forumIndex = index;
}

// Close forum modal
function closeForumModal() {
  document.getElementById("forum-detail-modal").classList.remove("show");
  cancelEdit(); // Reset any ongoing edits
}

// Load replies for a forum
function loadReplies(forumIndex) {
  const forums = getForums();
  const forum = forums[forumIndex];
  const repliesList = document.getElementById("replies-list");

  if (!forum.replies || forum.replies.length === 0) {
    repliesList.innerHTML = `
      <div style="text-align: center; padding: 24px; color: rgba(255, 255, 255, 0.6);">
        <i class="fas fa-comments" style="font-size: 24px; margin-bottom: 8px; opacity: 0.5;"></i>
        <p>No replies yet</p>
        <small>Be the first to reply to this forum</small>
      </div>
    `;
    return;
  }

  repliesList.innerHTML = forum.replies
    .map(
      (reply, replyIndex) => `
    <div class="reply-item ${reply.flagged ? "flagged" : ""}">
      <div class="reply-header">
        <span class="reply-author">${reply.author}</span>
        <span class="reply-date">${formatDate(reply.createdAt)}</span>
        <div class="reply-actions">
          <button class="btn-icon flag-btn" onclick="flagReply(${forumIndex}, ${replyIndex})" title="Flag as inappropriate">
            <i class="fas fa-flag"></i>
          </button>
          <button class="btn-icon delete-btn" onclick="deleteReply(${forumIndex}, ${replyIndex})" title="Delete reply">
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
function addReply() {
  const replyContent = document.getElementById("reply-content").value.trim();
  const forumIndex =
    document.getElementById("forum-detail-modal").dataset.forumIndex;

  if (!replyContent) {
    alert("Please enter a reply.");
    return;
  }

  const forums = getForums();
  const reply = {
    author: localStorage.getItem("username") || "Teacher",
    content: replyContent,
    createdAt: new Date().toISOString(),
    flagged: false,
  };

  if (!forums[forumIndex].replies) {
    forums[forumIndex].replies = [];
  }

  forums[forumIndex].replies.push(reply);
  saveForums(forums);

  // Reload replies and clear input
  loadReplies(forumIndex);
  document.getElementById("reply-content").value = "";

  // Auto-close modal after posting
  setTimeout(() => {
    closeForumModal();
  }, 1500);
}

// Delete reply
function deleteReply(forumIndex, replyIndex) {
  if (confirm("Are you sure you want to delete this reply?")) {
    const forums = getForums();
    forums[forumIndex].replies.splice(replyIndex, 1);
    saveForums(forums);
    loadReplies(forumIndex);
  }
}

// Flag reply
function flagReply(forumIndex, replyIndex) {
  if (confirm("Are you sure you want to flag this reply as inappropriate?")) {
    const forums = getForums();
    forums[forumIndex].replies[replyIndex].flagged = true;
    saveForums(forums);
    loadReplies(forumIndex);
  }
}

// Edit forum inline
function editForum() {
  const forumIndex =
    document.getElementById("forum-detail-modal").dataset.forumIndex;
  const forums = getForums();
  const forum = forums[forumIndex];

  // Populate edit fields
  document.getElementById("edit-forum-title").value = forum.title;
  document.getElementById("edit-forum-description").value = forum.description;
  currentEditTags = [...forum.tags];
  updateEditTagsDisplay();

  // Switch to edit mode
  const forumContent = document.getElementById("forum-content");
  const forumActions = document.getElementById("forum-actions");
  const forumEdit = document.getElementById("forum-edit");

  if (forumContent) forumContent.style.display = "none";
  if (forumActions) forumActions.style.display = "none";
  if (forumEdit) forumEdit.style.display = "block";
}

// Cancel edit
function cancelEdit() {
  const forumContent = document.getElementById("forum-content");
  const forumActions = document.getElementById("forum-actions");
  const forumEdit = document.getElementById("forum-edit");

  if (forumContent) forumContent.style.display = "block";
  if (forumActions) forumActions.style.display = "block";
  if (forumEdit) forumEdit.style.display = "none";

  // Clear edit fields
  const editTitle = document.getElementById("edit-forum-title");
  const editDesc = document.getElementById("edit-forum-description");

  if (editTitle) editTitle.value = "";
  if (editDesc) editDesc.value = "";
  currentEditTags = [];
  updateEditTagsDisplay();
}

// Save forum edit
function saveForumEdit() {
  const forumIndex =
    document.getElementById("forum-detail-modal").dataset.forumIndex;
  const title = document.getElementById("edit-forum-title").value.trim();
  const description = document
    .getElementById("edit-forum-description")
    .value.trim();

  if (!title || !description || currentEditTags.length === 0) {
    alert("Please fill in all fields and add at least one tag.");
    return;
  }

  const forums = getForums();
  forums[forumIndex].title = title;
  forums[forumIndex].description = description;
  forums[forumIndex].tags = [...currentEditTags];
  saveForums(forums);

  // Update display and exit edit mode
  const titleDisplay = document.getElementById("forum-title-display");
  const descDisplay = document.getElementById("forum-description-display");
  const tagsContainer = document.getElementById("forum-tags");

  if (titleDisplay) titleDisplay.textContent = title;
  if (descDisplay) descDisplay.textContent = description;
  if (tagsContainer) {
    tagsContainer.innerHTML = currentEditTags
      .map((tag) => `<span class="tag-item">${tag}</span>`)
      .join("");
  }

  cancelEdit();
  loadForums(); // Refresh the forum list
}

// Add tag to edit form
function addEditTag() {
  const tagInput = document.getElementById("edit-tag-input");
  if (!tagInput) return;

  const tagValue = tagInput.value.trim();

  if (!tagValue) return;

  // Validate tag: letters only, max 20 characters
  const tagRegex = /^[a-zA-Z\s]+$/;
  if (!tagRegex.test(tagValue)) {
    alert("Tags can only contain letters and spaces.");
    return;
  }

  if (tagValue.length > 20) {
    alert("Tags cannot exceed 20 characters.");
    return;
  }

  // Check for duplicates
  if (currentEditTags.includes(tagValue.toLowerCase())) {
    alert("This tag already exists.");
    return;
  }

  currentEditTags.push(tagValue.toLowerCase());
  updateEditTagsDisplay();
  tagInput.value = "";
  tagInput.focus();
}

// Update edit tags display
function updateEditTagsDisplay() {
  const tagsList = document.getElementById("edit-tags-list");
  if (tagsList) {
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
}

// Remove tag from edit form
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

// Get forums from localStorage
function getForums() {
  return JSON.parse(localStorage.getItem("teacher_forums")) || [];
}

// Save forums to localStorage
function saveForums(forums) {
  localStorage.setItem("teacher_forums", JSON.stringify(forums));
}

// Format date for display
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
