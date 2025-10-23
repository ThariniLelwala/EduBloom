document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("subjects-container");
  const modal = document.getElementById("subject-modal");
  const modalTitle = document.getElementById("modal-title");
  const input = document.getElementById("subject-input");
  const saveBtn = document.getElementById("save-subject-btn");
  const closeBtn = document.querySelector(".modal-close");

  let subjects = [];
  let editId = null;

  // Load subjects from quiz.json (shared with students)
  async function loadSubjects() {
    try {
      const res = await fetch("/data/quiz.json");
      const data = await res.json();
      subjects = data.subjects || [];

      // Add any teacher-specific subjects from localStorage
      const teacherSubjects = localStorage.getItem("teacher_quiz_subjects");
      if (teacherSubjects) {
        const teacherData = JSON.parse(teacherSubjects);
        subjects = [...subjects, ...teacherData];
      }

      renderSubjects();
    } catch (error) {
      console.error("Error loading subjects:", error);
      // Fallback to localStorage if quiz.json fails
      const teacherSubjects = localStorage.getItem("teacher_quiz_subjects");
      subjects = teacherSubjects ? JSON.parse(teacherSubjects) : [];
      renderSubjects();
    }
  }

  // Save subjects to localStorage (only teacher-created subjects)
  function saveSubjects() {
    const teacherSubjects = subjects.filter((subj) => subj.id > 3);
    localStorage.setItem(
      "teacher_quiz_subjects",
      JSON.stringify(teacherSubjects)
    );
  }

  function renderSubjects() {
    container.innerHTML = "";

    subjects.forEach((subj) => {
      const card = document.createElement("div");
      card.classList.add("subject-card");

      // Check if this is a shared subject from quiz.json or teacher-created
      const isSharedSubject = subj.id <= 3; // Assuming quiz.json subjects have IDs 1, 2, 3

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

      // Toggle dropdown
      dots.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdown.style.display =
          dropdown.style.display === "block" ? "none" : "block";
      });

      // Edit subject
      dropdown.querySelector(".edit").addEventListener("click", () => {
        if (isSharedSubject) {
          alert("Cannot edit shared subjects. Create a new subject instead.");
          dropdown.style.display = "none";
          return;
        }
        editId = subj.id;
        modalTitle.textContent = "Edit Subject";
        input.value = subj.name;
        modal.style.display = "flex";
        dropdown.style.display = "none";
      });

      // Delete subject
      dropdown.querySelector(".delete").addEventListener("click", async () => {
        if (isSharedSubject) {
          alert("Cannot delete shared subjects.");
          dropdown.style.display = "none";
          return;
        }
        const confirmed = await showConfirmation(
          `Delete "${subj.name}" and all its quizzes?`,
          "Delete Subject"
        );
        if (confirmed) {
          subjects = subjects.filter((s) => s.id !== subj.id);
          saveSubjects();
          renderSubjects();
        }
        dropdown.style.display = "none";
      });

      // Navigate to quiz set page (click anywhere except dropdown)
      card.addEventListener("click", (e) => {
        if (e.target.closest(".dots") || e.target.closest(".dropdown")) return;
        window.location.href = `quiz-set.html?subjectId=${
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

  saveBtn.addEventListener("click", () => {
    const name = input.value.trim();
    if (!name) return;

    if (editId) {
      // Check if trying to edit a shared subject
      if (editId <= 3) {
        alert("Cannot edit shared subjects. Create a new subject instead.");
        modal.style.display = "none";
        return;
      }
      const subj = subjects.find((s) => s.id === editId);
      if (subj) subj.name = name;
    } else {
      subjects.push({ id: Date.now(), name, quizzes: [] });
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

  document.addEventListener("click", () => {
    document
      .querySelectorAll(".dropdown")
      .forEach((dd) => (dd.style.display = "none"));
  });

  loadSubjects();
});
