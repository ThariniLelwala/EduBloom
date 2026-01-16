// ../../js/gpa-tracker.js
let gpaData = null;
let currentSemesterIndex = null;
let editSemesterContext = null;
let deleteSemesterContext = null;
let eventsAlreadyBound = false; // Track if events are already bound

// Default grade to GPA mapping
const defaultGradeToGPA = {
  "4.0": 4.0,
  A: 4.0,
  "A+": 4.0,
  3.7: 3.7,
  "A-": 3.7,
  3.3: 3.3,
  "B+": 3.3,
  "3.0": 3.0,
  B: 3.0,
  2.7: 2.7,
  "B-": 2.7,
  2.3: 2.3,
  "C+": 2.3,
  "2.0": 2.0,
  C: 2.0,
  1.7: 1.7,
  "C-": 1.7,
  1.3: 1.3,
  "D+": 1.3,
  "1.0": 1.0,
  D: 1.0,
  "0.0": 0.0,
  F: 0.0,
};

// Custom grade mappings (loaded from backend)
let customGradeToGPA = { ...defaultGradeToGPA };

// Available grades for editing
const availableGrades = [
  { key: "A+", display: "A+" },
  { key: "A", display: "A" },
  { key: "A-", display: "A-" },
  { key: "B+", display: "B+" },
  { key: "B", display: "B" },
  { key: "B-", display: "B-" },
  { key: "C+", display: "C+" },
  { key: "C", display: "C" },
  { key: "C-", display: "C-" },
  { key: "D+", display: "D+" },
  { key: "D", display: "D" },
  { key: "F", display: "F" },
];

// Check authentication
function checkAuth() {
  const token = localStorage.getItem("authToken");
  if (!token) {
    window.location.href = "/login.html";
    return false;
  }
  return true;
}

// Load GPA data from backend
async function loadGPAData() {
  try {
    if (!checkAuth()) return;

    // Load semesters from backend
    const semesters = await gpaApi.getSemesters();
    gpaData = { semesters: semesters };

    // Load custom grade mappings from backend
    const gradeMappings = await gpaApi.getGradeMappings();
    customGradeToGPA = { ...defaultGradeToGPA, ...gradeMappings };

    renderAll();
  } catch (err) {
    console.error("Error loading GPA data:", err);
    // Initialize with empty data
    gpaData = { semesters: [] };
    renderAll();
  }
}

// Render all
function renderAll() {
  if (!gpaData) return;

  populateSemestersList();
  updateSummary();
}

// Update summary
function updateSummary() {
  if (!gpaData) return;

  const totalSemesters = gpaData.semesters.length;
  let totalCredits = 0;
  let overallGPA = 0;
  let weightedCredits = 0;

  gpaData.semesters.forEach((semester) => {
    const semesterGPA = calculateSemesterGPA(semester);
    if (semesterGPA !== null) {
      const semesterCredits = semester.subjects.reduce(
        (sum, subject) => sum + (parseFloat(subject.credits) || 0),
        0
      );
      overallGPA += semesterGPA * semesterCredits;
      weightedCredits += semesterCredits;
      totalCredits += semesterCredits;
    }
  });

  if (weightedCredits > 0) {
    overallGPA = (overallGPA / weightedCredits).toFixed(2);
  }

  document.getElementById("total-semesters").textContent = totalSemesters;
  document.getElementById("total-credits").textContent = totalCredits;
  document.getElementById("overall-gpa").textContent = overallGPA;
}

// Calculate GPA for a semester
function calculateSemesterGPA(semester) {
  let totalPoints = 0;
  let totalCredits = 0;

  semester.subjects.forEach((subject) => {
    const gpa = customGradeToGPA[subject.grade];
    const credits = parseFloat(subject.credits) || 0;

    if (gpa !== undefined && gpa !== null && credits > 0) {
      totalPoints += gpa * credits;
      totalCredits += credits;
    }
  });

  if (totalCredits === 0) return null;

  return totalPoints / totalCredits;
}

