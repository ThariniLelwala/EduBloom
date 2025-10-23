document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("subjects-container");
  const modal = document.getElementById("subject-modal");
  const modalTitle = document.getElementById("modal-title");
  const input = document.getElementById("subject-input");
  const saveBtn = document.getElementById("save-subject-btn");
  const closeBtn = document.querySelector(".modal-close");

  let subjects = [];
  let editId = null;

  // Load subjects from JSON and published teacher quizzes
  async function loadSubjects() {
    const res = await fetch("/data/quiz.json");
    const data = await res.json();
    subjects = data.subjects;

    // Add published teacher quizzes
    const teacherSubjects = localStorage.getItem("teacher_quiz_subjects");
    if (teacherSubjects) {
      const teacherData = JSON.parse(teacherSubjects);
      teacherData.forEach((teacherSubject) => {
        // Check if subject already exists, if not create it
        let existingSubject = subjects.find(
          (s) => s.name.toLowerCase() === teacherSubject.name.toLowerCase()
        );
        if (!existingSubject) {
          existingSubject = {
            id: Date.now() + Math.random(),
            name: teacherSubject.name,
            quizzes: [],
          };
          subjects.push(existingSubject);
        }

        // Add published quizzes from this teacher subject
        teacherSubject.quizzes.forEach((quiz) => {
          if (quiz.published && quiz.questions && quiz.questions.length > 0) {
            // Check if quiz already exists (avoid duplicates)
            const quizExists = existingSubject.quizzes.some(
              (q) => q.name === quiz.name
            );
            if (!quizExists) {
              existingSubject.quizzes.push({
                ...quiz,
                teacherQuiz: true, // Mark as teacher-created quiz
              });
            }
          }
        });
      });
    }

    renderSubjects();
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
        editId = subj.id;
        modalTitle.textContent = "Edit Subject";
        input.value = subj.name;
        modal.style.display = "flex";
        dropdown.style.display = "none";
      });

      dropdown.querySelector(".delete").addEventListener("click", async () => {
        const confirmed = await showConfirmation(
          `Delete "${subj.name}" and all its quizzes?`,
          "Delete Subject"
        );
        if (confirmed) {
          subjects = subjects.filter((s) => s.id !== subj.id);
          renderSubjects();
        }
        dropdown.style.display = "none";
      });

      // Navigate to quiz set page
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
      const subj = subjects.find((s) => s.id === editId);
      if (subj) subj.name = name; // Fixed: ensure subj exists
    } else {
      subjects.push({ id: Date.now(), name, quizzes: [] });
    }

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
