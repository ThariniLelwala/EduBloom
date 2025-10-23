// Teacher Profile Management
document.addEventListener("DOMContentLoaded", function () {
  // Initialize profile
  loadTeacherProfile();
  initializeEditMode();
  checkUserRole();

  // Load teacher profile data
  function loadTeacherProfile() {
    // For now, using mock data - will be replaced with API calls later
    const mockProfile = {
      name: "Dr. Sarah Johnson",
      title: "Senior Mathematics Teacher",
      rating: 4.5,
      reviewCount: 127,
      stats: {
        totalStudents: 2847,
        yearsExperience: 12,
        resourcesCreated: 156,
        resourceViews: 45200,
      },
      details: {
        qualifications: "Ph.D. Mathematics, M.Ed. Education",
        specialization: "Advanced Calculus, Statistics, Algebra",
        experience: "12 years in secondary education",
        certifications: "CBSE Certified, STEM Educator",
        contactEmail: "sarah.johnson@edubloom.edu",
        officeHours: "Mon-Fri: 2:00 PM - 4:00 PM",
      },
    };

    displayProfileData(mockProfile);
  }

  // Display profile data
  function displayProfileData(profile) {
    // Update header information
    document.getElementById("teacher-name").textContent = profile.name;
    document.getElementById("teacher-title").textContent = profile.title;

    // Update rating stars
    updateRatingStars(profile.rating);
    document.getElementById(
      "rating-text"
    ).textContent = `${profile.rating} (${profile.reviewCount} reviews)`;

    // Update statistics
    document.getElementById("total-students").textContent =
      profile.stats.totalStudents.toLocaleString();
    document.getElementById("years-experience").textContent =
      profile.stats.yearsExperience;
    document.getElementById("resources-created").textContent =
      profile.stats.resourcesCreated;
    document.getElementById("resource-views").textContent =
      (profile.stats.resourceViews / 1000).toFixed(1) + "K";

    // Update professional details
    document.getElementById("qualifications").textContent =
      profile.details.qualifications;
    document.getElementById("specialization").textContent =
      profile.details.specialization;
    document.getElementById("experience").textContent =
      profile.details.experience;
    document.getElementById("certifications").textContent =
      profile.details.certifications;
    document.getElementById("contact-email").textContent =
      profile.details.contactEmail;
    document.getElementById("office-hours").textContent =
      profile.details.officeHours;
  }

  // Update rating stars display
  function updateRatingStars(rating) {
    const starsContainer = document.getElementById("rating-stars");
    starsContainer.innerHTML = "";

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
    function saveChanges() {
      const editableInputs = document.querySelectorAll(".detail-value");

      // Collect new values
      const updatedData = {};
      editableInputs.forEach((input) => {
        updatedData[input.id] = input.value;
      });

      // Here you would send the data to the backend
      console.log("Saving profile changes:", updatedData);

      // For now, just update the display
      exitEditMode();

      // Show success message (you can implement this)
      alert("Profile updated successfully!");
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
  }
});
