// User Management Statistics Functions

// Sample users data
let allUsers = [];
let filteredUsers = [];
let selectedUsers = new Set();

// Load all user statistics
function loadUserStatistics() {
  loadTotalUsers();
  loadActiveUsers();
  loadSuspendedUsers();
  loadDailyRegistration();
}

function loadTotalUsers() {
  const totalUsersCount = getTotalUsersCount();
  const element = document.getElementById("total-users-count");
  if (element) {
    element.textContent = totalUsersCount;
  }
}

function getTotalUsersCount() {
  // Count users from localStorage or return simulated data
  const students = JSON.parse(localStorage.getItem("students")) || [];
  const teachers = JSON.parse(localStorage.getItem("teachers")) || [];
  const parents = JSON.parse(localStorage.getItem("parents")) || [];
  return students.length + teachers.length + parents.length || 45;
}

function loadActiveUsers() {
  const activeUsersCount = getActiveUsersCount();
  const element = document.getElementById("active-users-count");
  if (element) {
    element.textContent = activeUsersCount;
  }
}

function getActiveUsersCount() {
  // Get active users from localStorage or simulate
  const activeUsers = JSON.parse(localStorage.getItem("activeUsers")) || [];
  return activeUsers.length || 28;
}

function loadSuspendedUsers() {
  const suspendedUsersCount = getSuspendedUsersCount();
  const element = document.getElementById("suspended-users-count");
  if (element) {
    element.textContent = suspendedUsersCount;
  }
}

function getSuspendedUsersCount() {
  // Get suspended users from localStorage or simulate
  const suspendedUsers =
    JSON.parse(localStorage.getItem("suspendedUsers")) || [];
  return suspendedUsers.length || 3;
}

function loadDailyRegistration() {
  const dailyRegistrationCount = getDailyRegistrationCount();
  const element = document.getElementById("daily-registration-count");
  if (element) {
    element.textContent = dailyRegistrationCount;
  }
}

function getDailyRegistrationCount() {
  // Get today's registrations from localStorage or simulate
  const todayRegistrations =
    JSON.parse(localStorage.getItem("todayRegistrations")) || [];
  return todayRegistrations.length || 5;
}

// ===== Users Table Functions =====

// Initialize users data
function initializeUsersData() {
  allUsers = [
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@email.com",
      role: "student",
      status: "active",
    },
    {
      id: 2,
      name: "Sarah Smith",
      email: "sarah.smith@email.com",
      role: "teacher",
      status: "active",
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike.johnson@email.com",
      role: "parent",
      status: "active",
    },
    {
      id: 4,
      name: "Emily Brown",
      email: "emily.brown@email.com",
      role: "student",
      status: "inactive",
    },
    {
      id: 5,
      name: "Alex Davis",
      email: "alex.davis@email.com",
      role: "teacher",
      status: "active",
    },
    {
      id: 6,
      name: "Jessica Wilson",
      email: "jessica.w@email.com",
      role: "student",
      status: "suspended",
    },
    {
      id: 7,
      name: "David Martinez",
      email: "david.m@email.com",
      role: "parent",
      status: "active",
    },
    {
      id: 8,
      name: "Lisa Anderson",
      email: "lisa.a@email.com",
      role: "teacher",
      status: "active",
    },
    {
      id: 9,
      name: "James Taylor",
      email: "james.t@email.com",
      role: "student",
      status: "active",
    },
    {
      id: 10,
      name: "Rachel Green",
      email: "rachel.g@email.com",
      role: "parent",
      status: "inactive",
    },
  ];
  filteredUsers = [...allUsers];
}

// Render users table
function renderUsersTable() {
  const tbody = document.getElementById("users-table-body");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (filteredUsers.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="admin-empty-state">
          No users found
        </td>
      </tr>
    `;
    return;
  }

  filteredUsers.forEach((user) => {
    const tr = document.createElement("tr");
    const isSelected = selectedUsers.has(user.id);

    tr.innerHTML = `
      <td>
        <input type="checkbox" class="user-checkbox admin-table-checkbox" data-user-id="${
          user.id
        }" ${isSelected ? "checked" : ""} />
      </td>
      <td class="text-white">${user.name}</td>
      <td class="text-muted">${user.email}</td>
      <td class="text-muted text-capitalize">${user.role}</td>
      <td class="text-muted text-capitalize">${user.status}</td>
      <td style="text-align: center;">
        <button class="edit-user-btn admin-table-action" data-user-id="${
          user.id
        }" title="Edit">
          <i class="fas fa-edit"></i>
        </button>
        <button class="delete-user-btn admin-table-action" data-user-id="${
          user.id
        }" title="Delete">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });

  // Bind checkbox events
  bindCheckboxEvents();
}