// Populate semesters list
function populateSemestersList() {
  const list = document.getElementById("semesters-list");
  if (!list) return;

  list.innerHTML = "";

  gpaData.semesters.forEach((semester, index) => {
    const semesterCard = document.createElement("div");
    semesterCard.className = "semester-card";

    // Calculate GPA for this semester
    const semesterGPA = calculateSemesterGPA(semester);
    const gpaDisplay = semesterGPA !== null ? semesterGPA.toFixed(2) : "N/A";

    const semesterDiv = document.createElement("div");
    semesterDiv.className = "exam-header";
    semesterDiv.innerHTML = `<span class="exam-name">${semester.name}</span><span class="exam-average">GPA: ${gpaDisplay}</span>`;

    const subjectsDiv = document.createElement("div");
    subjectsDiv.className = "exam-subjects";
    semester.subjects.forEach((subject) => {
      const subjectSpan = document.createElement("span");
      subjectSpan.className = "subject";
      const grade = subject.grade || "Not entered";
      const credits = subject.credits || "0";
      subjectSpan.textContent = `${subject.name}: ${grade} (${credits} credits)`;
      subjectsDiv.appendChild(subjectSpan);
    });

    // Actions
    const actions = document.createElement("div");
    actions.className = "exam-actions";

    const addSubjectBtn = document.createElement("button");
    addSubjectBtn.className = "btn-small";
    addSubjectBtn.textContent = "Add Subject";
    addSubjectBtn.addEventListener("click", () => openSubjectModal(index));

    const editBtn = document.createElement("button");
    editBtn.className = "btn-small";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => openEditSemesterModal(index));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn-small";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => openDeleteSemesterModal(index));

    actions.appendChild(addSubjectBtn);
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    semesterCard.appendChild(semesterDiv);
    semesterCard.appendChild(subjectsDiv);
    semesterCard.appendChild(actions);
    list.appendChild(semesterCard);
  });
}

