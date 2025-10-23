// Forum Management Statistics Functions

// Load all forum management statistics
function loadForumManagementStats() {
  loadTotalForums();
  loadForumAdmins();
  loadMostActiveForum();
  loadPendingModeration();
  loadPendingApprovals();
  loadAllForums();
}

function loadTotalForums() {
  const totalForumsCount = getTotalForumsCount();
  const element = document.getElementById("total-forums-count");
  if (element) {
    element.textContent = totalForumsCount;
  }
}

function getTotalForumsCount() {
  // Get total forums from localStorage or return simulated data
  const forums = JSON.parse(localStorage.getItem("forums")) || [];
  return forums.length || 42;
}

function loadForumAdmins() {
  const forumAdminsCount = getForumAdminsCount();
  const element = document.getElementById("forum-admins-count");
  if (element) {
    element.textContent = forumAdminsCount;
  }
}

function getForumAdminsCount() {
  // Get forum admins (teachers and university students) from localStorage or return simulated data
  const admins = JSON.parse(localStorage.getItem("forumAdmins")) || [];
  return admins.length || 28;
}

function loadMostActiveForum() {
  const mostActiveForum = getMostActiveForum();
  const element = document.getElementById("most-active-forum");
  if (element) {
    element.textContent = mostActiveForum;
  }
}

function getMostActiveForum() {
  // Get most active forum from localStorage or return simulated data
  const forum = localStorage.getItem("mostActiveForum") || "Computer Science";
  return forum;
}

function loadPendingModeration() {
  const pendingModerationCount = getPendingModerationCount();
  const element = document.getElementById("pending-moderation-count");
  if (element) {
    element.textContent = pendingModerationCount;
  }
}

function getPendingModerationCount() {
  // Get pending moderation posts from localStorage or return simulated data
  const pendingPosts =
    JSON.parse(localStorage.getItem("pendingModerationPosts")) || [];
  return pendingPosts.length || 15;
}

// ===== Pending Approvals Table =====

function loadPendingApprovals() {
  const pendingApprovals = getPendingApprovals();
  renderPendingApprovalsTable(pendingApprovals);
}

function getPendingApprovals() {
  const approvals = localStorage.getItem("pendingForumApprovals")
    ? JSON.parse(localStorage.getItem("pendingForumApprovals"))
    : getDefaultPendingApprovals();
  return approvals;
}

function getDefaultPendingApprovals() {
  return [
    {
      id: 1,
      forumName: "Web Development Tips",
      requestedBy: "Alex Johnson",
      category: "Technology",
      requestedDate: "2025-10-22",
      description:
        "A forum for discussing web development best practices and sharing resources.",
    },
    {
      id: 2,
      forumName: "Data Science Discussion",
      requestedBy: "Sarah Chen",
      category: "Science",
      requestedDate: "2025-10-21",
      description:
        "Forum for data science enthusiasts to share projects and discuss algorithms.",
    },
    {
      id: 3,
      forumName: "Creative Writing Hub",
      requestedBy: "Emma Davis",
      category: "Arts",
      requestedDate: "2025-10-20",
      description:
        "A space for creative writers to share their work and get feedback.",
    },
    {
      id: 4,
      forumName: "Machine Learning Basics",
      requestedBy: "Mike Wilson",
      category: "Technology",
      requestedDate: "2025-10-19",
      description:
        "Beginner-friendly forum for learning machine learning concepts and techniques.",
    },
  ];
}

