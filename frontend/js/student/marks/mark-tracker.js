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

  // Load subjects from backend
  async function loadSubjects() {
    try {
      subjects = await markApi.getSubjects();
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
            try {
                await markApi.deleteSubject(subj.id);
                loadSubjects();
            } catch(e) {
                alert(e.message);
            }
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

  saveBtn.addEventListener("click", async () => {
    const name = input.value.trim();
    if (!name) return;

    try {
        if (editId) {
            await markApi.updateSubject(editId, name);
        } else {
            await markApi.createSubject(name);
        }
        modal.style.display = "none";
        loadSubjects();
    } catch(e) {
        alert(e.message);
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
