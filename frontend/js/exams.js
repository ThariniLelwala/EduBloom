// ../../js/exams.js
let examsData = null;
let currentExamIndex = null;
let editExamContext = null;
let deleteExamContext = null;

// Load exams from JSON
async function loadExams() {
  try {
    const response = await fetch("../../data/exams.json");
    if (!response.ok) throw new Error("Failed to load exams.json");
    examsData = await response.json();

    renderAll();
    bindGlobalEvents();
  } catch (err) {
    console.error("Error loading exams:", err);
  }
}

// Render all
function renderAll() {
  if (!examsData) return;

  populateExamsList();
  updateSummary();
}

// Update summary
function updateSummary() {
  if (!examsData) return;

  const totalExams = examsData.exams.length;
  let totalSubjects = 0;

  examsData.exams.forEach((exam) => {
    totalSubjects += exam.subjects.length;
  });

  // Calculate average for the most recent exam (last in array)
  let averageMarks = 0;
  if (examsData.exams.length > 0) {
    const latestExam = examsData.exams[examsData.exams.length - 1];
    const marks = Object.values(latestExam.marks).filter(
      (mark) => mark !== null && mark !== undefined
    );
    if (marks.length > 0) {
      const sum = marks.reduce((acc, mark) => acc + mark, 0);
      averageMarks = (sum / marks.length).toFixed(2);
    }
  }

  document.getElementById("total-exams").textContent = totalExams;
  document.getElementById("total-subjects").textContent = totalSubjects;
  document.getElementById("average-marks").textContent = averageMarks;
}

// Populate exams list
function populateExamsList() {
  const list = document.getElementById("exams-list");
  if (!list) return;

  list.innerHTML = "";

  examsData.exams.forEach((exam, index) => {
    const li = document.createElement("li");
    li.className = "exam-item";

    // Calculate average for this exam
    const marks = Object.values(exam.marks).filter(
      (mark) => mark !== null && mark !== undefined
    );
    let examAverage = 0;
    if (marks.length > 0) {
      const sum = marks.reduce((acc, mark) => acc + mark, 0);
      examAverage = (sum / marks.length).toFixed(2);
    }

    const examDiv = document.createElement("div");
    examDiv.className = "exam-header";
    examDiv.innerHTML = `<span class="exam-name">${exam.name}</span><span class="exam-average">Average: ${examAverage}</span>`;

    const subjectsDiv = document.createElement("div");
    subjectsDiv.className = "exam-subjects";
    exam.subjects.forEach((subject) => {
      const subjectSpan = document.createElement("span");
      subjectSpan.className = "subject";
      const mark =
        exam.marks[subject] !== undefined ? exam.marks[subject] : "Not entered";
      subjectSpan.textContent = `${subject}: ${mark}`;
      subjectsDiv.appendChild(subjectSpan);
    });

    // Actions
    const actions = document.createElement("div");
    actions.className = "exam-actions";

    const addSubjectBtn = document.createElement("button");
    addSubjectBtn.className = "btn-small";
    addSubjectBtn.textContent = "Add Subject";
    addSubjectBtn.addEventListener("click", () => openSubjectModal(index));

    const enterMarksBtn = document.createElement("button");
    enterMarksBtn.className = "btn-small";
    enterMarksBtn.textContent = "Enter Marks";
    enterMarksBtn.addEventListener("click", () => openMarksModal(index));

    const editBtn = document.createElement("button");
    editBtn.className = "btn-small";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => openEditExamModal(index));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn-small";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => openDeleteExamModal(index));

    actions.appendChild(addSubjectBtn);
    actions.appendChild(enterMarksBtn);
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(examDiv);
    li.appendChild(subjectsDiv);
    li.appendChild(actions);
    list.appendChild(li);
  });
}

