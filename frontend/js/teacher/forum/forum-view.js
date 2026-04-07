// Forum View Page JavaScript

const authToken = localStorage.getItem("authToken");

document.addEventListener("DOMContentLoaded", function () {
  initializeForumView();
});

let currentForumId = null;
let allMyForums = [];
let allOtherForums = [];
let currentEditTags = [];

async function initializeForumView() {
  await loadMyForums();
  await loadAllForums();
  await loadPlatformStats();
  setupSearch();

  // Set up event listeners
  setupForumInteractions();
}

function setupSearch() {
  const searchInput = document.getElementById("forum-search");
  if (!searchInput) return;
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
      ((forum.tags || []).some((tag) => tag.toLowerCase().includes(searchTerm))) ||
      forum.description.toLowerCase().includes(searchTerm)
  );

  // Filter other forums
  const filteredOtherForums = allOtherForums.filter(
    (forum) =>
      forum.title.toLowerCase().includes(searchTerm) ||
      ((forum.tags || []).some((tag) => tag.toLowerCase().includes(searchTerm))) ||
      forum.description.toLowerCase().includes(searchTerm)
  );

  displayMyForums(filteredMyForums);
  displayOtherForums(filteredOtherForums);
}

async function loadMyForums() {
  try {
    const response = await fetch("/api/teacher/forums/my", {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (!response.ok) throw new Error("Failed to load your forums");
    allMyForums = await response.json();
    displayMyForums(allMyForums);
  } catch (error) {
    console.error("Error loading my forums:", error);
  }
}

function displayMyForums(forums) {
  const container = document.getElementById("my-forums");
  if (!container) return;

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
          <i class="fas fa-calendar"></i> ${formatDate(forum.created_at)} •
          <i class="fas fa-reply"></i> ${forum.reply_count || 0}
        </span>
      </div>
      <div class="topic-preview">${forum.description}</div>
    `;

    forumCard.addEventListener("click", () => openForumDetail(forum.id));
    container.appendChild(forumCard);
  });
}

async function loadAllForums() {
  try {
    const response = await fetch("/api/teacher/forums", {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (!response.ok) throw new Error("Failed to load forums");
    const forums = await response.json();
    
    // We'll filter out own forums in frontend for this specific view if needed
    // but the API returns all published ones.
    const currentUser = localStorage.getItem("username") || "Teacher";
    allOtherForums = forums.filter(f => f.author !== currentUser);
    
    displayOtherForums(allOtherForums);
  } catch (error) {
    console.error("Error loading all forums:", error);
  }
}

function displayOtherForums(forums) {
  const container = document.getElementById("all-forums");
  if (!container) return;

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
          (forum.tags || []).join(", ")
        }</span>
      </div>
      <div class="topic-meta">
        <span class="topic-author">by ${forum.author}</span>
        <span class="topic-stats">
          <i class="fas fa-calendar"></i> ${formatDate(forum.created_at)} •
          <i class="fas fa-reply"></i> ${forum.reply_count || 0}
        </span>
      </div>
      <div class="topic-preview">${forum.description}</div>
    `;

    forumCard.addEventListener("click", () => openForumDetail(forum.id));
    container.appendChild(forumCard);
  });
}

