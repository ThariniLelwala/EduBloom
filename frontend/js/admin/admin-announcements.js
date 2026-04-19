// Announcements Management - Connected to Backend API

// Load announcements
async function loadAnnouncements() {
  try {
    const announcements = await adminApi.getAllAnnouncements();
    renderAnnouncements(announcements || []);
  } catch (error) {
    console.error("Error loading announcements:", error);
    renderAnnouncements([]);
  }
}

// Render announcements
function renderAnnouncements(announcements) {
  const container = document.getElementById("announcements-container");
  if (!container) return;

  container.innerHTML = "";

  if (announcements.length === 0) {
    container.innerHTML = '<div class="admin-empty-state"><p>No announcements yet. Click "Add" to create one.</p></div>';
    return;
  }

  const roleLabels = {
    all: "All Users",
    student: "Students",
    teacher: "Teachers",
    parent: "Parents",
    admin: "Admins"
  };

  announcements.forEach((announcement) => {
    const announcementItem = document.createElement("div");
    announcementItem.className = "announcement-item";
    announcementItem.innerHTML = `
      <div class="announcement-header">
        <div style="flex: 1;">
          <h4 style="color: var(--color-white); margin: 0 0 4px 0;">${announcement.title}</h4>
          <p style="color: rgba(255, 255, 255, 0.6); font-size: 12px; margin: 0;">
            ${announcement.date} at ${announcement.time} 
            <span style="margin-left: 8px; padding: 2px 8px; background: rgba(255,255,255,0.1); border-radius: 4px; font-size: 10px;">
              ${roleLabels[announcement.targetRole] || "All Users"}
            </span>
          </p>
        </div>
        <div class="announcement-actions">
          <i class="fas fa-edit" style="cursor: pointer; color: rgba(255, 255, 255, 0.7);" title="Edit" data-announcement-id="${announcement.id}" data-edit-announcement="${announcement.id}"></i>
          <i class="fas fa-trash" style="cursor: pointer; color: rgba(255, 255, 255, 0.7);" title="Delete" data-announcement-id="${announcement.id}" data-delete-announcement="${announcement.id}"></i>
        </div>
      </div>
      <p style="color: rgba(255, 255, 255, 0.8); margin: 12px 0 0 0;">${announcement.message}</p>
    `;
    container.appendChild(announcementItem);
  });

  bindAnnouncementActions();
}

// Bind action buttons
function bindAnnouncementActions() {
  // Delete buttons
  document.querySelectorAll("[data-delete-announcement]").forEach((icon) => {
    icon.addEventListener("click", (e) => {
      const announcementId = e.target.getAttribute("data-announcement-id");
      window.deletingAnnouncementId = announcementId;
      document.getElementById("delete-announcement-modal").classList.add("show");
    });
  });

  // Edit buttons
  document.querySelectorAll("[data-edit-announcement]").forEach((icon) => {
    icon.addEventListener("click", async (e) => {
      const announcementId = e.target.getAttribute("data-announcement-id");
      const announcements = await adminApi.getAllAnnouncements();
      const announcement = announcements.find(a => a.id == announcementId);

      if (announcement) {
        window.editingAnnouncementId = announcementId;
        document.getElementById("announcement-modal-title").textContent = "Edit Announcement";
        document.getElementById("announcement-title-input").value = announcement.title;
        document.getElementById("announcement-message-input").value = announcement.message;
        document.getElementById("announcement-target-role").value = announcement.targetRole || "all";
        document.getElementById("announcement-modal").classList.add("show");
      }
    });
  });
}

// Initialize modal handlers
function initializeAnnouncementModalHandlers() {
  // Close modal handlers
  document.querySelectorAll(".modal-close").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const modalId = e.target.getAttribute("data-modal");
      const modal = document.getElementById(modalId);
      if (modal) modal.classList.remove("show");
    });
  });

  document.querySelectorAll(".modal-footer .btn-secondary").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const modal = e.target.closest(".modal");
      if (modal) modal.classList.remove("show");
    });
  });

  // Add announcement button
  const addAnnouncementBtn = document.getElementById("add-announcement-btn");
  if (addAnnouncementBtn) {
    addAnnouncementBtn.addEventListener("click", () => {
      window.editingAnnouncementId = null;
      document.getElementById("announcement-modal-title").textContent = "Add Announcement";
      document.getElementById("announcement-title-input").value = "";
      document.getElementById("announcement-message-input").value = "";
      document.getElementById("announcement-target-role").value = "all";
      document.getElementById("announcement-modal").classList.add("show");
    });
  }

  // Save announcement button
  const saveAnnouncementBtn = document.getElementById("save-announcement-btn");
  if (saveAnnouncementBtn) {
    saveAnnouncementBtn.addEventListener("click", async () => {
      const title = document.getElementById("announcement-title-input").value.trim();
      const message = document.getElementById("announcement-message-input").value.trim();
      const targetRole = document.getElementById("announcement-target-role").value;

      if (title && message) {
        try {
          if (window.editingAnnouncementId) {
            await adminApi.updateAnnouncement(window.editingAnnouncementId, { title, message, targetRole });
          } else {
            await adminApi.createAnnouncement({ title, message, targetRole });
          }
          document.getElementById("announcement-modal").classList.remove("show");
          loadAnnouncements();
          window.editingAnnouncementId = null;
        } catch (error) {
          alert("Error saving announcement: " + error.message);
        }
      } else {
        alert("Please fill in both title and message fields.");
      }
    });
  }

  // Delete announcement button
  const confirmDeleteBtn = document.getElementById("confirm-delete-announcement-btn");
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", async () => {
      const announcementId = window.deletingAnnouncementId;
      if (announcementId) {
        try {
          await adminApi.deleteAnnouncement(announcementId);
          document.getElementById("delete-announcement-modal").classList.remove("show");
          loadAnnouncements();
        } catch (error) {
          alert("Error deleting announcement: " + error.message);
        }
      }
    });
  }
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  loadAnnouncements();
  initializeAnnouncementModalHandlers();
});