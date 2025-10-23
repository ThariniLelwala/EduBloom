/**
 * Teacher Module Space JavaScript
 * Handles subject, topic, and public file management for teachers
 */

let currentSubjectId = null;
let currentPublicFileContext = null;
const API_BASE_URL = "http://localhost:3000/api/teacher"; // Backend API base URL

// Get authentication token from localStorage
function getAuthToken() {
  return localStorage.getItem("authToken");
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", function () {
  setupEventListeners();
  loadSubjects();
});

/**
 * Setup event listeners for buttons
 */
function setupEventListeners() {
  // Setup Create Subject Modal buttons
  const saveSubjectBtn = document.getElementById("save-subject-btn");
  const subjectModal = document.getElementById("subject-modal");
  const subjectInput = document.getElementById("subject-input");
  const modalTitle = document.getElementById("modal-title");
  const closeBtn = subjectModal
    ? subjectModal.querySelector(".modal-close")
    : null;

  if (saveSubjectBtn) {
    saveSubjectBtn.addEventListener("click", () =>
      handleSaveSubject(subjectInput, modalTitle)
    );
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () =>
      closeCreateSubjectModal(subjectModal)
    );
  }

  // Close modal when clicking outside of it
  if (subjectModal) {
    window.addEventListener("click", function (event) {
      if (event.target === subjectModal) {
        closeCreateSubjectModal(subjectModal);
      }
    });
  }

  // Public file status modal
  const publicStatusModal = document.getElementById("public-status-modal");
  const publicCloseBtn = publicStatusModal
    ? publicStatusModal.querySelector(".modal-close")
    : null;
  const publicSaveBtn = document.getElementById("public-save");
  const publicCancelBtn = document.getElementById("public-cancel");

  if (publicCloseBtn) {
    publicCloseBtn.addEventListener("click", () => closePublicStatusModal());
  }

  if (publicCancelBtn) {
    publicCancelBtn.addEventListener("click", () => closePublicStatusModal());
  }

  if (publicSaveBtn) {
    publicSaveBtn.addEventListener("click", () => handleSavePublicStatus());
  }

  if (publicStatusModal) {
    window.addEventListener("click", function (event) {
      if (event.target === publicStatusModal) {
        closePublicStatusModal();
      }
    });
  }
}

/**
 * Load subjects from API and display them
 */
async function loadSubjects() {
  try {
    const authToken = getAuthToken();
    if (!authToken) {
      console.log("User not authenticated");
      return;
    }

    const response = await fetch(`${API_BASE_URL}/subjects`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to load subjects");
    }

    const result = await response.json();
    const subjects = result.subjects || [];

    displaySubjects(subjects);
  } catch (error) {
    console.error("Error loading subjects:", error);
    showNotification("Failed to load subjects", "error");
  }
}

/**
 * Display subjects as cards
 */
