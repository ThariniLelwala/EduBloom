const backBtn = document.getElementById("back-btn");
const subjectHeading = document.getElementById("subject-name");
const container = document.getElementById("subjects-container");

const params = new URLSearchParams(window.location.search);
const subjectId = parseInt(params.get("subjectId")) || 1;
const subjectName = params.get("subjectName") || "Unknown Subject";
const setId = parseInt(params.get("setId")) || 0;
const setName = params.get("setName") || "Flashcard Set";

subjectHeading.textContent = setName;

let currentCards = [];
let editingId = null;

async function loadCards() {
  try {
    const res = await fetch("/data/flashcards.json");
    const data = await res.json();

    const subject = data.subjects.find((s) => s.id === subjectId);
    if (!subject) return;

    const set = subject.sets.find((s) => s.id === setId);
    if (!set) return;

    currentCards = set.cards || [];
    renderCards();
  } catch (error) {
    console.error("Error loading flashcards:", error);
    currentCards = [];
    renderCards();
  }
}

function renderCards() {
  container.innerHTML = "";
  currentCards.forEach((card, i) => {
    const cardElement = document.createElement("div");
    cardElement.classList.add("flashcard-item");
    cardElement.innerHTML = `
    <div class="flashcard-header">
      <div class="flashcard-text">
        <div class="flashcard-label">Question</div>
        <div class="flashcard-question">${card.question}</div>
        <div class="flashcard-label">Answer</div>
        <div class="flashcard-answer">${card.answer}</div>
      </div>
      <div class="flashcard-actions">
        <i class="edit-btn fas fa-edit icon-btn" title="Edit flashcard"></i>
        <i class="delete-btn fas fa-trash icon-btn" title="Delete flashcard"></i>
      </div>
    </div>
    `;

    // Edit button
    cardElement.querySelector(".edit-btn").addEventListener("click", () => {
      openEditModal(card.id);
    });

    // Delete button with confirmation
    cardElement.querySelector(".delete-btn").addEventListener("click", () => {
      if (
        confirm(
          `Are you sure you want to delete this flashcard?\n\n"${card.question}"`
        )
      ) {
        currentCards = currentCards.filter((c) => c.id !== card.id);
        renderCards();
      }
    });

    container.appendChild(cardElement);
  });
}

// Back button
backBtn.addEventListener("click", () => {
  window.location.href = `flashcard-set.html?subjectId=${subjectId}&subjectName=${encodeURIComponent(
    subjectName
  )}`;
});

// ------------------- Modal Logic -------------------
const modal = document.getElementById("flashcard-modal");
const closeBtn = modal.querySelector(".modal-close");
const addFlashcardBtn = document.getElementById("add-flashcard-btn");
const questionInput = document.getElementById("question-input");
const answerInput = document.getElementById("answer-input");
const saveBtn = document.getElementById("save-btn");
const saveNextBtn = document.getElementById("save-next-btn");

function resetModal() {
  editingId = null;
  questionInput.value = "";
  answerInput.value = "";
}

addFlashcardBtn.addEventListener("click", () => {
  resetModal();
  modal.style.display = "flex";
});

closeBtn.addEventListener("click", () => (modal.style.display = "none"));

function saveCard(closeAfter = true) {
  const questionText = questionInput.value.trim();
  const answerText = answerInput.value.trim();

  if (!questionText || !answerText) {
    alert("Please fill in both the question and answer fields.");
    return;
  }

  if (editingId) {
    // Update existing card
    const cardIndex = currentCards.findIndex((c) => c.id === editingId);
    if (cardIndex !== -1) {
      currentCards[cardIndex] = {
        id: editingId,
        question: questionText,
        answer: answerText,
      };
    }
    editingId = null;
  } else {
    // Create new card
    const newCard = {
      id: Date.now(),
      question: questionText,
      answer: answerText,
    };
    currentCards.push(newCard);
  }

  renderCards();

  if (closeAfter) {
    modal.style.display = "none";
  } else {
    resetModal();
  }
}

saveBtn.addEventListener("click", () => saveCard(true));
saveNextBtn.addEventListener("click", () => saveCard(false));

// Load card into modal for editing
function openEditModal(id) {
  const card = currentCards.find((c) => c.id === id);
  if (!card) return;

  editingId = id;
  questionInput.value = card.question;
  answerInput.value = card.answer;

  modal.style.display = "flex";
}

loadCards();
