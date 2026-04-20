// Forum Management - Connected to Backend API
let pendingDeletionsData = [];

// Load all forum data
async function loadForumManagementStats() {
  try {
    const stats = await adminApi.getForumStatistics();

    const totalElement = document.getElementById("total-forums-count");
    const adminsElement = document.getElementById("forum-admins-count");
    const activeElement = document.getElementById("most-active-forum");

    if (totalElement) totalElement.textContent = stats.totalForums || 0;
    if (adminsElement) adminsElement.textContent = stats.forumAdmins || 0;
    if (activeElement) activeElement.textContent = stats.mostActiveForum || "N/A";
  } catch (error) {
    console.error("Error loading forum stats:", error);
    setDefaultStats();
  }
}

function setDefaultStats() {
  const totalElement = document.getElementById("total-forums-count");
  const adminsElement = document.getElementById("forum-admins-count");
  const activeElement = document.getElementById("most-active-forum");

  if (totalElement) totalElement.textContent = "0";
  if (adminsElement) adminsElement.textContent = "0";
  if (activeElement) activeElement.textContent = "N/A";
}

// Load all forums
async function loadAllForums() {
  try {
    const forums = await adminApi.getAllForums();
    window.allForumsData = forums;
    renderAllForumsTable(forums);
    bindForumsSearch();
  } catch (error) {
    console.error("Error loading forums:", error);
    renderAllForumsTable([]);
  }
}

// Load pending deletion requests
async function loadPendingDeletions() {
  try {
    const requests = await adminApi.getPendingDeletions();
    pendingDeletionsData = requests;
    renderPendingDeletionsTable(requests);
    updateDeletionStats(requests.length);
  } catch (error) {
    console.error("Error loading pending deletions:", error);
    pendingDeletionsData = [];
    renderPendingDeletionsTable([]);
    updateDeletionStats(0);
  }
}

function updateDeletionStats(count) {
  const badge = document.getElementById("pending-deletion-badge");
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? "inline-block" : "none";
  }
}

function renderPendingDeletionsTable(requests) {
  const tbody = document.getElementById("pending-deletions-tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (requests.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: rgba(255,255,255,0.6);">No pending deletion requests</td></tr>`;
    return;
  }

  requests.forEach((request) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="text-white">${request.title || "Untitled"}</td>
      <td class="text-muted">${request.author || "Unknown"}</td>
      <td class="text-muted">${request.author_role || "student"}</td>
      <td class="text-white" style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${request.deletion_reason || ""}">${request.deletion_reason || "No reason provided"}</td>
      <td class="admin-table-action">
        <i class="fas fa-check" style="cursor: pointer; color: #2ed573; margin-right: 12px;" title="Approve" data-approve-id="${request.id}"></i>
        <i class="fas fa-times" style="cursor: pointer; color: #ff4757;" title="Reject" data-reject-id="${request.id}"></i>
      </td>
    `;
    tbody.appendChild(row);
  });

  bindDeletionActionButtons();
}

function bindDeletionActionButtons() {
  document.querySelectorAll("[data-approve-id]").forEach((icon) => {
    icon.addEventListener("click", async (e) => {
      const forumId = parseInt(e.target.getAttribute("data-approve-id"));
      if (confirm("Are you sure you want to approve this deletion? The forum will be permanently deleted.")) {
        await approveDeletion(forumId);
      }
    });
  });

  document.querySelectorAll("[data-reject-id]").forEach((icon) => {
    icon.addEventListener("click", async (e) => {
      const forumId = parseInt(e.target.getAttribute("data-reject-id"));
      if (confirm("Are you sure you want to reject this deletion request? The forum will remain active.")) {
        await rejectDeletion(forumId);
      }
    });
  });
}

async function approveDeletion(forumId) {
  try {
    await adminApi.approveDelete(forumId);
    showNotification("Forum deleted successfully", "success");
    await loadPendingDeletions();
    await loadAllForums();
  } catch (error) {
    console.error("Error approving deletion:", error);
    showNotification("Failed to approve deletion", "error");
  }
}

async function rejectDeletion(forumId) {
  try {
    await adminApi.rejectDelete(forumId);
    showNotification("Deletion request rejected", "success");
    await loadPendingDeletions();
  } catch (error) {
    console.error("Error rejecting deletion:", error);
    showNotification("Failed to reject deletion", "error");
  }
}

function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed; top: 20px; right: 20px;
    background: ${type === "error" ? "rgba(239,68,68,0.9)" : "rgba(74,222,128,0.9)"};
    color: white; padding: 12px 20px; border-radius: 8px;
    font-weight: 500; z-index: 1000;
  `;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

function renderAllForumsTable(forums) {
  const tbody = document.getElementById("all-forums-tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (forums.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: rgba(255,255,255,0.6);">No forums found</td></tr>`;
    return;
  }

  forums.forEach((forum) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="text-white">${forum.name || "Untitled"}</td>
      <td class="text-muted">${forum.createdBy || "Unknown"}</td>
      <td class="text-capitalize">${forum.creatorType || "teacher"}</td>
      <td class="text-white">${forum.members || 0}</td>
      <td class="text-capitalize" style="color: var(--color-white);">${forum.status || "active"}</td>
      <td class="admin-table-action">
        <i class="fas fa-eye" style="cursor: pointer;" title="View" data-forum-id="${forum.id}"></i>
      </td>
    `;
    tbody.appendChild(row);
  });

  bindForumViewButtons();
}

function bindForumsSearch() {
  const searchInput = document.getElementById("forums-search");
  const creatorFilter = document.getElementById("creator-type-filter");
  const statusFilter = document.getElementById("forum-status-filter");

  if (!searchInput) return;

  const applyFilters = () => {
    const searchTerm = searchInput.value.toLowerCase();
    const creatorType = creatorFilter?.value || "";
    const status = statusFilter?.value || "";
    const allForums = window.allForumsData || [];

    let filtered = allForums.filter(
      (forum) =>
        (forum.name || "").toLowerCase().includes(searchTerm) ||
        (forum.createdBy || "").toLowerCase().includes(searchTerm)
    );

    if (creatorType) {
      filtered = filtered.filter((forum) => forum.creatorType === creatorType);
    }

    if (status) {
      filtered = filtered.filter((forum) => forum.status === status);
    }

    renderAllForumsTable(filtered);
  };

  searchInput.addEventListener("input", applyFilters);
  if (creatorFilter) creatorFilter.addEventListener("change", applyFilters);
  if (statusFilter) statusFilter.addEventListener("change", applyFilters);
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  loadForumManagementStats();
  loadAllForums();
  loadPendingDeletions();
  initializeModalHandlers();
});

// Modal functions
function initializeModalHandlers() {
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
}

function bindForumViewButtons() {
  document.querySelectorAll("#all-forums-tbody [data-forum-id]").forEach((icon) => {
    icon.addEventListener("click", async (e) => {
      const forumId = parseInt(e.target.getAttribute("data-forum-id"));

      try {
        const forum = await adminApi.getForum(forumId);

        document.getElementById("forum-view-title").textContent = forum.name;
        document.getElementById("forum-view-name").textContent = forum.name;
        document.getElementById("forum-view-creator").textContent = forum.createdBy;
        document.getElementById("forum-view-creator-type").textContent = forum.creatorType;
        document.getElementById("forum-view-members").textContent = forum.members;
        document.getElementById("forum-view-status").textContent = forum.status;

        document.getElementById("forum-view-modal")?.classList.add("show");
      } catch (error) {
        console.error("Error loading forum details:", error);
        alert("Failed to load forum details");
      }
    });
  });
}