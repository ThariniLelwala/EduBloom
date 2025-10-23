// Teacher Profile Management
document.addEventListener("DOMContentLoaded", function () {
  // Initialize profile
  loadProfileData();
  initializeBackgroundOptions();
  initializePasswordChangeModal();
  initializeVerificationModal();
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
        loadVerificationStatus(token);
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
        role: userRole || "teacher",
        subject: "Not set",
        school: "Not set",
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
                    <p>Teacher</p>
                </div>
                <div class="profile-item">
                    <strong>Subject</strong>
                    <p>${user.subject || "Not set"}</p>
                </div>
                <div class="profile-item">
                    <strong>School</strong>
                    <p>${user.school || "Not set"}</p>
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

  // Load verification status
  async function loadVerificationStatus(token) {
    try {
      const res = await fetch("/api/teacher/verification-status", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();
      displayVerificationStatus(result.verification);
    } catch (error) {
      console.error("Failed to load verification status:", error);
      displayVerificationStatus(null);
    }
  }

  // Display verification status
  function displayVerificationStatus(verification) {
    const verificationSection = document.getElementById("verification-section");

    if (!verification) {
      // No verification data, show unverified status
      verificationSection.innerHTML = `
                <div class="profile-item">
                    <strong><i class="fas fa-shield-alt"></i> Verification Status</strong>
                    <p>Not Verified</p>
                    <p style="font-size: 12px; color: rgba(255, 255, 255, 0.7); margin-top: 8px;">Submit a verification request with your appointment letter.</p>
                    <button type="button" class="btn-primary" id="requestVerificationBtn" style="margin-top: 12px;">
                        <i class="fas fa-arrow-up"></i> Request Verification
                    </button>
                </div>
            `;

      document
        .getElementById("requestVerificationBtn")
        .addEventListener("click", () => {
          const modal = document.getElementById("verificationModal");
          const form = document.getElementById("verificationForm");

          // Reset all form elements to default state for new submission
          form.reset();
          document.getElementById("charCount").textContent = "0";

          const fileInput = document.getElementById("appointmentLetter");
          fileInput.disabled = false;
          fileInput.style.opacity = "1";

          const messageTextarea = document.getElementById(
            "verificationMessage"
          );
          messageTextarea.readOnly = false;
          messageTextarea.style.opacity = "1";

          document.querySelector('[for="appointmentLetter"]').style.display =
            "block";
          fileInput.style.display = "block";
          document.querySelector(".file-info").style.display = "block";
          document.querySelector(".file-info").textContent =
            "Accepted formats: PDF, Word, Image (Max 5MB)";

          document.getElementById("submitVerificationBtn").style.display =
            "block";
          document.getElementById("submitVerificationBtn").textContent =
            "Submit Request";
          document.getElementById("submitVerificationBtn").onclick = null;

          // Remove close button if it exists from view mode
          const closeViewBtn = document.getElementById("verificationCloseBtn");
          if (closeViewBtn) {
            closeViewBtn.remove();
          }

          modal.classList.add("show");
          document.body.style.overflow = "hidden";
        });
    } else if (verification.status === "verified") {
      // Verified status
      verificationSection.innerHTML = `
                <div class="profile-item">
                    <strong><i class="fas fa-shield-alt"></i> Verification Status</strong>
                    <p>Verified ✓</p>
                    <p style="font-size: 12px; color: rgba(255, 255, 255, 0.7); margin-top: 8px;">Verified on ${new Date(
                      verification.verified_at
                    ).toLocaleDateString()}</p>
                </div>
            `;
    } else if (verification.status === "pending") {
      // Pending verification
      verificationSection.innerHTML = `
                <div class="profile-item">
                    <strong><i class="fas fa-shield-alt"></i> Verification Status</strong>
                    <p>Pending Review</p>
                    <p style="font-size: 12px; color: rgba(255, 255, 255, 0.7); margin-top: 8px;">Submitted on ${new Date(
                      verification.submitted_at
                    ).toLocaleDateString()}</p>
                    <div style="display: flex; gap: 8px; margin-top: 12px;">
                      <button type="button" class="btn-primary" id="viewVerificationBtn" style="flex: 1;">
                          <i class="fas fa-eye"></i> View Request
                      </button>
                      <button type="button" class="btn-secondary" id="deleteVerificationBtn" style="flex: 1;">
                          <i class="fas fa-trash"></i> Delete
                      </button>
                    </div>
                </div>
            `;

      // View request (read-only with file display)
      document
        .getElementById("viewVerificationBtn")
        ?.addEventListener("click", () => {
          const modal = document.getElementById("verificationModal");
          const form = document.getElementById("verificationForm");

          // Load current message into form as read-only
          document.getElementById("verificationMessage").value =
            verification.message || "";
          document.getElementById("charCount").textContent = (
            verification.message || ""
          ).length;

          // Show file input label but make it read-only
          document.querySelector('[for="appointmentLetter"]').style.display =
            "block";
          const fileInput = document.getElementById("appointmentLetter");
          fileInput.style.display = "block";
          fileInput.disabled = true;
          fileInput.style.opacity = "0.7";

          // Show file info text with download link and file name
          const fileInfo = document.querySelector(".file-info");
          fileInfo.style.display = "block";
          if (verification.hasFile) {
            fileInfo.innerHTML = `
              <div style="margin-bottom: 8px;">
                <strong>Uploaded File:</strong> ${
                  verification.file_name || "appointment_letter"
                }
              </div>
              <a href="/api/teacher/download-verification-file" 
                 style="color: var(--color-primary); text-decoration: underline; cursor: pointer; font-weight: 500; display: inline-block;">
                <i class="fas fa-download"></i> Download File
              </a>
            `;
          } else {
            fileInfo.innerHTML = `<strong>No file attached</strong>`;
          }

          // Make textarea read-only
          document.getElementById("verificationMessage").readOnly = true;
          document.getElementById("verificationMessage").style.opacity = "0.7";

          // Hide submit button
          document.getElementById("submitVerificationBtn").style.display =
            "none";

          // Add a close button
          const existingCloseBtn = document.getElementById(
            "verificationCloseBtn"
          );
          if (!existingCloseBtn) {
            const closeViewBtn = document.createElement("button");
            closeViewBtn.id = "verificationCloseBtn";
            closeViewBtn.type = "button";
            closeViewBtn.className = "btn-secondary";
            closeViewBtn.textContent = "Close";
            closeViewBtn.style.width = "100%";
            document.querySelector(".modal-footer").appendChild(closeViewBtn);

            closeViewBtn.addEventListener("click", () => {
              // Reset form for next use
              document.querySelector(
                '[for="appointmentLetter"]'
              ).style.display = "block";
              document.getElementById("appointmentLetter").style.display =
                "block";
              document.getElementById("appointmentLetter").disabled = false;
              document.getElementById("appointmentLetter").style.opacity = "1";
              document.querySelector(".file-info").style.display = "block";
              document.querySelector(".file-info").textContent =
                "Accepted formats: PDF, Word, Image (Max 5MB)";
              document.getElementById("verificationMessage").readOnly = false;
              document.getElementById("verificationMessage").style.opacity =
                "1";
              document.getElementById("submitVerificationBtn").style.display =
                "block";
              document.getElementById("submitVerificationBtn").textContent =
                "Submit Request";
              document.getElementById("submitVerificationBtn").onclick = null;
              closeViewBtn.remove();

              document
                .getElementById("verificationModal")
                .classList.remove("show");
              document.body.style.overflow = "";
            });
          }

          modal.classList.add("show");
          document.body.style.overflow = "hidden";
        });

      // Delete request
      document
        .getElementById("deleteVerificationBtn")
        ?.addEventListener("click", async () => {
          // Use the showConfirmation function from confirmation-modal.js
          if (window.showConfirmation) {
            const confirmed = await window.showConfirmation(
              "Are you sure you want to delete your verification request?",
              "Delete"
            );

            if (confirmed) {
              const token = localStorage.getItem("authToken");

              try {
                const res = await fetch("/api/teacher/delete-verification", {
                  method: "DELETE",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                });

                const result = await res.json();

                if (res.ok) {
                  showToast("Verification request deleted successfully!");
                  // Reload verification status
                  setTimeout(() => loadVerificationStatus(token), 500);
                } else {
                  showToast(
                    result.error || "Failed to delete verification request"
                  );
                }
              } catch (error) {
                console.error("Error deleting verification request:", error);
                showToast("Error deleting verification request");
              }
            }
          } else {
            console.error("showConfirmation is not available");
          }
        });
    } else if (verification.status === "rejected") {
      // Rejected verification
      verificationSection.innerHTML = `
                <div class="profile-item">
                    <strong><i class="fas fa-shield-alt"></i> Verification Status</strong>
                    <p>Rejected</p>
                    <p style="font-size: 12px; color: rgba(255, 255, 255, 0.7); margin-top: 8px;">Rejected on ${new Date(
                      verification.reviewed_at
                    ).toLocaleDateString()}</p>
                    ${
                      verification.rejection_reason
                        ? `<p style="font-size: 12px; color: rgba(255, 255, 255, 0.7); margin-top: 8px; font-style: italic;">Reason: ${verification.rejection_reason}</p>`
                        : ""
                    }
                    <button type="button" class="btn-primary" id="resubmitVerificationBtn" style="margin-top: 12px;">
                        <i class="fas fa-redo"></i> Resubmit Request
                    </button>
                </div>
            `;

      document
        .getElementById("resubmitVerificationBtn")
        .addEventListener("click", () => {
          const modal = document.getElementById("verificationModal");
          const form = document.getElementById("verificationForm");

          // Reset form to empty state
          form.reset();
          document.getElementById("charCount").textContent = "0";

          // Show all form fields (in case they were hidden)
          document.querySelector('[for="appointmentLetter"]').style.display =
            "block";
          document.getElementById("appointmentLetter").style.display = "block";
          document.querySelector(".file-info").style.display = "block";

          // Reset button text
          document.getElementById("submitVerificationBtn").textContent =
            "Submit Request";
          document.getElementById("submitVerificationBtn").onclick = null;

          modal.classList.add("show");
          document.body.style.overflow = "hidden";
        });
    }
  }

  // Show request details
  function showRequestDetails(verification) {
    let message = `Verification Request Details\n\n`;
    message += `Status: ${verification.status}\n`;
    message += `Submitted: ${new Date(
      verification.submitted_at
    ).toLocaleDateString()}\n`;
    if (verification.reviewed_at) {
      message += `Reviewed: ${new Date(
        verification.reviewed_at
      ).toLocaleDateString()}\n`;
    }
    if (verification.rejection_reason) {
      message += `\nReason for Rejection:\n${verification.rejection_reason}\n`;
    }
    alert(message);
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
    const currentBg = localStorage.getItem("selectedBackground") || "bg1";
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

    if (bgId === "custom" && customUrl) {
      bgImage.style.backgroundImage = `url(${customUrl})`;
    } else {
      // Default backgrounds
      const bgUrls = {
        bg1: "../../../assets/images/bg1.jpeg",
        bg2: "../../../assets/images/bg2.jpg",
        bg3: "../../../assets/images/bg3.jpeg",
        bg4: "../../../assets/images/bg4.jpeg",
        bg5: "../../../assets/images/bg5.jpg",
      };

      const bgUrl = bgUrls[bgId] || bgUrls["bg1"];
      bgImage.style.backgroundImage = `url(${bgUrl})`;
    }

    bgImage.style.backgroundSize = "cover";
    bgImage.style.backgroundPosition = "center";
    bgImage.style.backgroundRepeat = "no-repeat";
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

  // Initialize verification modal
  function initializeVerificationModal() {
    const modal = document.getElementById("verificationModal");
    const closeBtn = document.getElementById("closeVerificationBtn");
    const cancelBtn = document.getElementById("cancelVerificationBtn");
    const form = document.getElementById("verificationForm");
    const submitBtn = document.getElementById("submitVerificationBtn");
    const charCount = document.getElementById("charCount");
    const messageTextarea = document.getElementById("verificationMessage");
    const token = localStorage.getItem("authToken");

    if (!form) return; // Exit if form doesn't exist

    // Character counter
    messageTextarea.addEventListener("input", () => {
      charCount.textContent = messageTextarea.value.length;
    });

    // Close modal functions
    const closeModal = () => {
      modal.classList.remove("show");
      document.body.style.overflow = "";
      form.reset();
      charCount.textContent = "0";

      // Reset all form elements to default state
      const fileInput = document.getElementById("appointmentLetter");
      fileInput.disabled = false;
      fileInput.style.opacity = "1";

      const messageTextarea = document.getElementById("verificationMessage");
      messageTextarea.readOnly = false;
      messageTextarea.style.opacity = "1";

      document.querySelector('[for="appointmentLetter"]').style.display =
        "block";
      fileInput.style.display = "block";
      document.querySelector(".file-info").style.display = "block";
      document.querySelector(".file-info").textContent =
        "Accepted formats: PDF, Word, Image (Max 5MB)";

      document.getElementById("submitVerificationBtn").style.display = "block";
      document.getElementById("submitVerificationBtn").textContent =
        "Submit Request";
      document.getElementById("submitVerificationBtn").onclick = null;

      // Remove close button if it exists from view mode
      const closeViewBtn = document.getElementById("verificationCloseBtn");
      if (closeViewBtn) {
        closeViewBtn.remove();
      }
    };

    closeBtn.addEventListener("click", closeModal);
    cancelBtn.addEventListener("click", closeModal);

    // Close on outside click
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });

    // Form submission
    submitBtn.addEventListener("click", async (e) => {
      e.preventDefault();

      const verificationMessage = document.getElementById(
        "verificationMessage"
      ).value;
      const appointmentLetter =
        document.getElementById("appointmentLetter").files[0];

      // Validate that a file is selected
      if (!appointmentLetter) {
        showToast("Please select an appointment letter file");
        return;
      }

      // Check file size (max 5MB)
      const maxFileSize = 5 * 1024 * 1024; // 5MB
      if (appointmentLetter.size > maxFileSize) {
        showToast("File size exceeds 5MB limit");
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "Submitting...";

      try {
        // Read file as base64
        const fileContent = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64Content = reader.result.split(",")[1];
            resolve(base64Content);
          };
          reader.onerror = reject;
          reader.readAsDataURL(appointmentLetter);
        });

        // Send as JSON with base64-encoded file
        const payload = {
          verificationMessage: verificationMessage,
          appointmentLetter: {
            filename: appointmentLetter.name,
            data: fileContent,
          },
        };

        const res = await fetch("/api/teacher/request-verification", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        const result = await res.json();

        if (res.ok) {
          showToast("Verification request submitted successfully!");
          closeModal();
          // Reload verification status to show pending state
          setTimeout(() => loadVerificationStatus(token), 500);
        } else {
          showToast(result.error || "Failed to submit verification request");
        }
      } catch (error) {
        console.error("Error submitting verification request:", error);
        showToast("Error submitting verification request");
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Request";
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
