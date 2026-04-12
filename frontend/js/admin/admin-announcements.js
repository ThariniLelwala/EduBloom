// Announcements Management - Connected to Backend API

let announcements = [];
let editingAnnouncementId = null;

async function loadAnnouncements() {
  try {
    announcements = await adminApi.getAnnouncements();
  } catch (error) {
    console.error("Error loading announcements:", error);
    announcements = [];
    showToast("Failed to load announcements", "error");
  }
  renderAnnouncements();
}

function renderAnnouncements() {
  const container = document.getElementById("announcements-container");
  if (!container) return;
  container.innerHTML = "";

  if (announcements.length === 0) {
    container.innerHTML = '<div class="admin-empty-state"><p>No announcements yet. Click "Add" to create one.</p></div>';
    return;
  }

  announcements.forEach(ann => {
    const createdDate = new Date(ann.created_at);
    const date = createdDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const time = createdDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    const authorName = ann.author_firstname && ann.author_lastname
      ? `${ann.author_firstname} ${ann.author_lastname}`
      : ann.author_username || "Unknown";

    let dateInfo = `<span class="announcement-date">${date} at ${time}</span>`;
    if (ann.updated_at && ann.updated_at !== ann.created_at) {
      const updatedDate = new Date(ann.updated_at);
      const updatedDateStr = updatedDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      const updatedTime = updatedDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
      dateInfo = `
        <span class="announcement-date">${date} at ${time}</span>
        <span class="announcement-separator">|</span>
        <span class="announcement-edited">edited ${updatedDateStr} at ${updatedTime}</span>
      `;
    }

    container.innerHTML += `
      <div class="announcement-item">
        <div class="announcement-header">
          <div style="flex: 1; min-width: 0;">
            <h4 style="color: var(--color-white); margin: 0 0 8px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(ann.title)}</h4>
            <div class="announcement-meta">
              <span class="announcement-author"><i class="fas fa-user"></i> ${escapeHtml(authorName)}</span>
              <span class="announcement-separator">|</span>
              ${dateInfo}
            </div>
          </div>
          <div class="announcement-actions">
            <i class="fas fa-edit" style="cursor: pointer; color: rgba(255,255,255,0.7);" data-edit-id="${ann.id}" title="Edit"></i>
            <i class="fas fa-trash" style="cursor: pointer; color: rgba(255,255,255,0.7);" data-delete-id="${ann.id}" title="Delete"></i>
          </div>
        </div>
        <p style="color: rgba(255, 255, 255, 0.8); margin: 12px 0 0 0; line-height: 1.5; white-space: pre-wrap;">${escapeHtml(ann.message)}</p>
      </div>
    `;
  });

  initAnnouncementHandlers();
}

function initAnnouncementHandlers() {
  document.querySelectorAll("[data-edit-id]").forEach(icon => {
    icon.addEventListener("click", () => {
      const id = parseInt(icon.dataset.editId);
      const ann = announcements.find(a => a.id === id);
      if (ann) {
        editingAnnouncementId = id;
        document.getElementById("announcement-modal-title").textContent = "Edit Announcement";
        document.getElementById("announcement-title-input").value = ann.title;
        document.getElementById("announcement-message-input").value = ann.message;
        clearErrors();
        document.getElementById("announcement-modal").classList.add("show");
      }
    });
  });

  document.querySelectorAll("[data-delete-id]").forEach(icon => {
    icon.addEventListener("click", () => {
      window.deletingAnnouncementId = parseInt(icon.dataset.deleteId);
      document.getElementById("delete-announcement-modal").classList.add("show");
    });
  });
}

function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function clearErrors() {
  document.getElementById("title-error").textContent = "";
  document.getElementById("message-error").textContent = "";
  document.getElementById("announcement-title-input").classList.remove("input-error");
  document.getElementById("announcement-message-input").classList.remove("input-error");
}

