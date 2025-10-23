// Forum View Page JavaScript

document.addEventListener("DOMContentLoaded", function () {
  initializeForumView();
});

let currentForumId = null;
let allMyForums = [];
let allOtherForums = [];
let currentEditTags = [];

function initializeForumView() {
  loadMyForums();
  loadAllForums();
  loadPlatformStats();
  setupSearch();

  // Set up event listeners
  setupForumInteractions();
}

function setupSearch() {
  const searchInput = document.getElementById("forum-search");
  searchInput.addEventListener("input", function () {
    const searchTerm = this.value.toLowerCase().trim();
    filterForums(searchTerm);
  });
}

function filterForums(searchTerm) {
  if (!searchTerm) {
    // Show all forums
    displayMyForums(allMyForums);
    displayOtherForums(allOtherForums);
    return;
  }

  // Filter my forums
  const filteredMyForums = allMyForums.filter(
    (forum) =>
      forum.title.toLowerCase().includes(searchTerm) ||
      (Array.isArray(forum.tags) &&
        forum.tags.some((tag) => tag.toLowerCase().includes(searchTerm))) ||
      forum.description.toLowerCase().includes(searchTerm)
  );

  // Filter other forums
  const filteredOtherForums = allOtherForums.filter(
    (forum) =>
      forum.title.toLowerCase().includes(searchTerm) ||
      (Array.isArray(forum.tags) &&
        forum.tags.some((tag) => tag.toLowerCase().includes(searchTerm))) ||
      forum.description.toLowerCase().includes(searchTerm)
  );

  displayMyForums(filteredMyForums);
  displayOtherForums(filteredOtherForums);
}

function loadMyForums() {
  const currentUser = localStorage.getItem("username") || "Teacher";
  allMyForums = getAllForums().filter((f) => f.author === currentUser);
  displayMyForums(allMyForums);
}

function displayMyForums(forums) {
  const container = document.getElementById("my-forums");

  if (forums.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 24px; color: rgba(255, 255, 255, 0.6);">
        <i class="fas fa-edit" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
        <p>${
          allMyForums.length === 0
            ? "You haven't created any forums yet"
            : "No forums match your search"
        }</p>
        ${
          allMyForums.length === 0
            ? '<small><a href="forum.html" style="color: var(--color-white); text-decoration: underline;">Create your first forum</a></small>'
            : ""
        }
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
        <span class="topic-category ${
          forum.published ? "published" : "draft"
        }">${forum.published ? "Published" : "Draft"}</span>
      </div>
      <div class="topic-meta">
        <span class="topic-author">by ${forum.author}</span>
        <span class="topic-stats">
          <i class="fas fa-calendar"></i> ${formatDate(forum.createdAt)} •
          <i class="fas fa-reply"></i> ${
            Array.isArray(forum.replies) ? forum.replies.length : 0
          }
        </span>
      </div>
      <div class="topic-preview">${forum.description}</div>
    `;

    forumCard.addEventListener("click", () => openForumDetail(forum.id));
    container.appendChild(forumCard);
  });
}

function loadAllForums() {
  const currentUser = localStorage.getItem("username") || "Teacher";
  allOtherForums = getAllForums().filter(
    (f) => f.published && f.author !== currentUser
  );
  displayOtherForums(allOtherForums);
}

function displayOtherForums(forums) {
  const container = document.getElementById("all-forums");

  if (forums.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 24px; color: rgba(255, 255, 255, 0.6);">
        <i class="fas fa-comments" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
        <p>${
          allOtherForums.length === 0
            ? "No other forums available"
            : "No forums match your search"
        }</p>
        ${
          allOtherForums.length === 0
            ? "<small>Be the first to create a forum!</small>"
            : ""
        }
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
        <span class="topic-category">${
          Array.isArray(forum.tags) ? forum.tags.join(", ") : ""
        }</span>
      </div>
      <div class="topic-meta">
        <span class="topic-author">by ${forum.author}</span>
        <span class="topic-stats">
          <i class="fas fa-calendar"></i> ${formatDate(forum.createdAt)} •
          <i class="fas fa-reply"></i> ${
            Array.isArray(forum.replies) ? forum.replies.length : 0
          }
        </span>
      </div>
      <div class="topic-preview">${forum.description}</div>
    `;

    forumCard.addEventListener("click", () => openForumDetail(forum.id));
    container.appendChild(forumCard);
  });
}

