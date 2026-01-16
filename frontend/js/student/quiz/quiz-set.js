document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("subjects-container");
  const modal = document.getElementById("subject-modal");
  const modalTitle = document.getElementById("modal-title");
  const input = document.getElementById("subject-input");
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
    if (!token) {
      window.location.href = "/login.html";
      return false;
    }
    return true;
  }

  // Load data from backend
  async function loadQuizzes() {
    try {
      if (!checkAuth()) return;

      const quizzes_data = await studentQuizApi.getQuizSets(subjectId);
      quizzes = quizzes_data;
      renderQuizzes();
    } catch (error) {
      console.error("Error loading quiz sets:", error);
      alert("Failed to load quiz sets: " + error.message);
      quizzes = [];
      renderQuizzes();
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

      dropdown
        .querySelector(".delete")
        .addEventListener("click", async () => {
          const confirmed = await showConfirmation(
            `Delete "${quiz.name}"?`,
            "Delete Quiz"
          );
          if (confirmed) {
            try {
              await studentQuizApi.deleteQuizSet(quiz.id);
              loadQuizzes(); // Reload from backend
            } catch (error) {
              alert("Failed to delete quiz: " + error.message);
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
      modal.style.display = "flex";
    });
  }

  saveBtn.addEventListener("click", async () => {
    const name = input.value.trim();
    if (!name) {
      alert("Please enter a quiz name");
      return;
    }

    try {
      if (editId) {
        // Update existing quiz set
        await studentQuizApi.updateQuizSet(editId, { name });
      } else {
        // Create new quiz set
        await studentQuizApi.createQuizSet(subjectId, name);
      }

      modal.style.display = "none";
      loadQuizzes(); // Reload from backend
    } catch (error) {
      alert("Failed to save quiz: " + error.message);
    }
  });

  closeBtn.addEventListener("click", () => (modal.style.display = "none"));

  document.addEventListener("click", () => {
    document
      .querySelectorAll(".dropdown")
      .forEach((dd) => (dd.style.display = "none"));
  });

  // Load initial data
  await loadQuizzes();

  // ---------------- Take Quiz Logic ----------------
  const takeQuizBtn = document.getElementById("take-quiz-btn");
  const takeQuizModal = document.getElementById("take-quiz-modal");
  const closeTakeQuiz = takeQuizModal.querySelector(".modal-close");
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
          ${quiz.name} (${quiz.question_count || 0} questions)
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

  confirmTakeQuiz.addEventListener("click", async () => {
    const selectedIds = [
      ...quizOptionsContainer.querySelectorAll("input:checked"),
    ].map((c) => parseInt(c.value));

    if (!selectedIds.length) {
      alert("Please select at least one quiz to take.");
      return;
    }

    try {
      // Gather questions from selected quizzes
      let selectedQuestions = [];
      for (const quizId of selectedIds) {
        const quizData = await studentQuizApi.getQuizSet(quizId);
        if (quizData.questions && quizData.questions.length > 0) {
          quizData.questions.forEach((q) => {
            // Transform backend format to frontend format
            const correctAnswer = q.answers.find((a) => a.is_correct);
            selectedQuestions.push({
              id: q.id,
              question: q.question_text,
              answers: q.answers.map((a) => a.answer_text),
              correct: correctAnswer ? correctAnswer.answer_text : null,
              quizId: quizId,
            });
          });
        }
      }

      if (selectedQuestions.length === 0) {
        alert("The selected quizzes have no questions.");
        return;
      }

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
    } catch (error) {
      alert("Error preparing quiz: " + error.message);
    }
  });
});
