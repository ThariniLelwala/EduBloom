// Announcements Management Functions

// Load all announcements
function loadAnnouncements() {
  const announcements = getAnnouncements();
  renderAnnouncements(announcements);
}

function getAnnouncements() {
  const announcements = localStorage.getItem("announcements")
    ? JSON.parse(localStorage.getItem("announcements"))
    : getDefaultAnnouncements();
  return announcements;
}

function getDefaultAnnouncements() {
  return [
    {
      id: 1,
      title: "System Maintenance Scheduled",
      message:
        "We will be performing system maintenance on October 28th from 2:00 AM to 4:00 AM UTC. The platform will be temporarily unavailable during this time.",
      date: "2025-10-24",
      time: "10:30 AM",
    },
    {
      id: 2,
      title: "New Feature: Enhanced Quiz Analytics",
      message:
        "We've released a new feature that provides detailed analytics for quiz performance. Teachers can now view comprehensive reports and identify areas where students need additional support.",
      date: "2025-10-22",
      time: "3:45 PM",
    },
    {
      id: 3,
      title: "Welcome to EduBloom",
      message:
        "Thank you for joining EduBloom! We're excited to have you as part of our learning community. Check out our help section for tutorials and best practices.",
      date: "2025-10-20",
      time: "9:00 AM",
    },
  ];
}

function renderAnnouncements(announcements) {
  const container = document.getElementById("announcements-container");
  if (!container) return;

  container.innerHTML = "";

  if (announcements.length === 0) {
    container.innerHTML =
      '<div class="admin-empty-state"><p>No announcements yet. Click "Add" to create one.</p></div>';
    return;
  }

  announcements.forEach((announcement) => {
    const announcementItem = document.createElement("div");
    announcementItem.className = "announcement-item";
    announcementItem.innerHTML = `
      <div class="announcement-header">
        <div style="flex: 1;">
          <h4 style="color: var(--color-white); margin: 0 0 4px 0;">${announcement.title}</h4>
          <p style="color: rgba(255, 255, 255, 0.6); font-size: 12px; margin: 0;">${announcement.date} at ${announcement.time}</p>
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

function bindAnnouncementActions() {
  // Delete buttons
  document.querySelectorAll("[data-delete-announcement]").forEach((icon) => {
    icon.addEventListener("click", (e) => {
      const announcementId = e.target.getAttribute("data-announcement-id");
      window.deletingAnnouncementId = announcementId;
      document
        .getElementById("delete-announcement-modal")
        .classList.add("show");
    });
  });

  // Edit buttons
  document.querySelectorAll("[data-edit-announcement]").forEach((icon) => {
    icon.addEventListener("click", (e) => {
      const announcementId = e.target.getAttribute("data-announcement-id");
      const announcements = getAnnouncements();
      const announcement = announcements.find((a) => a.id == announcementId);

      if (announcement) {
        window.editingAnnouncementId = announcementId;
        document.getElementById("announcement-modal-title").textContent =
          "Edit Announcement";
        document.getElementById("announcement-title-input").value =
          announcement.title;
        document.getElementById("announcement-message-input").value =
          announcement.message;
        document.getElementById("announcement-modal").classList.add("show");
      }
    });
  });
}

// ===== Modal Handlers =====

function initializeAnnouncementModalHandlers() {
  // Close modal when clicking X or Cancel button
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
      document.getElementById("announcement-modal-title").textContent =
        "Add Announcement";
      document.getElementById("announcement-title-input").value = "";
      document.getElementById("announcement-message-input").value = "";
      document.getElementById("announcement-modal").classList.add("show");
    });
  }

  // Save announcement button
  const saveAnnouncementBtn = document.getElementById("save-announcement-btn");
  if (saveAnnouncementBtn) {
    saveAnnouncementBtn.addEventListener("click", () => {
      const title = document
        .getElementById("announcement-title-input")
        .value.trim();
      const message = document
        .getElementById("announcement-message-input")
        .value.trim();

      if (title && message) {
        let announcements = getAnnouncements();
        const now = new Date();
        const date = now.toISOString().split("T")[0];
        const time = now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });

        if (window.editingAnnouncementId) {
          // Edit existing announcement
          const announcement = announcements.find(
            (a) => a.id == window.editingAnnouncementId
          );
          if (announcement) {
            announcement.title = title;
            announcement.message = message;
          }
        } else {
          // Add new announcement
          const newAnnouncement = {
            id:
              announcements.length > 0
                ? Math.max(...announcements.map((a) => a.id)) + 1
                : 1,
            title,
            message,
            date,
            time,
          };
          announcements.unshift(newAnnouncement);
        }

        localStorage.setItem("announcements", JSON.stringify(announcements));
        document.getElementById("announcement-modal").classList.remove("show");
        loadAnnouncements();
        window.editingAnnouncementId = null;
      } else {
        alert("Please fill in both title and message fields.");
      }
    });
  }

  // Delete announcement button
  const confirmDeleteBtn = document.getElementById(
    "confirm-delete-announcement-btn"
  );
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", () => {
      const announcementId = window.deletingAnnouncementId;
      if (announcementId) {
        let announcements = getAnnouncements();
        announcements = announcements.filter((a) => a.id != announcementId);
        localStorage.setItem("announcements", JSON.stringify(announcements));
        document
          .getElementById("delete-announcement-modal")
          .classList.remove("show");
        loadAnnouncements();
      }
    });
  }
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  loadAnnouncements();
  initializeAnnouncementModalHandlers();
});
