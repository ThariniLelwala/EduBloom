// Teacher Profile Management
document.addEventListener("DOMContentLoaded", function () {
  // Initialize profile
  loadUserData();
  loadTeacherProfile();
  initializeEditMode();
  checkUserRole();

  // First load user data from auth profile
  async function loadUserData() {
    const token = localStorage.getItem("authToken");
    const firstname = localStorage.getItem("firstname");
    const lastname = localStorage.getItem("lastname");
    
    // If we have stored name, use it
    if (firstname || lastname) {
      const fullName = [firstname, lastname].filter(Boolean).join(" ");
      const teacherNameEl = document.getElementById("teacher-name");
      if (teacherNameEl) teacherNameEl.textContent = fullName || "Teacher";
    }
    
    // Try to get fresh data from auth profile API
    if (token) {
      try {
        const res = await fetch("/api/auth/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (res.ok) {
          const result = await res.json();
          if (result.user) {
            const fullName = [result.user.firstname, result.user.lastname].filter(Boolean).join(" ");
            const teacherNameEl = document.getElementById("teacher-name");
            if (teacherNameEl && fullName) {
              teacherNameEl.textContent = fullName;
            }
          }
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    }
  }

  // Load teacher profile data from backend
  async function loadTeacherProfile() {
    const token = localStorage.getItem("authToken");
    
    if (!token) {
      showSetupPrompt("Please log in to view your profile");
      return;
    }

    try {
      const res = await fetch("/api/teacher/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const result = await res.json();
        if (result.profile) {
          displayProfileData(result.profile);
        } else {
          showSetupPrompt("Set up your profile");
        }
      } else if (res.status === 404) {
        showSetupPrompt("Set up your profile");
      } else {
        showSetupPrompt("Failed to load profile");
      }
    } catch (error) {
      console.error("Error loading teacher profile:", error);
      showSetupPrompt("Failed to load profile");
    }
  }

  function showSetupPrompt(message) {
    const teacherTitleEl = document.getElementById("teacher-title");
    const ratingStarsEl = document.getElementById("rating-stars");
    const ratingTextEl = document.getElementById("rating-text");
    
    if (teacherTitleEl) teacherTitleEl.textContent = message;
    if (ratingStarsEl) ratingStarsEl.innerHTML = "";
    if (ratingTextEl) ratingTextEl.textContent = "No ratings yet";

    // Show edit button immediately for setup
    const editBtn = document.getElementById("edit-profile-btn");
    if (editBtn) editBtn.style.display = "block";
  }

  // Display profile data from backend
  function displayProfileData(profile) {
    const title = profile.title || "Teacher";
    const rating = parseFloat(profile.rating) || 0;
    const reviewCount = parseInt(profile.review_count) || 0;

    // Update title only (name is loaded from auth profile)
    const teacherTitleEl = document.getElementById("teacher-title");
    if (teacherTitleEl) teacherTitleEl.textContent = title;

    // Update rating stars
    updateRatingStars(rating);
    const ratingTextEl = document.getElementById("rating-text");
    if (ratingTextEl) {
      if (rating > 0) {
        ratingTextEl.textContent = `${rating.toFixed(1)} (${reviewCount} reviews)`;
      } else {
        ratingTextEl.textContent = "No ratings yet";
      }
    }

    // Update statistics
    const totalStudentsEl = document.getElementById("total-students");
    if (totalStudentsEl) totalStudentsEl.textContent = (profile.total_students || 0).toLocaleString();
    
    const yearsExperienceEl = document.getElementById("years-experience");
    if (yearsExperienceEl) {
      const expYears = profile.experience?.match(/\d+/)?.[0] || profile.total_students || 0;
      yearsExperienceEl.textContent = expYears;
    }
    
    const resourcesCreatedEl = document.getElementById("resources-created");
    if (resourcesCreatedEl) resourcesCreatedEl.textContent = profile.resources_created || 0;
    
    const resourceViewsEl = document.getElementById("resource-views");
    if (resourceViewsEl) {
      const views = profile.resource_views || 0;
      resourceViewsEl.textContent = views >= 1000 ? (views / 1000).toFixed(1) + "K" : views;
    }

    // Update professional details
    const setDetailText = (id, value, defaultText) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value || defaultText;
    };

    setDetailText("qualifications", profile.qualifications, "Click edit to add");
    setDetailText("specialization", profile.specialization, "Click edit to add");
    setDetailText("experience", profile.experience, "Click edit to add");
    setDetailText("certifications", profile.certifications, "Click edit to add");
    setDetailText("contact-email", profile.contact_email, "Click edit to add");
    setDetailText("office-hours", profile.office_hours, "Click edit to add");
  }

  // Update rating stars display
  function updateRatingStars(rating) {
    const starsContainer = document.getElementById("rating-stars");
    if (!starsContainer) return;
    
    starsContainer.innerHTML = "";
    
    if (!rating || rating === 0) {
      // No rating - show empty stars
      for (let i = 0; i < 5; i++) {
        const emptyStar = document.createElement("i");
        emptyStar.className = "far fa-star star";
        starsContainer.appendChild(emptyStar);
      }
      return;
    }

    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      const star = document.createElement("i");
      star.className = "fas fa-star star";
      starsContainer.appendChild(star);
    }

    // Add half star if needed
    if (hasHalfStar) {
      const halfStar = document.createElement("i");
      halfStar.className = "fas fa-star-half-alt star";
      starsContainer.appendChild(halfStar);
    }

    // Add empty stars to make 5 total
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      const emptyStar = document.createElement("i");
      emptyStar.className = "far fa-star star";
      starsContainer.appendChild(emptyStar);
    }
  }

  // Check user role and show/hide edit functionality
  function checkUserRole() {
    const userRole = localStorage.getItem("userRole");
    const editBtn = document.getElementById("edit-profile-btn");

    if (userRole === "teacher") {
      editBtn.style.display = "block";
    } else {
      editBtn.style.display = "none";
    }
  }

  // Initialize edit mode functionality
  function initializeEditMode() {
    const editBtn = document.getElementById("edit-profile-btn");
    const saveBtn = document.getElementById("save-changes-btn");
    const cancelBtn = document.getElementById("cancel-edit-btn");
    const editActions = document.getElementById("edit-actions");

    let originalValues = {};

    // Edit button click
    editBtn.addEventListener("click", function () {
      enterEditMode();
    });

    // Save button click
    saveBtn.addEventListener("click", function () {
      saveChanges();
    });

    // Cancel button click
    cancelBtn.addEventListener("click", function () {
      exitEditMode();
    });

    // Enter edit mode
    function enterEditMode() {
      const editableFields = document.querySelectorAll(".detail-value");

      // Store original values
      originalValues = {};
      editableFields.forEach((field) => {
        const fieldId = field.id;
        originalValues[fieldId] = field.textContent;
      });

      // Make fields editable
      editableFields.forEach((field) => {
        const input = document.createElement("input");
        input.type = "text";
        input.value = field.textContent;
        input.className = "detail-value";
        input.id = field.id;
        field.parentNode.replaceChild(input, field);
      });

      // Show edit actions, hide edit button
      editBtn.style.display = "none";
      editActions.style.display = "flex";

      // Add edit mode class to body for styling
      document.body.classList.add("edit-mode");
    }

    // Save changes
    async function saveChanges() {
      const editableInputs = document.querySelectorAll(".detail-value");

      // Collect new values
      const updatedData = {};
      editableInputs.forEach((input) => {
        updatedData[input.id] = input.value;
      });

      const token = localStorage.getItem("authToken");
      
      try {
        const res = await fetch("/api/teacher/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: document.getElementById("teacher-title").textContent,
            qualifications: updatedData.qualifications,
            specialization: updatedData.specialization,
            experience: updatedData.experience,
            certifications: updatedData.certifications,
            contact_email: updatedData["contact-email"],
            office_hours: updatedData["office-hours"],
          }),
        });

        if (res.ok) {
          const result = await res.json();
          if (result.profile) {
            displayProfileData(result.profile);
          }
          exitEditMode();
          showNotification("Profile updated successfully!", "success");
        } else {
          const error = await res.json();
          exitEditMode();
          showNotification(error.error || "Failed to update profile", "error");
        }
      } catch (error) {
        console.error("Error saving profile:", error);
        exitEditMode();
        showNotification("Failed to update profile", "error");
      }
    }

    // Exit edit mode
    function exitEditMode() {
      const editableInputs = document.querySelectorAll(".detail-value");

      // Convert inputs back to spans
      editableInputs.forEach((input) => {
        const span = document.createElement("span");
        span.className = "detail-value";
        span.id = input.id;
        span.textContent = originalValues[input.id] || input.value;
        input.parentNode.replaceChild(span, input);
      });

      // Show edit button, hide edit actions
      editBtn.style.display = "block";
      editActions.style.display = "none";

      // Remove edit mode class
      document.body.classList.remove("edit-mode");
    }

    function showNotification(message, type = "success") {
      const notification = document.createElement("div");
      notification.className = `notification ${type}`;
      notification.textContent = message;
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === "success" ? "rgba(74, 222, 128, 0.9)" : "rgba(220, 53, 69, 0.9)"};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease;
      `;

      document.body.appendChild(notification);

      setTimeout(() => {
        notification.style.animation = "slideOut 0.3s ease";
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 300);
      }, 3000);
    }
  }
});
