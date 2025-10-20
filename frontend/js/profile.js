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
