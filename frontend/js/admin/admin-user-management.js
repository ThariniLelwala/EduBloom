// User Management Statistics Functions

// Sample users data
let allUsers = [];
let filteredUsers = [];
let selectedUsers = new Set();
let pendingDeleteUserIds = null; // Store user IDs pending deletion

// Load all user statistics
function loadUserStatistics() {
  loadStatisticsFromAPI();
}

// Load statistics from backend API
async function loadStatisticsFromAPI() {
  try {
    const stats = await adminApi.getStatistics();

    const totalElement = document.getElementById("total-users-count");
    if (totalElement) {
      totalElement.textContent = stats.total || 0;
    }

    const activeElement = document.getElementById("active-users-count");
    if (activeElement) {
      activeElement.textContent =
        stats.students + stats.teachers + stats.parents || 0;
    }

    const suspendedElement = document.getElementById("suspended-users-count");
    if (suspendedElement) {
      suspendedElement.textContent = "0"; // Will be implemented with status column
    }

    const dailyElement = document.getElementById("daily-registration-count");
    if (dailyElement) {
      dailyElement.textContent = stats.todayRegistrations || 0;
    }
  } catch (error) {
    console.error("Error loading statistics:", error);
  }
}

function loadTotalUsers() {
  // Deprecated: Use loadStatisticsFromAPI instead
}

function getTotalUsersCount() {
  // Deprecated: Use loadStatisticsFromAPI instead
  return 0;
}

function loadActiveUsers() {
  // Deprecated: Use loadStatisticsFromAPI instead
}

function getActiveUsersCount() {
  // Deprecated: Use loadStatisticsFromAPI instead
  return 0;
}

