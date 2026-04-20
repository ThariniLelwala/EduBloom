// ../../js/exams.js

let subjectsData = [];
let currentSubjectIndex = null;
let editSubjectContext = null;
let deleteSubjectContext = null;
let currentTestContext = null;
let editTestContext = null;
let deleteTestContext = null;

// Check authentication
function checkAuth() {
  const token = localStorage.getItem("authToken");
  if (!token) {
    window.location.href = "/login.html";
    return false;
  }
  return true;
}

// Load subjects and tests from backend
async function loadSubjectsData() {
  try {
    if (!checkAuth()) return;

    subjectsData = await examApi.getTerms();
    renderAll();
    bindGlobalEvents();
  } catch (err) {
    console.error("Error loading subjects/marks data:", err);
    subjectsData = [];
    renderAll();
    bindGlobalEvents();
  }
}

// Render all
function renderAll() {
  populateSubjectsList();
  updateSummary();
}

// Update summary
function updateSummary() {
  const totalSubjects = subjectsData.length;
  let totalTests = 0;
  let allMarks = [];

  subjectsData.forEach((subject) => {
    totalTests += subject.subjects ? subject.subjects.length : 0;
    if (subject.subjects) {
      subject.subjects.forEach(test => {
        if (test.mark !== null && test.mark !== undefined) {
          allMarks.push(parseFloat(test.mark));
        }
      });
    }
  });

  let averageMarks = 0;
  if (allMarks.length > 0) {
    const sum = allMarks.reduce((acc, mark) => acc + mark, 0);
    averageMarks = (sum / allMarks.length).toFixed(2);
  }

  document.getElementById("total-subjects").textContent = totalSubjects;
  document.getElementById("total-tests").textContent = totalTests;
  document.getElementById("average-marks").textContent = averageMarks;
}

// Populate subjects list
function populateSubjectsList() {
  const list = document.getElementById("exams-list");
  if (!list) return;

  list.innerHTML = "";

  if(subjectsData.length === 0) {
    list.innerHTML = `<div style="text-align: center; color: rgba(255,255,255,0.7); padding: 20px;">No exams added yet. Add an exam to start tracking marks.</div>`;
    return;
  }

  subjectsData.forEach((subject, index) => {
    const li = document.createElement("li");
    li.className = "exam-item"; // Keep same class names for CSS compatibility

    // Calculate average for this subject
    let subjectAverage = 0;
    const tests = subject.subjects || [];
    if (tests.length > 0) {
      const validMarks = tests.filter(t => t.mark !== null && t.mark !== undefined).map(t => parseFloat(t.mark));
      if (validMarks.length > 0) {
        const sum = validMarks.reduce((acc, mark) => acc + mark, 0);
        subjectAverage = (sum / validMarks.length).toFixed(2);
      }
    }

    const subjectDiv = document.createElement("div");
    subjectDiv.className = "exam-header";
    subjectDiv.innerHTML = `<span class="exam-name">${subject.name}</span><span class="exam-average">Average: ${subjectAverage}</span>`;

    const testsDiv = document.createElement("div");
    testsDiv.className = "exam-subjects";
    
    if (tests.length === 0) {
       const emptySpan = document.createElement("span");
       emptySpan.className = "subject";
       emptySpan.textContent = "No subjects added yet.";
       emptySpan.style.fontStyle = "italic";
       emptySpan.style.opacity = "0.7";
       testsDiv.appendChild(emptySpan);
    } else {
        tests.forEach((test, testIndex) => {
          const testSpan = document.createElement("span");
          testSpan.className = "subject";
          testSpan.style.cursor = "pointer";
          testSpan.title = "Click to edit/delete subject";
          testSpan.textContent = `${test.name}: ${test.mark}`;
          
          testSpan.addEventListener("click", () => {
             openEditTestModal(index, testIndex);
          });
          
          testsDiv.appendChild(testSpan);
        });
    }

    // Actions
    const actions = document.createElement("div");
    actions.className = "exam-actions";

    const addTestBtn = document.createElement("button");
    addTestBtn.className = "btn-primary";
    addTestBtn.textContent = "+ Add Subject";
    addTestBtn.addEventListener("click", () => openAddTestModal(index));

    const rightActions = document.createElement("div");
    rightActions.className = "exam-actions-right";

    const editBtn = document.createElement("button");
    editBtn.className = "btn-icon-only";
    editBtn.innerHTML = '<i class="fas fa-edit"></i>';
    editBtn.title = "Edit Exam";
    editBtn.addEventListener("click", () => openEditSubjectModal(index));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn-icon-only delete-btn";
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
    deleteBtn.title = "Delete Exam";
    deleteBtn.addEventListener("click", () => openDeleteSubjectModal(index));

    rightActions.appendChild(editBtn);
    rightActions.appendChild(deleteBtn);

    actions.appendChild(addTestBtn);
    actions.appendChild(rightActions);

    li.appendChild(subjectDiv);
    li.appendChild(testsDiv);
    li.appendChild(actions);
    list.appendChild(li);
  });
}