function displaySubjects(subjects) {
  const grid = document.getElementById("subjects-container");

  if (!grid) return;

  grid.innerHTML = "";

  subjects.forEach((subject) => {
    const card = document.createElement("div");
    card.classList.add("subject-card");
    card.innerHTML = `
      <div class="subject-header">
        <i class="fas fa-folder"></i>
        <span>${subject.name}</span>
      </div>
      <i class="fas fa-ellipsis-v dots"></i>
      <div class="dropdown">
        <ul>
          <li class="open">Open Subject</li>
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
      window.location.href = `./subject.html?subjectId=${
        subject.id
      }&subjectName=${encodeURIComponent(subject.name)}`;
      dropdown.style.display = "none";
    });

    // Edit subject
    dropdown.querySelector(".edit").addEventListener("click", () => {
      openEditSubjectModal(subject);
      dropdown.style.display = "none";
    });

    // Delete subject
    dropdown.querySelector(".delete").addEventListener("click", () => {
      if (confirm(`Delete "${subject.name}" and all its topics?`)) {
        deleteSubject(subject.id);
      }
      dropdown.style.display = "none";
    });

    // Navigate to subject (click anywhere except dropdown)
    card.addEventListener("click", (e) => {
      if (e.target.closest(".dots") || e.target.closest(".dropdown")) return;
      window.location.href = `./subject.html?subjectId=${
        subject.id
      }&subjectName=${encodeURIComponent(subject.name)}`;
    });
  });

  // Close dropdowns when clicking outside
  document.addEventListener("click", () => {
    document
      .querySelectorAll(".dropdown")
      .forEach((dd) => (dd.style.display = "none"));
  });

  // Always add the "Add Subject" card at the end
  const addSubjectCard = document.createElement("div");
  addSubjectCard.classList.add("subject-card", "add-card");
  addSubjectCard.onclick = openCreateSubjectModal;
  addSubjectCard.innerHTML = `
    <i class="fas fa-plus"></i><span>Add Subject</span>
  `;
  grid.appendChild(addSubjectCard);
}

/**
 * Open create subject modal
 */
function openCreateSubjectModal() {
  const modal = document.getElementById("subject-modal");
  const input = document.getElementById("subject-input");
  const title = document.getElementById("modal-title");

  title.textContent = "Add Subject";
  input.value = "";
  delete input.dataset.editId;

  modal.classList.add("show");
  modal.style.display = "flex";
}

/**
 * Open edit subject modal
 */
function openEditSubjectModal(subject) {
  const modal = document.getElementById("subject-modal");
  const input = document.getElementById("subject-input");
  const title = document.getElementById("modal-title");

  title.textContent = "Edit Subject";
  input.value = subject.name;
  input.dataset.editId = subject.id;

  modal.classList.add("show");
  modal.style.display = "flex";
}

/**
 * Close subject modal
 */
function closeCreateSubjectModal(modal) {
  const input = document.getElementById("subject-input");

  modal.classList.remove("show");
  modal.style.display = "none";

  input.value = "";
  delete input.dataset.editId;
}

/**
 * Save subject (create or edit)
 */
async function handleSaveSubject(input, title) {
  const subjectName = input.value.trim();
  const editId = input.dataset.editId;

  if (!subjectName) {
    showNotification("Please enter a subject name", "error");
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
        body: JSON.stringify({ name: subjectName }),
      });

      if (!response.ok) {
        throw new Error("Failed to update subject");
      }

      showNotification("Subject updated successfully!", "success");
    } else {
      // Create subject
      const response = await fetch(`${API_BASE_URL}/subjects/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: subjectName }),
      });

      if (!response.ok) {
        throw new Error("Failed to create subject");
      }

      showNotification("Subject created successfully!", "success");
    }

    const modal = document.getElementById("subject-modal");
    closeCreateSubjectModal(modal);
    loadSubjects();
  } catch (error) {
    console.error("Error saving subject:", error);
    showNotification(error.message || "Failed to save subject", "error");
  }
}

/**
 * Delete subject
 */
async function deleteSubject(subjectId) {
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
      throw new Error("Failed to delete subject");
    }

    showNotification("Subject deleted successfully!", "success");
    loadSubjects();
  } catch (error) {
    console.error("Error deleting subject:", error);
    showNotification("Failed to delete subject", "error");
  }
}

/**
 * Open public file status modal
 */
function openPublicStatusModal(fileId, currentStatus) {
  currentPublicFileContext = { fileId, currentStatus };
  const modal = document.getElementById("public-status-modal");
  const toggle = document.getElementById("file-public-toggle");

  toggle.checked = currentStatus;
  modal.classList.add("show");
  modal.style.display = "flex";
}

/**
 * Close public file status modal
 */
function closePublicStatusModal() {
  const modal = document.getElementById("public-status-modal");
  modal.classList.remove("show");
  modal.style.display = "none";
  currentPublicFileContext = null;
}

/**
 * Handle saving public file status
 */
async function handleSavePublicStatus() {
  if (!currentPublicFileContext) return;

  try {
    const authToken = getAuthToken();
    if (!authToken) {
      showNotification("User not authenticated", "error");
      return;
    }

    const { fileId } = currentPublicFileContext;
    const isPublic = document.getElementById("file-public-toggle").checked;

    const response = await fetch(`${API_BASE_URL}/notes/${fileId}/visibility`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ is_public: isPublic }),
    });

    if (!response.ok) {
      throw new Error("Failed to update file visibility");
    }

    showNotification("File visibility updated successfully!", "success");
    closePublicStatusModal();
    // Reload current subject data to reflect changes
    if (currentSubjectId) {
      window.location.reload();
    }
  } catch (error) {
    console.error("Error updating file visibility:", error);
    showNotification("Failed to update file visibility", "error");
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
