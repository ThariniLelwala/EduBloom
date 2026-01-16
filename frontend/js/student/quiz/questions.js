const backBtn = document.getElementById("back-btn");
const subjectHeading = document.getElementById("subject-name");
const container = document.getElementById("subjects-container");

const params = new URLSearchParams(window.location.search);
const subjectId = parseInt(params.get("subjectId")) || 1;
const subjectName = params.get("subjectName") || "Unknown Subject";
const quizId = parseInt(params.get("quizId")) || 0;
const quizName = params.get("quizName") || "Quiz";

subjectHeading.textContent = quizName;

let currentQuestions = [];
let editingId = null; // Track which question is being edited

// Check authentication
function checkAuth() {
  const token = localStorage.getItem("authToken");
  if (!token) {
    window.location.href = "/login.html";
    return false;
  }
  return true;
}

async function loadQuestions() {
  try {
    if (!checkAuth()) return;

    const questions_data = await studentQuizApi.getQuestions(quizId);
    currentQuestions = questions_data;
    renderQuestions();
  } catch (error) {
    console.error("Error loading questions:", error);
    alert("Failed to load questions: " + error.message);
    currentQuestions = [];
    renderQuestions();
  }
}

function renderQuestions() {
  container.innerHTML = "";
  currentQuestions.forEach((q, i) => {
    const card = document.createElement("div");
    card.classList.add("question-card");

    // Find the correct answer
    const correctAnswer = q.answers.find((a) => a.is_correct);

    card.innerHTML = `
    <div class="question-header">
      <div class="question-text">
      ${i + 1}. ${q.question_text}
      </div>
      <div class="question-actions">
        <i class="edit-btn fas fa-edit icon-btn"></i>
        <i class="delete-btn fas fa-trash icon-btn"></i>
      </div>
    </div>
      <ul class="answers">
        ${q.answers
          .map(
            (ans) =>
              `<li class="${ans.is_correct ? "correct" : ""}">${ans.answer_text}</li>`
          )
          .join("")}
      </ul>
    `;

    // Edit button
    card.querySelector(".edit-btn").addEventListener("click", () => {
      openEditModal(q.id);
    });

    // Delete button with confirmation showing question text
    card.querySelector(".delete-btn").addEventListener("click", async () => {
      const confirmed = await showConfirmation(
        `Are you sure you want to delete this question?\n\n"${q.question_text}"`,
        "Delete Question"
      );
      if (confirmed) {
        try {
          await studentQuizApi.deleteQuestion(q.id);
          loadQuestions(); // Reload from backend
        } catch (error) {
          alert("Failed to delete question: " + error.message);
        }
      }
    });

    container.appendChild(card);
  });
}

// Back button
backBtn.addEventListener("click", () => {
  window.location.href = `quiz-set.html?subjectId=${subjectId}&subjectName=${encodeURIComponent(
    subjectName
  )}`;
});

// ------------------- Modal Logic -------------------
const modal = document.getElementById("question-modal");
const closeBtn = modal.querySelector(".modal-close");
const addQuestionBtn = document.getElementById("add-question-btn");
const questionInput = document.getElementById("question-input");
const answersContainer = document.getElementById("answers-container");
const addAnswerBtn = document.getElementById("add-answer-btn");
const saveBtn = document.getElementById("save-btn");
const saveNextBtn = document.getElementById("save-next-btn");

function resetModal() {
  editingId = null; // Reset editing state
  questionInput.value = "";
  answersContainer.innerHTML = "";
  addAnswerField();
  addAnswerField();
}

function addAnswerField(value = "", checked = false) {
  const wrapper = document.createElement("div");
  wrapper.classList.add("answer-field");
  wrapper.innerHTML = `
    <input type="radio" name="correct" ${checked ? "checked" : ""}/>
    <input type="text" class="answer-input" value="${value}" placeholder="Answer option" />
    <button class="remove-answer">&times;</button>
  `;
  answersContainer.appendChild(wrapper);

  wrapper
    .querySelector(".remove-answer")
    .addEventListener("click", () => wrapper.remove());
}

addAnswerBtn.addEventListener("click", () => addAnswerField());

addQuestionBtn.addEventListener("click", () => {
  resetModal();
  modal.style.display = "flex";
});

closeBtn.addEventListener("click", () => (modal.style.display = "none"));

async function saveQuestion(closeAfter = true) {
  const questionText = questionInput.value.trim();
  const answerInputs = [...answersContainer.querySelectorAll(".answer-input")];
  const answerTexts = answerInputs.map((a) => a.value.trim()).filter(Boolean);

  const correctIndex = [
    ...answersContainer.querySelectorAll("input[type=radio]"),
  ].findIndex((r) => r.checked);

  if (!questionText || answerTexts.length < 2 || correctIndex === -1) {
    alert(
      "Please fill in the question, add at least 2 answers, and select the correct one."
    );
    return;
  }

  // Build answers array in backend format
  const answers = answerTexts.map((text, index) => ({
    text: text,
    is_correct: index === correctIndex,
  }));

  try {
    if (editingId) {
      // Update existing question
      await studentQuizApi.updateQuestion(editingId, {
        question_text: questionText,
        answers: answers,
      });
      editingId = null;
    } else {
      // Create new question
      await studentQuizApi.createQuestion(quizId, questionText, answers);
    }

    loadQuestions(); // Reload from backend

    if (closeAfter) {
      modal.style.display = "none";
    } else {
      resetModal();
    }
  } catch (error) {
    alert("Failed to save question: " + error.message);
  }
}

saveBtn.addEventListener("click", () => saveQuestion(true));
saveNextBtn.addEventListener("click", () => saveQuestion(false));

// Load question into modal for editing
function openEditModal(id) {
  const q = currentQuestions.find((ques) => ques.id === id);
  if (!q) return;

  editingId = id;
  questionInput.value = q.question_text;
  answersContainer.innerHTML = "";

  q.answers.forEach((ans) => {
    addAnswerField(ans.answer_text, ans.is_correct);
  });

  modal.style.display = "flex";
}

loadQuestions();