// Bind global events
function bindGlobalEvents() {
  // Exam modal
  const examModal = document.getElementById("exam-modal");
  const examModalClose = document.getElementById("exam-modal-close");
  const examModalCancel = document.getElementById("exam-modal-cancel");
  const examModalSave = document.getElementById("exam-modal-save");
  const examNameInput = document.getElementById("exam-name-input");

  // Subject modal
  const subjectModal = document.getElementById("subject-modal");
  const subjectModalClose = document.getElementById("subject-modal-close");
  const subjectModalCancel = document.getElementById("subject-modal-cancel");
  const subjectModalSave = document.getElementById("subject-modal-save");
  const examSelect = document.getElementById("exam-select");
  const subjectsContainer = document.getElementById("subjects-container");
  const addSubjectBtn = document.getElementById("add-subject-btn");

  // Marks modal
  const marksModal = document.getElementById("marks-modal");
  const marksModalClose = document.getElementById("marks-modal-close");
  const marksModalCancel = document.getElementById("marks-modal-cancel");
  const marksModalSave = document.getElementById("marks-modal-save");
  const marksBody = document.getElementById("marks-body");

  // Edit exam modal
  const editExamModal = document.getElementById("edit-exam-modal");
  const editExamModalClose = document.getElementById("edit-exam-modal-close");
  const editExamModalCancel = document.getElementById("edit-exam-modal-cancel");
  const editExamModalSave = document.getElementById("edit-exam-modal-save");
  const editExamNameInput = document.getElementById("edit-exam-name-input");

  // Delete exam modal
  const deleteExamModal = document.getElementById("delete-exam-modal");
  const deleteExamModalClose = document.getElementById(
    "delete-exam-modal-close"
  );
  const deleteExamModalCancel = document.getElementById(
    "delete-exam-modal-cancel"
  );
  const deleteExamModalConfirm = document.getElementById(
    "delete-exam-modal-confirm"
  );

  function openModal(m) {
    m.classList.add("show");
  }
  function closeModal(m) {
    m.classList.remove("show");
  }

  // Add exam button
  document
    .querySelector(".add-btn[data-type='exam']")
    .addEventListener("click", () => {
      examNameInput.value = "";
      openModal(examModal);
      examNameInput.focus();
    });

  [examModalClose, examModalCancel].forEach((btn) =>
    btn.addEventListener("click", () => closeModal(examModal))
  );

  examModalSave.addEventListener("click", () => {
    const name = examNameInput.value.trim();
    if (!name) return;

    examsData.exams.push({ name, subjects: [], marks: {} });
    renderAll();
    closeModal(examModal);
  });

  // Subject modal
  [subjectModalClose, subjectModalCancel].forEach((btn) =>
    btn.addEventListener("click", () => closeModal(subjectModal))
  );

  addSubjectBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const input = document.createElement("input");
    input.type = "text";
    input.className = "subject-input";
    input.placeholder = "Enter subject name...";
    subjectsContainer.appendChild(input);
  });

  subjectModalSave.addEventListener("click", () => {
    const examIndex = examSelect.value;
    const subjectInputs = subjectsContainer.querySelectorAll(".subject-input");
    const newSubjects = Array.from(subjectInputs)
      .map((input) => input.value.trim())
      .filter((s) => s && s.length > 0);

    if (!examIndex || newSubjects.length === 0) return;

    const exam = examsData.exams[examIndex];
    const uniqueSubjects = newSubjects.filter(
      (subject) => !exam.subjects.includes(subject)
    );
    uniqueSubjects.forEach((subject) => {
      exam.subjects.push(subject);
      exam.marks[subject] = null;
    });
    renderAll();
    closeModal(subjectModal);
  });

  // Marks modal
  [marksModalClose, marksModalCancel].forEach((btn) =>
    btn.addEventListener("click", () => closeModal(marksModal))
  );

  marksModalSave.addEventListener("click", () => {
    const exam = examsData.exams[currentExamIndex];
    const inputs = marksBody.querySelectorAll("input");
    inputs.forEach((input) => {
      const subject = input.dataset.subject;
      const mark = parseFloat(input.value);
      if (!isNaN(mark)) {
        exam.marks[subject] = mark;
      }
    });
    renderAll();
    closeModal(marksModal);
  });

  // Edit exam modal
  [editExamModalClose, editExamModalCancel].forEach((btn) =>
    btn.addEventListener("click", () => closeModal(editExamModal))
  );

  editExamModalSave.addEventListener("click", () => {
    const newName = editExamNameInput.value.trim();
    if (!newName || !editExamContext) return;

    examsData.exams[editExamContext].name = newName;
    renderAll();
    closeModal(editExamModal);
    editExamContext = null;
  });

  // Delete exam modal
  [deleteExamModalClose, deleteExamModalCancel].forEach((btn) =>
    btn.addEventListener("click", () => closeModal(deleteExamModal))
  );

  deleteExamModalConfirm.addEventListener("click", () => {
    if (deleteExamContext !== null) {
      examsData.exams.splice(deleteExamContext, 1);
      renderAll();
      closeModal(deleteExamModal);
      deleteExamContext = null;
    }
  });
}

// Open subject modal
function openSubjectModal(examIndex) {
  const subjectModal = document.getElementById("subject-modal");
  const examSelect = document.getElementById("exam-select");
  const subjectsContainer = document.getElementById("subjects-container");

  examSelect.innerHTML = '<option value="">Select Exam</option>';
  examsData.exams.forEach((exam, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = exam.name;
    examSelect.appendChild(option);
  });
  examSelect.value = examIndex;

  // Clear existing inputs and add one empty input
  subjectsContainer.innerHTML =
    '<input type="text" class="subject-input" placeholder="Enter subject name..." />';

  subjectModal.classList.add("show");
  subjectsContainer.querySelector(".subject-input").focus();
}

// Open marks modal
function openMarksModal(examIndex) {
  const marksModal = document.getElementById("marks-modal");
  const marksBody = document.getElementById("marks-body");

  currentExamIndex = examIndex;
  const exam = examsData.exams[examIndex];
  marksBody.innerHTML = `<h3>Enter marks for ${exam.name}</h3>`;
  exam.subjects.forEach((subject) => {
    const div = document.createElement("div");
    div.className = "mark-input";
    const label = document.createElement("label");
    label.textContent = subject;
    const input = document.createElement("input");
    input.type = "number";
    input.dataset.subject = subject;
    input.value = exam.marks[subject] || "";
    div.appendChild(label);
    div.appendChild(input);
    marksBody.appendChild(div);
  });
  marksModal.classList.add("show");
}

// Open edit exam modal
function openEditExamModal(index) {
  const editExamModal = document.getElementById("edit-exam-modal");
  const editExamNameInput = document.getElementById("edit-exam-name-input");

  editExamContext = index;
  editExamNameInput.value = examsData.exams[index].name;
  editExamModal.classList.add("show");
  editExamNameInput.focus();
}

// Open delete exam modal
function openDeleteExamModal(index) {
  deleteExamContext = index;
  const deleteExamModal = document.getElementById("delete-exam-modal");
  deleteExamModal.classList.add("show");
}

// Initialize
loadExams();
