// Content Moderation - Connected to Backend API

// Load statistics
async function loadContentModerationStats() {
  try {
    const stats = await adminApi.getModerationStatistics();
    
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
    console.error("Error loading stats:", error);
    setDefaultStats();
  }
}

function setDefaultStats() {
  const elements = ["total-quizzes-count", "total-forums-count", "total-notes-count", 
                    "pending-review-count", "today-uploads-count", "engaged-users-count"];
  elements.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = "0";
  });
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  loadContentModerationStats();
  loadFlaggedContent();
  initializeModals();
});

// Load flagged content
async function loadFlaggedContent() {
  try {
    const filters = {
      status: "pending",
      contentType: document.getElementById("filter-content-type")?.value || null,
      reason: document.getElementById("filter-flag-reason")?.value || null
    };
    window.allFlaggedContent = await adminApi.getFlaggedContent(filters);
    renderFlaggedContent();
    bindFilterEvents();
  } catch (error) {
    console.error("Error loading flagged content:", error);
    window.allFlaggedContent = [];
    renderFlaggedContent();
  }
}

// Render flagged content table
function renderFlaggedContent() {
  const tbody = document.getElementById("flagged-content-body");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (!window.allFlaggedContent || window.allFlaggedContent.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: rgba(255,255,255,0.6);">No flagged content found</td></tr>`;
    return;
  }

  const reasonLabels = { inappropriate: "Inappropriate", spam: "Spam", harassment: "Harassment", misinformation: "Misinformation" };
  const typeLabels = { forum: "Forum", note: "Note", quiz: "Quiz" };

  window.allFlaggedContent.forEach(item => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="text-white">${item.id}</td>
      <td class="text-muted">${item.author}</td>
      <td class="text-muted text-capitalize">${typeLabels[item.contentType] || item.contentType}</td>
      <td class="text-muted">${item.flaggedBy}</td>
      <td class="text-muted">${reasonLabels[item.reason] || item.reason}</td>
      <td style="text-align: center;">
        <button class="view-flagged-btn admin-table-action" data-content-id="${item.id}" data-flag-id="${item.contentId}" title="View">
          <i class="fas fa-eye"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  bindViewButtons();
}

// Filter functions
function bindFilterEvents() {
  const searchInput = document.getElementById("search-flagged");
  const contentTypeFilter = document.getElementById("filter-content-type");
  const flagReasonFilter = document.getElementById("filter-flag-reason");

  if (searchInput) searchInput.addEventListener("input", applyFilters);
  if (contentTypeFilter) contentTypeFilter.addEventListener("change", loadFlaggedContent);
  if (flagReasonFilter) flagReasonFilter.addEventListener("change", loadFlaggedContent);
}

function applyFilters() {
  const searchTerm = document.getElementById("search-flagged")?.value.toLowerCase() || "";
  const contentType = document.getElementById("filter-content-type")?.value || "";
  const reason = document.getElementById("filter-flag-reason")?.value || "";

  if (!window.allFlaggedContent) return;

  const filtered = window.allFlaggedContent.filter(item => {
    const matchesSearch = item.id.toLowerCase().includes(searchTerm) || 
                          (item.author || "").toLowerCase().includes(searchTerm);
    const matchesType = !contentType || item.contentType === contentType;
    const matchesReason = !reason || item.reason === reason;
    return matchesSearch && matchesType && matchesReason;
  });

  const tbody = document.getElementById("flagged-content-body");
  if (!tbody) return;

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: rgba(255,255,255,0.6);">No results found</td></tr>`;
    return;
  }

  const reasonLabels = { inappropriate: "Inappropriate", spam: "Spam", harassment: "Harassment", misinformation: "Misinformation" };
  const typeLabels = { forum: "Forum", note: "Note", quiz: "Quiz" };

  filtered.forEach(item => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="text-white">${item.id}</td>
      <td class="text-muted">${item.author}</td>
      <td class="text-muted text-capitalize">${typeLabels[item.contentType] || item.contentType}</td>
      <td class="text-muted">${item.flaggedBy}</td>
      <td class="text-muted">${reasonLabels[item.reason] || item.reason}</td>
      <td style="text-align: center;">
        <button class="view-flagged-btn admin-table-action" data-content-id="${item.id}" data-flag-id="${item.contentId}" title="View">
          <i class="fas fa-eye"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  bindViewButtons();
}

// Modal handling
let currentFlagId = null;

function initializeModals() {
  const modal = document.getElementById("flagged-content-modal");
  const deleteModal = document.getElementById("delete-confirmation-modal");

  // Close buttons
  document.getElementById("flagged-modal-close")?.addEventListener("click", () => modal?.classList.remove("show"));
  document.getElementById("delete-confirm-close")?.addEventListener("click", () => deleteModal?.classList.remove("show"));
  document.getElementById("delete-cancel-btn")?.addEventListener("click", () => deleteModal?.classList.remove("show"));

  // Dismiss flag
  document.getElementById("dismiss-flag-btn")?.addEventListener("click", async () => {
    if (currentFlagId) {
      try {
        await adminApi.dismissFlag(currentFlagId);
        modal?.classList.remove("show");
        loadFlaggedContent();
        loadContentModerationStats();
      } catch (error) {
        alert("Error dismissing flag: " + error.message);
      }
    }
  });

  // Delete content - show confirmation
  document.getElementById("delete-content-btn")?.addEventListener("click", () => {
    deleteModal?.classList.add("show");
  });

  // Confirm delete
  document.getElementById("delete-confirm-btn")?.addEventListener("click", async () => {
    if (currentFlagId) {
      try {
        await adminApi.deleteFlaggedContent(currentFlagId);
        modal?.classList.remove("show");
        deleteModal?.classList.remove("show");
        loadFlaggedContent();
        loadContentModerationStats();
      } catch (error) {
        alert("Error deleting content: " + error.message);
      }
    }
  });
}

function bindViewButtons() {
  document.querySelectorAll(".view-flagged-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const contentId = btn.dataset.contentId;
      const flagId = parseInt(btn.dataset.flagId);
      currentFlagId = flagId;

      const content = window.allFlaggedContent?.find(item => item.id === contentId);
      if (!content) return;

      const reasonLabels = { inappropriate: "Inappropriate", spam: "Spam", harassment: "Harassment", misinformation: "Misinformation" };
      const typeLabels = { forum: "Forum", note: "Note", quiz: "Quiz" };

      const detailsDiv = document.getElementById("flagged-content-details");
      if (detailsDiv) {
        detailsDiv.innerHTML = `
          <div style="display: grid; gap: 16px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div>
                <label style="color: rgba(255,255,255,0.7); font-size: 12px; font-weight: 600;">Content ID</label>
                <p style="color: var(--color-white); margin-top: 4px;">${content.id}</p>
              </div>
              <div>
                <label style="color: rgba(255,255,255,0.7); font-size: 12px; font-weight: 600;">Content Type</label>
                <p style="color: var(--color-white); margin-top: 4px;">${typeLabels[content.contentType] || content.contentType}</p>
              </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div>
                <label style="color: rgba(255,255,255,0.7); font-size: 12px; font-weight: 600;">Author</label>
                <p style="color: var(--color-white); margin-top: 4px;">${content.author}</p>
              </div>
              <div>
                <label style="color: rgba(255,255,255,0.7); font-size: 12px; font-weight: 600;">Flagged By</label>
                <p style="color: var(--color-white); margin-top: 4px;">${content.flaggedBy}</p>
              </div>
            </div>
            <div>
              <label style="color: rgba(255,255,255,0.7); font-size: 12px; font-weight: 600;">Flag Reason</label>
              <p style="color: var(--color-white); margin-top: 4px;">${reasonLabels[content.reason] || content.reason}</p>
            </div>
            <div>
              <label style="color: rgba(255,255,255,0.7); font-size: 12px; font-weight: 600;">Flag Description</label>
              <p style="color: var(--color-white); margin-top: 4px; padding: 12px; background: rgba(255,255,255,0.05); border-radius: 8px;">${content.flagReason || "No description"}</p>
            </div>
            <div>
              <label style="color: rgba(255,255,255,0.7); font-size: 12px; font-weight: 600;">Content Preview</label>
              <p style="color: var(--color-white); margin-top: 4px; padding: 12px; background: rgba(255,255,255,0.05); border-radius: 8px; max-height: 150px; overflow-y: auto;">${content.contentPreview || content.contentTitle || "No preview available"}</p>
            </div>
            <div>
              <label style="color: rgba(255,255,255,0.7); font-size: 12px; font-weight: 600;">Timestamp</label>
              <p style="color: var(--color-white); margin-top: 4px;">${content.timestamp ? new Date(content.timestamp).toLocaleString() : "N/A"}</p>
            </div>
          </div>
        `;
      }

      document.getElementById("flagged-content-modal")?.classList.add("show");
    });
  });
}