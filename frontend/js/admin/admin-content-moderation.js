// Content Moderation Statistics Functions

// Load all content moderation statistics
function loadContentModerationStats() {
  loadTotalContent();
  loadPendingReview();
  loadTodaysUploads();
  loadEngagedUsers();
}

function loadTotalContent() {
  const quizzesCount = getTotalQuizzesCount();
  const forumsCount = getTotalForumsCount();
  const notesCount = getTotalNotesCount();

  const quizzesElement = document.getElementById("total-quizzes-count");
  const forumsElement = document.getElementById("total-forums-count");
  const notesElement = document.getElementById("total-notes-count");

  if (quizzesElement) {
    quizzesElement.textContent = quizzesCount;
  }
  if (forumsElement) {
    forumsElement.textContent = forumsCount;
  }
  if (notesElement) {
    notesElement.textContent = notesCount;
  }
}

function getTotalQuizzesCount() {
  // Count quizzes from localStorage or return simulated data
  const quizzes = JSON.parse(localStorage.getItem("quizzes")) || [];
  return quizzes.length || 28;
}

function getTotalForumsCount() {
  // Count forums from localStorage or return simulated data
  const forums = JSON.parse(localStorage.getItem("forums")) || [];
  return forums.length || 24;
}

function getTotalNotesCount() {
  // Count notes from localStorage or return simulated data
  const notes = JSON.parse(localStorage.getItem("notes")) || [];
  return notes.length || 35;
}

function loadPendingReview() {
  const pendingReviewCount = getPendingReviewCount();
  const element = document.getElementById("pending-review-count");
  if (element) {
    element.textContent = pendingReviewCount;
  }
}

function getPendingReviewCount() {
  // Get pending review count from localStorage or simulate
  const pendingReviews =
    JSON.parse(localStorage.getItem("pendingReviews")) || [];
  return pendingReviews.length || 8;
}

function loadTodaysUploads() {
  const todayUploadsCount = getTodaysUploadsCount();
  const element = document.getElementById("today-uploads-count");
  if (element) {
    element.textContent = todayUploadsCount;
  }
}

function getTodaysUploadsCount() {
  // Get today's uploads count from localStorage or simulate
  const todayUploads = JSON.parse(localStorage.getItem("todayUploads")) || [];
  return todayUploads.length || 12;
}

function loadEngagedUsers() {
  const engagedUsersCount = getEngagedUsersCount();
  const element = document.getElementById("engaged-users-count");
  if (element) {
    element.textContent = engagedUsersCount;
  }
}

function getEngagedUsersCount() {
  // Get engaged users count from localStorage or simulate
  const engagedUsers = JSON.parse(localStorage.getItem("engagedUsers")) || [];
  return engagedUsers.length || 156;
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  loadContentModerationStats();
  initializeFlaggedContent();
  bindFlaggedContentEvents();
});

// ===== Flagged Content Functions =====

let allFlaggedContent = [];
let filteredFlaggedContent = [];
let currentViewingContent = null;