function renderPendingApprovalsTable(approvals) {
  const tbody = document.getElementById("pending-approvals-tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  approvals.forEach((approval) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="text-white">${approval.forumName}</td>
      <td class="text-muted">${approval.requestedBy}</td>
      <td class="text-capitalize">${approval.category}</td>
      <td class="text-muted">${approval.requestedDate}</td>
      <td class="admin-table-action">
        <i class="fas fa-eye" style="cursor: pointer;" title="View" data-approval-id="${approval.id}"></i>
      </td>
    `;
    tbody.appendChild(row);
  });

  bindPendingApprovalViewButtons();
}

// ===== All Forums Table =====

function loadAllForums() {
  const allForums = getAllForums();
  renderAllForumsTable(allForums);
  bindForumsSearch();
}

function getAllForums() {
  const forums = localStorage.getItem("allForums")
    ? JSON.parse(localStorage.getItem("allForums"))
    : getDefaultAllForums();
  return forums;
}

function getDefaultAllForums() {
  return [
    {
      id: 1,
      name: "Computer Science",
      createdBy: "Dr. Johnson",
      creatorType: "teacher",
      members: 256,
      status: "active",
    },
    {
      id: 2,
      name: "General Discussion",
      createdBy: "Prof. Smith",
      creatorType: "teacher",
      members: 412,
      status: "active",
    },
    {
      id: 3,
      name: "Physics Q&A",
      createdBy: "Jane Wilson",
      creatorType: "student",
      members: 178,
      status: "active",
    },
    {
      id: 4,
      name: "Mathematics Help",
      createdBy: "Prof. Brown",
      creatorType: "teacher",
      members: 334,
      status: "active",
    },
    {
      id: 5,
      name: "Chemistry Lab",
      createdBy: "Alex Chen",
      creatorType: "student",
      members: 145,
      status: "inactive",
    },
    {
      id: 6,
      name: "History & Culture",
      createdBy: "Prof. Taylor",
      creatorType: "teacher",
      members: 289,
      status: "active",
    },
    {
      id: 7,
      name: "Art & Design",
      createdBy: "Sarah Davis",
      creatorType: "student",
      members: 201,
      status: "active",
    },
    {
      id: 8,
      name: "Literature Club",
      createdBy: "Prof. Anderson",
      creatorType: "teacher",
      members: 267,
      status: "active",
    },
  ];
}

function renderAllForumsTable(forums) {
  const tbody = document.getElementById("all-forums-tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  forums.forEach((forum) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="text-white">${forum.name}</td>
      <td class="text-muted">${forum.createdBy}</td>
      <td class="text-capitalize">${forum.creatorType}</td>
      <td class="text-white">${forum.members}</td>
      <td class="text-capitalize" style="color: var(--color-white);">
        ${forum.status}
      </td>
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
    const allForums = getAllForums();

    let filtered = allForums.filter(
      (forum) =>
        forum.name.toLowerCase().includes(searchTerm) ||
        forum.createdBy.toLowerCase().includes(searchTerm)
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
  initializeModalHandlers();
});

// ===== Modal Functions =====

let currentApprovalId = null;

function initializeModalHandlers() {
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

  // Grant Approval modal
  const grantBtn = document.getElementById("grant-approval-btn");
  if (grantBtn) {
    grantBtn.addEventListener("click", () => {
      document
        .getElementById("pending-approval-modal")
        .classList.remove("show");
      document.getElementById("grant-confirmation-modal").classList.add("show");
    });
  }

  // Reject Request modal
  const rejectBtn = document.getElementById("reject-request-btn");
  if (rejectBtn) {
    rejectBtn.addEventListener("click", () => {
      document
        .getElementById("pending-approval-modal")
        .classList.remove("show");
      document
        .getElementById("reject-confirmation-modal")
        .classList.add("show");
    });
  }

  // Confirm Grant
  const confirmGrantBtn = document.getElementById("confirm-grant-btn");
  if (confirmGrantBtn) {
    confirmGrantBtn.addEventListener("click", () => {
      console.log("Forum approved with ID:", currentApprovalId);
      document
        .getElementById("grant-confirmation-modal")
        .classList.remove("show");
      loadPendingApprovals();
      currentApprovalId = null;
    });
  }

  // Confirm Reject
  const confirmRejectBtn = document.getElementById("confirm-reject-btn");
  if (confirmRejectBtn) {
    confirmRejectBtn.addEventListener("click", () => {
      console.log("Forum rejected with ID:", currentApprovalId);
      document
        .getElementById("reject-confirmation-modal")
        .classList.remove("show");
      loadPendingApprovals();
      currentApprovalId = null;
    });
  }
}

function bindPendingApprovalViewButtons() {
  document
    .querySelectorAll("#pending-approvals-tbody [data-approval-id]")
    .forEach((icon) => {
      icon.addEventListener("click", (e) => {
        const approvalId = e.target.getAttribute("data-approval-id");
        currentApprovalId = approvalId;
        const approvals = getPendingApprovals();
        const approval = approvals.find((a) => a.id == approvalId);

        if (approval) {
          document.getElementById("approval-modal-title").textContent =
            approval.forumName;
          document.getElementById("approval-modal-name").textContent =
            approval.forumName;
          document.getElementById("approval-modal-requester").textContent =
            approval.requestedBy;
          document.getElementById("approval-modal-category").textContent =
            approval.category;
          document.getElementById("approval-modal-date").textContent =
            approval.requestedDate;
          document.getElementById("approval-modal-description").textContent =
            approval.description || "No description provided";

          document
            .getElementById("pending-approval-modal")
            .classList.add("show");
        }
      });
    });
}

function bindForumViewButtons() {
  document
    .querySelectorAll("#all-forums-tbody [data-forum-id]")
    .forEach((icon) => {
      icon.addEventListener("click", (e) => {
        const forumId = e.target.getAttribute("data-forum-id");
        const forums = getAllForums();
        const forum = forums.find((f) => f.id == forumId);

        if (forum) {
          document.getElementById("forum-view-title").textContent = forum.name;
          document.getElementById("forum-view-name").textContent = forum.name;
          document.getElementById("forum-view-creator").textContent =
            forum.createdBy;
          document.getElementById("forum-view-creator-type").textContent =
            forum.creatorType;
          document.getElementById("forum-view-members").textContent =
            forum.members;
          document.getElementById("forum-view-status").textContent =
            forum.status;

          document.getElementById("forum-view-modal").classList.add("show");
        }
      });
    });
}
