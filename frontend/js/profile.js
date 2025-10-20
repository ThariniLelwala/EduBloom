// Show toast notification
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// Background image options with root paths
const bgOptions = [
  { id: "bg1", name: "Default", path: "/assets/images/bg1.jpeg" },
  { id: "bg2", name: "Nature", path: "/assets/images/bg2.jpg" },
  { id: "bg3", name: "Abstract", path: "/assets/images/bg3.jpeg" },
  { id: "bg4", name: "Minimal", path: "/assets/images/bg4.jpeg" },
  { id: "bg5", name: "Gradient", path: "/assets/images/bg5.jpg" },
];

// Function to fetch the user's profile
async function fetchProfile() {
  const token = localStorage.getItem("authToken"); // Get the token from localStorage

  if (!token) {
    // If no token is available, redirect to login page
    window.location.href = "/login.html";
    return;
  }

  try {
    const res = await fetch("/api/auth/profile", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Include token in the Authorization header
      },
    });

    const result = await res.json();

    if (res.ok) {
      // Profile fetched successfully, display the profile info
      const profileInfo = document.getElementById("profile-info");
      const welcomeHeading = document.getElementById("welcome-heading");

      // Update welcome heading with username
      welcomeHeading.textContent = `Welcome ${result.user.username}`;

      // Update profile info grid
      profileInfo.innerHTML = `
        <div class="profile-info-grid">
          <div class="profile-item">
            <strong>Username</strong>
            <p>${result.user.username}</p>
          </div>
          <div class="profile-item">
            <strong>Email</strong>
            <p>${result.user.email}</p>
          </div>
          <div class="profile-item">
            <strong>Role</strong>
            <p>${result.user.role}</p>
          </div>
          <div class="profile-item">
            <strong>Student Type</strong>
            <p>${result.user.student_type || "N/A"}</p>
          </div>
        </div>
      `;

      // If user is a student, fetch and display linked parents and pending requests
      if (result.user.role === "student") {
        loadPendingParentRequests();
        loadLinkedParents();
      }

      // If user is a parent, fetch and display their children
      if (result.user.role === "parent") {
        loadParentChildren();
      }
    } else {
      // Handle any errors (e.g., token expired or invalid)
      alert(result.error || "Error fetching profile.");
    }
  } catch (err) {
    console.error("Error fetching profile:", err.message);
    alert("An error occurred while fetching your profile.");
  }
}

// Function to handle logout
function logout() {
  localStorage.removeItem("authToken"); // Clear the token from localStorage
  localStorage.removeItem("userRole");
  localStorage.removeItem("userId");
  localStorage.removeItem("username");
  window.location.href = "/login.html"; // Redirect to login page
}

