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

  // Load quizzes from quiz.json and teacher localStorage
  async function loadQuizzes() {
    try {
      // Load shared quizzes from quiz.json
      const res = await fetch("/data/quiz.json");
      const data = await res.json();
      const sharedSubject = data.subjects.find((s) => s.id === subjectId);
      const sharedQuizzes = sharedSubject
        ? sharedSubject.quizzes.map((quiz) => ({ ...quiz, isShared: true }))
        : [];

      // Load teacher-created quizzes from localStorage
      const teacherSubjects = localStorage.getItem("teacher_quiz_subjects");
      const subjects = teacherSubjects ? JSON.parse(teacherSubjects) : [];
      const teacherSubject = subjects.find((s) => s.id === subjectId);
      const teacherQuizzes = teacherSubject
        ? teacherSubject.quizzes.map((quiz) => ({ ...quiz, isShared: false }))
        : [];

      // Combine shared and teacher quizzes
      quizzes = [...sharedQuizzes, ...teacherQuizzes];

      // Load published status for quizzes
      const quizStatus = localStorage.getItem("quiz_status");
      if (quizStatus) {
        const statusData = JSON.parse(quizStatus);
        quizzes.forEach((quiz) => {
          if (statusData[quiz.id] !== undefined) {
            quiz.published = statusData[quiz.id];
          } else {
            quiz.published = quiz.published !== false; // Default to published
          }
        });
      } else {
        // Default all quizzes to published
        quizzes.forEach((quiz) => {
          quiz.published = quiz.published !== false;
        });
      }

      renderQuizzes();
    } catch (error) {
      console.error("Error loading quizzes:", error);
      // Fallback to localStorage only
      const teacherSubjects = localStorage.getItem("teacher_quiz_subjects");
      const subjects = teacherSubjects ? JSON.parse(teacherSubjects) : [];
      const teacherSubject = subjects.find((s) => s.id === subjectId);
      quizzes = teacherSubject
        ? teacherSubject.quizzes.map((quiz) => ({ ...quiz, isShared: false }))
        : [];
      renderQuizzes();
    }
  }

  // Save only teacher-created quizzes back to localStorage
  function saveSubjects() {
    const teacherSubjects = localStorage.getItem("teacher_quiz_subjects");
    let subjects = teacherSubjects ? JSON.parse(teacherSubjects) : [];
    const subjectIndex = subjects.findIndex((s) => s.id === subjectId);
    if (subjectIndex !== -1) {
      // Only save teacher-created quizzes (IDs > 399)
      subjects[subjectIndex].quizzes = quizzes.filter((quiz) => quiz.id > 399);
      localStorage.setItem("teacher_quiz_subjects", JSON.stringify(subjects));
    }

    // Save quiz published status
    const quizStatus = {};
    quizzes.forEach((quiz) => {
      quizStatus[quiz.id] = quiz.published;
    });
    localStorage.setItem("quiz_status", JSON.stringify(quizStatus));
  }

  function renderQuizzes() {
    container.innerHTML = "";

    quizzes.forEach((quiz) => {
      const card = document.createElement("div");
      card.classList.add("subject-card");

      // Check if this is a shared quiz from quiz.json or teacher-created
      const isSharedQuiz = quiz.isShared;

      card.innerHTML = `
        <div class="subject-header">
          <i class="fas fa-file-alt"></i>
          <span>${quiz.name}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px; margin-left: auto;">
          <i class="fas ${quiz.published ? "fa-globe" : "fa-lock"}"></i>
          <i class="fas fa-ellipsis-v dots"></i>
        </div>
        <div class="dropdown">
          <ul>
            <li class="edit">Edit</li>
            <li class="change-status">${
              quiz.published ? "Make Private" : "Make Public"
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
        if (isSharedQuiz) {
          alert("Cannot edit shared quizzes. Create a new quiz instead.");
          dropdown.style.display = "none";
          return;
        }
        editId = quiz.id;
        modalTitle.textContent = "Edit Quiz";
        input.value = quiz.name;
        publishCheckbox.checked = quiz.published || false;
        modal.style.display = "flex";
        dropdown.style.display = "none";
      });

      dropdown.querySelector(".change-status").addEventListener("click", () => {
        quiz.published = !quiz.published;
        saveSubjects();
        renderQuizzes();
        dropdown.style.display = "none";
      });

      dropdown.querySelector(".delete").addEventListener("click", async () => {
        if (isSharedQuiz) {
          alert("Cannot delete shared quizzes.");
          dropdown.style.display = "none";
          return;
        }
        if (await showConfirmation(`Delete "${quiz.name}"?`)) {
          quizzes = quizzes.filter((q) => q.id !== quiz.id);
          saveSubjects();
          renderQuizzes();
        }
        dropdown.style.display = "none";
      });

      // Navigate to questions page when clicking on card
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

  saveBtn.addEventListener("click", () => {
    const name = input.value.trim();
    if (!name) return;

    if (editId) {
      const quiz = quizzes.find((q) => q.id === editId);
      if (quiz) {
        quiz.name = name;
        quiz.published = publishCheckbox.checked;
      }
    } else {
      quizzes.push({
        id: Date.now(),
        name,
        questions: [],
        published: publishCheckbox.checked,
      });
    }

    saveSubjects();
    modal.style.display = "none";
    renderQuizzes();
  });

  closeBtn.addEventListener("click", () => (modal.style.display = "none"));

  document.addEventListener("click", () => {
    document
      .querySelectorAll(".dropdown")
      .forEach((dd) => (dd.style.display = "none"));
  });

  loadQuizzes();
});
