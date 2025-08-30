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

async function loadQuestions() {
  const res = await fetch("../../data/quiz.json");
  const data = await res.json();

  const subject = data.subjects.find((s) => s.id === subjectId);
  if (!subject) return;

  const quiz = subject.quizzes.find((q) => q.id === quizId);
  if (!quiz) return;

  currentQuestions = quiz.questions || [];
  renderQuestions();
}

function renderQuestions() {
  container.innerHTML = "";
  currentQuestions.forEach((q) => {
    const card = document.createElement("div");
    card.classList.add("question-card");
    card.innerHTML = `
      <div class="question-text"><i class="fas fa-question"></i> ${
        q.question
      }</div>
      <ul class="answers">
        ${q.answers
          .map(
            (ans) =>
              `<li class="${ans === q.correct ? "correct" : ""}">${ans}</li>`
          )
          .join("")}
      </ul>
    `;
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
const closeBtn = modal.querySelector(".close");
const addQuestionBtn = document.getElementById("add-question-btn");
const questionInput = document.getElementById("question-input");
const answersContainer = document.getElementById("answers-container");
const addAnswerBtn = document.getElementById("add-answer-btn");
const saveBtn = document.getElementById("save-btn");
const saveNextBtn = document.getElementById("save-next-btn");

function resetModal() {
  questionInput.value = "";
  answersContainer.innerHTML = "";
  addAnswerField();
  addAnswerField();
}

function addAnswerField(value = "") {
  const wrapper = document.createElement("div");
  wrapper.classList.add("answer-field");
  wrapper.innerHTML = `
    <input type="radio" name="correct" />
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
  const answers = answerInputs.map((a) => a.value.trim()).filter(Boolean);

  const correctIndex = [
    ...answersContainer.querySelectorAll("input[type=radio]"),
  ].findIndex((r) => r.checked);

  if (!questionText || answers.length < 2 || correctIndex === -1) {
    alert(
      "Please fill in the question, add at least 2 answers, and select the correct one."
    );
    return;
  }

  const newQuestion = {
    id: Date.now(),
    question: questionText,
    answers,
    correct: answers[correctIndex],
  };

  currentQuestions.push(newQuestion);
  renderQuestions();

  if (closeAfter) {
    modal.style.display = "none";
  } else {
    resetModal();
  }
}

saveBtn.addEventListener("click", () => saveQuestion(true));
saveNextBtn.addEventListener("click", () => saveQuestion(false));

loadQuestions();