function getAllForums() {
  return JSON.parse(localStorage.getItem("teacher_forums")) || [];
}

function loadPlatformStats() {
  const forums = getAllForums();
  const publishedForums = forums.filter((f) => f.published);
  const totalForums = forums.length;
  const totalReplies = forums.reduce(
    (sum, f) => sum + (Array.isArray(f.replies) ? f.replies.length : 0),
    0
  );

  // Get unique teachers
  const teachers = [...new Set(forums.map((f) => f.author))];
  const totalTeachers = teachers.length;

  document.getElementById("total-forums").textContent = totalForums;
  document.getElementById("total-teachers").textContent = totalTeachers;
  document.getElementById("total-replies").textContent = totalReplies;
}

function openForumDetail(forumId) {
  const forums = getAllForums();
  const forum = forums.find((f) => f.id === forumId);
  if (!forum) return;

  currentForumId = forumId;

  // Display mode
  document.getElementById("forum-title-display").textContent = forum.title;
  document.getElementById("forum-author").textContent = `by ${forum.author}`;
  document.getElementById("forum-date").textContent = formatDate(
    forum.createdAt
  );
  document.getElementById("forum-description-display").textContent =
    forum.description;

  // Display tags
  const tagsContainer = document.getElementById("forum-tags");
  tagsContainer.innerHTML = Array.isArray(forum.tags)
    ? forum.tags.map((tag) => `<span class="tag-item">${tag}</span>`).join("")
    : "";

  // Show edit button if current user is the author
  const currentUser = localStorage.getItem("username") || "Teacher";
  const forumActions = document.getElementById("forum-actions");
  const forumContent = document.querySelector(".forum-content");
  const forumEdit = document.getElementById("forum-edit");

  if (forum.author === currentUser) {
    forumActions.style.display = "block";
    forumContent.style.display = "block";
    forumEdit.style.display = "none";
  } else {
    forumActions.style.display = "none";
    forumContent.style.display = "block";
    forumEdit.style.display = "none";
  }

  // Display replies
  loadReplies(forum.replies);

  const modal = document.getElementById("forum-detail-modal");
  modal.classList.add("show");
}

