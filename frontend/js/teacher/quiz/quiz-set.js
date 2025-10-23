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

  // Load teacher subjects and find the current subject
  function loadQuizzes() {
    const teacherSubjects = localStorage.getItem("teacher_quiz_subjects");
    const subjects = teacherSubjects ? JSON.parse(teacherSubjects) : [];
    const subject = subjects.find((s) => s.id === subjectId);
    quizzes = subject ? subject.quizzes : [];
    renderQuizzes();
  }

  // Save subjects back to localStorage
  function saveSubjects() {
    const teacherSubjects = localStorage.getItem("teacher_quiz_subjects");
    let subjects = teacherSubjects ? JSON.parse(teacherSubjects) : [];
    const subjectIndex = subjects.findIndex((s) => s.id === subjectId);
    if (subjectIndex !== -1) {
      subjects[subjectIndex].quizzes = quizzes;
      localStorage.setItem("teacher_quiz_subjects", JSON.stringify(subjects));
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
          <div class="publish-status ${quiz.published ? "published" : "draft"}">
            <i class="fas ${quiz.published ? "fa-globe" : "fa-lock"}"></i>
            ${quiz.published ? "Published" : "Draft"}
          </div>
        </div>
        <i class="fas fa-ellipsis-v dots"></i>
        <div class="dropdown">
          <ul>
            <li class="edit">Edit</li>
            <li class="publish">${quiz.published ? "Unpublish" : "Publish"}</li>
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
        publishCheckbox.checked = quiz.published || false;
        modal.style.display = "flex";
        dropdown.style.display = "none";
      });

      dropdown.querySelector(".publish").addEventListener("click", () => {
        quiz.published = !quiz.published;
        saveSubjects();
        renderQuizzes();
        dropdown.style.display = "none";
      });

      dropdown.querySelector(".delete").addEventListener("click", () => {
        if (confirm(`Delete "${quiz.name}"?`)) {
          quizzes = quizzes.filter((q) => q.id !== quiz.id);
          saveSubjects();
          renderQuizzes();
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