// Bind global events (only once)
function bindGlobalEvents() {
  // Prevent binding events multiple times
  if (eventsAlreadyBound) return;
  eventsAlreadyBound = true;

  // Semester modal
  const semesterModal = document.getElementById("semester-modal");
  const semesterModalClose = document.getElementById("semester-modal-close");
  const semesterModalCancel = document.getElementById("semester-modal-cancel");
  const semesterModalSave = document.getElementById("semester-modal-save");
  const semesterNameInput = document.getElementById("semester-name-input");

  // Subject modal
  const subjectModal = document.getElementById("subject-modal");
  const subjectModalClose = document.getElementById("subject-modal-close");
  const subjectModalCancel = document.getElementById("subject-modal-cancel");
  const subjectModalSave = document.getElementById("subject-modal-save");
  const semesterSelect = document.getElementById("semester-select");
  const subjectsContainer = document.getElementById("subjects-container");
  const addSubjectBtn = document.getElementById("add-subject-btn");

  // Edit semester modal
  const editSemesterModal = document.getElementById("edit-semester-modal");
  const editSemesterModalClose = document.getElementById(
    "edit-semester-modal-close"
  );
  const editSemesterModalCancel = document.getElementById(
    "edit-semester-modal-cancel"
  );
  const editSemesterModalSave = document.getElementById(
    "edit-semester-modal-save"
  );
  const editSemesterNameInput = document.getElementById(
    "edit-semester-name-input"
  );

  // Delete semester modal
  const deleteSemesterModal = document.getElementById("delete-semester-modal");
  const deleteSemesterModalClose = document.getElementById(
    "delete-semester-modal-close"
  );
  const deleteSemesterModalCancel = document.getElementById(
    "delete-semester-modal-cancel"
  );
  const deleteSemesterModalConfirm = document.getElementById(
    "delete-semester-modal-confirm"
  );

  function openModal(m) {
    m.classList.add("show");
  }
  function closeModal(m) {
    m.classList.remove("show");
  }

  // Add semester button
  document
    .querySelector(".add-btn[data-type='semester']")
    .addEventListener("click", () => {
      semesterNameInput.value = "";
      openModal(semesterModal);
      semesterNameInput.focus();
    });

  [semesterModalClose, semesterModalCancel].forEach((btn) =>
    btn.addEventListener("click", () => closeModal(semesterModal))
  );

  semesterModalSave.addEventListener("click", async () => {
    const name = semesterNameInput.value.trim();
    if (!name) return;

    try {
      await gpaApi.createSemester(name);
      closeModal(semesterModal);
      await loadGPAData(); // Reload from backend
    } catch (error) {
      alert("Failed to create semester: " + error.message);
    }
  });

  // Subject modal
  [subjectModalClose, subjectModalCancel].forEach((btn) =>
    btn.addEventListener("click", () => closeModal(subjectModal))
  );

  addSubjectBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const subjectRow = document.createElement("div");
    subjectRow.className = "subject-grade-row";
    subjectRow.innerHTML = `
      <input type="text" class="subject-input" placeholder="Enter subject name..." />
      <input type="number" class="credits-input" placeholder="Credits" min="0" max="10" step="0.5" />
      <select class="custom-select grade-select">
        <option value="">Grade</option>
        <option value="A+">A+</option>
        <option value="A">A</option>
        <option value="A-">A-</option>
        <option value="B+">B+</option>
        <option value="B">B</option>
        <option value="B-">B-</option>
        <option value="C+">C+</option>
        <option value="C">C</option>
        <option value="C-">C-</option>
        <option value="D+">D+</option>
        <option value="D">D</option>
        <option value="F">F</option>
      </select>
    `;
    subjectsContainer.appendChild(subjectRow);
    // Initialize custom selects for the new row
    if (window.initCustomSelects) {
      window.initCustomSelects();
    }
  });

  subjectModalSave.addEventListener("click", async () => {
    const semesterIndex = semesterSelect.value;
    const subjectRows =
      subjectsContainer.querySelectorAll(".subject-grade-row");

    if (semesterIndex === "") return;

    const semester = gpaData.semesters[semesterIndex];
    let hasNewSubjects = false;

    for (const row of subjectRows) {
      const subjectInput = row.querySelector(".subject-input");
      const creditsInput = row.querySelector(".credits-input");
      const gradeSelect = row.querySelector(".grade-select");
      const subjectName = subjectInput.value.trim();
      const credits = parseFloat(creditsInput.value) || 0;
      const grade = gradeSelect.value;

      if (subjectName && grade && credits > 0) {
        // Check if subject already exists
        const existingSubject = semester.subjects.find(
          (s) => s.name === subjectName
        );
        if (!existingSubject) {
          try {
            await gpaApi.createSubject(semester.id, subjectName, grade, credits);
            hasNewSubjects = true;
          } catch (error) {
            console.error("Failed to create subject:", error);
          }
        }
      }
    }

    closeModal(subjectModal);
    if (hasNewSubjects) {
      await loadGPAData(); // Reload from backend
    }
  });

  // Edit semester modal
  [editSemesterModalClose, editSemesterModalCancel].forEach((btn) =>
    btn.addEventListener("click", () => closeModal(editSemesterModal))
  );

  editSemesterModalSave.addEventListener("click", async () => {
    const newName = editSemesterNameInput.value.trim();
    if (!newName || editSemesterContext === null) return;

    try {
      const semester = gpaData.semesters[editSemesterContext];
      await gpaApi.updateSemester(semester.id, newName);
      closeModal(editSemesterModal);
      editSemesterContext = null;
      await loadGPAData(); // Reload from backend
    } catch (error) {
      alert("Failed to update semester: " + error.message);
    }
  });

  // Delete semester modal
  [deleteSemesterModalClose, deleteSemesterModalCancel].forEach((btn) =>
    btn.addEventListener("click", () => closeModal(deleteSemesterModal))
  );

  deleteSemesterModalConfirm.addEventListener("click", async () => {
    if (deleteSemesterContext !== null) {
      try {
        const semester = gpaData.semesters[deleteSemesterContext];
        await gpaApi.deleteSemester(semester.id);
        closeModal(deleteSemesterModal);
        deleteSemesterContext = null;
        await loadGPAData(); // Reload from backend
      } catch (error) {
        alert("Failed to delete semester: " + error.message);
      }
    }
  });

  // View credits modal
  const viewCreditsModal = document.getElementById("view-credits-modal");
  const viewCreditsModalClose = document.getElementById(
    "view-credits-modal-close"
  );
  const viewCreditsModalCloseBtn = document.getElementById(
    "view-credits-modal-close-btn"
  );

  // Edit credits modal
  const editCreditsModal = document.getElementById("edit-credits-modal");
  const editCreditsModalClose = document.getElementById(
    "edit-credits-modal-close"
  );
  const editCreditsModalCancel = document.getElementById(
    "edit-credits-modal-cancel"
  );
  const editCreditsModalSave = document.getElementById(
    "edit-credits-modal-save"
  );

  // View credits button
  document.getElementById("view-credits-btn").addEventListener("click", () => {
    populateViewCreditsModal();
    openModal(viewCreditsModal);
  });

  [viewCreditsModalClose, viewCreditsModalCloseBtn].forEach((btn) =>
    btn.addEventListener("click", () => closeModal(viewCreditsModal))
  );

  // Edit credits button
  document.getElementById("edit-credits-btn").addEventListener("click", () => {
    populateEditCreditsModal();
    openModal(editCreditsModal);
  });

  [editCreditsModalClose, editCreditsModalCancel].forEach((btn) =>
    btn.addEventListener("click", () => closeModal(editCreditsModal))
  );

  editCreditsModalSave.addEventListener("click", async () => {
    const newMappings = saveEditedCredits();
    try {
      await gpaApi.updateGradeMappings(newMappings);
      closeModal(editCreditsModal);
      await loadGPAData(); // Reload to refresh mappings
    } catch (error) {
      alert("Failed to save grade mappings: " + error.message);
    }
  });
}