function showValidationError(fieldId, message) {
  const errorEl = document.getElementById(`${fieldId}-error`);
  const inputEl = document.getElementById(`announcement-${fieldId}-input`);
  if (errorEl) errorEl.textContent = message;
  if (inputEl) inputEl.classList.add("input-error");
}

function showToast(message, type = "success") {
  const existingToast = document.querySelector(".success-toast");
  if (existingToast) existingToast.remove();

  const toast = document.createElement("div");
  toast.className = "success-toast";
  toast.style.background = type === "error" ? "#e74c3c" : "#2ecc71";
  toast.innerHTML = `<i class="fas fa-${type === "error" ? "exclamation-circle" : "check-circle"}"></i> ${message}`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "slideIn 0.3s ease reverse";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

document.addEventListener("DOMContentLoaded", () => {
  loadAnnouncements();
  initModalHandlers();
});

function initModalHandlers() {
  document.querySelectorAll(".modal-close, .modal-footer .btn-secondary").forEach(btn => {
    btn.addEventListener("click", e => {
      const modal = e.target.closest(".modal");
      if (modal) modal.classList.remove("show");
    });
  });

  document.getElementById("add-announcement-btn")?.addEventListener("click", () => {
    editingAnnouncementId = null;
    document.getElementById("announcement-modal-title").textContent = "Add Announcement";
    document.getElementById("announcement-title-input").value = "";
    document.getElementById("announcement-message-input").value = "";
    clearErrors();
    document.getElementById("announcement-modal").classList.add("show");
  });

  const titleInput = document.getElementById("announcement-title-input");
  const messageInput = document.getElementById("announcement-message-input");

  titleInput?.addEventListener("input", () => {
    if (titleInput.value.trim()) {
      document.getElementById("title-error").textContent = "";
      titleInput.classList.remove("input-error");
    }
  });

  messageInput?.addEventListener("input", () => {
    if (messageInput.value.trim()) {
      document.getElementById("message-error").textContent = "";
      messageInput.classList.remove("input-error");
    }
  });

  const saveBtn = document.getElementById("save-announcement-btn");
  saveBtn?.addEventListener("click", async () => {
    const title = document.getElementById("announcement-title-input").value.trim();
    const message = document.getElementById("announcement-message-input").value.trim();
    let hasErrors = false;

    clearErrors();

    if (!title) {
      showValidationError("title", "Title is required");
      hasErrors = true;
    } else if (title.length > 255) {
      showValidationError("title", "Title must be 255 characters or less");
      hasErrors = true;
    }

    if (!message) {
      showValidationError("message", "Message is required");
      hasErrors = true;
    }

    if (hasErrors) return;

    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span class="saving-indicator"><i class="fas fa-spinner"></i> Saving...</span>';

    try {
      if (editingAnnouncementId) {
        await adminApi.updateAnnouncement(editingAnnouncementId, title, message);
        showToast("Announcement updated successfully!");
      } else {
        await adminApi.createAnnouncement(title, message);
        showToast("Announcement created successfully!");
      }
      document.getElementById("announcement-modal").classList.remove("show");
      await loadAnnouncements();
    } catch (error) {
      showToast(error.message || "Failed to save announcement", "error");
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerHTML = "Save Announcement";
    }
  });

  document.getElementById("confirm-delete-announcement-btn")?.addEventListener("click", async () => {
    const deleteBtn = document.getElementById("confirm-delete-announcement-btn");
    if (window.deletingAnnouncementId) {
      deleteBtn.disabled = true;
      deleteBtn.innerHTML = '<span class="saving-indicator"><i class="fas fa-spinner"></i></span>';

      try {
        await adminApi.deleteAnnouncement(window.deletingAnnouncementId);
        document.getElementById("delete-announcement-modal").classList.remove("show");
        showToast("Announcement deleted successfully!");
        await loadAnnouncements();
      } catch (error) {
        showToast(error.message || "Failed to delete announcement", "error");
      } finally {
        deleteBtn.disabled = false;
        deleteBtn.innerHTML = "Delete";
      }
    }
  });
}
