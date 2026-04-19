// User Management Statistics Functions

let allUsers = [];
let filteredUsers = [];
let suspendedUsers = [];
let selectedUsers = new Set();
let pendingDeleteUserIds = null;
let pendingEditUserId = null;

// Load all user statistics
function loadUserStatistics() {
  loadStatisticsFromAPI();
}

// Load statistics from backend API
async function loadStatisticsFromAPI() {
  try {
    const stats = await adminApi.getStatistics();

    const activeUsers = stats.total || 0;
    const suspendedUsers = stats.suspended || 0;
    const totalUsers = activeUsers + suspendedUsers;

    const totalElement = document.getElementById("total-users-count");
    if (totalElement) {
      totalElement.textContent = totalUsers;
    }

    const activeElement = document.getElementById("active-users-count");
    if (activeElement) {
      activeElement.textContent = activeUsers;
    }

    const suspendedElement = document.getElementById("suspended-users-count");
    if (suspendedElement) {
      suspendedElement.textContent = suspendedUsers;
    }

    const dailyElement = document.getElementById("daily-registration-count");
    if (dailyElement) {
      dailyElement.textContent = stats.todayRegistrations || 0;
    }
  } catch (error) {
    console.error("Error loading statistics:", error);
  }
}

// Load all users from API
async function loadAllUsersFromAPI() {
  try {
    allUsers = await adminApi.getAllUsers();
    filteredUsers = [...allUsers];
    renderUsersTable();
  } catch (error) {
    console.error("Error loading users:", error);
  }
}

// Load suspended users from API
async function loadSuspendedUsers() {
  try {
    suspendedUsers = await adminApi.getSuspendedUsers();
    renderSuspendedUsersTable();
  } catch (error) {
    console.error("Error loading suspended users:", error);
    suspendedUsers = [];
    renderSuspendedUsersTable();
  }
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
          No active users found
        </td>
      </tr>
    `;
    return;
  }

  filteredUsers.forEach((user) => {
    const tr = document.createElement("tr");
    const isSelected = selectedUsers.has(user.id);
    const fullName = `${user.firstname || ""} ${user.lastname || ""}`.trim() || user.username;
    const isAdmin = user.role === "admin";
    const editButton = isAdmin
      ? ``
      : `<button class="edit-user-btn admin-table-action" data-user-id="${user.id}" title="Edit">
          <i class="fas fa-edit"></i>
        </button>`;

    const birthday = user.birthday ? new Date(user.birthday).toLocaleDateString() : '-';
    const gender = user.gender ? user.gender : '-';

    tr.innerHTML = `
      <td>
        <input type="checkbox" class="user-checkbox admin-table-checkbox" data-user-id="${user.id}" ${isSelected ? "checked" : ""} />
      </td>
      <td class="text-white">${fullName}</td>
      <td class="text-muted">${user.username}</td>
      <td class="text-muted">${user.email}</td>
      <td class="text-muted text-capitalize">${user.role}</td>
      <td class="text-muted">${birthday}</td>
      <td class="text-muted text-capitalize">${gender}</td>
      <td style="text-align: center;">
        ${editButton}
        <button class="delete-user-btn admin-table-action" data-user-id="${user.id}" title="Suspend">
          <i class="fas fa-ban"></i>
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });

  bindCheckboxEvents();
}