// Bind checkbox events
function bindCheckboxEvents() {
  const checkboxes = document.querySelectorAll(".user-checkbox");
  const selectAllCheckbox = document.getElementById("select-all");

  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", (e) => {
      const userId = parseInt(e.target.dataset.userId);
      if (e.target.checked) {
        selectedUsers.add(userId);
      } else {
        selectedUsers.delete(userId);
      }
      updateBulkDeleteButton();
      updateSelectAllCheckbox();
    });
  });

  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener("change", (e) => {
      checkboxes.forEach((checkbox) => {
        checkbox.checked = e.target.checked;
        const userId = parseInt(checkbox.dataset.userId);
        if (e.target.checked) {
          selectedUsers.add(userId);
        } else {
          selectedUsers.delete(userId);
        }
      });
      updateBulkDeleteButton();
    });
  }
}

// Update bulk delete button state
function updateBulkDeleteButton() {
  const bulkDeleteBtn = document.getElementById("bulk-delete-btn");
  if (selectedUsers.size > 0) {
    bulkDeleteBtn.disabled = false;
    bulkDeleteBtn.classList.remove("btn-disabled");
  } else {
    bulkDeleteBtn.disabled = true;
    bulkDeleteBtn.classList.add("btn-disabled");
  }
}

// Update select all checkbox state
function updateSelectAllCheckbox() {
  const selectAllCheckbox = document.getElementById("select-all");
  const checkboxes = document.querySelectorAll(".user-checkbox");
  if (checkboxes.length === 0) return;

  selectAllCheckbox.checked = selectedUsers.size === checkboxes.length;
  selectAllCheckbox.indeterminate =
    selectedUsers.size > 0 && selectedUsers.size < checkboxes.length;
}

// Filter users
function filterUsers() {
  const searchQuery = document
    .getElementById("search-users")
    .value.toLowerCase();
  const roleFilter = document.getElementById("filter-role").value;
  const activityFilter = document.getElementById("filter-activity").value;

  filteredUsers = allUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery) ||
      user.email.toLowerCase().includes(searchQuery);
    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesActivity = !activityFilter || user.status === activityFilter;

    return matchesSearch && matchesRole && matchesActivity;
  });

  selectedUsers.clear();
  renderUsersTable();
}

// Bind filter events
function bindFilterEvents() {
  const searchInput = document.getElementById("search-users");
  const roleFilter = document.getElementById("filter-role");
  const activityFilter = document.getElementById("filter-activity");

  if (searchInput) {
    searchInput.addEventListener("input", filterUsers);
  }
  if (roleFilter) {
    roleFilter.addEventListener("change", filterUsers);
  }
  if (activityFilter) {
    activityFilter.addEventListener("change", filterUsers);
  }
}

// Bind action button events
function bindActionEvents() {
  const addUserBtn = document.getElementById("add-user-btn");
  const bulkDeleteBtn = document.getElementById("bulk-delete-btn");

  if (addUserBtn) {
    addUserBtn.addEventListener("click", () => {
      alert("Add User functionality - to be implemented");
    });
  }

  if (bulkDeleteBtn) {
    bulkDeleteBtn.addEventListener("click", () => {
      if (selectedUsers.size === 0) return;
      if (confirm(`Delete ${selectedUsers.size} selected user(s)?`)) {
        allUsers = allUsers.filter((user) => !selectedUsers.has(user.id));
        selectedUsers.clear();
        filterUsers();
      }
    });
  }

  // Bind individual delete buttons
  document.addEventListener("click", (e) => {
    if (e.target.closest(".delete-user-btn")) {
      const userId = parseInt(
        e.target.closest(".delete-user-btn").dataset.userId
      );
      if (confirm("Delete this user?")) {
        allUsers = allUsers.filter((user) => user.id !== userId);
        filterUsers();
      }
    }

    if (e.target.closest(".edit-user-btn")) {
      const userId = parseInt(
        e.target.closest(".edit-user-btn").dataset.userId
      );
      alert(`Edit user functionality for user ${userId} - to be implemented`);
    }
  });
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  loadUserStatistics();
  initializeUsersData();
  renderUsersTable();
  bindFilterEvents();
  bindActionEvents();
});