// Open subject modal
function openSubjectModal(semesterIndex) {
  const subjectModal = document.getElementById("subject-modal");
  const semesterSelect = document.getElementById("semester-select");
  const subjectsContainer = document.getElementById("subjects-container");

  semesterSelect.innerHTML = '<option value="">Select Semester</option>';
  gpaData.semesters.forEach((semester, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = semester.name;
    semesterSelect.appendChild(option);
  });
  semesterSelect.value = semesterIndex;

  // Clear existing inputs and add one empty input
  subjectsContainer.innerHTML = `
    <div class="subject-grade-row">
      <input type="text" class="subject-input" placeholder="Enter subject name..." />
      <input type="number" class="credits-input" placeholder="Credits" min="0" max="10" step="0.5" />
      <select class="custom-select grade-select">
        <option value="">Grade</option>
        <option value="A+">A+</option>
        <option value="A">A</option>
        <option value="A-">A-</option>
        <option value="B+">B+</option>
        <option value="B">B</option>
        <option value="B-">B-</option>
        <option value="C+">C+</option>
        <option value="C">C</option>
        <option value="C-">C-</option>
        <option value="D+">D+</option>
        <option value="D">D</option>
        <option value="F">F</option>
      </select>
    </div>
  `;

  subjectModal.classList.add("show");
  subjectsContainer.querySelector(".subject-input").focus();
  // Initialize custom selects for the modal
  if (window.initCustomSelects) {
    window.initCustomSelects();
  }
}

// Open edit semester modal
function openEditSemesterModal(index) {
  const editSemesterModal = document.getElementById("edit-semester-modal");
  const editSemesterNameInput = document.getElementById(
    "edit-semester-name-input"
  );

  editSemesterContext = index;
  editSemesterNameInput.value = gpaData.semesters[index].name;
  editSemesterModal.classList.add("show");
  editSemesterNameInput.focus();
}

// Open delete semester modal
function openDeleteSemesterModal(index) {
  deleteSemesterContext = index;
  const deleteSemesterModal = document.getElementById("delete-semester-modal");
  deleteSemesterModal.classList.add("show");
}

// Populate view credits modal
function populateViewCreditsModal() {
  const creditsDisplay = document.getElementById("credits-display");
  creditsDisplay.innerHTML = "";

  availableGrades.forEach((grade) => {
    const creditItem = document.createElement("div");
    creditItem.className = "credit-item";

    const gradeLabel = document.createElement("div");
    gradeLabel.className = "grade-label";
    gradeLabel.textContent = grade.display;

    const creditValue = document.createElement("div");
    creditValue.className = "credit-value";
    creditValue.textContent =
      customGradeToGPA[grade.key] || customGradeToGPA[grade.display] || "N/A";

    creditItem.appendChild(gradeLabel);
    creditItem.appendChild(creditValue);
    creditsDisplay.appendChild(creditItem);
  });
}

// Populate edit credits modal
function populateEditCreditsModal() {
  const creditsEdit = document.getElementById("credits-edit");
  creditsEdit.innerHTML = "";

  availableGrades.forEach((grade) => {
    const creditItem = document.createElement("div");
    creditItem.className = "credit-item";

    const gradeLabel = document.createElement("div");
    gradeLabel.className = "grade-label";
    gradeLabel.textContent = grade.display;

    const creditInput = document.createElement("input");
    creditInput.type = "number";
    creditInput.step = "0.01";
    creditInput.min = "0";
    creditInput.max = "4.0";
    creditInput.value =
      customGradeToGPA[grade.key] || customGradeToGPA[grade.display] || "";
    creditInput.dataset.grade = grade.key;

    creditItem.appendChild(gradeLabel);
    creditItem.appendChild(creditInput);
    creditsEdit.appendChild(creditItem);
  });
}

// Save edited credits - returns the new mappings object
function saveEditedCredits() {
  const creditInputs = document.querySelectorAll("#credits-edit input");
  const newMappings = {};

  creditInputs.forEach((input) => {
    const grade = input.dataset.grade;
    const value = parseFloat(input.value);

    if (!isNaN(value) && value >= 0 && value <= 4.0) {
      newMappings[grade] = value;
      customGradeToGPA[grade] = value;
    }
  });

  return newMappings;
}

// Initialize
async function init() {
  await loadGPAData();
  bindGlobalEvents();
}

init();