// Render suspended users table
function renderSuspendedUsersTable() {
  const tbody = document.getElementById("suspended-users-table-body");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (suspendedUsers.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="admin-empty-state">
          No suspended users
        </td>
      </tr>
    `;
    return;
  }

  suspendedUsers.forEach((user) => {
    const fullName = `${user.firstname || ""} ${user.lastname || ""}`.trim() || user.username;
    const suspendedDate = user.suspended_at ? new Date(user.suspended_at).toLocaleDateString() : "N/A";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="text-white">${fullName}</td>
      <td class="text-muted">${user.username}</td>
      <td class="text-muted">${user.email}</td>
      <td class="text-muted text-capitalize">${user.role}</td>
      <td class="text-muted">${suspendedDate}</td>
      <td style="text-align: center;">
        <button class="view-suspended-btn admin-table-action" data-user-id="${user.id}" title="View Details">
          <i class="fas fa-eye"></i>
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });

  bindSuspendedEvents();
}

// Bind suspended user events
function bindSuspendedEvents() {
  document.querySelectorAll(".view-suspended-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const userId = parseInt(btn.dataset.userId);
      openSuspendedUserModal(userId);
    });
  });
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
  selectAllCheckbox.indeterminate = selectedUsers.size > 0 && selectedUsers.size < checkboxes.length;
}

// Filter users
function filterUsers() {
  const searchQuery = document.getElementById("search-users").value.toLowerCase();
  const roleFilter = document.getElementById("filter-role").value;

  filteredUsers = allUsers.filter((user) => {
    const fullName = `${user.firstname || ""} ${user.lastname || ""}`.toLowerCase();
    const username = (user.username || "").toLowerCase();
    const email = (user.email || "").toLowerCase();

    const matchesSearch = fullName.includes(searchQuery) || username.includes(searchQuery) || email.includes(searchQuery);
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
      pendingDeleteUserIds = Array.from(selectedUsers);
      openDeleteConfirmModal();
    });
  }

  document.addEventListener("click", async (e) => {
    if (e.target.closest(".delete-user-btn")) {
      const userId = parseInt(e.target.closest(".delete-user-btn").dataset.userId);
      pendingDeleteUserIds = [userId];
      openDeleteConfirmModal();
    }

    if (e.target.closest(".edit-user-btn")) {
      const userId = parseInt(e.target.closest(".edit-user-btn").dataset.userId);
      openEditUserModal(userId);
    }
  });
}

// Modal Functions
function openAddAdminModal() {
  const modal = document.getElementById("add-admin-modal");
  if (modal) {
    modal.style.display = "flex";
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

// Edit User Modal Functions
function openEditUserModal(userId) {
  const user = allUsers.find((u) => u.id === userId);
  if (!user) return;

  if (user.role === "admin") {
    showToast("Cannot edit admin accounts", "error");
    return;
  }

  pendingEditUserId = userId;
  const modal = document.getElementById("edit-user-modal");

  if (modal) {
    modal.style.display = "flex";
    document.getElementById("edit-user-id").value = userId;
    document.getElementById("edit-firstname").value = user.firstname || "";
    document.getElementById("edit-lastname").value = user.lastname || "";
    document.getElementById("edit-username").value = user.username || "";
    document.getElementById("edit-email").value = user.email || "";
    document.getElementById("edit-role").value = user.role || "student";
    document.getElementById("edit-birthday").value = user.birthday ? user.birthday.split('T')[0] : "";

    const studentTypeGroup = document.getElementById("edit-student-type-group");
    const studentTypeSelect = document.getElementById("edit-student-type");
    if (user.role === "student") {
      studentTypeGroup.style.display = "block";
      studentTypeSelect.value = user.student_type || "";
    } else {
      studentTypeGroup.style.display = "none";
    }

    document.getElementById("edit-error-msg").style.display = "none";
  }
}

function closeEditUserModal() {
  const modal = document.getElementById("edit-user-modal");
  if (modal) {
    modal.style.display = "none";
  }
  pendingEditUserId = null;
}

// Handle edit user form submission
async function handleEditUserSubmit(e) {
  e.preventDefault();

  if (!pendingEditUserId) {
    return;
  }

  const firstname = document.getElementById("edit-firstname").value.trim();
  const lastname = document.getElementById("edit-lastname").value.trim();
  const username = document.getElementById("edit-username").value.trim();
  const email = document.getElementById("edit-email").value.trim();
  const role = document.getElementById("edit-role").value;
  const student_type = role === "student" ? document.getElementById("edit-student-type").value : null;
  const errorMsg = document.getElementById("edit-error-msg");

  if (!firstname && !lastname && !username && !email) {
    errorMsg.textContent = "At least one field must be filled";
    errorMsg.style.display = "block";
    return;
  }

  const birthday = document.getElementById("edit-birthday").value;
  const userData = {};
  if (firstname) userData.firstname = firstname;
  if (lastname) userData.lastname = lastname;
  if (username) userData.username = username;
  if (email) userData.email = email;
  if (role) userData.role = role;
  if (student_type) userData.student_type = student_type;
  if (birthday) userData.birthday = birthday;

  try {
    await adminApi.updateUser(pendingEditUserId, userData);
    closeEditUserModal();
    await loadAllUsersFromAPI();
    showToast("User updated successfully!", "success");
  } catch (error) {
    errorMsg.textContent = error.message || "Error updating user";
    errorMsg.style.display = "block";
  }
}

// Handle delete confirmation form submission
async function handleDeleteConfirmSubmit(e) {
  e.preventDefault();

  if (!pendingDeleteUserIds || pendingDeleteUserIds.length === 0) {
    return;
  }

  const password = document.getElementById("delete-password").value;
  const reason = document.getElementById("delete-reason").value.trim();
  const errorMsg = document.getElementById("delete-error-msg");

  if (!password) {
    errorMsg.textContent = "Password is required";
    errorMsg.style.display = "block";
    return;
  }

  if (!reason) {
    errorMsg.textContent = "Reason is required";
    errorMsg.style.display = "block";
    return;
  }

  try {
    if (pendingDeleteUserIds.length === 1) {
      await adminApi.deleteUser(pendingDeleteUserIds[0], password, reason);
    } else {
      await adminApi.deleteMultipleUsers(pendingDeleteUserIds, password, reason);
      selectedUsers.clear();
    }

    closeDeleteConfirmModal();
    await loadAllUsersFromAPI();
    await loadSuspendedUsers();
    await loadStatisticsFromAPI();
    showToast("User(s) suspended successfully!", "success");
  } catch (error) {
    errorMsg.textContent = error.message || "Error suspending user(s)";
    errorMsg.style.display = "block";
    showToast(error.message || "Error suspending user(s)", "error");
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

  if (!firstname || !lastname || !birthday || !username || !email || !password) {
    errorMsg.textContent = "All fields are required";
    errorMsg.style.display = "block";
    return;
  }

  // Password validation
  if (password.length < 8) {
    errorMsg.textContent = "Password must be at least 8 characters";
    errorMsg.style.display = "block";
    return;
  }
  if (!/[A-Z]/.test(password)) {
    errorMsg.textContent = "Password must contain at least one uppercase letter";
    errorMsg.style.display = "block";
    return;
  }
  if (!/[0-9]/.test(password)) {
    errorMsg.textContent = "Password must contain at least one number";
    errorMsg.style.display = "block";
    return;
  }
  if (!/[@$!%*?&]/.test(password)) {
    errorMsg.textContent = "Password must contain at least one special character (@$!%*?&)";
    errorMsg.style.display = "block";
    return;
  }

  // Age validation (18+)
  const birthDate = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age < 18) {
    errorMsg.textContent = "Admin must be at least 18 years old";
    errorMsg.style.display = "block";
    return;
  }

  const adminData = {
    firstname,
    lastname,
    birthday,
    username,
    email,
    password,
  };

  try {
    await adminApi.createAdmin(adminData);
    closeAddAdminModal();
    await loadAllUsersFromAPI();
    showToast("Admin created successfully!", "success");
  } catch (error) {
    errorMsg.textContent = error.message || "Error creating admin";
    errorMsg.style.display = "block";
  }
}

// Suspended User Modal
function openSuspendedUserModal(userId) {
  const user = suspendedUsers.find(u => Number(u.id) === Number(userId));
  if (!user) return;

  document.getElementById("suspended-username").textContent = user.username || "N/A";
  document.getElementById("suspended-email").textContent = user.email || "N/A";
  document.getElementById("suspended-role").textContent = (user.role || "").charAt(0).toUpperCase() + (user.role || "").slice(1);
  document.getElementById("suspended-by").textContent = user.suspended_by_admin || "N/A";
  document.getElementById("suspended-reason").textContent = user.reason || "No reason provided";

  const modal = document.getElementById("suspended-user-modal");
  if (modal) {
    modal.style.display = "flex";
  }
}

function closeSuspendedUserModal() {
  const modal = document.getElementById("suspended-user-modal");
  if (modal) {
    modal.style.display = "none";
  }
}

// Toast notification
function showToast(message, type = "success") {
  let toast = document.getElementById("user-management-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "user-management-toast";
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      padding: 16px 24px;
      background: rgba(34, 197, 94, 0.95);
      color: white;
      border-radius: 8px;
      font-size: 14px;
      z-index: 10000;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(34, 197, 94, 0.4);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      transition: opacity 0.3s ease;
    `;
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.display = "block";
  toast.style.opacity = "1";

  if (type === "error") {
    toast.style.background = "rgba(239, 68, 68, 0.95)";
    toast.style.borderColor = "rgba(239, 68, 68, 0.4)";
  } else {
    toast.style.background = "rgba(34, 197, 94, 0.95)";
    toast.style.borderColor = "rgba(34, 197, 94, 0.4)";
  }

  if (type === "error") {
    toast.style.background = "rgba(239, 68, 68, 0.95)";
    toast.style.borderColor = "rgba(239, 68, 68, 0.4)";
  } else if (type === "success") {
    toast.style.background = "rgba(34, 197, 94, 0.95)";
    toast.style.borderColor = "rgba(34, 197, 94, 0.4)";
  }

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => {
      toast.style.display = "none";
    }, 300);
  }, 3000);
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  loadUserStatistics();
  loadAllUsersFromAPI();
  loadSuspendedUsers();
  bindFilterEvents();
  bindActionEvents();

  // Add Admin Modal event listeners
  const closeBtn = document.getElementById("close-admin-modal");
  const cancelBtn = document.getElementById("cancel-admin-btn");
  const form = document.getElementById("add-admin-form");
  const modal = document.getElementById("add-admin-modal");

  if (closeBtn) closeBtn.addEventListener("click", closeAddAdminModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeAddAdminModal);
  if (form) form.addEventListener("submit", handleAddAdminSubmit);
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeAddAdminModal();
    });
  }

  // Delete Confirmation Modal
  const closeDeleteBtn = document.getElementById("close-delete-modal");
  const cancelDeleteBtn = document.getElementById("cancel-delete-btn");
  const deleteForm = document.getElementById("delete-confirm-form");
  const deleteModal = document.getElementById("delete-confirm-modal");

  if (closeDeleteBtn) closeDeleteBtn.addEventListener("click", closeDeleteConfirmModal);
  if (cancelDeleteBtn) cancelDeleteBtn.addEventListener("click", closeDeleteConfirmModal);
  if (deleteForm) deleteForm.addEventListener("submit", handleDeleteConfirmSubmit);
  if (deleteModal) {
    deleteModal.addEventListener("click", (e) => {
      if (e.target === deleteModal) closeDeleteConfirmModal();
    });
  }

  // Edit User Modal
  const closeEditBtn = document.getElementById("close-edit-modal");
  const cancelEditBtn = document.getElementById("cancel-edit-btn");
  const editForm = document.getElementById("edit-user-form");
  const editModal = document.getElementById("edit-user-modal");
  const editRoleSelect = document.getElementById("edit-role");

  if (closeEditBtn) closeEditBtn.addEventListener("click", closeEditUserModal);
  if (cancelEditBtn) cancelEditBtn.addEventListener("click", closeEditUserModal);
  if (editForm) editForm.addEventListener("submit", handleEditUserSubmit);
  if (editModal) {
    editModal.addEventListener("click", (e) => {
      if (e.target === editModal) closeEditUserModal();
    });
  }
  if (editRoleSelect) {
    editRoleSelect.addEventListener("change", (e) => {
      const studentTypeGroup = document.getElementById("edit-student-type-group");
      if (e.target.value === "student") {
        studentTypeGroup.style.display = "block";
      } else {
        studentTypeGroup.style.display = "none";
      }
    });
  }

  // Suspended User Modal
  const closeSuspendedBtn = document.getElementById("close-suspended-btn");
  const closeSuspendedIcon = document.getElementById("close-suspended-modal");
  const suspendedModal = document.getElementById("suspended-user-modal");

  if (closeSuspendedBtn) closeSuspendedBtn.addEventListener("click", closeSuspendedUserModal);
  if (closeSuspendedIcon) closeSuspendedIcon.addEventListener("click", closeSuspendedUserModal);
  if (suspendedModal) {
    suspendedModal.addEventListener("click", (e) => {
      if (e.target === suspendedModal) closeSuspendedUserModal();
    });
  }
});
