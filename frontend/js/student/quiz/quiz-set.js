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

  function checkAuth() {
    const token = localStorage.getItem("authToken");
    if (!token) {
      window.location.href = "/login.html";
      return false;
    }
    return true;
  }

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

  async function loadQuizHistory() {
    try {
      const quizIds = quizzes.map(q => q.id);
      if (quizIds.length === 0) return;

      const attempts = await studentQuizApi.getAttemptsBySets(quizIds);
      renderQuizHistory(attempts);
    } catch (error) {
      console.error("Error loading quiz history:", error);
    }
  }

  function renderQuizHistory(attempts) {
    const historySection = document.getElementById("quiz-history-section");
    const historyContainer = document.getElementById("quiz-history-container");

    if (!attempts || attempts.length === 0) {
      historySection.style.display = "none";
      return;
    }

    historySection.style.display = "block";
    historyContainer.innerHTML = "";

    attempts.slice(0, 10).forEach(attempt => {
      const item = document.createElement("div");
      item.className = "history-item";
      
      const percentage = parseFloat(attempt.score_percentage) || 0;
      const scoreClass = percentage >= 70 ? "good" : percentage >= 50 ? "ok" : "low";
      const date = new Date(attempt.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });

      item.innerHTML = `
        <div class="history-score ${scoreClass}">
          <span class="score-value">${percentage}%</span>
        </div>
        <div class="history-details">
          <span class="history-quiz">${attempt.quiz_names?.join(", ") || "Quiz"}</span>
          <span class="history-meta">${attempt.correct_answers}/${attempt.total_questions} correct</span>
          <span class="history-date">${date}</span>
        </div>
      `;
      historyContainer.appendChild(item);
    });
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
              loadQuizzes();
            } catch (error) {
              alert("Failed to delete quiz: " + error.message);
            }
          }
          dropdown.style.display = "none";
        });

      card.addEventListener("click", (e) => {
        if (e.target.closest(".dots") || e.target.closest(".dropdown")) return;
        window.location.href = `questions.html?subjectId=${subjectId}&quizId=${
          quiz.id
        }&quizName=${encodeURIComponent(
          quiz.name
        )}&subjectName=${encodeURIComponent(subjectName)}`;
      });
    });

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
        await studentQuizApi.updateQuizSet(editId, { name });
      } else {
        await studentQuizApi.createQuizSet(subjectId, name);
      }

      modal.style.display = "none";
      loadQuizzes();
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

  await loadQuizzes();
  await loadQuizHistory();

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
      let selectedQuestions = [];
      for (const quizId of selectedIds) {
        const quizData = await studentQuizApi.getQuizSet(quizId);
        if (quizData.questions && quizData.questions.length > 0) {
          quizData.questions.forEach((q) => {
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

      selectedQuestions = selectedQuestions.sort(() => Math.random() - 0.5);

      localStorage.setItem(
        "currentQuiz",
        JSON.stringify({
          subjectId,
          subjectName,
          questions: selectedQuestions,
        })
      );

      window.location.href = `take-quiz.html?subjectId=${subjectId}&subjectName=${encodeURIComponent(
        subjectName
      )}`;
    } catch (error) {
      alert("Error preparing quiz: " + error.message);
    }
  });
});