function loadReplies(replies) {
  const container = document.getElementById("replies-list");
  if (!Array.isArray(replies) || replies.length === 0) {
    container.innerHTML =
      '<p style="color: rgba(255, 255, 255, 0.6); text-align: center; padding: 20px;">No replies yet. Be the first to reply!</p>';
    return;
  }

  container.innerHTML = replies
    .map(
      (reply, index) => `
    <div class="reply-item">
      <div class="reply-header">
        <span class="reply-author">${reply.author}</span>
        <span class="reply-date">${formatDate(reply.createdAt)}</span>
        <div class="reply-actions">
          <button class="flag-reply-btn" onclick="flagReply(${index})" title="Flag as inappropriate">
            <i class="fas fa-flag"></i>
          </button>
          <button class="delete-reply-btn" onclick="deleteReply(${index})" title="Delete reply">
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

function addReply() {
  const content = document.getElementById("reply-content").value.trim();
  if (!content) {
    showNotification("Please enter a reply", "error");
    return;
  }

  const forums = getAllForums();
  const forum = forums.find((f) => f.id === currentForumId);
  if (!forum) return;

  // Ensure replies is an array
  if (!Array.isArray(forum.replies)) {
    forum.replies = [];
  }

  const reply = {
    id: Date.now(),
    content,
    author: localStorage.getItem("username") || "Teacher",
    createdAt: new Date().toISOString(),
  };

  forum.replies.push(reply);
  saveAllForums(forums);

  document.getElementById("reply-content").value = "";
  loadReplies(forum.replies);

  // Refresh the forum lists
  loadMyForums();
  loadAllForums();
  loadPlatformStats();

  // Re-apply current search filter
  const searchTerm = document
    .getElementById("forum-search")
    .value.toLowerCase()
    .trim();
  if (searchTerm) {
    filterForums(searchTerm);
  }

  // Close the modal after posting
  closeForumModal();

  showNotification("Reply posted successfully!", "success");
}

function saveAllForums(forums) {
  localStorage.setItem("teacher_forums", JSON.stringify(forums));
}

function deleteReply(replyIndex) {
  if (
    !confirm(
      "Are you sure you want to delete this reply? This action cannot be undone."
    )
  ) {
    return;
  }

  const forums = getAllForums();
  const forum = forums.find((f) => f.id === currentForumId);
  if (!forum || !Array.isArray(forum.replies)) return;

  forum.replies.splice(replyIndex, 1);
  saveAllForums(forums);

  // Refresh the display
  loadReplies(forum.replies);
  loadMyForums();
  loadAllForums();
  loadPlatformStats();

  // Re-apply current search filter
  const searchTerm = document
    .getElementById("forum-search")
    .value.toLowerCase()
    .trim();
  if (searchTerm) {
    filterForums(searchTerm);
  }

  showNotification("Reply deleted successfully!", "success");
}

function flagReply(replyIndex) {
  const forums = getAllForums();
  const forum = forums.find((f) => f.id === currentForumId);
  if (!forum || !Array.isArray(forum.replies) || !forum.replies[replyIndex])
    return;

  const reply = forum.replies[replyIndex];
  const flagged = confirm(
    `Flag this reply as inappropriate?\n\n"${reply.content}"\n\nBy: ${reply.author}`
  );

  if (flagged) {
    // Mark as flagged (you could store this in a separate array or add a flag property)
    if (!forum.flaggedReplies) forum.flaggedReplies = [];
    forum.flaggedReplies.push({
      replyIndex,
      reply: reply,
      flaggedBy: localStorage.getItem("username") || "Teacher",
      flaggedAt: new Date().toISOString(),
    });

    saveAllForums(forums);
    showNotification("Reply has been flagged for review!", "success");
  }
}

function editForum() {
  const forums = getAllForums();
  const forum = forums.find((f) => f.id === currentForumId);
  if (!forum) return;

  // Switch to edit mode
  document.querySelector(".forum-content").style.display = "none";
  document.getElementById("forum-actions").style.display = "none";
  document.getElementById("forum-edit").style.display = "block";

  // Populate edit fields
  document.getElementById("edit-forum-title").value = forum.title;
  document.getElementById("edit-forum-description").value = forum.description;

  // Handle tags
  currentEditTags = Array.isArray(forum.tags) ? [...forum.tags] : [];
  updateEditTagsDisplay();

  // Set up tag input
  const tagInput = document.getElementById("edit-tag-input");
  const addTagBtn = document.getElementById("edit-add-tag-btn");

  const addTagHandler = () => {
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

    if (currentEditTags.includes(tagValue.toLowerCase())) {
      alert("This tag already exists.");
      return;
    }

    currentEditTags.push(tagValue.toLowerCase());
    updateEditTagsDisplay();
    tagInput.value = "";
    tagInput.focus();
  };

  addTagBtn.onclick = addTagHandler;
  tagInput.onkeypress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTagHandler();
    }
  };
}

function cancelEdit() {
  // Switch back to display mode
  document.querySelector(".forum-content").style.display = "block";
  document.getElementById("forum-actions").style.display = "block";
  document.getElementById("forum-edit").style.display = "none";
}

function saveForumEdit() {
  const title = document.getElementById("edit-forum-title").value.trim();
  const description = document
    .getElementById("edit-forum-description")
    .value.trim();

  if (!title) {
    alert("Please enter a forum title.");
    return;
  }

  if (!description) {
    alert("Please enter a forum description.");
    return;
  }

  const forums = getAllForums();
  const forum = forums.find((f) => f.id === currentForumId);
  if (!forum) return;

  // Update forum
  forum.title = title;
  forum.description = description;
  forum.tags = [...currentEditTags];

  saveAllForums(forums);

  // Switch back to display mode and refresh
  cancelEdit();
  openForumDetail(currentForumId); // Refresh the display
  loadMyForums();
  loadAllForums();

  showNotification("Forum updated successfully!", "success");
}

function updateEditTagsDisplay() {
  const tagsList = document.getElementById("edit-tags-list");
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

function closeForumModal() {
  const modal = document.getElementById("forum-detail-modal");
  modal.classList.remove("show");
  currentForumId = null;
}

function setupForumInteractions() {
  // Forum click handlers are handled in loadAllForums
}

// Close modal when clicking outside
document.addEventListener("click", function (e) {
  const modal = document.getElementById("forum-detail-modal");
  if (e.target === modal) {
    closeForumModal();
  }
});

// Handle escape key
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeForumModal();
  }
});

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
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
