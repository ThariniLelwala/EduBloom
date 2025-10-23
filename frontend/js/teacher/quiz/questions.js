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

async function loadQuestions() {
  try {
    const quiz = await QuizAPI.getQuizSet(quizId);
    currentQuestions = quiz.questions || [];
    renderQuestions();
  } catch (error) {
    console.error("Error loading questions:", error);
    showMessage(error.message, "error");
  }
}

function renderQuestions() {
  container.innerHTML = "";
  currentQuestions.forEach((q, i) => {
    const card = document.createElement("div");
    card.classList.add("question-card");
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
              `<li class="${ans.is_correct ? "correct" : ""}">${
                ans.answer_text
              }</li>`
          )
          .join("")}
      </ul>
    `;

    // Edit button
    card.querySelector(".edit-btn").addEventListener("click", () => {
      openEditModal(q.id);
    });

    // Delete button with confirmation
    card.querySelector(".delete-btn").addEventListener("click", async () => {
      if (
        await showConfirmation(
          `Are you sure you want to delete this question?\n\n"${q.question_text}"`
        )
      ) {
        try {
          await QuizAPI.deleteQuestion(q.id);
          currentQuestions = currentQuestions.filter(
            (ques) => ques.id !== q.id
          );
          renderQuestions();
        } catch (error) {
          showMessage(error.message, "error");
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

function saveQuestion(closeAfter = true) {
  const questionText = questionInput.value.trim();
  const answerInputs = [...answersContainer.querySelectorAll(".answer-input")];
  const answers = answerInputs
    .map((a, idx) => ({
      text: a.value.trim(),
      is_correct:
        answersContainer.querySelectorAll("input[type=radio]")[idx].checked,
    }))
    .filter((ans) => ans.text);

  const correctCount = answers.filter((a) => a.is_correct).length;

  if (!questionText || answers.length < 2 || correctCount !== 1) {
    showMessage(
      "Please fill in the question, add at least 2 answers, and select exactly one correct answer.",
      "error"
    );
    return;
  }

  if (editingId) {
    // Update existing question
    saveEditedQuestion(questionText, answers, closeAfter);
  } else {
    // Create new question
    saveNewQuestion(questionText, answers, closeAfter);
  }
}

async function saveNewQuestion(questionText, answers, closeAfter) {
  try {
    const newQuestion = await QuizAPI.createQuestion(
      quizId,
      questionText,
      answers
    );
    currentQuestions.push(newQuestion);
    renderQuestions();

    if (closeAfter) {
      modal.style.display = "none";
    } else {
      resetModal();
    }
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function saveEditedQuestion(questionText, answers, closeAfter) {
  try {
    const updated = await QuizAPI.updateQuestion(
      editingId,
      questionText,
      answers
    );
    const index = currentQuestions.findIndex((q) => q.id === editingId);
    if (index !== -1) {
      currentQuestions[index] = updated;
    }
    editingId = null;
    renderQuestions();

    if (closeAfter) {
      modal.style.display = "none";
    } else {
      resetModal();
    }
  } catch (error) {
    showMessage(error.message, "error");
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

if (checkAuth()) {
  loadQuestions();
}