// Function to load and display parent children selector (for parents only)
async function loadParentChildren() {
  const token = localStorage.getItem("authToken");

  try {
    const res = await fetch("/api/parent/children", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await res.json();

    if (res.ok && result.children && result.children.length > 0) {
      console.log("Parent children found:", result.children);

      // Sort children by creation date (oldest first)
      result.children.sort(
        (a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0)
      );

      // Get currently selected child from localStorage, or default to first child
      let selectedChildId = localStorage.getItem("selectedChildId");
      if (
        !selectedChildId ||
        !result.children.find((c) => c.id == selectedChildId)
      ) {
        selectedChildId = result.children[0].id;
        localStorage.setItem("selectedChildId", selectedChildId);
      }

      // Create a section to display child selector
      const profileInfo = document.getElementById("profile-info");
      const childSelectorSection = document.createElement("div");
      childSelectorSection.className = "profile-card";
      childSelectorSection.style.marginTop = "24px";

      let childSelectorHTML = `
        <h3 style="color: var(--color-white); margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
          <i class="fas fa-child"></i> Child Selection
        </h3>
        <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 16px; font-size: 14px;">
          Select which child you want to view and manage:
        </p>
        <div style="margin-bottom: 16px;">
          <select id="childSelector" class="custom-select" style="width: 100%; max-width: 300px;">
      `;

      result.children.forEach((child) => {
        const selected = child.id == selectedChildId ? "selected" : "";
        childSelectorHTML += `<option value="${child.id}" ${selected}>${
          child.username
        } (${child.student_type || "student"})</option>`;
      });

      childSelectorHTML += `
          </select>
        </div>
        <div id="selectedChildInfo" style="padding: 16px; background: rgba(0, 0, 0, 0.2); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1);">
          <!-- Selected child info will be displayed here -->
        </div>
      `;

      childSelectorSection.innerHTML = childSelectorHTML;
      profileInfo.parentElement.appendChild(childSelectorSection);

      // Initialize custom select styling
      if (typeof initCustomSelects === "function") {
        initCustomSelects();
      }

      // Add event listener to child selector
      document
        .getElementById("childSelector")
        .addEventListener("change", (e) => {
          const selectedId = e.target.value;
          localStorage.setItem("selectedChildId", selectedId);
          updateSelectedChildInfo(
            result.children.find((c) => c.id == selectedId)
          );
          showToast("Child selection updated!");
        });

      // Display info for currently selected child
      updateSelectedChildInfo(
        result.children.find((c) => c.id == selectedChildId)
      );
    } else if (res.ok && (!result.children || result.children.length === 0)) {
      // No children linked yet
      const profileInfo = document.getElementById("profile-info");
      const noChildrenSection = document.createElement("div");
      noChildrenSection.className = "profile-card";
      noChildrenSection.style.marginTop = "24px";

      noChildrenSection.innerHTML = `
        <h3 style="color: var(--color-white); margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
          <i class="fas fa-child"></i> Child Selection
        </h3>
        <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 16px; font-size: 14px;">
          You haven't linked any children yet. When you register as a parent, you can enter your child's username to create a link request.
        </p>
        <div style="padding: 16px; background: rgba(0, 0, 0, 0.2); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1); text-align: center;">
          <i class="fas fa-info-circle" style="font-size: 24px; color: var(--color-primary); margin-bottom: 8px;"></i>
          <p style="margin: 0; color: rgba(255, 255, 255, 0.8);">No children linked</p>
        </div>
      `;

      profileInfo.parentElement.appendChild(noChildrenSection);
    } else {
      console.log("No children found or response not ok");
    }
  } catch (err) {
    console.error("Error loading parent children:", err);
  }
}

// Function to update the selected child info display
function updateSelectedChildInfo(child) {
  const infoDiv = document.getElementById("selectedChildInfo");
  if (infoDiv && child) {
    infoDiv.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
        <i class="fas fa-user-graduate" style="color: var(--color-primary); font-size: 18px;"></i>
        <strong style="color: var(--color-white); font-size: 16px;">${
          child.username
        }</strong>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 14px;">
        <div>
          <span style="color: rgba(255, 255, 255, 0.6);">Email:</span><br>
          <span style="color: var(--color-white);">${child.email}</span>
        </div>
        <div>
          <span style="color: rgba(255, 255, 255, 0.6);">Type:</span><br>
          <span style="color: var(--color-white);">${
            child.student_type || "Student"
          }</span>
        </div>
      </div>
    `;
  }
}
async function loadPendingParentRequests() {
  const token = localStorage.getItem("authToken");
  console.log("loadPendingParentRequests called, token exists:", !!token);

  try {
    const res = await fetch("/api/student/pending-parent-requests", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(
      "Pending requests response status:",
      res.status,
      res.statusText
    );
    const result = await res.json();
    console.log("Pending requests response data:", result);

    if (res.ok && result.pendingRequests && result.pendingRequests.length > 0) {
      console.log("Pending requests found:", result.pendingRequests);
      // Create a section to display pending parent requests
      const profileInfo = document.getElementById("profile-info");
      const pendingSection = document.createElement("div");
      pendingSection.className = "profile-card";
      pendingSection.style.marginTop = "24px";

      let pendingHTML = `
        <h3 style="color: #ffd700; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
          <i class="fas fa-hourglass-start"></i> Pending Parent Requests
        </h3>
        <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 16px; font-size: 14px;">
          These parents are waiting for your approval to view your progress and manage tasks.
        </p>
        <div class="profile-info-grid">
      `;

      result.pendingRequests.forEach((request) => {
        pendingHTML += `
          <div class="profile-item" style="position: relative;">
            <strong>${request.parent_username}</strong>
            <p style="margin-bottom: 8px; font-size: 13px;">${
              request.parent_email
            }</p>
            <p style="margin-bottom: 12px; font-size: 12px; color: rgba(255, 255, 255, 0.6);">
              Requested: ${new Date(request.created_at).toLocaleDateString()}
            </p>
            <div style="display: flex; gap: 8px;">
              <button class="btn-primary accept-parent-btn" data-link-id="${
                request.id
              }" 
                      style="flex: 1; font-size: 12px;">
                <i class="fas fa-check"></i> Accept
              </button>
              <button class="btn-secondary reject-parent-btn" data-link-id="${
                request.id
              }" 
                      style="flex: 1; font-size: 12px;">
                <i class="fas fa-times"></i> Reject
              </button>
            </div>
          </div>
        `;
      });

      pendingHTML += `
        </div>
      `;

      pendingSection.innerHTML = pendingHTML;
      profileInfo.parentElement.appendChild(pendingSection);

      // Add event listeners to accept/reject buttons
      document.querySelectorAll(".accept-parent-btn").forEach((btn) => {
        btn.addEventListener("click", () =>
          acceptParentLink(btn.dataset.linkId)
        );
        btn.addEventListener("mouseover", () => {
          btn.style.opacity = "0.8";
        });
        btn.addEventListener("mouseout", () => {
          btn.style.opacity = "1";
        });
      });

      document.querySelectorAll(".reject-parent-btn").forEach((btn) => {
        btn.addEventListener("click", () =>
          rejectParentLink(btn.dataset.linkId)
        );
        btn.addEventListener("mouseover", () => {
          btn.style.opacity = "0.8";
        });
        btn.addEventListener("mouseout", () => {
          btn.style.opacity = "1";
        });
      });
    } else {
      console.log("No pending requests found or response not ok");
    }
  } catch (err) {
    console.error("Error loading pending parent requests:", err);
  }
}

// Function to accept a parent link request
async function acceptParentLink(linkId) {
  const token = localStorage.getItem("authToken");

  try {
    const res = await fetch("/api/student/accept-parent-link", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ linkId }),
    });

    const result = await res.json();

    if (res.ok) {
      showToast("Parent link accepted successfully!");
      setTimeout(() => {
        location.reload();
      }, 1500);
    } else {
      showToast(result.error || "Failed to accept parent link");
    }
  } catch (err) {
    console.error("Error accepting parent link:", err);
    showToast("An error occurred while accepting the link");
  }
}

// Function to reject a parent link request
async function rejectParentLink(linkId) {
  if (!confirm("Are you sure you want to reject this parent link request?")) {
    return;
  }

  const token = localStorage.getItem("authToken");

  try {
    const res = await fetch("/api/student/reject-parent-link", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ linkId }),
    });

    const result = await res.json();

    if (res.ok) {
      showToast("Parent link request rejected");
      setTimeout(() => {
        location.reload();
      }, 1500);
    } else {
      showToast(result.error || "Failed to reject parent link");
    }
  } catch (err) {
    console.error("Error rejecting parent link:", err);
    showToast("An error occurred while rejecting the link");
  }
}

// Function to load and display linked parents (for students only)
async function loadLinkedParents() {
  const token = localStorage.getItem("authToken");
  console.log("loadLinkedParents called, token exists:", !!token);

  try {
    const res = await fetch("/api/student/linked-parents", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Fetch response status:", res.status, res.statusText);
    const result = await res.json();
    console.log("Response data:", result);

    if (res.ok && result.parents && result.parents.length > 0) {
      console.log("Parents found:", result.parents);
      // Create a section to display linked parents
      const profileInfo = document.getElementById("profile-info");
      const parentsSection = document.createElement("div");
      parentsSection.className = "profile-card";
      parentsSection.style.marginTop = "24px";

      let parentsHTML = `
        <h3 style="color: #4dabf7; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
          <i class="fas fa-user-shield"></i> Active Parent Links
        </h3>
        <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 16px; font-size: 14px;">
          These parents have access to your progress and can manage your tasks.
        </p>
        <div class="profile-info-grid">
      `;

      result.parents.forEach((parent) => {
        parentsHTML += `
          <div class="profile-item" style="position: relative;">
            <strong>${parent.parent_username}</strong>
            <p style="margin-bottom: 8px; font-size: 13px;">${
              parent.parent_email
            }</p>
            <p style="margin-bottom: 12px; font-size: 12px; color: rgba(255, 255, 255, 0.6);">
              Connected: ${new Date(parent.created_at).toLocaleDateString()}
            </p>
            <button class="btn-secondary remove-parent-btn" data-link-id="${
              parent.link_id
            }" 
                    style="font-size: 12px; width: 100%;">
              <i class="fas fa-unlink"></i> Remove Link
            </button>
          </div>
        `;
      });

      parentsHTML += `
        </div>
      `;

      parentsSection.innerHTML = parentsHTML;
      profileInfo.parentElement.appendChild(parentsSection);

      // Add event listeners to remove buttons
      document.querySelectorAll(".remove-parent-btn").forEach((btn) => {
        btn.addEventListener("click", () =>
          removeParentLink(btn.dataset.linkId)
        );
        btn.addEventListener("mouseover", () => {
          btn.style.opacity = "0.8";
        });
        btn.addEventListener("mouseout", () => {
          btn.style.opacity = "1";
        });
      });
    } else {
      console.log("No parents found or response not ok:", {
        ok: res.ok,
        parents: result.parents,
      });
    }
  } catch (err) {
    console.error("Error loading linked parents:", err);
  }
}

// Function to remove a parent link
async function removeParentLink(linkId) {
  if (!confirm("Are you sure you want to remove this parent link?")) {
    return;
  }

  const token = localStorage.getItem("authToken");

  try {
    const res = await fetch("/api/student/remove-parent-link", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ linkId }),
    });

    const result = await res.json();

    if (res.ok) {
      showToast("Parent link removed successfully");
      // Reload the page to refresh the parent list
      setTimeout(() => {
        location.reload();
      }, 1500);
    } else {
      showToast(result.error || "Failed to remove parent link");
    }
  } catch (err) {
    console.error("Error removing parent link:", err);
    showToast("An error occurred while removing the link");
  }
}

// Select background function (applies immediately)
function selectBackground(bgId, bgPath) {
  // Update UI
  document.querySelectorAll(".bg-option").forEach((opt) => {
    opt.classList.remove("selected");
  });
  document
    .querySelector(`.bg-option[data-id="${bgId}"]`)
    .classList.add("selected");

  // Save preference
  localStorage.setItem("selectedBackground", bgId);
  localStorage.setItem("backgroundImagePath", bgPath);
  localStorage.removeItem("customBackground");

  // Apply background to page
  applyBackground(bgPath);

  // Show notification
  showToast("Background changed successfully!");
}

// Handle custom background upload (applies immediately)
function handleCustomUpload() {
  const fileInput = document.getElementById("custom-bg");
  const file = fileInput.files[0];

  if (file) {
    const reader = new FileReader();

    reader.onload = function (e) {
      const imageDataUrl = e.target.result;

      // Save to localStorage
      localStorage.setItem("selectedBackground", "custom");
      localStorage.setItem("customBackground", imageDataUrl);

      // Apply background to page
      applyBackground(imageDataUrl);

      // Show notification
      showToast("Custom background uploaded successfully!");
    };

    reader.readAsDataURL(file);
  }
}

// Apply background to current page
function applyBackground(path) {
  document.querySelector(".bg-image").style.backgroundImage = `url(${path})`;

  // Also update welcome image on the profile page
  const welcomeImages = document.querySelectorAll(".welcome-image");
  if (welcomeImages.length > 0) {
    welcomeImages.forEach((el) => {
      el.style.backgroundImage = `url(${path})`;
    });
  }
}

// Apply saved background on page load
function applySavedBackground() {
  const bgId = localStorage.getItem("selectedBackground") || "bg1";
  let bgPath;

  if (bgId === "custom") {
    bgPath = localStorage.getItem("customBackground");
  } else {
    // Find the path for the selected preset background
    const selectedBg = bgOptions.find((bg) => bg.id === bgId);
    bgPath = selectedBg ? selectedBg.path : bgOptions[0].path;
  }

  if (bgPath) {
    applyBackground(bgPath);
  }
}

// Initialize the page
document.addEventListener("DOMContentLoaded", function () {
  // Fetch user profile
  fetchProfile();

  // Apply saved background
  applySavedBackground();

  // Load saved background preference
  const savedBg = localStorage.getItem("selectedBackground") || "bg1";

  // Create background options
  const bgOptionsContainer = document.getElementById("bg-options");

  bgOptions.forEach((bg) => {
    const option = document.createElement("div");
    option.className = `bg-option ${savedBg === bg.id ? "selected" : ""}`;
    option.dataset.id = bg.id;
    option.dataset.path = bg.path;

    option.innerHTML = `
      <img src="${bg.path}" alt="${bg.name}" 
           onerror="this.parentNode.innerHTML='<div class=\"placeholder-img\">${bg.name}<br>(Image not found)</div>'" />
      <div class="checkmark"><i class="fas fa-check"></i></div>
    `;

    option.addEventListener("click", () => {
      selectBackground(bg.id, bg.path);
    });

    bgOptionsContainer.appendChild(option);
  });

  // Set up custom background upload
  document
    .getElementById("custom-bg")
    .addEventListener("change", handleCustomUpload);

  // Add event listener to logout button
  document.getElementById("logoutButton").addEventListener("click", logout);

  // Initialize password change modal
  initializePasswordChangeModal();
});

// Initialize password change modal functionality
function initializePasswordChangeModal() {
  const modal = document.getElementById("changePasswordModal");
  const changePasswordBtn = document.getElementById("changePasswordBtn");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const changePasswordForm = document.getElementById("changePasswordForm");

  // Open modal
  changePasswordBtn.addEventListener("click", () => {
    modal.classList.add("show");
    changePasswordForm.reset();
    clearPasswordErrors();
  });

  // Close modal functions
  function closeModal() {
    modal.classList.remove("show");
    changePasswordForm.reset();
    clearPasswordErrors();
  }

  closeModalBtn.addEventListener("click", closeModal);
  cancelBtn.addEventListener("click", closeModal);

  // Close modal when clicking outside
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Form submission
  changePasswordForm.addEventListener("submit", handlePasswordChange);
}

// Clear all password error messages
function clearPasswordErrors() {
  document.getElementById("oldPasswordError").classList.remove("show");
  document.getElementById("newPasswordError").classList.remove("show");
  document.getElementById("confirmPasswordError").classList.remove("show");
  document.getElementById("oldPasswordError").textContent = "";
  document.getElementById("newPasswordError").textContent = "";
  document.getElementById("confirmPasswordError").textContent = "";
}

// Handle password change submission
async function handlePasswordChange(e) {
  e.preventDefault();

  const oldPassword = document.getElementById("oldPassword").value;
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  // Clear previous errors
  clearPasswordErrors();

  // Validation
  let hasError = false;

  if (!oldPassword) {
    showPasswordError("oldPasswordError", "Current password is required");
    hasError = true;
  }

  if (!newPassword) {
    showPasswordError("newPasswordError", "New password is required");
    hasError = true;
  }

  if (newPassword.length < 6) {
    showPasswordError(
      "newPasswordError",
      "New password must be at least 6 characters"
    );
    hasError = true;
  }

  if (newPassword !== confirmPassword) {
    showPasswordError("confirmPasswordError", "Passwords do not match");
    hasError = true;
  }

  if (oldPassword === newPassword) {
    showPasswordError(
      "newPasswordError",
      "New password must be different from current password"
    );
    hasError = true;
  }

  if (hasError) return;

  // Disable submit button
  const submitBtn = document.getElementById("submitBtn");
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Changing...';

  try {
    const token = localStorage.getItem("authToken");
    const response = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        oldPassword,
        newPassword,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      showToast("Password changed successfully!");
      document.getElementById("changePasswordModal").classList.remove("show");
      document.getElementById("changePasswordForm").reset();
    } else {
      showPasswordError(
        "oldPasswordError",
        result.error || "Failed to change password"
      );
    }
  } catch (error) {
    console.error("Error changing password:", error);
    showToast("An error occurred while changing password");
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = "Change Password";
  }
}

// Show password error message
function showPasswordError(elementId, message) {
  const errorElement = document.getElementById(elementId);
  errorElement.textContent = message;
  errorElement.classList.add("show");
}