function loadSuspendedUsers() {
  // Deprecated: Use loadStatisticsFromAPI instead
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
    const fullName =
      `${user.firstname || ""} ${user.lastname || ""}`.trim() || user.username;

    tr.innerHTML = `
      <td>
        <input type="checkbox" class="user-checkbox admin-table-checkbox" data-user-id="${
          user.id
        }" ${isSelected ? "checked" : ""} />
      </td>
      <td class="text-white">${fullName}</td>
      <td class="text-muted">${user.username}</td>
      <td class="text-muted">${user.email}</td>
      <td class="text-muted text-capitalize">${user.role}</td>
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

  filteredUsers = allUsers.filter((user) => {
    // Create full name from firstname and lastname
    const fullName = `${user.firstname || ""} ${
      user.lastname || ""
    }`.toLowerCase();
    const username = (user.username || "").toLowerCase();
    const email = (user.email || "").toLowerCase();

    // Search in fullname, username, or email
    const matchesSearch =
      fullName.includes(searchQuery) ||
      username.includes(searchQuery) ||
      email.includes(searchQuery);

    // Filter by role (if selected)
    const matchesRole = !roleFilter || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  selectedUsers.clear();
  renderUsersTable();
}

// Bind filter events
function bindFilterEvents() {
  const searchInput = document.getElementById("search-users");
  const roleFilter = document.getElementById("filter-role");

  if (searchInput) {
    searchInput.addEventListener("input", filterUsers);
  }
  if (roleFilter) {
    roleFilter.addEventListener("change", filterUsers);
  }
}

// Bind action button events
function bindActionEvents() {
  const addAdminBtn = document.getElementById("add-admin-btn");
  const bulkDeleteBtn = document.getElementById("bulk-delete-btn");

  if (addAdminBtn) {
    addAdminBtn.addEventListener("click", () => {
      openAddAdminModal();
    });
  }

  if (bulkDeleteBtn) {
    bulkDeleteBtn.addEventListener("click", async () => {
      if (selectedUsers.size === 0) return;
      // Show password confirmation modal
      pendingDeleteUserIds = Array.from(selectedUsers);
      openDeleteConfirmModal();
    });
  }

  // Bind individual delete buttons
  document.addEventListener("click", async (e) => {
    if (e.target.closest(".delete-user-btn")) {
      const userId = parseInt(
        e.target.closest(".delete-user-btn").dataset.userId
      );
      // Show password confirmation modal
      pendingDeleteUserIds = [userId];
      openDeleteConfirmModal();
    }

    if (e.target.closest(".edit-user-btn")) {
      const userId = parseInt(
        e.target.closest(".edit-user-btn").dataset.userId
      );
      alert(`Edit user functionality for user ${userId} - to be implemented`);
    }
  });
}

// Modal Functions
function openAddAdminModal() {
  const modal = document.getElementById("add-admin-modal");
  if (modal) {
    modal.style.display = "flex";
    // Reset form
    document.getElementById("add-admin-form").reset();
    document.getElementById("admin-error-msg").style.display = "none";
  }
}

function closeAddAdminModal() {
  const modal = document.getElementById("add-admin-modal");
  if (modal) {
    modal.style.display = "none";
  }
}

function openDeleteConfirmModal() {
  const modal = document.getElementById("delete-confirm-modal");
  if (modal) {
    modal.style.display = "flex";
    // Reset form
    document.getElementById("delete-confirm-form").reset();
    document.getElementById("delete-error-msg").style.display = "none";
  }
}

function closeDeleteConfirmModal() {
  const modal = document.getElementById("delete-confirm-modal");
  if (modal) {
    modal.style.display = "none";
  }
  pendingDeleteUserIds = null;
}

// Handle delete confirmation form submission
async function handleDeleteConfirmSubmit(e) {
  e.preventDefault();

  if (!pendingDeleteUserIds || pendingDeleteUserIds.length === 0) {
    return;
  }

  const password = document.getElementById("delete-password").value;
  const errorMsg = document.getElementById("delete-error-msg");

  if (!password) {
    errorMsg.textContent = "Password is required";
    errorMsg.style.display = "block";
    return;
  }

  try {
    // Delete user(s) with password
    if (pendingDeleteUserIds.length === 1) {
      await adminApi.deleteUser(pendingDeleteUserIds[0], password);
      allUsers = allUsers.filter((user) => user.id !== pendingDeleteUserIds[0]);
    } else {
      await adminApi.deleteMultipleUsers(pendingDeleteUserIds, password);
      allUsers = allUsers.filter(
        (user) => !pendingDeleteUserIds.includes(user.id)
      );
      selectedUsers.clear();
    }

    closeDeleteConfirmModal();
    filterUsers();
    alert("User(s) deleted successfully!");
  } catch (error) {
    errorMsg.textContent = error.message || "Error deleting user(s)";
    errorMsg.style.display = "block";
  }
}

// Handle add admin form submission
async function handleAddAdminSubmit(e) {
  e.preventDefault();

  const firstname = document.getElementById("admin-firstname").value.trim();
  const lastname = document.getElementById("admin-lastname").value.trim();
  const birthday = document.getElementById("admin-birthday").value;
  const username = document.getElementById("admin-username").value.trim();
  const email = document.getElementById("admin-email").value.trim();
  const password = document.getElementById("admin-password").value;
  const errorMsg = document.getElementById("admin-error-msg");

  // Basic validation
  if (
    !firstname ||
    !lastname ||
    !birthday ||
    !username ||
    !email ||
    !password
  ) {
    errorMsg.textContent = "All fields are required";
    errorMsg.style.display = "block";
    return;
  }

  // Password validation
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    errorMsg.textContent =
      "Password must be at least 8 chars with uppercase, number, and special character";
    errorMsg.style.display = "block";
    return;
  }

  // Age validation (18+)
  const birthDate = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  if (age < 18) {
    errorMsg.textContent = "Admin must be at least 18 years old";
    errorMsg.style.display = "block";
    return;
  }

  // Create admin data object
  const adminData = {
    firstname,
    lastname,
    birthday,
    username,
    email,
    password,
  };

  try {
    const response = await adminApi.createAdmin(adminData);
    // Success - close modal and refresh table
    closeAddAdminModal();
    await loadAllUsersFromAPI();
    alert("Admin created successfully!");
  } catch (error) {
    errorMsg.textContent = error.message || "Error creating admin";
    errorMsg.style.display = "block";
  }
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  loadUserStatistics();
  loadAllUsersFromAPI();
  bindFilterEvents();
  bindActionEvents();

  // Add Admin Modal event listeners
  const closeBtn = document.getElementById("close-admin-modal");
  const cancelBtn = document.getElementById("cancel-admin-btn");
  const form = document.getElementById("add-admin-form");
  const modal = document.getElementById("add-admin-modal");

  if (closeBtn) {
    closeBtn.addEventListener("click", closeAddAdminModal);
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", closeAddAdminModal);
  }

  if (form) {
    form.addEventListener("submit", handleAddAdminSubmit);
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeAddAdminModal();
      }
    });
  }

  // Delete Confirmation Modal event listeners
  const closeDeleteBtn = document.getElementById("close-delete-modal");
  const cancelDeleteBtn = document.getElementById("cancel-delete-btn");
  const deleteForm = document.getElementById("delete-confirm-form");
  const deleteModal = document.getElementById("delete-confirm-modal");

  if (closeDeleteBtn) {
    closeDeleteBtn.addEventListener("click", closeDeleteConfirmModal);
  }

  if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener("click", closeDeleteConfirmModal);
  }

  if (deleteForm) {
    deleteForm.addEventListener("submit", handleDeleteConfirmSubmit);
  }

  if (deleteModal) {
    deleteModal.addEventListener("click", (e) => {
      if (e.target === deleteModal) {
        closeDeleteConfirmModal();
      }
    });
  }
});

// Load all users from API
async function loadAllUsersFromAPI() {
  try {
    allUsers = await adminApi.getAllUsers();
    filteredUsers = [...allUsers];
    renderUsersTable();
  } catch (error) {
    console.error("Error loading users:", error);
    // Fallback to initialize mock data
    initializeUsersData();
    renderUsersTable();
  }
}
