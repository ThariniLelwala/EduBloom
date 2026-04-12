// Content Moderation - Connected to Backend API

function loadContentModerationStats() {
  loadModerationStatsFromAPI();
}

async function loadModerationStatsFromAPI() {
  try {
    const stats = await adminApi.getModerationStats();

    const quizzesElement = document.getElementById("total-quizzes-count");
    const forumsElement = document.getElementById("total-forums-count");
    const notesElement = document.getElementById("total-notes-count");
    const pendingElement = document.getElementById("pending-review-count");
    const todayElement = document.getElementById("today-uploads-count");
    const engagedElement = document.getElementById("engaged-users-count");

    if (quizzesElement) quizzesElement.textContent = stats.totalQuizzes || 0;
    if (forumsElement) forumsElement.textContent = stats.totalForums || 0;
    if (notesElement) notesElement.textContent = stats.totalNotes || 0;
    if (pendingElement) pendingElement.textContent = stats.pendingReview || 0;
    if (todayElement) todayElement.textContent = stats.todayUploads || 0;
    if (engagedElement) engagedElement.textContent = stats.engagedUsers || 0;
  } catch (error) {
    console.error("Error loading moderation stats:", error);
  }
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  loadContentModerationStats();
  loadAllFlaggedContentFromAPI();
  bindFlaggedContentEvents();
});

// ===== Flagged Content Functions =====

let allFlaggedContent = [];
let filteredFlaggedContent = [];
let currentViewingContent = null;

async function loadAllFlaggedContentFromAPI() {
  try {
    allFlaggedContent = await adminApi.getFlaggedContent({ status: "pending" });
    filteredFlaggedContent = [...allFlaggedContent];
    renderFlaggedContent();
  } catch (error) {
    console.error("Error loading flagged content:", error);
    filteredFlaggedContent = [];
    renderFlaggedContent();
  }
}

// Render flagged content table
function renderFlaggedContent() {
  const tbody = document.getElementById("flagged-content-body");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (filteredFlaggedContent.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="admin-empty-state">
          No flagged content found
        </td>
      </tr>
    `;
    return;
  }

  filteredFlaggedContent.forEach((item) => {
    const tr = document.createElement("tr");
    
    const authorName = `${item.author_firstname || ""} ${item.author_lastname || ""}`.trim() || item.author_username;
    const flaggerName = `${item.flagger_firstname || ""} ${item.flagger_lastname || ""}`.trim() || item.flagger_username;

    tr.innerHTML = `
      <td class="text-white">FC${item.id}</td>
      <td class="text-muted">${authorName}</td>
      <td class="text-muted text-capitalize">${item.content_type}</td>
      <td class="text-muted">${flaggerName}</td>
      <td class="text-muted">${capitalizeFirst(item.reason)}</td>
      <td style="text-align: center;">
        <button class="view-flagged-btn admin-table-action" data-content-id="${item.id}" title="View">
          <i class="fas fa-eye"></i>
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });

  bindViewButtons();
}

