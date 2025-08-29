const backBtn = document.getElementById("back-btn");
const subjectHeading = document.getElementById("subject-name");
const container = document.getElementById("subjects-container");

const params = new URLSearchParams(window.location.search);
const subjectId = parseInt(params.get("subjectId")) || 1;
const subjectName = params.get("subjectName") || "Unknown Subject";
const quizId = parseInt(params.get("quizId")) || 0;
const quizName = params.get("quizName") || "Quiz";

// Set heading
subjectHeading.textContent = quizName;

async function loadQuestions() {
  const res = await fetch("../../data/quiz.json");
  const data = await res.json();

  const subject = data.subjects.find((s) => s.id === subjectId);
  if (!subject) return;

  const quiz = subject.quizzes.find((q) => q.id === quizId);
  if (!quiz) return;

  renderQuestions(quiz.questions);
}

function renderQuestions(questions) {
  container.innerHTML = "";
  questions.forEach((q) => {
    const card = document.createElement("div");
    card.classList.add("subject-card");
    card.innerHTML = `
      <div class="subject-header">
        <i class="fas fa-question"></i>
        <span>${q.question}</span>
      </div>
      <ul>
        ${q.answers
          .map((ans) => `<li>${ans} ${ans === q.correct ? "(✔)" : ""}</li>`)
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

loadQuestions();
