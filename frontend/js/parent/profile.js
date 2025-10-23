// Parent Profile Management
document.addEventListener("DOMContentLoaded", function () {
  // Initialize profile
  loadProfileData();
  initializeBackgroundOptions();
  initializePasswordChangeModal();
  initializeAddChildModal();
  initializeLogout();

  // Load profile data from localStorage or API
  function loadProfileData() {
    const token = localStorage.getItem("authToken");
    const userRole = localStorage.getItem("userRole");
    const username = localStorage.getItem("username");
    const profileInfo = document.getElementById("profile-info");

    // If we have a token, try to fetch full profile from API
    if (token) {
      fetchProfileFromAPI(token);
    } else {
      // Fallback to localStorage data
      loadProfileFromLocalStorage(username, userRole);
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
        loadProfileFromLocalStorage(username, userRole);
      }
    } catch (error) {
      console.error("Failed to fetch profile from API:", error);
      // Fallback to localStorage
      const username = localStorage.getItem("username");
      const userRole = localStorage.getItem("userRole");
      loadProfileFromLocalStorage(username, userRole);
    }
  }

  // Load profile data from localStorage (fallback)
  function loadProfileFromLocalStorage(username, userRole) {
    if (username) {
      const mockUser = {
        name: username,
        email: localStorage.getItem("email") || "Not set",
        role: userRole || "parent",
        phone: "Not set",
        address: "Not set",
        joinedDate: new Date().toISOString(),
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
      welcomeHeading.textContent = `Welcome ${user.name || user.username}`;
    }
    if (welcomeMessage) {
      welcomeMessage.textContent =
        "Manage your profile and appearance settings";
    }

    // Display profile information
    profileInfo.innerHTML = `
            <div class="profile-info-grid">
                <div class="profile-item">
                    <strong>Name</strong>
                    <p>${user.name || user.username || "Not set"}</p>
                </div>
                <div class="profile-item">
                    <strong>Email</strong>
                    <p>${user.email || "Not set"}</p>
                </div>
                <div class="profile-item">
                    <strong>Role</strong>
                    <p>Parent</p>
                </div>
                <div class="profile-item">
                    <strong>Phone</strong>
                    <p>${user.phone || "Not set"}</p>
                </div>
                <div class="profile-item">
                    <strong>Address</strong>
                    <p>${user.address || "Not set"}</p>
                </div>
                <div class="profile-item">
                    <strong>Joined</strong>
                    <p>${
                      user.joinedDate
                        ? new Date(user.joinedDate).toLocaleDateString()
                        : "Not set"
                    }</p>
                </div>
            </div>
        `;

    // Load linked students
    loadLinkedStudents();
  }

  // Load linked students
  async function loadLinkedStudents() {
    const token = localStorage.getItem("authToken");
    const linkedStudentsDiv = document.getElementById("linked-students");

    if (!token) {
      linkedStudentsDiv.innerHTML = `<p style="color: rgba(255,255,255,0.7); text-align: center;">No linked students found.</p>`;
      return;
    }

    try {
      const res = await fetch("/api/parent/children", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();

      if (res.ok && result.children) {
        displayLinkedStudents(result.children);
      } else {
        linkedStudentsDiv.innerHTML = `<p style="color: rgba(255,255,255,0.7); text-align: center;">No linked students found.</p>`;
      }
    } catch (error) {
      console.error("Failed to fetch linked students:", error);
      linkedStudentsDiv.innerHTML = `<p style="color: rgba(255,255,255,0.7); text-align: center;">Failed to load linked students.</p>`;
    }
  }

  // Display linked students
  function displayLinkedStudents(children) {
    const linkedStudentsDiv = document.getElementById("linked-students");

    if (children.length === 0) {
      linkedStudentsDiv.innerHTML = `<p style="color: rgba(255,255,255,0.7); text-align: center;">No linked students found.</p>`;
      return;
    }

    const studentsHTML = children.map(child => `
      <div class="linked-student">
        <div class="student-info">
          <strong>${child.username}</strong>
          <p>${child.email} (${child.student_type})</p>
        </div>
        <button class="btn-remove" onclick="removeStudentLink(${child.id})">
          <i class="fas fa-trash"></i> Remove
        </button>
      </div>
    `).join('');

    linkedStudentsDiv.innerHTML = studentsHTML;
  }

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

  // Initialize add child modal
  function initializeAddChildModal() {
    const modal = document.getElementById("addChildModal");
    const openBtn = document.getElementById("addChildBtn");
    const closeBtn = document.getElementById("closeAddChildModalBtn");
    const cancelBtn = document.getElementById("cancelAddChildBtn");
    const form = document.getElementById("addChildForm");
    const submitBtn = document.getElementById("submitAddChildBtn");

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
      input.addEventListener("input", validateAddChildForm);
    });

    function validateAddChildForm() {
      const studentIdentifier = document.getElementById("studentIdentifier").value;

      clearErrors();

      let isValid = true;

      if (!studentIdentifier.trim()) {
        showError("studentIdentifier", "Student identifier is required");
        isValid = false;
      }

      submitBtn.disabled = !isValid;
    }

    // Form submission
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const studentIdentifier = document.getElementById("studentIdentifier").value.trim();

      try {
        const token = localStorage.getItem("authToken");

        const res = await fetch("/api/parent/request-child-link", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ studentIdentifier }),
        });

        const result = await res.json();

        if (res.ok) {
          showToast("Link request sent successfully!");
          closeModal();
        } else {
          showError("studentIdentifier", result.error || "Failed to send link request");
        }
      } catch (error) {
        console.error("Failed to send link request:", error);
        showError("studentIdentifier", "Failed to send link request. Please try again.");
      }
    });
  }

  // Remove student link
  async function removeStudentLink(studentId) {
    if (!confirm('Are you sure you want to remove this student link?')) {
      return;
    }

    try {
      const token = localStorage.getItem("authToken");

      const res = await fetch("/api/parent/remove-student-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ studentId }),
      });

      const result = await res.json();

      if (res.ok) {
        showToast("Student link removed successfully!");
        // Reload the data
        loadLinkedStudents();
      } else {
        showToast(result.error || "Failed to remove student link");
      }
    } catch (error) {
      console.error("Failed to remove student link:", error);
      showToast("Failed to remove student link. Please try again.");
    }
  }

  // Make removeStudentLink globally available
  window.removeStudentLink = removeStudentLink;

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
