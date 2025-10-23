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

  let sets = [];
  let editId = null;

  // Load data from JSON
  try {
    const res = await fetch("/data/flashcards.json");
    const data = await res.json();
    const subject = data.subjects.find((s) => s.id === subjectId);
    if (subject) sets = subject.sets;
  } catch (error) {
    console.error("Error loading flashcard sets:", error);
    sets = [];
  }

  function renderSets() {
    container.innerHTML = "";

    sets.forEach((set) => {
      const card = document.createElement("div");
      card.classList.add("subject-card");
      // Using quiz-set structure with card count
      card.innerHTML = `
        <div class="subject-header">
          <i class="fas fa-sticky-note"></i>
          <span>${set.name}</span>
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
        editId = set.id;
        modalTitle.textContent = "Edit Flashcard Set";
        input.value = set.name;
        modal.style.display = "flex";
        dropdown.style.display = "none";
      });

      dropdown.querySelector(".delete").addEventListener("click", async () => {
        const confirmed = await showConfirmation(
          `Delete "${set.name}"?`,
          "Delete Flashcard Set"
        );
        if (confirmed) {
          sets = sets.filter((s) => s.id !== set.id);
          renderSets();
        }
        dropdown.style.display = "none";
      });

      // Navigate to flashcards page
      card.addEventListener("click", (e) => {
        if (e.target.closest(".dots") || e.target.closest(".dropdown")) return;
        window.location.href = `flashcard-items.html?subjectId=${subjectId}&setId=${
          set.id
        }&setName=${encodeURIComponent(
          set.name
        )}&subjectName=${encodeURIComponent(subjectName)}`;
      });
    });

    // Add Set card
    const addCard = document.createElement("div");
    addCard.classList.add("subject-card", "add-card");
    addCard.innerHTML = `<i class="fas fa-plus"></i><span>Add Set</span>`;
    container.appendChild(addCard);

    addCard.addEventListener("click", () => {
      editId = null;
      modalTitle.textContent = "Add Flashcard Set";
      input.value = "";
      modal.style.display = "flex";
    });
  }

  saveBtn.addEventListener("click", () => {
    const name = input.value.trim();
    if (!name) return;

    if (editId) {
      const set = sets.find((s) => s.id === editId);
      if (set) set.name = name;
    } else {
      sets.push({ id: Date.now(), name, cards: [] });
    }

    modal.style.display = "none";
    renderSets();
  });

  closeBtn.addEventListener("click", () => (modal.style.display = "none"));

  document.addEventListener("click", () => {
    document
      .querySelectorAll(".dropdown")
      .forEach((dd) => (dd.style.display = "none"));
  });

  renderSets();

  // ---------------- Study Flashcards Logic ----------------
  const studyFlashcardsBtn = document.getElementById("study-flashcards-btn");
  const studyFlashcardsModal = document.getElementById(
    "study-flashcards-modal"
  );
  const closeStudyFlashcards =
    studyFlashcardsModal.querySelector(".modal-close");
  const flashcardOptionsContainer =
    document.getElementById("flashcard-options");
  const confirmStudyFlashcards = document.getElementById(
    "confirm-study-flashcards"
  );
  const cancelStudyFlashcards = document.getElementById(
    "cancel-study-flashcards"
  );

  studyFlashcardsBtn.addEventListener("click", () => {
    flashcardOptionsContainer.innerHTML = "";
    sets.forEach((set) => {
      const option = document.createElement("div");

      option.innerHTML = `
        <label class="checkbox-container">
          <input type="checkbox" value="${set.id}" />
          ${set.name} (${set.cards ? set.cards.length : 0} cards)
        </label>
      `;
      flashcardOptionsContainer.appendChild(option);
    });
    studyFlashcardsModal.style.display = "flex";
  });

  closeStudyFlashcards.addEventListener(
    "click",
    () => (studyFlashcardsModal.style.display = "none")
  );
  cancelStudyFlashcards.addEventListener(
    "click",
    () => (studyFlashcardsModal.style.display = "none")
  );

  confirmStudyFlashcards.addEventListener("click", () => {
    const selectedIds = [
      ...flashcardOptionsContainer.querySelectorAll("input:checked"),
    ].map((c) => parseInt(c.value));

    if (!selectedIds.length) {
      alert("Please select at least one set to study.");
      return;
    }

    // Gather cards from selected sets
    let selectedCards = [];
    let selectedSetNames = [];
    selectedIds.forEach((id) => {
      const set = sets.find((s) => s.id === id);
      if (set && set.cards) {
        selectedCards = selectedCards.concat(set.cards);
        selectedSetNames.push(set.name);
      }
    });

    if (!selectedCards.length) {
      alert("The selected sets don't contain any flashcards.");
      return;
    }

    // Shuffle cards
    selectedCards = selectedCards
      .map((c) => ({ ...c }))
      .sort(() => Math.random() - 0.5);

    // Store in localStorage
    localStorage.setItem(
      "currentFlashcards",
      JSON.stringify({
        subjectId,
        subjectName,
        setNames: selectedSetNames,
        cards: selectedCards,
      })
    );

    // Navigate to study flashcards page
    window.location.href = `study-flashcards.html?subjectId=${subjectId}&subjectName=${encodeURIComponent(
      subjectName
    )}`;
  });
});