// Bind global events
// We use a flag to prevent attaching multiple listeners if re-rendering
let eventsBound = false;
function bindGlobalEvents() {
  if (eventsBound) return;
  eventsBound = true;

  // Modals
  const subjectModal = document.getElementById("subject-modal");
  const editSubjectModal = document.getElementById("edit-subject-modal");
  const deleteSubjectModal = document.getElementById("delete-subject-modal");
  
  const testModal = document.getElementById("test-modal");
  const editTestModal = document.getElementById("edit-test-modal");

  // Add Subject
  document.querySelector(".add-btn[data-type='exam']").addEventListener("click", () => {
    document.getElementById("subject-name-input").value = "";
    openModal(subjectModal);
    document.getElementById("subject-name-input").focus();
  });

  const closeModalList = document.querySelectorAll(".modal-close, .btn-secondary");
  closeModalList.forEach((btn) => {
      btn.addEventListener("click", (e) => {
         const modalNode = e.target.closest(".modal");
         if (modalNode) closeModal(modalNode);
      });
  });

  document.getElementById("subject-modal-save").addEventListener("click", async () => {
    const name = document.getElementById("subject-name-input").value.trim();
    if (!name) {
      alert("Please enter a term name");
      return;
    }

    if (name.length > 100) {
      alert("Term name must be 100 characters or less");
      return;
    }

    try {
        const result = await examApi.createTerm(name);
        closeModal(subjectModal);
        await loadSubjectsData();
    } catch(err) {
        alert("Failed to create exam: " + err.message);
    }
  });

  // Edit Subject
  document.getElementById("edit-subject-modal-save").addEventListener("click", async () => {
    const newName = document.getElementById("edit-subject-name-input").value.trim();
    if (!newName) {
      alert("Please enter a term name");
      return;
    }

    if (newName.length > 100) {
      alert("Term name must be 100 characters or less");
      return;
    }

    if (editSubjectContext === null) return;

    try {
        const subjId = subjectsData[editSubjectContext].id;
        await examApi.updateTerm(subjId, newName);
        closeModal(editSubjectModal);
        editSubjectContext = null;
        await loadSubjectsData();
    } catch(err) {
        alert("Failed to update exam: " + err.message);
    }
  });

  // Delete Subject
  document.getElementById("delete-subject-modal-confirm").addEventListener("click", async () => {
    if (deleteSubjectContext !== null) {
      try {
          const subjId = subjectsData[deleteSubjectContext].id;
          await examApi.deleteTerm(subjId);
          closeModal(deleteSubjectModal);
          deleteSubjectContext = null;
          await loadSubjectsData();
      } catch(err) {
          alert("Failed to delete exam: " + err.message);
      }
    }
  });

  // Add Test
  document.getElementById("test-modal-save").addEventListener("click", async () => {
    if (currentSubjectIndex === null) return;
    const subjId = subjectsData[currentSubjectIndex].id;
    const testName = document.getElementById("test-name-input").value.trim();
    const testMark = document.getElementById("test-mark-input").value;
    
    if(!testName) {
        alert("Please enter a subject name.");
        return;
    }

    if(testName.length > 100) {
        alert("Subject name must be 100 characters or less");
        return;
    }
    
    if(!testMark) {
        alert("Please enter a mark.");
        return;
    }

    const markNum = parseFloat(testMark);
    if(isNaN(markNum) || markNum < 0 || markNum > 100) {
        alert("Mark must be between 0 and 100");
        return;
    }
    
    try {
        await examApi.createSubject(subjId, testName, markNum);
        closeModal(testModal);
        currentSubjectIndex = null;
        await loadSubjectsData();
    } catch(err) {
        alert("Failed to add subject: " + err.message);
    }
  });

  // Save and Next Test
  document.getElementById("test-modal-save-next").addEventListener("click", async () => {
    if (currentSubjectIndex === null) return;
    const subjId = subjectsData[currentSubjectIndex].id;
    const testName = document.getElementById("test-name-input").value.trim();
    const testMark = document.getElementById("test-mark-input").value;
    
    if(!testName) {
        alert("Please enter a subject name.");
        return;
    }

    if(testName.length > 100) {
        alert("Subject name must be 100 characters or less");
        return;
    }
    
    if(!testMark) {
        alert("Please enter a mark.");
        return;
    }

    const markNum = parseFloat(testMark);
    if(isNaN(markNum) || markNum < 0 || markNum > 100) {
        alert("Mark must be between 0 and 100");
        return;
    }
    
    try {
        await examApi.createSubject(subjId, testName, markNum);
        document.getElementById("test-name-input").value = "";
        document.getElementById("test-mark-input").value = "";
        document.getElementById("test-name-input").focus();
        await loadSubjectsData();
    } catch(err) {
        alert("Failed to add subject: " + err.message);
    }
  });

  // Edit/Delete Test
  document.getElementById("edit-test-modal-save").addEventListener("click", async () => {
      if (editSubjectContext === null || editTestContext === null) return;
      
      const testName = document.getElementById("edit-test-name-input").value.trim();
      const testMark = document.getElementById("edit-test-mark-input").value;
      
      if(!testName) {
          alert("Please enter a subject name.");
          return;
      }

      if(testName.length > 100) {
          alert("Subject name must be 100 characters or less");
          return;
      }

      if(testMark) {
          const markNum = parseFloat(testMark);
          if(isNaN(markNum) || markNum < 0 || markNum > 100) {
              alert("Mark must be between 0 and 100");
              return;
          }
      }

      try {
          const testId = subjectsData[editSubjectContext].subjects[editTestContext].id;
          await examApi.updateSubject(testId, testName, testMark ? parseFloat(testMark) : null);
          closeModal(editTestModal);
          editSubjectContext = null;
          editTestContext = null;
          await loadSubjectsData();
      } catch(err) {
          alert("Failed to update subject: " + err.message);
      }
  });

  document.getElementById("edit-test-modal-delete").addEventListener("click", async () => {
      if (editSubjectContext === null || editTestContext === null) return;
      const confirmed = window.confirm("Are you sure you want to delete this subject?");
      if (confirmed) {
          try {
              const testId = subjectsData[editSubjectContext].subjects[editTestContext].id;
              await examApi.deleteSubject(testId);
              closeModal(editTestModal);
              editSubjectContext = null;
              editTestContext = null;
              await loadSubjectsData();
          } catch(err) {
              alert("Failed to delete subject: " + err.message);
          }
      }
  });

}

