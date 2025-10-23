// ../../../js/marks/mark-tracker.js
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("subjects-container");
  const modal = document.getElementById("subject-modal");
  const modalTitle = document.getElementById("modal-title");
  const input = document.getElementById("subject-input");
  const saveBtn = document.getElementById("save-subject-btn");
  const closeBtn = document.querySelector(".modal-close");

  let subjects = [];
  let editId = null;

  // Load subjects from localStorage or JSON
  async function loadSubjects() {
    try {
      // Try to load from localStorage first
      const stored = localStorage.getItem("markTrackerSubjects");
      if (stored) {
        subjects = JSON.parse(stored);
      } else {
        // Fallback to JSON file
        const res = await fetch("../../../data/mark-tracker.json");
        const data = await res.json();
        subjects = data.subjects || [];
      }
      renderSubjects();
    } catch (error) {
      console.error("Error loading mark tracker data:", error);
      subjects = [];
      renderSubjects();
    }
  }

  function renderSubjects() {
    container.innerHTML = "";

    subjects.forEach((subj) => {
      const card = document.createElement("div");
      card.classList.add("subject-card");
      card.innerHTML = `
        <div class="subject-header">
          <i class="fas fa-folder"></i>
          <span>${subj.name}</span>
        </div>
        <i class="fas fa-ellipsis-v dots"></i>
        <div class="dropdown">
          <ul>
            <li class="edit"><i class="fa fa-pencil"></i> Edit</li>
            <li class="delete"><i class="fa fa-trash"></i> Delete</li>
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
        editId = subj.id;
        modalTitle.textContent = "Edit Subject";
        input.value = subj.name;
        modal.style.display = "flex";
        dropdown.style.display = "none";
      });

      dropdown.querySelector(".delete").addEventListener("click", async () => {
        const confirmed = await showConfirmation(
          `Delete "${subj.name}" and all its marks?`,
          "Delete Subject"
        );
        if (confirmed) {
          subjects = subjects.filter((s) => s.id !== subj.id);
          saveSubjects();
          renderSubjects();
        }
        dropdown.style.display = "none";
      });

      // Navigate to subject marks page
      card.addEventListener("click", (e) => {
        if (e.target.closest(".dots") || e.target.closest(".dropdown")) return;
        window.location.href = `mark-tracker-subject.html?subjectId=${
          subj.id
        }&subjectName=${encodeURIComponent(subj.name)}`;
      });
    });

    // Add card
    const addCard = document.createElement("div");
    addCard.classList.add("subject-card", "add-card");
    addCard.innerHTML = `<i class="fas fa-plus"></i><span>Add Subject</span>`;
    container.appendChild(addCard);

    addCard.addEventListener("click", () => {
      editId = null;
      modalTitle.textContent = "Add Subject";
      input.value = "";
      modal.style.display = "flex";
    });
  }

  function saveSubjects() {
    localStorage.setItem("markTrackerSubjects", JSON.stringify(subjects));
  }

  saveBtn.addEventListener("click", () => {
    const name = input.value.trim();
    if (!name) return;

    if (editId) {
      const subj = subjects.find((s) => s.id === editId);
      if (subj) subj.name = name;
    } else {
      subjects.push({ id: Date.now(), name, tests: [] });
    }

    saveSubjects();
    modal.style.display = "none";
    renderSubjects();
  });

  closeBtn.addEventListener("click", () => (modal.style.display = "none"));

  document.addEventListener("click", () => {
    document
      .querySelectorAll(".dropdown")
      .forEach((dd) => (dd.style.display = "none"));
  });

  loadSubjects();
});
