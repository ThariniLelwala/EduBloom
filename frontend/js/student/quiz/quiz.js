document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("subjects-container");
  const modal = document.getElementById("subject-modal");
  const modalTitle = document.getElementById("modal-title");
  const input = document.getElementById("subject-input");
  const saveBtn = document.getElementById("save-subject-btn");
  const closeBtn = document.querySelector(".modal-close");

  let subjects = [];
  let editId = null;

  // Check authentication
  function checkAuth() {
    const token = localStorage.getItem("authToken");
    if (!token) {
      window.location.href = "/login.html";
      return false;
    }
    return true;
  }

  // Load subjects from backend
  async function loadSubjects() {
    try {
      if (!checkAuth()) return;

      const subjects_data = await studentQuizApi.getSubjects();
      subjects = subjects_data;
      renderSubjects();
    } catch (error) {
      console.error("Error loading quiz subjects:", error);
      alert("Failed to load quiz subjects: " + error.message);
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
          try {
            await studentQuizApi.deleteSubject(subj.id);
            loadSubjects(); // Reload from backend
          } catch (error) {
            alert("Failed to delete subject: " + error.message);
          }
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

  saveBtn.addEventListener("click", async () => {
    const name = input.value.trim();
    if (!name) {
      alert("Please enter a subject name");
      return;
    }

    try {
      if (editId) {
        // Update existing subject
        await studentQuizApi.updateSubject(editId, { name });
      } else {
        // Create new subject
        await studentQuizApi.createSubject(name);
      }

      modal.style.display = "none";
      loadSubjects(); // Reload from backend
    } catch (error) {
      alert("Failed to save subject: " + error.message);
    }
  });

  closeBtn.addEventListener("click", () => (modal.style.display = "none"));

  document.addEventListener("click", () => {
    document
      .querySelectorAll(".dropdown")
      .forEach((dd) => (dd.style.display = "none"));
  });

  loadSubjects();
});