// Sample flagged content data
function initializeFlaggedContent() {
  allFlaggedContent = [
    {
      id: "FC001",
      author: "John Doe",
      contentType: "forum",
      flagReason:
        "This forum post contains offensive language and inappropriate discussion",
      actualContent:
        "I can't believe how terrible this topic is. Everyone here is incompetent and doesn't deserve to be in this community. This is absolutely unacceptable!",
      flaggedBy: "Sarah Smith",
      reason: "inappropriate",
      timestamp: "2025-10-24 10:30",
    },
    {
      id: "FC002",
      author: "Mike Johnson",
      contentType: "note",
      flagReason: "Repeated promotional links and advertising content",
      actualContent:
        "Check out this amazing product! Click here: www.spam-link.com. Don't miss our sale! Visit www.spam-link.com now. Limited time offer at www.spam-link.com!",
      flaggedBy: "Emily Brown",
      reason: "spam",
      timestamp: "2025-10-24 09:15",
    },
    {
      id: "FC003",
      author: "Alex Davis",
      contentType: "quiz",
      flagReason: "Quiz contains false medical information",
      actualContent:
        "Question: Which of the following is a cure for COVID-19? A) Bleach B) Essential Oils C) Garlic D) Prayer. Answer: All of the above are effective remedies.",
      flaggedBy: "James Taylor",
      reason: "misinformation",
      timestamp: "2025-10-23 14:20",
    },
    {
      id: "FC004",
      author: "Jessica Wilson",
      contentType: "forum",
      flagReason: "Personal attack and harassment directed at another user",
      actualContent:
        "@AlexSmith you are the worst person I know. Everyone agrees you don't belong here. Stop posting your garbage content!",
      flaggedBy: "Rachel Green",
      reason: "harassment",
      timestamp: "2025-10-23 11:45",
    },
    {
      id: "FC005",
      author: "David Martinez",
      contentType: "note",
      flagReason: "Spam post with multiple affiliate links",
      actualContent:
        "Amazing money-making opportunity! Visit www.earn-money.com with code DAVID10. Get 50% off at www.shop-now.com. Buy now and earn commissions!",
      flaggedBy: "Lisa Anderson",
      reason: "spam",
      timestamp: "2025-10-22 16:00",
    },
  ];
  filteredFlaggedContent = [...allFlaggedContent];
  renderFlaggedContent();
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

    const reasonLabel =
      {
        inappropriate: "Inappropriate",
        spam: "Spam",
        harassment: "Harassment",
        misinformation: "Misinformation",
      }[item.reason] || item.reason;

    const contentTypeLabel =
      {
        forum: "Forum",
        note: "Note",
        quiz: "Quiz",
      }[item.contentType] || item.contentType;

    tr.innerHTML = `
      <td class="text-white">${item.id}</td>
      <td class="text-muted">${item.author}</td>
      <td class="text-muted text-capitalize">${contentTypeLabel}</td>
      <td class="text-muted">${item.flaggedBy}</td>
      <td class="text-muted">${reasonLabel}</td>
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

// Filter flagged content
function filterFlaggedContent() {
  const searchQuery = document
    .getElementById("search-flagged")
    .value.toLowerCase();
  const contentTypeFilter = document.getElementById(
    "filter-content-type"
  ).value;
  const flagReasonFilter = document.getElementById("filter-flag-reason").value;

  filteredFlaggedContent = allFlaggedContent.filter((item) => {
    const matchesSearch =
      item.id.toLowerCase().includes(searchQuery) ||
      item.author.toLowerCase().includes(searchQuery);
    const matchesContentType =
      !contentTypeFilter || item.contentType === contentTypeFilter;
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

  // Modal close buttons
  const modal = document.getElementById("flagged-content-modal");
  const modalClose = document.getElementById("flagged-modal-close");
  const dismissFlagBtn = document.getElementById("dismiss-flag-btn");
  const deleteContentBtn = document.getElementById("delete-content-btn");

  if (modalClose) {
    modalClose.addEventListener("click", () => {
      modal.classList.remove("show");
    });
  }

  if (dismissFlagBtn) {
    dismissFlagBtn.addEventListener("click", () => {
      if (currentViewingContent) {
        allFlaggedContent = allFlaggedContent.filter(
          (item) => item.id !== currentViewingContent.id
        );
        filterFlaggedContent();
        modal.classList.remove("show");
        currentViewingContent = null;
      }
    });
  }

  if (deleteContentBtn) {
    deleteContentBtn.addEventListener("click", () => {
      if (currentViewingContent) {
        const deleteConfirmModal = document.getElementById(
          "delete-confirmation-modal"
        );
        if (deleteConfirmModal) {
          deleteConfirmModal.classList.add("show");
        }
      }
    });
  }

  // Delete confirmation modal handlers
  const deleteConfirmModal = document.getElementById(
    "delete-confirmation-modal"
  );
  const deleteConfirmClose = document.getElementById("delete-confirm-close");
  const deleteCancelBtn = document.getElementById("delete-cancel-btn");
  const deleteConfirmBtn = document.getElementById("delete-confirm-btn");

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
    deleteConfirmBtn.addEventListener("click", () => {
      if (currentViewingContent) {
        allFlaggedContent = allFlaggedContent.filter(
          (item) => item.id !== currentViewingContent.id
        );
        filterFlaggedContent();
        modal.classList.remove("show");
        deleteConfirmModal.classList.remove("show");
        currentViewingContent = null;
      }
    });
  }

  // Close delete confirmation modal when clicking outside
  if (deleteConfirmModal) {
    window.addEventListener("click", (e) => {
      if (e.target === deleteConfirmModal) {
        deleteConfirmModal.classList.remove("show");
      }
    });
  }
}

// Bind view buttons
function bindViewButtons() {
  const viewButtons = document.querySelectorAll(".view-flagged-btn");
  const modal = document.getElementById("flagged-content-modal");

  viewButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const contentId = btn.dataset.contentId;
      const content = allFlaggedContent.find((item) => item.id === contentId);

      if (content) {
        currentViewingContent = content;

        const reasonLabel =
          {
            inappropriate: "Inappropriate",
            spam: "Spam",
            harassment: "Harassment",
            misinformation: "Misinformation",
          }[content.reason] || content.reason;

        const contentTypeLabel =
          {
            forum: "Forum",
            note: "Note",
            quiz: "Quiz",
          }[content.contentType] || content.contentType;

        const detailsDiv = document.getElementById("flagged-content-details");
        detailsDiv.innerHTML = `
          <div style="display: grid; gap: 16px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div>
                <label style="color: rgba(255, 255, 255, 0.7); font-size: 12px; font-weight: 600;">Content ID</label>
                <p style="color: var(--color-white); margin-top: 4px;">${content.id}</p>
              </div>
              <div>
                <label style="color: rgba(255, 255, 255, 0.7); font-size: 12px; font-weight: 600;">Content Type</label>
                <p style="color: var(--color-white); margin-top: 4px;">${contentTypeLabel}</p>
              </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div>
                <label style="color: rgba(255, 255, 255, 0.7); font-size: 12px; font-weight: 600;">Author</label>
                <p style="color: var(--color-white); margin-top: 4px;">${content.author}</p>
              </div>
              <div>
                <label style="color: rgba(255, 255, 255, 0.7); font-size: 12px; font-weight: 600;">Flagged By</label>
                <p style="color: var(--color-white); margin-top: 4px;">${content.flaggedBy}</p>
              </div>
            </div>
            <div>
              <label style="color: rgba(255, 255, 255, 0.7); font-size: 12px; font-weight: 600;">Flag Reason</label>
              <p style="color: var(--color-white); margin-top: 4px;">${reasonLabel}</p>
            </div>
            <div>
              <label style="color: rgba(255, 255, 255, 0.7); font-size: 12px; font-weight: 600;">Flag Description</label>
              <p style="color: var(--color-white); margin-top: 4px; padding: 12px; background: rgba(255, 255, 255, 0.05); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1);">${content.flagReason}</p>
            </div>
            <div>
              <label style="color: rgba(255, 255, 255, 0.7); font-size: 12px; font-weight: 600;">Actual Content (${contentTypeLabel})</label>
              <p style="color: var(--color-white); margin-top: 4px; padding: 12px; background: rgba(255, 255, 255, 0.05); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1); max-height: 200px; overflow-y: auto;">${content.actualContent}</p>
            </div>
            <div>
              <label style="color: rgba(255, 255, 255, 0.7); font-size: 12px; font-weight: 600;">Timestamp</label>
              <p style="color: var(--color-white); margin-top: 4px;">${content.timestamp}</p>
            </div>
          </div>
        `;

        modal.classList.add("show");
      }
    });
  });
}
