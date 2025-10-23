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
    console.log("Loading flashcards - subjectId:", subjectId, "setId:", setId);

    const res = await fetch("../../../../data/flashcards.json");
    const data = await res.json();

    console.log("Fetched data:", data);

    const subject = data.subjects.find((s) => s.id === subjectId);
    console.log("Found subject:", subject);

    if (!subject) {
      console.warn("Subject not found");
      currentCards = [];
      renderCards();
      return;
    }

    const set = subject.sets.find((s) => s.id === setId);
    console.log("Found set:", set);

    if (!set) {
      console.warn("Set not found");
      currentCards = [];
      renderCards();
      return;
    }

    currentCards = set.cards || [];
    console.log("Loaded cards:", currentCards);
    renderCards();
  } catch (error) {
    console.error("Error loading flashcards:", error);
    currentCards = [];
    renderCards();
  }
}

function renderCards() {
  container.innerHTML = "";

  console.log("renderCards called with", currentCards.length, "cards");

  if (currentCards.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: rgba(255, 255, 255, 0.6);">
        <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
        <p>No flashcards in this set yet</p>
        <small>Click "Add Flashcard" to create one</small>
      </div>
    `;
    return;
  }

  currentCards.forEach((card, i) => {
    const cardElement = document.createElement("div");
    cardElement.classList.add("flashcard-item");
    cardElement.innerHTML = `
    <div class="flashcard-card">
      <div class="flashcard-front">
        <div class="flashcard-content">
          <div class="flashcard-label">Question</div>
          <div class="flashcard-question">${card.question}</div>
        </div>
      </div>
      <div class="flashcard-back">
        <div class="flashcard-content">
          <div class="flashcard-label">Answer</div>
          <div class="flashcard-answer">${card.answer}</div>
        </div>
      </div>
    </div>
    <div class="flashcard-actions">
      <i class="edit-btn fas fa-edit icon-btn" title="Edit flashcard"></i>
      <i class="delete-btn fas fa-trash icon-btn" title="Delete flashcard"></i>
    </div>
    `;

    // Flip card on click
    const cardFlip = cardElement.querySelector(".flashcard-card");
    cardFlip.addEventListener("click", () => {
      cardFlip.classList.toggle("flipped");
    });

    // Edit button
    cardElement.querySelector(".edit-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      openEditModal(card.id);
    });

    // Delete button with confirmation
    cardElement
      .querySelector(".delete-btn")
      .addEventListener("click", async (e) => {
        e.stopPropagation();
        const confirmed = await showConfirmation(
          `Are you sure you want to delete this flashcard?\n\n"${card.question}"`,
          "Delete Flashcard"
        );
        if (confirmed) {
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
