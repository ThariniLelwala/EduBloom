// Forum Management - Connected to Backend API

async function loadForumManagementStats() {
  try {
    const stats = await adminApi.getForumStats();
    document.getElementById("total-forums-count").textContent = stats.totalForums || 0;
    document.getElementById("forum-admins-count").textContent = stats.forumCreators || 0;
    document.getElementById("most-active-forum").textContent = stats.mostActiveForum || "None";
    document.getElementById("pending-moderation-count").textContent = stats.pendingApprovals || 0;
  } catch (error) {
    console.error("Error loading forum stats:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadForumManagementStats();
  loadPendingApprovals();
  loadAllForums();
  initializeModalHandlers();
});

let pendingApprovals = [];
let allForums = [];

async function loadPendingApprovals() {
  try {
    pendingApprovals = await adminApi.getPendingForumApprovals();
    renderPendingApprovalsTable();
  } catch (error) {
    console.error("Error loading pending approvals:", error);
    pendingApprovals = [];
    renderPendingApprovalsTable();
  }
}

function renderPendingApprovalsTable() {
  const tbody = document.getElementById("pending-approvals-tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  if (pendingApprovals.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="admin-empty-state">No pending approvals</td></tr>';
    return;
  }

  pendingApprovals.forEach(approval => {
    const authorName = `${approval.author_firstname || ""} ${approval.author_lastname || ""}`.trim() || approval.author_username;
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="text-white">${approval.title}</td>
      <td class="text-muted">${authorName}</td>
      <td class="text-muted">General</td>
      <td class="text-muted">${new Date(approval.created_at).toLocaleDateString()}</td>
      <td><i class="fas fa-eye" style="cursor:pointer" data-approval-id="${approval.id}"></i></td>
    `;
    tbody.appendChild(row);
  });
  bindPendingApprovalViewButtons();
}

async function loadAllForums() {
  try {
    allForums = await adminApi.getAllForums();
    renderAllForumsTable();
  } catch (error) {
    console.error("Error loading forums:", error);
    allForums = [];
    renderAllForumsTable();
  }
}

function renderAllForumsTable(forums = allForums) {
  const tbody = document.getElementById("all-forums-tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  if (forums.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="admin-empty-state">No forums found</td></tr>';
    return;
  }

  forums.forEach(forum => {
    const authorName = `${forum.author_firstname || ""} ${forum.author_lastname || ""}`.trim() || forum.author_username;
    const status = forum.published && !forum.archived ? "active" : "inactive";
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="text-white">${forum.title}</td>
      <td class="text-muted">${authorName}</td>
      <td class="text-capitalize">${forum.author_role || "teacher"}</td>
      <td class="text-white">${forum.reply_count || 0}</td>
      <td class="text-capitalize" style="color: var(--color-white)">${status}</td>
      <td><i class="fas fa-eye" style="cursor:pointer" data-forum-id="${forum.id}"></i></td>
    `;
    tbody.appendChild(row);
  });
  bindForumViewButtons();
  bindForumsSearch();
}

function bindForumsSearch() {
  const searchInput = document.getElementById("forums-search");
  const creatorFilter = document.getElementById("creator-type-filter");
  const statusFilter = document.getElementById("forum-status-filter");

  const applyFilters = () => {
    const search = searchInput?.value || "";
    const creatorRole = creatorFilter?.value || "";
    const status = statusFilter?.value || "";

    let filtered = allForums.filter(forum => {
      const authorName = `${forum.author_firstname || ""} ${forum.author_lastname || ""}`.trim() || forum.author_username;
      const matchesSearch = forum.title.toLowerCase().includes(search.toLowerCase()) || authorName.toLowerCase().includes(search.toLowerCase());
      const forumStatus = forum.published && !forum.archived ? "active" : "inactive";
      const matchesCreator = !creatorRole || (forum.author_role || "teacher") === creatorRole;
      const matchesStatus = !status || forumStatus === status;
      return matchesSearch && matchesCreator && matchesStatus;
    });
    renderAllForumsTable(filtered);
  };

  if (searchInput) searchInput.addEventListener("input", applyFilters);
  if (creatorFilter) creatorFilter.addEventListener("change", applyFilters);
  if (statusFilter) statusFilter.addEventListener("change", applyFilters);
}

let currentApprovalId = null;
let currentForumId = null;

function initializeModalHandlers() {
  document.querySelectorAll(".modal-close, .modal-footer .btn-secondary").forEach(btn => {
    btn.addEventListener("click", e => {
      const modal = e.target.closest(".modal");
      if (modal) modal.classList.remove("show");
    });
  });

  document.getElementById("grant-approval-btn")?.addEventListener("click", () => {
    document.getElementById("pending-approval-modal").classList.remove("show");
    document.getElementById("grant-confirmation-modal").classList.add("show");
  });

  document.getElementById("reject-request-btn")?.addEventListener("click", () => {
    document.getElementById("pending-approval-modal").classList.remove("show");
    document.getElementById("reject-confirmation-modal").classList.add("show");
  });

  document.getElementById("confirm-grant-btn")?.addEventListener("click", async () => {
    if (currentApprovalId) {
      try {
        await adminApi.approveForum(currentApprovalId);
        document.getElementById("grant-confirmation-modal").classList.remove("show");
        await loadPendingApprovals();
        await loadAllForums();
        await loadForumManagementStats();
        alert("Forum approved successfully");
      } catch (error) {
        alert(error.message);
      }
    }
    currentApprovalId = null;
  });

  document.getElementById("confirm-reject-btn")?.addEventListener("click", async () => {
    if (currentApprovalId) {
      try {
        await adminApi.rejectForum(currentApprovalId);
        document.getElementById("reject-confirmation-modal").classList.remove("show");
        await loadPendingApprovals();
        await loadForumManagementStats();
        alert("Forum rejected");
      } catch (error) {
        alert(error.message);
      }
    }
    currentApprovalId = null;
  });
}

function bindPendingApprovalViewButtons() {
  document.querySelectorAll("#pending-approvals-tbody [data-approval-id]").forEach(icon => {
    icon.addEventListener("click", async e => {
      const id = parseInt(e.target.dataset.approvalId);
      currentApprovalId = id;
      const approval = pendingApprovals.find(a => a.id === id);
      if (approval) {
        const authorName = `${approval.author_firstname || ""} ${approval.author_lastname || ""}`.trim() || approval.author_username;
        document.getElementById("approval-modal-title").textContent = approval.title;
        document.getElementById("approval-modal-name").textContent = approval.title;
        document.getElementById("approval-modal-requester").textContent = authorName;
        document.getElementById("approval-modal-category").textContent = "General";
        document.getElementById("approval-modal-date").textContent = new Date(approval.created_at).toLocaleDateString();
        document.getElementById("approval-modal-description").textContent = approval.description || "No description";
        document.getElementById("pending-approval-modal").classList.add("show");
      }
    });
  });
}

function bindForumViewButtons() {
  document.querySelectorAll("#all-forums-tbody [data-forum-id]").forEach(icon => {
    icon.addEventListener("click", async e => {
      const id = parseInt(e.target.dataset.forumId);
      currentForumId = id;
      try {
        const forum = await adminApi.getForumById(id);
        const authorName = `${forum.author_firstname || ""} ${forum.author_lastname || ""}`.trim() || forum.author_username;
        const status = forum.published && !forum.archived ? "active" : "inactive";
        document.getElementById("forum-view-title").textContent = forum.title;
        document.getElementById("forum-view-name").textContent = forum.title;
        document.getElementById("forum-view-creator").textContent = authorName;
        document.getElementById("forum-view-creator-type").textContent = forum.author_role || "teacher";
        document.getElementById("forum-view-members").textContent = forum.reply_count || 0;
        document.getElementById("forum-view-status").textContent = status;
        document.getElementById("forum-view-modal").classList.add("show");
      } catch (error) {
        alert("Error loading forum details");
      }
    });
  });
}
