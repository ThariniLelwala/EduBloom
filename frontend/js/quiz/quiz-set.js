document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("subjects-container");
  const modal = document.getElementById("subject-modal");
  const modalTitle = document.getElementById("modal-title");
  const input = document.getElementById("subject-input");
  const saveBtn = document.getElementById("save-subject-btn");
  const closeBtn = modal.querySelector(".close");
  const subjectHeading = document.getElementById("subject-name");

  const params = new URLSearchParams(window.location.search);
  const subjectId = parseInt(params.get("subjectId"));
  const subjectName = params.get("subjectName") || "Unknown Subject";

  subjectHeading.textContent = subjectName;

  let quizzes = [];
  let editId = null;

  // Load data from JSON
  const res = await fetch("/data/quiz.json");
  const data = await res.json();
  const subject = data.subjects.find((s) => s.id === subjectId);
  if (subject) quizzes = subject.quizzes;

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

      dots.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdown.style.display =
          dropdown.style.display === "block" ? "none" : "block";
      });

      dropdown.querySelector(".edit").addEventListener("click", () => {
        editId = quiz.id;
        modalTitle.textContent = "Edit Quiz";
        input.value = quiz.name;
        modal.style.display = "flex";
        dropdown.style.display = "none";
      });

      dropdown.querySelector(".delete").addEventListener("click", () => {
        if (confirm(`Delete "${quiz.name}"?`)) {
          quizzes = quizzes.filter((q) => q.id !== quiz.id);
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
      modal.style.display = "flex";
    });
  }

  saveBtn.addEventListener("click", () => {
    const name = input.value.trim();
    if (!name) return;

    if (editId) {
      const quiz = quizzes.find((q) => q.id === editId);
      if (quiz) quiz.name = name;
    } else {
      quizzes.push({ id: Date.now(), name, questions: [] });
    }

    modal.style.display = "none";
    renderQuizzes();
  });

  closeBtn.addEventListener("click", () => (modal.style.display = "none"));

  document.addEventListener("click", () => {
    document
      .querySelectorAll(".dropdown")
      .forEach((dd) => (dd.style.display = "none"));
  });

  renderQuizzes();

  // ---------------- Take Quiz Logic ----------------
  const takeQuizBtn = document.getElementById("take-quiz-btn");
  const takeQuizModal = document.getElementById("take-quiz-modal");
  const closeTakeQuiz = takeQuizModal.querySelector(".close");
  const quizOptionsContainer = document.getElementById("quiz-options");
  const confirmTakeQuiz = document.getElementById("confirm-take-quiz");
  const cancelTakeQuiz = document.getElementById("cancel-take-quiz");

  takeQuizBtn.addEventListener("click", () => {
    quizOptionsContainer.innerHTML = "";
    quizzes.forEach((quiz) => {
      const option = document.createElement("div");

      option.innerHTML = `
        <label class="checkbox-container">
          <input type="checkbox" value="${quiz.id}" />
          ${quiz.name}
        </label>
      `;
      quizOptionsContainer.appendChild(option);
    });
    takeQuizModal.style.display = "flex";
  });

  closeTakeQuiz.addEventListener(
    "click",
    () => (takeQuizModal.style.display = "none")
  );
  cancelTakeQuiz.addEventListener(
    "click",
    () => (takeQuizModal.style.display = "none")
  );

  confirmTakeQuiz.addEventListener("click", () => {
    const selectedIds = [
      ...quizOptionsContainer.querySelectorAll("input:checked"),
    ].map((c) => parseInt(c.value));

    if (!selectedIds.length) {
      alert("Please select at least one topic to take the quiz.");
      return;
    }

    // Gather questions from selected quizzes and stamp quizId
    let selectedQuestions = [];
    selectedIds.forEach((id) => {
      const quiz = quizzes.find((q) => q.id === id);
      if (quiz) {
        quiz.questions.forEach((q) => {
          selectedQuestions.push({
            ...q,
            quizId: quiz.id, // 👈 stamp parent quizId
          });
        });
      }
    });

    // Shuffle questions
    selectedQuestions = selectedQuestions.sort(() => Math.random() - 0.5);

    // Store in localStorage
    localStorage.setItem(
      "currentQuiz",
      JSON.stringify({
        subjectId,
        subjectName,
        questions: selectedQuestions,
      })
    );

    // Navigate to take quiz page
    window.location.href = `take-quiz.html?subjectId=${subjectId}&subjectName=${encodeURIComponent(
      subjectName
    )}`;
  });
});