function openModal(m) {
  m.classList.add("show");
}
function closeModal(m) {
  m.classList.remove("show");
}

function openAddTestModal(subjectIndex) {
  currentSubjectIndex = subjectIndex;
  document.getElementById("test-name-input").value = "";
  document.getElementById("test-mark-input").value = "";
  const testModal = document.getElementById("test-modal");
  openModal(testModal);
  document.getElementById("test-name-input").focus();
}

// Reusing editSubjectContext for Edit/Delete Subject to hold the index
function openEditSubjectModal(index) {
  editSubjectContext = index;
  document.getElementById("edit-subject-name-input").value = subjectsData[index].name;
  openModal(document.getElementById("edit-subject-modal"));
  document.getElementById("edit-subject-name-input").focus();
}

function openDeleteSubjectModal(index) {
  deleteSubjectContext = index;
  openModal(document.getElementById("delete-subject-modal"));
}

function openEditTestModal(subjectIndex, testIndex) {
    editSubjectContext = subjectIndex;
    editTestContext = testIndex;
    const test = subjectsData[subjectIndex].subjects[testIndex];
    
    document.getElementById("edit-test-name-input").value = test.name;
    document.getElementById("edit-test-mark-input").value = test.mark;
    openModal(document.getElementById("edit-test-modal"));
    document.getElementById("edit-test-name-input").focus();
}

// Fallback confirm if custom modal is missing
async function showConfirmation(message, title) {
    if (typeof window.showConfirmationModal === "function") {
        return await window.showConfirmationModal(message, title);
    }
    return window.confirm(message);
}

// Initialize
loadSubjectsData();
