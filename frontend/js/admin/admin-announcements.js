// Announcements Management - Connected to Backend API

let announcements = [];
let editingAnnouncementId = null;

async function loadAnnouncements() {
  try {
    announcements = await adminApi.getAnnouncements();
  } catch (error) {
    console.error("Error loading announcements:", error);
    announcements = [];
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
    const date = new Date(ann.created_at).toLocaleDateString();
    const time = new Date(ann.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    container.innerHTML += `
      <div class="announcement-item">
        <div class="announcement-header">
          <div style="flex: 1;">
            <h4 style="color: var(--color-white); margin: 0 0 4px 0;">${ann.title}</h4>
            <p style="color: rgba(255, 255, 255, 0.6); font-size: 12px; margin: 0;">${date} at ${time}</p>
          </div>
          <div class="announcement-actions">
            <i class="fas fa-edit" style="cursor: pointer;" data-edit-id="${ann.id}"></i>
            <i class="fas fa-trash" style="cursor: pointer;" data-delete-id="${ann.id}"></i>
          </div>
        </div>
        <p style="color: rgba(255, 255, 255, 0.8); margin: 12px 0 0 0;">${ann.message}</p>
      </div>
    `;
  });

  document.querySelectorAll("[data-edit-id]").forEach(icon => {
    icon.addEventListener("click", () => {
      const id = parseInt(icon.dataset.editId);
      const ann = announcements.find(a => a.id === id);
      if (ann) {
        editingAnnouncementId = id;
        document.getElementById("announcement-modal-title").textContent = "Edit Announcement";
        document.getElementById("announcement-title-input").value = ann.title;
        document.getElementById("announcement-message-input").value = ann.message;
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
    document.getElementById("announcement-modal").classList.add("show");
  });

  document.getElementById("save-announcement-btn")?.addEventListener("click", async () => {
    const title = document.getElementById("announcement-title-input").value.trim();
    const message = document.getElementById("announcement-message-input").value.trim();
    
    if (!title || !message) {
      alert("Please fill in both title and message fields.");
      return;
    }

    try {
      if (editingAnnouncementId) {
        await adminApi.updateAnnouncement(editingAnnouncementId, title, message);
      } else {
        await adminApi.createAnnouncement(title, message);
      }
      document.getElementById("announcement-modal").classList.remove("show");
      await loadAnnouncements();
    } catch (error) {
      alert(error.message);
    }
  });

  document.getElementById("confirm-delete-announcement-btn")?.addEventListener("click", async () => {
    if (window.deletingAnnouncementId) {
      try {
        await adminApi.deleteAnnouncement(window.deletingAnnouncementId);
        document.getElementById("delete-announcement-modal").classList.remove("show");
        await loadAnnouncements();
      } catch (error) {
        alert(error.message);
      }
    }
  });
}
