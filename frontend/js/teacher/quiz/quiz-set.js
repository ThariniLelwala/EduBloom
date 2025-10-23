document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("subjects-container");
  const modal = document.getElementById("subject-modal");
  const modalTitle = document.getElementById("modal-title");
  const input = document.getElementById("subject-input");
  const publishCheckbox = document.getElementById("publish-checkbox");
  const saveBtn = document.getElementById("save-subject-btn");
  const closeBtn = modal.querySelector(".modal-close");
  const subjectHeading = document.getElementById("subject-name");

  const params = new URLSearchParams(window.location.search);
  const subjectId = parseInt(params.get("subjectId"));
  const subjectName = params.get("subjectName") || "Unknown Subject";

  subjectHeading.textContent = subjectName;

  let quizzes = [];
  let editId = null;

  // Check authentication
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

  // Load quizzes from backend
  async function loadQuizzes() {
    try {
      quizzes = await QuizAPI.getQuizSets(subjectId);
      renderQuizzes();
    } catch (error) {
      console.error("Error loading quizzes:", error);
      showMessage(
        error.message || "Failed to load quizzes. Please try again.",
        "error"
      );
    }
  }

  function renderQuizzes() {
    container.innerHTML = "";

    quizzes.forEach((quiz) => {
      const card = document.createElement("div");
      card.classList.add("subject-card");

      card.innerHTML = `
        <div class="subject-header">
          <i class="fas fa-file-alt"></i>
          <span>${quiz.name}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; margin-left: auto;">
          <i class="fas ${quiz.is_published ? "fa-globe" : "fa-lock"}"></i>
          <i class="fas fa-ellipsis-v dots"></i>
        </div>
        <div class="dropdown">
          <ul>
            <li class="edit">Edit</li>
            <li class="change-status">${
              quiz.is_published ? "Make Private" : "Make Public"
            }</li>
            <li class="delete">Delete</li>
          </ul>
        </div>
      `;
      container.appendChild(card);

      const dots = card.querySelector(".dots");
      const dropdown = card.querySelector(".dropdown");

      dots.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdown.style.display =
          dropdown.style.display === "block" ? "none" : "block";
      });

      dropdown.querySelector(".edit").addEventListener("click", () => {
        editId = quiz.id;
        modalTitle.textContent = "Edit Quiz";
        input.value = quiz.name;
        publishCheckbox.checked = quiz.is_published || false;
        modal.style.display = "flex";
        dropdown.style.display = "none";
      });

      dropdown
        .querySelector(".change-status")
        .addEventListener("click", async () => {
          try {
            await QuizAPI.updateQuizSet(quiz.id, {
              is_published: !quiz.is_published,
            });
            quiz.is_published = !quiz.is_published;
            renderQuizzes();
          } catch (error) {
            showMessage(error.message, "error");
          }
          dropdown.style.display = "none";
        });

      dropdown.querySelector(".delete").addEventListener("click", async () => {
        if (await showConfirmation(`Delete "${quiz.name}"?`)) {
          try {
            await QuizAPI.deleteQuizSet(quiz.id);
            quizzes = quizzes.filter((q) => q.id !== quiz.id);
            renderQuizzes();
          } catch (error) {
            showMessage(error.message, "error");
          }
        }
        dropdown.style.display = "none";
      });

      // Navigate to questions page
      card.addEventListener("click", (e) => {
        if (e.target.closest(".dots") || e.target.closest(".dropdown")) return;
        window.location.href = `questions.html?subjectId=${subjectId}&quizId=${
          quiz.id
        }&quizName=${encodeURIComponent(
          quiz.name
        )}&subjectName=${encodeURIComponent(subjectName)}`;
      });
    });

    // Add Quiz card
    const addCard = document.createElement("div");
    addCard.classList.add("subject-card", "add-card");
    addCard.innerHTML = `<i class="fas fa-plus"></i><span>Add Quiz</span>`;
    container.appendChild(addCard);

    addCard.addEventListener("click", () => {
      editId = null;
      modalTitle.textContent = "Add Quiz";
      input.value = "";
      publishCheckbox.checked = false;
      modal.style.display = "flex";
    });
  }

  saveBtn.addEventListener("click", async () => {
    const name = input.value.trim();
    if (!name) {
      showMessage("Please enter a quiz name", "error");
      return;
    }

    try {
      if (editId) {
        const updated = await QuizAPI.updateQuizSet(editId, {
          name,
          is_published: publishCheckbox.checked,
        });
        const index = quizzes.findIndex((q) => q.id === editId);
        if (index !== -1) {
          quizzes[index] = updated;
        }
      } else {
        const newQuiz = await QuizAPI.createQuizSet(
          subjectId,
          name,
          null,
          publishCheckbox.checked
        );
        quizzes.push(newQuiz);
      }

      modal.style.display = "none";
      renderQuizzes();
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

  loadQuizzes();
});
