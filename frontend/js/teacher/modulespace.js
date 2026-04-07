/**
 * Teacher Module Space JavaScript
 * Serves as the root dashboard for classes, rendering combined Grade/Subject cards.
 */

const API_BASE_URL = "http://localhost:3000/api/teacher"; // Backend API base URL

// Get authentication token from localStorage
function getAuthToken() {
  return localStorage.getItem("authToken");
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", function () {
  setupEventListeners();
  loadClasses();
});

/**
 * Setup event listeners for buttons
 */
function setupEventListeners() {
  // Setup Create Class Modal buttons
  const saveSubjectBtn = document.getElementById("save-subject-btn");
  const subjectModal = document.getElementById("subject-modal");
  const closeBtn = subjectModal ? subjectModal.querySelector(".modal-close") : null;

  if (saveSubjectBtn) {
    saveSubjectBtn.addEventListener("click", () => handleSaveClass());
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => closeCreateClassModal());
  }

  // Close modal when clicking outside of it
  if (subjectModal) {
    window.addEventListener("click", function (event) {
      if (event.target === subjectModal) {
        closeCreateClassModal();
      }
    });
  }
}

/**
 * Load classes (subjects) from API and display them
 */
async function loadClasses() {
  try {
    const authToken = getAuthToken();
    if (!authToken) {
      console.log("User not authenticated");
      return;
    }

    // Call /subjects without grade param to fetch all
    const response = await fetch(`${API_BASE_URL}/subjects`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to load classes");
    }

    const result = await response.json();
    const subjects = result.subjects || [];

    displayClasses(subjects);
  } catch (error) {
    console.error("Error loading classes:", error);
    showNotification("Failed to load classes", "error");
  }
}

/**
 * Display classes as cards
 */
function displayClasses(subjects) {
  const grid = document.getElementById("subjects-container");
  if (!grid) return;
  grid.innerHTML = "";

  subjects.forEach((subject) => {
    const card = document.createElement("div");
    card.classList.add("subject-card");
    card.innerHTML = `
      <div class="subject-header">
        <i class="fas fa-folder"></i>
        <span>Grade ${subject.grade} - ${subject.name}</span>
      </div>
      <i class="fas fa-ellipsis-v dots"></i>
      <div class="dropdown">
        <ul>
          <li class="open">Open Class</li>
          <li class="edit">Edit</li>
          <li class="delete">Delete</li>
        </ul>
      </div>
    `;
    grid.appendChild(card);

    const dots = card.querySelector(".dots");
    const dropdown = card.querySelector(".dropdown");

    // Toggle dropdown
    dots.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdown.style.display =
        dropdown.style.display === "block" ? "none" : "block";
    });

    // Open subject
    dropdown.querySelector(".open").addEventListener("click", () => {
      window.location.href = `./subject.html?subjectId=${subject.id}&subjectName=${encodeURIComponent(subject.name)}&grade=${subject.grade}`;
      dropdown.style.display = "none";
    });

    // Edit subject
    dropdown.querySelector(".edit").addEventListener("click", () => {
      openEditClassModal(subject);
      dropdown.style.display = "none";
    });

    // Delete subject
    dropdown.querySelector(".delete").addEventListener("click", async () => {
      const confirmed = await window.showConfirmation(
        `Delete "Grade ${subject.grade} - ${subject.name}" and all its topics/resources?`,
        "Delete Class"
      );
      if (confirmed) {
        deleteClass(subject.id);
      }
      dropdown.style.display = "none";
    });

    // Navigate to subject (click anywhere except dropdown)
    card.addEventListener("click", (e) => {
      if (e.target.closest(".dots") || e.target.closest(".dropdown")) return;
      window.location.href = `./subject.html?subjectId=${subject.id}&subjectName=${encodeURIComponent(subject.name)}&grade=${subject.grade}`;
    });
  });

  // Close dropdowns when clicking outside
  document.addEventListener("click", () => {
    document.querySelectorAll(".dropdown").forEach((dd) => (dd.style.display = "none"));
  });

  // Always add the "Add Class" card at the end
  const addClassCard = document.createElement("div");
  addClassCard.classList.add("subject-card", "add-card");
  addClassCard.onclick = openCreateClassModal;
  addClassCard.innerHTML = `
    <i class="fas fa-plus"></i><span>Create Class</span>
  `;
  grid.appendChild(addClassCard);
}

