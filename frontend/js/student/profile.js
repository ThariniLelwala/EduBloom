// Student Profile Management
document.addEventListener("DOMContentLoaded", function () {
  // Initialize profile
  loadProfileData();
  initializeBackgroundOptions();
  initializePasswordChangeModal();
  initializeLogout();

  // Load profile data from localStorage or API
  function loadProfileData() {
    // Debug: Log all localStorage data
    console.log("localStorage contents:");
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      console.log(`${key}: ${localStorage.getItem(key)}`);
    }

    const token = localStorage.getItem("authToken");
    const userRole = localStorage.getItem("userRole");
    const username = localStorage.getItem("username");
    const studentType = localStorage.getItem("studentType");
    const profileInfo = document.getElementById("profile-info");

    console.log("Profile data check:", {
      token,
      userRole,
      username,
      studentType,
    });

    // If we have a token, try to fetch full profile from API
    if (token) {
      fetchProfileFromAPI(token);
    } else {
      // Fallback to localStorage data
      loadProfileFromLocalStorage(username, userRole, studentType);
    }
  }

  // Fetch profile data from API
  async function fetchProfileFromAPI(token) {
    try {
      const res = await fetch("/api/auth/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();

      if (res.ok && result.user) {
        displayProfileData(result.user);
      } else {
        // Fallback to localStorage if API fails
        const username = localStorage.getItem("username");
        const userRole = localStorage.getItem("userRole");
        const studentType = localStorage.getItem("studentType");
        loadProfileFromLocalStorage(username, userRole, studentType);
      }
    } catch (error) {
      console.error("Failed to fetch profile from API:", error);
      // Fallback to localStorage
      const username = localStorage.getItem("username");
      const userRole = localStorage.getItem("userRole");
      const studentType = localStorage.getItem("studentType");
      loadProfileFromLocalStorage(username, userRole, studentType);
    }
  }

  // Load profile data from localStorage (fallback)
  function loadProfileFromLocalStorage(username, userRole, studentType) {
    if (username) {
      const mockUser = {
        firstname: localStorage.getItem("firstname") || "Not set",
        lastname: localStorage.getItem("lastname") || "Not set",
        birthday: localStorage.getItem("birthday") || "Not set",
        email: localStorage.getItem("email") || "Not set",
        role: userRole || "student",
        student_type: studentType,
      };
      displayProfileData(mockUser);
    } else {
      showNoProfileData();
    }
  }

  // Display profile data
  function displayProfileData(user) {
    const profileInfo = document.getElementById("profile-info");
    const welcomeHeading = document.getElementById("welcome-heading");
    const welcomeMessage = document.getElementById("welcome-message");

    // Update welcome message
    if (welcomeHeading) {
      welcomeHeading.textContent = `Welcome ${
        user.firstname || user.name || user.username
      }`;
    }
    if (welcomeMessage) {
      welcomeMessage.textContent =
        "Manage your profile and appearance settings";
    }

    // Display profile information
    profileInfo.innerHTML = `
            <div class="profile-info-grid">
                <div class="profile-item">
                    <strong>First Name</strong>
                    <p>${user.firstname || "Not set"}</p>
                </div>
                <div class="profile-item">
                    <strong>Last Name</strong>
                    <p>${user.lastname || "Not set"}</p>
                </div>
                <div class="profile-item">
                    <strong>Birthday</strong>
                    <p>${
                      user.birthday
                        ? new Date(user.birthday).toLocaleDateString()
                        : "Not set"
                    }</p>
                </div>
                <div class="profile-item">
                    <strong>Email</strong>
                    <p>${user.email || "Not set"}</p>
                </div>
                <div class="profile-item">
                    <strong>Role</strong>
                    <p>Student</p>
                </div>
                <div class="profile-item">
                    <strong>Grade</strong>
                    <p>${
                      user.student_type === "school"
                        ? "School Level"
                        : "University Level" || "Not set"
                    }</p>
                </div>
            </div>
        `;

    // Load parent data
    loadLinkedParents();
    loadPendingRequests();
  }

  // Load linked parents
  async function loadLinkedParents() {
    const token = localStorage.getItem("authToken");
    const linkedParentsDiv = document.getElementById("linked-parents");

    if (!token) {
      linkedParentsDiv.innerHTML = `<p style="color: rgba(255,255,255,0.7); text-align: center;">No linked parents found.</p>`;
      return;
    }

    try {
      const res = await fetch("/api/student/linked-parents", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();

      if (res.ok && result.parents) {
        displayLinkedParents(result.parents);
      } else {
        linkedParentsDiv.innerHTML = `<p style="color: rgba(255,255,255,0.7); text-align: center;">No linked parents found.</p>`;
      }
    } catch (error) {
      console.error("Failed to fetch linked parents:", error);
      linkedParentsDiv.innerHTML = `<p style="color: rgba(255,255,255,0.7); text-align: center;">Failed to load linked parents.</p>`;
    }
  }

  // Display linked parents
  function displayLinkedParents(parents) {
    const linkedParentsDiv = document.getElementById("linked-parents");

    if (parents.length === 0) {
      linkedParentsDiv.innerHTML = `<p style="color: rgba(255,255,255,0.7); text-align: center;">No linked parents found.</p>`;
      return;
    }

    const parentsHTML = parents
      .map(
        (parent) => `
      <div class="linked-parent">
        <div class="parent-info">
          <strong>${parent.parent_username}</strong>
          <p>${parent.parent_email}</p>
        </div>
        <button class="btn-remove" onclick="removeParentLink(${parent.link_id})">
          <i class="fas fa-trash"></i> Remove
        </button>
      </div>
    `
      )
      .join("");

    linkedParentsDiv.innerHTML = parentsHTML;
  }

  // Load pending parent requests
  async function loadPendingRequests() {
    const token = localStorage.getItem("authToken");
    const pendingRequestsDiv = document.getElementById("pending-requests");

    if (!token) {
      pendingRequestsDiv.innerHTML = `<p style="color: rgba(255,255,255,0.7); text-align: center;">No pending requests.</p>`;
      return;
    }

    try {
      const res = await fetch("/api/student/pending-parent-requests", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();

      if (res.ok && result.pendingRequests) {
        displayPendingRequests(result.pendingRequests);
      } else {
        pendingRequestsDiv.innerHTML = `<p style="color: rgba(255,255,255,0.7); text-align: center;">No pending requests.</p>`;
      }
    } catch (error) {
      console.error("Failed to fetch pending requests:", error);
      pendingRequestsDiv.innerHTML = `<p style="color: rgba(255,255,255,0.7); text-align: center;">Failed to load pending requests.</p>`;
    }
  }

  // Display pending requests
  function displayPendingRequests(requests) {
    const pendingRequestsDiv = document.getElementById("pending-requests");

    if (requests.length === 0) {
      pendingRequestsDiv.innerHTML = `<p style="color: rgba(255,255,255,0.7); text-align: center;">No pending requests.</p>`;
      return;
    }

    const requestsHTML = requests
      .map(
        (request) => `
      <div class="parent-request">
        <strong>${request.parent_username}</strong>
        <p>${request.parent_email}</p>
        <p>Requested on: ${new Date(
          request.created_at
        ).toLocaleDateString()}</p>
        <div class="request-actions">
          <button class="btn-accept" onclick="handleParentRequest(${
            request.id || request.link_id
          }, 'accept')">
            <i class="fas fa-check"></i> Accept
          </button>
          <button class="btn-reject" onclick="handleParentRequest(${
            request.id || request.link_id
          }, 'reject')">
            <i class="fas fa-times"></i> Reject
          </button>
        </div>
      </div>
    `
      )
      .join("");

    pendingRequestsDiv.innerHTML = requestsHTML;
  }

  // Handle parent request (accept/reject)
  async function handleParentRequest(linkId, action) {
    try {
      const token = localStorage.getItem("authToken");

      const res = await fetch(`/api/student/${action}-parent-link`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ linkId }),
      });

      const result = await res.json();

      if (res.ok) {
        showToast(`Parent request ${action}ed successfully!`);
        // Reload the data
        loadLinkedParents();
        loadPendingRequests();
      } else {
        showToast(result.error || `Failed to ${action} request`);
      }
    } catch (error) {
      console.error(`Failed to ${action} parent request:`, error);
      showToast(`Failed to ${action} request. Please try again.`);
    }
  }

  // Make handleParentRequest globally available
  window.handleParentRequest = handleParentRequest;

  // Remove parent link
  async function removeParentLink(linkId) {
    if (!confirm("Are you sure you want to remove this parent link?")) {
      return;
    }

    try {
      const token = localStorage.getItem("authToken");

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
        showToast("Parent link removed successfully!");
        // Reload the data
        loadLinkedParents();
      } else {
        showToast(result.error || "Failed to remove parent link");
      }
    } catch (error) {
      console.error("Failed to remove parent link:", error);
      showToast("Failed to remove parent link. Please try again.");
    }
  }

  // Make removeParentLink globally available
  window.removeParentLink = removeParentLink;

  // Show no profile data message
  function showNoProfileData() {
    const profileInfo = document.getElementById("profile-info");
    profileInfo.innerHTML = `
            <div class="profile-item">
                <p style="text-align: center; color: rgba(255,255,255,0.7);">
                    <i class="fas fa-exclamation-triangle"></i>
                    Profile data not available. Please log in again.
                </p>
            </div>
        `;
  }

  // Initialize background options
  function initializeBackgroundOptions() {
    const bgOptions = document.getElementById("bg-options");
    const customBgInput = document.getElementById("custom-bg");

    // Default background options
    const backgrounds = [
      { id: "bg1", name: "Default", url: "../../../assets/images/bg1.jpeg" },
      { id: "bg2", name: "Nature", url: "../../../assets/images/bg2.jpg" },
      { id: "bg3", name: "Abstract", url: "../../../assets/images/bg3.jpeg" },
      { id: "bg4", name: "Space", url: "../../../assets/images/bg4.jpeg" },
      { id: "bg5", name: "Ocean", url: "../../../assets/images/bg5.jpg" },
    ];

    // Create background option elements
    backgrounds.forEach((bg) => {
      const option = document.createElement("div");
      option.className = "bg-option";
      option.dataset.bgId = bg.id;
      option.onclick = () => selectBackground(bg.id);

      option.innerHTML = `
                <img src="${bg.url}" alt="${bg.name}" onerror="this.innerHTML='<div class=\\'placeholder-img\\'>${bg.name}</div>'">
                <div class="checkmark"><i class="fas fa-check"></i></div>
            `;

      bgOptions.appendChild(option);
    });

    // Load current background selection
    const currentBg = localStorage.getItem("selectedBackground") || "default";
    selectBackground(currentBg);

    // Handle custom background upload
    if (customBgInput) {
      customBgInput.addEventListener("change", function (e) {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function (e) {
            const imageUrl = e.target.result;
            localStorage.setItem("customBackground", imageUrl);
            localStorage.setItem("selectedBackground", "custom");
            applyBackground("custom", imageUrl);
            showToast("Custom background uploaded successfully!");
          };
          reader.readAsDataURL(file);
        }
      });
    }
  }

  // Select background
  function selectBackground(bgId) {
    // Update localStorage
    localStorage.setItem("selectedBackground", bgId);

    // Update UI
    document.querySelectorAll(".bg-option").forEach((option) => {
      option.classList.remove("selected");
    });

    const selectedOption = document.querySelector(`[data-bg-id="${bgId}"]`);
    if (selectedOption) {
      selectedOption.classList.add("selected");
    }

    // Apply background
    if (bgId === "custom") {
      const customBg = localStorage.getItem("customBackground");
      if (customBg) {
        applyBackground(bgId, customBg);
      }
    } else {
      applyBackground(bgId);
    }

    showToast("Background updated successfully!");
  }

  // Apply background
  function applyBackground(bgId, customUrl = null) {
    const bgImage = document.querySelector(".bg-image");
    let bgUrl;

    if (bgId === "custom" && customUrl) {
      bgUrl = customUrl;
    } else {
      // Default backgrounds
      const bgUrls = {
        bg1: "../../../assets/images/bg1.jpeg",
        bg2: "../../../assets/images/bg2.jpg",
        bg3: "../../../assets/images/bg3.jpeg",
        bg4: "../../../assets/images/bg4.jpeg",
        bg5: "../../../assets/images/bg5.jpg",
      };

      bgUrl = bgUrls[bgId] || bgUrls["bg1"];
    }

    // Update main background
    if (bgImage) {
      bgImage.style.backgroundImage = `url(${bgUrl})`;
      bgImage.style.backgroundSize = "cover";
      bgImage.style.backgroundPosition = "center";
      bgImage.style.backgroundRepeat = "no-repeat";
    }

    // Update welcome image
    const welcomeImages = document.querySelectorAll(".welcome-image");
    if (welcomeImages.length > 0) {
      welcomeImages.forEach((el) => {
        el.style.backgroundImage = `url(${bgUrl})`;
        el.style.backgroundSize = "cover";
        el.style.backgroundPosition = "center";
        el.style.backgroundRepeat = "no-repeat";
      });
    }
  }

  // Initialize password change modal
  function initializePasswordChangeModal() {
    const modal = document.getElementById("changePasswordModal");
    const openBtn = document.getElementById("changePasswordBtn");
    const closeBtn = document.getElementById("closeModalBtn");
    const cancelBtn = document.getElementById("cancelBtn");
    const form = document.getElementById("changePasswordForm");
    const submitBtn = document.getElementById("submitBtn");

    // Open modal
    if (openBtn) {
      openBtn.addEventListener("click", () => {
        modal.classList.add("show");
        document.body.style.overflow = "hidden";
      });
    }

    // Close modal functions
    const closeModal = () => {
      modal.classList.remove("show");
      document.body.style.overflow = "";
      form.reset();
      clearErrors();
    };

    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

    // Close on outside click
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });

    // Form validation
    const inputs = form.querySelectorAll("input");
    inputs.forEach((input) => {
      input.addEventListener("input", validateForm);
    });

    function validateForm() {
      const oldPassword = document.getElementById("oldPassword").value;
      const newPassword = document.getElementById("newPassword").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      clearErrors();

      let isValid = true;

      // Check if new password matches confirmation
      if (newPassword && confirmPassword && newPassword !== confirmPassword) {
        showError("confirmPassword", "Passwords do not match");
        isValid = false;
      }

      // Check password strength
      if (newPassword && newPassword.length < 6) {
        showError("newPassword", "Password must be at least 6 characters long");
        isValid = false;
      }

      submitBtn.disabled =
        !isValid || !oldPassword || !newPassword || !confirmPassword;
    }

    // Form submission
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const oldPassword = document.getElementById("oldPassword").value;
      const newPassword = document.getElementById("newPassword").value;

      try {
        // Here you would typically make an API call to change the password
        // For now, we'll simulate it
        const user = JSON.parse(localStorage.getItem("user") || "{}");

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Update localStorage (in real app, this would be handled by the API)
        user.passwordChanged = true;
        localStorage.setItem("user", JSON.stringify(user));

        showToast("Password changed successfully!");
        closeModal();
      } catch (error) {
        showError(
          "oldPassword",
          "Failed to change password. Please try again."
        );
      }
    });
  }

  // Initialize logout functionality
  function initializeLogout() {
    const logoutBtn = document.getElementById("logoutButton");

    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        // Show confirmation modal
        if (window.showConfirmationModal) {
          window.showConfirmationModal({
            title: "Logout",
            message: "Are you sure you want to logout?",
            confirmText: "Logout",
            cancelText: "Cancel",
            onConfirm: () => {
              // Clear user data
              localStorage.removeItem("user");
              localStorage.removeItem("token");
              localStorage.removeItem("selectedBackground");
              localStorage.removeItem("customBackground");

              // Redirect to login
              window.location.href = "../../../login.html";
            },
          });
        } else {
          // Fallback if confirmation modal is not available
          if (confirm("Are you sure you want to logout?")) {
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            localStorage.removeItem("selectedBackground");
            localStorage.removeItem("customBackground");
            window.location.href = "../../../login.html";
          }
        }
      });
    }
  }

  // Utility functions
  function showError(inputId, message) {
    const errorElement = document.getElementById(inputId + "Error");
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.add("show");
    }
  }

  function clearErrors() {
    const errors = document.querySelectorAll(".password-error");
    errors.forEach((error) => {
      error.classList.remove("show");
    });
  }

  function showToast(message) {
    const toast = document.getElementById("toast");
    if (toast) {
      toast.textContent = message;
      toast.classList.add("show");

      setTimeout(() => {
        toast.classList.remove("show");
      }, 3000);
    }
  }
});