function capitalizeFirst(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Filter flagged content
function filterFlaggedContent() {
  const searchQuery = document.getElementById("search-flagged").value.toLowerCase();
  const contentTypeFilter = document.getElementById("filter-content-type").value;
  const flagReasonFilter = document.getElementById("filter-flag-reason").value;

  filteredFlaggedContent = allFlaggedContent.filter((item) => {
    const authorName = `${item.author_firstname || ""} ${item.author_lastname || ""}`.trim() || item.author_username || "";
    const idStr = `FC${item.id}`;
    
    const matchesSearch =
      idStr.toLowerCase().includes(searchQuery) ||
      authorName.toLowerCase().includes(searchQuery);
    const matchesContentType =
      !contentTypeFilter || item.content_type === contentTypeFilter;
    const matchesFlagReason =
      !flagReasonFilter || item.reason === flagReasonFilter;

    return matchesSearch && matchesContentType && matchesFlagReason;
  });

  renderFlaggedContent();
}

// Bind filter events
function bindFlaggedContentEvents() {
  const searchInput = document.getElementById("search-flagged");
  const contentTypeFilter = document.getElementById("filter-content-type");
  const flagReasonFilter = document.getElementById("filter-flag-reason");

  if (searchInput) {
    searchInput.addEventListener("input", filterFlaggedContent);
  }
  if (contentTypeFilter) {
    contentTypeFilter.addEventListener("change", filterFlaggedContent);
  }
  if (flagReasonFilter) {
    flagReasonFilter.addEventListener("change", filterFlaggedContent);
  }

  // Modal elements
  const modal = document.getElementById("flagged-content-modal");
  const modalClose = document.getElementById("flagged-modal-close");
  const dismissFlagBtn = document.getElementById("dismiss-flag-btn");
  const deleteContentBtn = document.getElementById("delete-content-btn");
  const deleteConfirmModal = document.getElementById("delete-confirmation-modal");
  const deleteConfirmClose = document.getElementById("delete-confirm-close");
  const deleteCancelBtn = document.getElementById("delete-cancel-btn");
  const deleteConfirmBtn = document.getElementById("delete-confirm-btn");

  // Open flagged content modal
  if (modalClose) {
    modalClose.addEventListener("click", () => {
      modal.classList.remove("show");
    });
  }

  // Dismiss flag button
  if (dismissFlagBtn) {
    dismissFlagBtn.addEventListener("click", async () => {
      if (currentViewingContent) {
        try {
          await adminApi.dismissFlag(currentViewingContent.id);
          modal.classList.remove("show");
          await loadAllFlaggedContentFromAPI();
          await loadModerationStatsFromAPI();
          alert("Flag dismissed successfully");
        } catch (error) {
          alert(error.message || "Error dismissing flag");
        }
      }
    });
  }

  // Delete content button
  if (deleteContentBtn) {
    deleteContentBtn.addEventListener("click", () => {
      if (currentViewingContent) {
        const confirmationModal = document.getElementById("delete-confirmation-modal");
        if (confirmationModal) {
          confirmationModal.classList.add("show");
        }
      }
    });
  }

  // Delete confirmation modal handlers
  if (deleteConfirmClose) {
    deleteConfirmClose.addEventListener("click", () => {
      deleteConfirmModal.classList.remove("show");
    });
  }

  if (deleteCancelBtn) {
    deleteCancelBtn.addEventListener("click", () => {
      deleteConfirmModal.classList.remove("show");
    });
  }

  if (deleteConfirmBtn) {
    deleteConfirmBtn.addEventListener("click", async () => {
      if (currentViewingContent) {
        try {
          await adminApi.deleteFlaggedContent(currentViewingContent.id);
          deleteConfirmModal.classList.remove("show");
          modal.classList.remove("show");
          await loadAllFlaggedContentFromAPI();
          await loadModerationStatsFromAPI();
          alert("Content deleted successfully");
        } catch (error) {
          alert(error.message || "Error deleting content");
        }
      }
    });
  }

  // Close delete confirmation modal when clicking outside
  if (deleteConfirmModal) {
    window.addEventListener("click", (e) => {
      if (e.target === deleteConfirmModal) {
        deleteConfirmModal.classList.remove("show");
      }
      if (e.target === modal) {
        modal.classList.remove("show");
      }
    });
  }
}

// Bind view buttons
function bindViewButtons() {
  const viewButtons = document.querySelectorAll(".view-flagged-btn");
  const modal = document.getElementById("flagged-content-modal");

  viewButtons.forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const contentId = parseInt(btn.dataset.contentId);
      
      try {
        const content = await adminApi.getFlaggedContentById(contentId);
        currentViewingContent = content;

        const authorName = `${content.author_firstname || ""} ${content.author_lastname || ""}`.trim() || content.author_username;
        const flaggerName = `${content.flagger_firstname || ""} ${content.flagger_lastname || ""}`.trim() || content.flagger_username;

        const detailsDiv = document.getElementById("flagged-content-details");
        detailsDiv.innerHTML = `
          <div style="display: grid; gap: 16px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div>
                <label style="color: rgba(255, 255, 255, 0.7); font-size: 12px; font-weight: 600;">Content ID</label>
                <p style="color: var(--color-white); margin-top: 4px;">FC${content.id}</p>
              </div>
              <div>
                <label style="color: rgba(255, 255, 255, 0.7); font-size: 12px; font-weight: 600;">Content Type</label>
                <p style="color: var(--color-white); margin-top: 4px;">${capitalizeFirst(content.content_type)}</p>
              </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div>
                <label style="color: rgba(255, 255, 255, 0.7); font-size: 12px; font-weight: 600;">Author</label>
                <p style="color: var(--color-white); margin-top: 4px;">${authorName}</p>
              </div>
              <div>
                <label style="color: rgba(255, 255, 255, 0.7); font-size: 12px; font-weight: 600;">Flagged By</label>
                <p style="color: var(--color-white); margin-top: 4px;">${flaggerName}</p>
              </div>
            </div>
            <div>
              <label style="color: rgba(255, 255, 255, 0.7); font-size: 12px; font-weight: 600;">Flag Reason</label>
              <p style="color: var(--color-white); margin-top: 4px;">${capitalizeFirst(content.reason)}</p>
            </div>
            <div>
              <label style="color: rgba(255, 255, 255, 0.7); font-size: 12px; font-weight: 600;">Flag Description</label>
              <p style="color: var(--color-white); margin-top: 4px; padding: 12px; background: rgba(255, 255, 255, 0.05); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1);">${content.description || "No description provided"}</p>
            </div>
            <div>
              <label style="color: rgba(255, 255, 255, 0.7); font-size: 12px; font-weight: 600;">Original Content ID</label>
              <p style="color: var(--color-white); margin-top: 4px;">${content.content_id}</p>
            </div>
            <div>
              <label style="color: rgba(255, 255, 255, 0.7); font-size: 12px; font-weight: 600;">Timestamp</label>
              <p style="color: var(--color-white); margin-top: 4px;">${new Date(content.created_at).toLocaleString()}</p>
            </div>
          </div>
        `;

        modal.classList.add("show");
      } catch (error) {
        console.error("Error fetching flagged content details:", error);
        alert("Error loading content details");
      }
    });
  });
}
