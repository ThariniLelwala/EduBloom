document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("subjects-container");
  const modal = document.getElementById("subject-modal");
  const modalTitle = document.getElementById("modal-title");
  const input = document.getElementById("subject-input");
  const saveBtn = document.getElementById("save-subject-btn");
  const closeBtn = document.querySelector(".close");

  // Demo subjects
  let subjects = [
    { id: 1, name: "Mathematics" },
    { id: 2, name: "Science" },
    { id: 3, name: "History" },
  ];

  let editId = null;

  function renderSubjects() {
    container.innerHTML = "";

    // Subject cards
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
            <li class="edit">Edit</li>
            <li class="delete">Delete</li>
          </ul>
        </div>
      `;
      container.appendChild(card);

      const dots = card.querySelector(".dots");
      const dropdown = card.querySelector(".dropdown");

      // Dropdown toggle
      dots.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdown.style.display =
          dropdown.style.display === "block" ? "none" : "block";
      });

      // Edit option
      dropdown.querySelector(".edit").addEventListener("click", () => {
        editId = subj.id;
        modalTitle.textContent = "Edit Subject";
        input.value = subj.name;
        modal.style.display = "flex";
        dropdown.style.display = "none";
      });

      // Delete option
      dropdown.querySelector(".delete").addEventListener("click", () => {
        if (confirm(`Delete "${subj.name}" and all its quizzes?`)) {
          subjects = subjects.filter((s) => s.id !== subj.id);
          renderSubjects();
        }
        dropdown.style.display = "none";
      });

      // Card click navigates to quiz-set.html
      card.addEventListener("click", (e) => {
        if (e.target.closest(".dots") || e.target.closest(".dropdown")) return;
        // For now, all subjects go to same page
        window.location.href =
          "quiz-set.html?subjectId=" +
          subj.id +
          "&subjectName=" +
          encodeURIComponent(subj.name);
      });
    });

    // Add card
    const addCard = document.createElement("div");
    addCard.classList.add("subject-card", "add-card");
    addCard.innerHTML = `<i class="fas fa-plus"></i><span>Add Card</span>`;
    container.appendChild(addCard);

    addCard.addEventListener("click", () => {
      editId = null;
      modalTitle.textContent = "Add Subject";
      input.value = "";
      modal.style.display = "flex";
    });
  }

  // Save button
  saveBtn.addEventListener("click", () => {
    const name = input.value.trim();
    if (!name) return;

    if (editId) {
      const subj = subjects.find((s) => s.id === editId);
      subj.name = name;
    } else {
      subjects.push({ id: Date.now(), name });
    }

    modal.style.display = "none";
    renderSubjects();
  });

  // Close modal
  closeBtn.addEventListener("click", () => (modal.style.display = "none"));

  // Close dropdowns when clicking outside
  document.addEventListener("click", () => {
    document
      .querySelectorAll(".dropdown")
      .forEach((dd) => (dd.style.display = "none"));
  });

  renderSubjects();
});
