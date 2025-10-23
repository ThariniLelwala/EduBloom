document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("subjects-container");
  const modal = document.getElementById("subject-modal");
  const modalTitle = document.getElementById("modal-title");
  const input = document.getElementById("subject-input");
  const saveBtn = document.getElementById("save-subject-btn");
  const closeBtn = document.querySelector(".modal-close");

  let subjects = [];
  let editId = null;

  // Check authentication and role
  function checkAuth() {
    const token = localStorage.getItem("authToken");
    const userRole = localStorage.getItem("userRole");

    if (!token) {
      showMessage("Please log in to access quizzes.", "error");
      setTimeout(() => (window.location.href = "/login.html"), 2000);
      return false;
    }

    if (userRole !== "teacher") {
      showMessage("Only teachers can access this page.", "error");
      setTimeout(() => (window.location.href = "/"), 2000);
      return false;
    }

    return true;
  }

  // Load subjects from backend
  async function loadSubjects() {
    try {
      subjects = await QuizAPI.getSubjects();
      renderSubjects();
    } catch (error) {
      console.error("Error loading subjects:", error);
      showMessage(
        error.message || "Failed to load quizzes. Please try again.",
        "error"
      );
    }
  }

  function renderSubjects() {
    container.innerHTML = "";

    subjects.forEach((subj) => {
      const card = document.createElement("div");
      card.classList.add("subject-card");

      // Check if this is a shared subject from quiz.json or teacher-created
      const isSharedSubject = subj.id <= 3; // Assuming quiz.json subjects have IDs 1, 2, 3

      card.innerHTML = `
        <div class="subject-header">
          <i class="fas fa-folder"></i>
          <span>${subj.name}</span>
        </div>
        <i class="fas fa-ellipsis-v dots"></i>
        <div class="dropdown">
          <ul>
            <li class="edit">Edit</li>
            <li class="delete">Delete</li>
          </ul>
        </div>
      `;
      container.appendChild(card);

      const dots = card.querySelector(".dots");
      const dropdown = card.querySelector(".dropdown");

      // Toggle dropdown
      dots.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdown.style.display =
          dropdown.style.display === "block" ? "none" : "block";
      });

      // Edit subject
      dropdown.querySelector(".edit").addEventListener("click", () => {
        editId = subj.id;
        modalTitle.textContent = "Edit Subject";
        input.value = subj.name;
        modal.style.display = "flex";
        dropdown.style.display = "none";
      });

      // Delete subject
      dropdown.querySelector(".delete").addEventListener("click", async () => {
        const confirmed = await showConfirmation(
          `Delete "${subj.name}" and all its quizzes?`,
          "Delete Subject"
        );
        if (confirmed) {
          try {
            await QuizAPI.deleteSubject(subj.id);
            subjects = subjects.filter((s) => s.id !== subj.id);
            renderSubjects();
          } catch (error) {
            showMessage(error.message, "error");
          }
        }
        dropdown.style.display = "none";
      });

      // Navigate to quiz set page (click anywhere except dropdown)
      card.addEventListener("click", (e) => {
        if (e.target.closest(".dots") || e.target.closest(".dropdown")) return;
        window.location.href = `quiz-set.html?subjectId=${
          subj.id
        }&subjectName=${encodeURIComponent(subj.name)}`;
      });
    });

    // Add card
    const addCard = document.createElement("div");
    addCard.classList.add("subject-card", "add-card");
    addCard.innerHTML = `<i class="fas fa-plus"></i><span>Add Subject</span>`;
    container.appendChild(addCard);

    addCard.addEventListener("click", () => {
      editId = null;
      modalTitle.textContent = "Add Subject";
      input.value = "";
      modal.style.display = "flex";
    });
  }

  saveBtn.addEventListener("click", async () => {
    const name = input.value.trim();
    if (!name) {
      showMessage("Please enter a subject name", "error");
      return;
    }

    try {
      if (editId) {
        const updated = await QuizAPI.updateSubject(editId, name, null);
        const index = subjects.findIndex((s) => s.id === editId);
        if (index !== -1) {
          subjects[index] = updated;
        }
      } else {
        const newSubject = await QuizAPI.createSubject(name, null);
        subjects.push(newSubject);
      }

      modal.style.display = "none";
      renderSubjects();
    } catch (error) {
      showMessage(error.message, "error");
    }
  });

  closeBtn.addEventListener("click", () => (modal.style.display = "none"));

  document.addEventListener("click", () => {
    document
      .querySelectorAll(".dropdown")
      .forEach((dd) => (dd.style.display = "none"));
  });

  // Show message helper
  function showMessage(msg, type) {
    const messageDiv = document.createElement("div");
    messageDiv.textContent = msg;
    messageDiv.style.padding = "10px 15px";
    messageDiv.style.marginTop = "10px";
    messageDiv.style.borderRadius = "4px";
    messageDiv.style.color = type === "error" ? "#d32f2f" : "#388e3c";
    messageDiv.style.backgroundColor = type === "error" ? "#ffebee" : "#e8f5e9";
    messageDiv.style.border =
      type === "error" ? "1px solid #d32f2f" : "1px solid #388e3c";

    const existingMessage = document.querySelector("[data-message]");
    if (existingMessage) existingMessage.remove();

    messageDiv.setAttribute("data-message", "true");
    container.parentElement.insertBefore(messageDiv, container);

    setTimeout(() => messageDiv.remove(), 3000);
  }

  // Verify authentication before loading
  if (!checkAuth()) {
    return; // Stop execution if not authenticated
  }

  loadSubjects();
});