/**
 * Open create class modal
 */
function openCreateClassModal() {
  const modal = document.getElementById("subject-modal");
  const gradeInput = document.getElementById("grade-input");
  const subjectInput = document.getElementById("subject-input");
  const title = document.getElementById("modal-title");

  title.textContent = "Create Class Module";
  
  // Reset grade to 5
  gradeInput.value = "5";
  gradeInput.disabled = false;
  if (window.refreshCustomSelects) window.refreshCustomSelects();

  subjectInput.value = "";
  delete subjectInput.dataset.editId;

  modal.classList.add("show");
  modal.style.display = "flex";
}

/**
 * Open edit class modal
 */
function openEditClassModal(subject) {
  const modal = document.getElementById("subject-modal");
  const gradeInput = document.getElementById("grade-input");
  const subjectInput = document.getElementById("subject-input");
  const title = document.getElementById("modal-title");

  title.textContent = "Edit Class Module";
  
  // Set grade
  gradeInput.value = subject.grade.toString();
  // Disable grade changing for existing subjects as per existing logic
  gradeInput.disabled = true;
  if (window.refreshCustomSelects) window.refreshCustomSelects();

  subjectInput.value = subject.name;
  subjectInput.dataset.editId = subject.id;

  modal.classList.add("show");
  modal.style.display = "flex";
}

/**
 * Close class modal
 */
function closeCreateClassModal() {
  const modal = document.getElementById("subject-modal");
  const gradeInput = document.getElementById("grade-input");
  const subjectInput = document.getElementById("subject-input");

  modal.classList.remove("show");
  modal.style.display = "none";

  gradeInput.disabled = false;
  if (window.refreshCustomSelects) window.refreshCustomSelects();

  subjectInput.value = "";
  delete subjectInput.dataset.editId;
}

/**
 * Save class (create or edit)
 */
async function handleSaveClass() {
  const gradeInput = document.getElementById("grade-input");
  const subjectInput = document.getElementById("subject-input");
  const subjectName = subjectInput.value.trim();
  const selectGrade = parseInt(gradeInput.value, 10);
  const editId = subjectInput.dataset.editId;

  if (!subjectName) {
    showNotification("Please enter a class name", "error");
    return;
  }

  try {
    const authToken = getAuthToken();
    if (!authToken) {
      showNotification("User not authenticated", "error");
      return;
    }

    if (editId) {
      // Edit subject
      const response = await fetch(`${API_BASE_URL}/subjects/${editId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        // The backend updateSubject currently only updates name and description
        body: JSON.stringify({ name: subjectName }),
      });

      if (!response.ok) {
        throw new Error("Failed to update class");
      }

      showNotification("Class updated successfully!", "success");
    } else {
      // Create subject
      const response = await fetch(`${API_BASE_URL}/subjects/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: subjectName, grade: selectGrade }),
      });

      if (!response.ok) {
        throw new Error("Failed to create class");
      }

      showNotification("Class created successfully!", "success");
    }

    closeCreateClassModal();
    loadClasses();
  } catch (error) {
    console.error("Error saving class:", error);
    showNotification(error.message || "Failed to save class", "error");
  }
}

/**
 * Delete a class
 */
async function deleteClass(subjectId) {
  try {
    const authToken = getAuthToken();
    if (!authToken) {
      showNotification("User not authenticated", "error");
      return;
    }

    const response = await fetch(`${API_BASE_URL}/subjects/${subjectId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete class");
    }

    showNotification("Class deleted successfully!", "success");
    loadClasses();
  } catch (error) {
    console.error("Error deleting class:", error);
    showNotification("Failed to delete class", "error");
  }
}

/**
 * Show notification
 */
function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  let bgColor = "#2196F3";
  if (type === "success") {
    bgColor = "#4CAF50";
  } else if (type === "error") {
    bgColor = "#f44336";
  }

  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    background-color: ${bgColor};
    color: white;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    z-index: 10000;
    font-size: 14px;
    animation: slideIn 0.3s ease-in-out;
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}
