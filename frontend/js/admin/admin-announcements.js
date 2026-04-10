// js/admin/admin-announcements.js

const BASE = "/api/admin/announcements";

function getToken() {
  return localStorage.getItem("authToken");
}

// ===== Load & Render =====

async function loadAnnouncements() {
  try {
    const res = await fetch(BASE, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    renderAnnouncements(data.announcements);
  } catch (err) {
    console.error("Failed to load announcements:", err);
    showToast("Failed to load announcements", "error");
  }
}

function renderAnnouncements(announcements) {
  const container = document.getElementById("announcements-container");
  if (!container) return;

  if (announcements.length === 0) {
    container.innerHTML = `<p style="color:var(--text-muted);padding:1rem;">No announcements yet.</p>`;
    return;
  }

  container.innerHTML = announcements.map((a) => `
    <div class="announcement-item" data-id="${a.id}">
      <div class="announcement-header">
        <h4>${a.title}</h4>
        <span class="badge-role">${a.target_role}</span>
      </div>
      <p class="announcement-message">${a.message.replace(/\n/g, '<br>')}</p>
      <div class="announcement-footer">
        <span class="announcement-date">${new Date(a.created_at).toLocaleDateString()}</span>
        <div class="announcement-actions">
          <button class="btn btn-sm btn-secondary edit-announcement-btn"
                  data-id="${a.id}"
                  data-title="${escapeQuotes(a.title)}"
                  data-message="${escapeQuotes(a.message)}"
                  data-target-role="${a.target_role}">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button class="btn btn-sm btn-danger delete-announcement-btn" data-id="${a.id}">
            <i class="fas fa-trash"></i> Delete
          </button>
        </div>
      </div>
    </div>
  `).join("");
}

function escapeQuotes(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\n/g, '&#10;')
    .replace(/\r/g, '&#13;')
    .replace(/\t/g, '&#9;');
}

function unescapeQuotes(str) {
  if (!str) return '';
  return str
    .replace(/&#10;/g, '\n')
    .replace(/&#13;/g, '\r')
    .replace(/&#9;/g, '\t')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&');
}

// ===== Create =====

async function createAnnouncement(title, message, target_role, scheduled_at) {
  try {
    const res = await fetch(BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ title, message, target_role, scheduled_at }),
    });
    const data = await res.json();
    console.log("API response:", data);
    if (!res.ok) throw new Error(data.error);
    showToast("Announcement created successfully", "success");
    loadAnnouncements();
    closeModal();
  } catch (err) {
    console.error("Create announcement error:", err.message);
    showToast(err.message || "Failed to create announcement", "error");
  }
}

// ===== Update =====

async function updateAnnouncement(id, title, message, target_role) {
  try {
    const res = await fetch(`${BASE}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ title, message, target_role }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    showToast("Announcement updated successfully", "success");
    loadAnnouncements();
    closeModal();
  } catch (err) {
    showToast(err.message || "Failed to update announcement", "error");
  }
}

// ===== Delete =====

async function deleteAnnouncement(id) {
  // Store the ID to delete
  pendingDeleteId = id;
  openDeleteModal();
}

async function confirmDeleteAnnouncement() {
  if (!pendingDeleteId) return;

  try {
    const res = await fetch(`${BASE}/${pendingDeleteId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    showToast("Announcement deleted successfully", "success");
    loadAnnouncements();
    closeDeleteModal();
  } catch (err) {
    showToast(err.message || "Failed to delete announcement", "error");
  }
}

// ===== Modal Helpers =====

let editingId = null;
let pendingDeleteId = null;

function openAddModal() {
  editingId = null;
  document.getElementById("modal-title").textContent = "Add Announcement";
  document.getElementById("announcement-title-input").value = "";
  document.getElementById("announcement-message-input").value = "";
  document.getElementById("announcement-role-select").value = "all";
  document.getElementById("announcement-modal").style.display = "flex";
}

function openEditModal(id, title, message, target_role) {
  editingId = id;
  document.getElementById("modal-title").textContent = "Edit Announcement";
  document.getElementById("announcement-title-input").value = unescapeQuotes(title);
  document.getElementById("announcement-message-input").value = unescapeQuotes(message);
  document.getElementById("announcement-role-select").value = target_role;
  document.getElementById("announcement-modal").style.display = "flex";
}

function closeModal() {
  document.getElementById("announcement-modal").style.display = "none";
  editingId = null;
}

function openDeleteModal() {
  document.getElementById("delete-announcement-modal").style.display = "flex";
}

function closeDeleteModal() {
  document.getElementById("delete-announcement-modal").style.display = "none";
  pendingDeleteId = null;
}

function handleModalSubmit() {
  console.log("Save button clicked");
  const title = document.getElementById("announcement-title-input").value.trim();
  const message = document.getElementById("announcement-message-input").value.trim();
  const target_role = document.getElementById("announcement-role-select").value;

  if (!title || !message) {
    showToast("Title and message are required", "error");
    return;
  }

  if (editingId) {
    updateAnnouncement(editingId, title, message, target_role);
  } else {
    createAnnouncement(title, message, target_role, null);
  }
}

// ===== Toast =====

function showToast(msg, type = "success") {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.className = `toast toast-${type} show`;
  setTimeout(() => toast.classList.remove("show"), 3000);
}

// ===== Init =====

document.addEventListener("DOMContentLoaded", () => {
  loadAnnouncements();

  const addBtn = document.getElementById("add-announcement-btn");
  if (addBtn) addBtn.addEventListener("click", openAddModal);

  // Wire Save button via addEventListener (more reliable than inline onclick)
  const saveBtn = document.getElementById("save-announcement-btn");
  if (saveBtn) saveBtn.addEventListener("click", handleModalSubmit);

  // Also wire the Cancel / close buttons in case inline onclick fails
  const cancelBtn = document.querySelector("#announcement-modal .modal-footer .btn-secondary");
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

  const closeModalBtn = document.querySelector("#announcement-modal .modal-close");
  if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);

  // Delete modal event listeners
  const deleteModalCloseBtn = document.querySelector("#delete-announcement-modal .modal-close");
  if (deleteModalCloseBtn) deleteModalCloseBtn.addEventListener("click", closeDeleteModal);

  const deleteCancelBtn = document.querySelector("#delete-announcement-modal .modal-footer .btn-secondary");
  if (deleteCancelBtn) deleteCancelBtn.addEventListener("click", closeDeleteModal);

  const deleteConfirmBtn = document.getElementById("confirm-delete-announcement-btn");
  if (deleteConfirmBtn) deleteConfirmBtn.addEventListener("click", confirmDeleteAnnouncement);

  // Event delegation for edit and delete buttons
  document.addEventListener("click", (e) => {
    if (e.target.closest(".edit-announcement-btn")) {
      const btn = e.target.closest(".edit-announcement-btn");
      const id = parseInt(btn.dataset.id);
      const title = btn.dataset.title;
      const message = btn.dataset.message;
      const targetRole = btn.dataset.targetRole;
      openEditModal(id, title, message, targetRole);
    }

    if (e.target.closest(".delete-announcement-btn")) {
      const btn = e.target.closest(".delete-announcement-btn");
      const id = parseInt(btn.dataset.id);
      deleteAnnouncement(id);
    }
  });
});