async function loadPlatformStats() {
  try {
    const response = await fetch("/api/teacher/forums", {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (!response.ok) return;
    const forums = await response.json();

    const totalForums = forums.length;
    const totalReplies = forums.reduce((sum, f) => sum + (f.reply_count || 0), 0);
    const teachers = [...new Set(forums.map((f) => f.author))];
    const totalTeachers = teachers.length;

    document.getElementById("total-forums").textContent = totalForums;
    document.getElementById("total-teachers").textContent = totalTeachers;
    document.getElementById("total-replies").textContent = totalReplies;
  } catch (error) {
    console.error("Error loading stats:", error);
  }
}

async function openForumDetail(forumId) {
  try {
    const response = await fetch(`/api/teacher/forums/${forumId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    if (!response.ok) throw new Error("Failed to load forum details");
    const forum = await response.json();

    currentForumId = forumId;

    // Display mode
    document.getElementById("forum-title-display").textContent = forum.title;
    document.getElementById("forum-author").textContent = `by ${forum.author}`;
    document.getElementById("forum-date").textContent = formatDate(forum.created_at);
    document.getElementById("forum-description-display").textContent = forum.description;

    // Display tags
    const tagsContainer = document.getElementById("forum-tags");
    tagsContainer.innerHTML = (forum.tags || [])
      .map((tag) => `<span class="tag-item">${tag}</span>`)
      .join("");

    // Show actions if current user is the author
    const currentUser = localStorage.getItem("username") || "Teacher";
    const forumActions = document.getElementById("forum-actions");
    const forumContent = document.querySelector(".forum-content");
    const forumEdit = document.getElementById("forum-edit");

    if (forum.author === currentUser) {
      if (forumActions) forumActions.style.display = "block";
    } else {
      if (forumActions) forumActions.style.display = "none";
    }
    
    if (forumContent) forumContent.style.display = "block";
    if (forumEdit) forumEdit.style.display = "none";

    // Increment view count
    fetch(`/api/teacher/forums/${forumId}/view`, {
      method: "POST",
      headers: { Authorization: `Bearer ${authToken}` },
    }).catch(err => console.error("Error incrementing views:", err));

    // Display replies
    loadReplies(forum.replies, forum.id);

    // Set up delete button listener
    const deleteBtn = document.getElementById("delete-forum-btn");
    if (deleteBtn) {
      deleteBtn.onclick = () => {
        const replyCount = forum.replies ? forum.replies.length : 0;
        deleteForum(forumId, replyCount);
      };
    }

    const modal = document.getElementById("forum-detail-modal");
    modal.classList.add("show");
  } catch (error) {
    console.error("Error opening forum detail:", error);
  }
}

function loadReplies(replies, forumId) {
  const container = document.getElementById("replies-list");
  if (!replies || replies.length === 0) {
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
        <span class="reply-date">${formatDate(reply.created_at)}</span>
        <div class="reply-actions">
          <button class="delete-reply-btn" onclick="deleteReply(${forumId}, ${reply.id})" title="Delete reply">
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

async function addReply() {
  const content = document.getElementById("reply-content").value.trim();
  if (!content) {
    showNotification("Please enter a reply", "error");
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

    document.getElementById("reply-content").value = "";
    
    // Refresh the forum view
    const refreshedResponse = await fetch(`/api/teacher/forums/${currentForumId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const refreshedForum = await refreshedResponse.json();
    loadReplies(refreshedForum.replies, currentForumId);

    // Refresh the lists
    loadMyForums();
    loadAllForums();
    loadPlatformStats();

    showNotification("Reply posted successfully!", "success");
  } catch (error) {
    console.error("Error adding reply:", error);
    showNotification("Failed to post reply", "error");
  }
}

async function deleteReply(forumId, replyId) {
  if (!confirm("Are you sure you want to delete this reply? This action cannot be undone.")) return;

  try {
    const response = await fetch(`/api/teacher/forums/${forumId}/replies/${replyId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (!response.ok) throw new Error("Failed to delete reply");

    // Refresh the forum view
    const refreshedResponse = await fetch(`/api/teacher/forums/${forumId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const refreshedForum = await refreshedResponse.json();
    loadReplies(refreshedForum.replies, forumId);

    // Refresh the lists
    loadMyForums();
    loadAllForums();
    loadPlatformStats();

    showNotification("Reply deleted successfully!", "success");
  } catch (error) {
    console.error("Error deleting reply:", error);
    showNotification("Failed to delete reply", "error");
  }
}

async function deleteForum(forumId, replyCount) {
  let message = "Are you sure you want to delete this forum? This action cannot be undone.";
  
  if (replyCount > 0) {
    message = `This forum has ${replyCount} replies and cannot be fully deleted. It will be archived instead. Do you want to archive this forum?`;
  }

  if (!confirm(message)) return;

  try {
    const response = await fetch(`/api/teacher/forums/${forumId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${authToken}` },
    });

    if (!response.ok) throw new Error("Failed to delete forum");

    closeForumModal();
    loadMyForums();
    loadAllForums();
    loadPlatformStats();

    showNotification(replyCount > 0 ? "Forum archived successfully!" : "Forum deleted successfully!", "success");
  } catch (error) {
    console.error("Error deleting forum:", error);
    showNotification("Failed to delete forum", "error");
  }
}

async function editForum() {
  try {
    const response = await fetch(`/api/teacher/forums/${currentForumId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const forum = await response.json();

    // Switch to edit mode
    document.querySelector(".forum-content").style.display = "none";
    const forumActions = document.getElementById("forum-actions");
    if (forumActions) forumActions.style.display = "none";
    document.getElementById("forum-edit").style.display = "block";

    // Populate edit fields
    document.getElementById("edit-forum-title").value = forum.title;
    document.getElementById("edit-forum-description").value = forum.description;

    // Handle tags
    currentEditTags = [...(forum.tags || [])];
    updateEditTagsDisplay();
  } catch (error) {
    console.error("Error preparing edit:", error);
  }
}

function cancelEdit() {
  // Switch back to display mode
  document.querySelector(".forum-content").style.display = "block";
  const forumActions = document.getElementById("forum-actions");
  if (forumActions) forumActions.style.display = "block";
  document.getElementById("forum-edit").style.display = "none";
}

async function saveForumEdit() {
  const title = document.getElementById("edit-forum-title").value.trim();
  const description = document.getElementById("edit-forum-description").value.trim();

  if (!title || !description) {
    alert("Please fill in all fields.");
    return;
  }

  try {
    const response = await fetch(`/api/teacher/forums/${currentForumId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        description,
        tags: [...currentEditTags],
        published: true,
      }),
    });

    if (!response.ok) throw new Error("Failed to update forum");

    // Switch back to display mode and refresh
    cancelEdit();
    openForumDetail(currentForumId); 
    loadMyForums();
    loadAllForums();

    showNotification("Forum updated successfully!", "success");
  } catch (error) {
    console.error("Error updating forum:", error);
    showNotification("Failed to update forum", "error");
  }
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

function closeForumModal() {
  const modal = document.getElementById("forum-detail-modal");
  if (modal) modal.classList.remove("show");
  currentForumId = null;
}

function setupForumInteractions() {
  const addTagBtn = document.getElementById("edit-add-tag-btn");
  const tagInput = document.getElementById("edit-tag-input");

  if (addTagBtn && tagInput) {
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
  if (!dateString) return "Date unknown";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function showNotification(message, type = "info") {
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

  if (type === "error") {
    notification.style.background = "rgba(239, 68, 68, 0.9)";
  } else if (type === "success") {
    notification.style.background = "rgba(34, 197, 94, 0.9)";
  }

  document.body.appendChild(notification);

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
