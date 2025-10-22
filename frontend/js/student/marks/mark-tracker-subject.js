// ../../../js/marks/mark-tracker-subject.js
document.addEventListener("DOMContentLoaded", async () => {
  const testsContainer = document.getElementById("tests-container");
  const testModal = document.getElementById("test-modal");
  const testModalTitle = document.getElementById("test-modal-title");
  const testNameInput = document.getElementById("test-name-input");
  const testMarkInput = document.getElementById("test-mark-input");
  const saveTestBtn = document.getElementById("save-test-btn");
  const closeTestBtn = testModal.querySelector(".modal-close");
  const addTestBtn = document.getElementById("add-test-btn");
  const subjectHeading = document.getElementById("subject-name");

  const params = new URLSearchParams(window.location.search);
  const subjectId = parseInt(params.get("subjectId"));
  const subjectName = params.get("subjectName") || "Unknown Subject";

  subjectHeading.textContent = subjectName;

  let subjects = [];
  let currentSubject = null;
  let editTestId = null;
  let chart = null;

  // Load data from localStorage or JSON
  async function loadData() {
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
      currentSubject = subjects.find((s) => s.id === subjectId);
      if (!currentSubject) {
        alert("Subject not found");
        window.location.href = "./mark-tracker.html";
        return;
      }
      renderTests();
      renderChart();
    } catch (error) {
      console.error("Error loading data:", error);
    }
  }

  function renderTests() {
    testsContainer.innerHTML = "";

    if (!currentSubject.tests || currentSubject.tests.length === 0) {
      testsContainer.innerHTML = "<p>No tests added yet.</p>";
      return;
    }

    currentSubject.tests.forEach((test) => {
      const testItem = document.createElement("div");
      testItem.className = "test-item";
      testItem.innerHTML = `
        <div class="test-info">
          <span class="test-name">${test.name}</span>
          <span class="test-mark">${test.mark}/100</span>
        </div>
        <div class="test-actions">
        </div>
      `;

      // Create action icons
      const actionsDiv = testItem.querySelector(".test-actions");

      const editBtn = document.createElement("i");
      editBtn.className = "fa fa-pencil";
      editBtn.title = "Edit";
      editBtn.addEventListener("click", () => {
        editTest(test.id);
      });

      const deleteBtn = document.createElement("i");
      deleteBtn.className = "fa fa-trash";
      deleteBtn.title = "Delete";
      deleteBtn.addEventListener("click", () => {
        deleteTest(test.id);
      });

      actionsDiv.appendChild(editBtn);
      actionsDiv.appendChild(deleteBtn);

      testsContainer.appendChild(testItem);
    });
  }

  function renderChart() {
    const ctx = document.getElementById("progressChart").getContext("2d");

    if (chart) {
      chart.destroy();
    }

    if (!currentSubject.tests || currentSubject.tests.length === 0) {
      // Show empty chart
      chart = new Chart(ctx, {
        type: "line",
        data: {
          labels: [],
          datasets: [
            {
              label: "Marks",
              data: [],
              borderColor: "rgba(255, 255, 255, 0.8)",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              labels: {
                color: "white",
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              ticks: {
                color: "white",
              },
              grid: {
                color: "rgba(255, 255, 255, 0.2)",
              },
            },
            x: {
              ticks: {
                color: "white",
              },
              grid: {
                color: "rgba(255, 255, 255, 0.2)",
              },
            },
          },
        },
      });
      return;
    }

    // Sort tests by date (assuming they have timestamps)
    const sortedTests = [...currentSubject.tests].sort(
      (a, b) => (a.date || 0) - (b.date || 0)
    );

    const labels = sortedTests.map((test) => test.name);
    const data = sortedTests.map((test) => test.mark);

    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Marks",
            data: data,
            borderColor: "rgba(255, 255, 255, 0.8)",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            tension: 0.4,
            pointBackgroundColor: "rgba(255, 255, 255, 1)",
            pointBorderColor: "rgba(255, 255, 255, 1)",
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: {
              color: "white",
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              color: "white",
            },
            grid: {
              color: "rgba(255, 255, 255, 0.2)",
            },
          },
          x: {
            ticks: {
              color: "white",
              maxRotation: 45,
              minRotation: 45,
            },
            grid: {
              color: "rgba(255, 255, 255, 0.2)",
            },
          },
        },
      },
    });
  }

  function editTest(testId) {
    const test = currentSubject.tests.find((t) => t.id === testId);
    if (!test) return;

    editTestId = testId;
    testModalTitle.textContent = "Edit Test";
    testNameInput.value = test.name;
    testMarkInput.value = test.mark;
    testModal.style.display = "flex";
  }

  function deleteTest(testId) {
    if (confirm("Are you sure you want to delete this test?")) {
      currentSubject.tests = currentSubject.tests.filter(
        (t) => t.id !== testId
      );
      saveData();
      renderTests();
      renderChart();
    }
  }

  function saveData() {
    localStorage.setItem("markTrackerSubjects", JSON.stringify(subjects));
  }

  // Event listeners
  addTestBtn.addEventListener("click", () => {
    editTestId = null;
    testModalTitle.textContent = "Add Test";
    testNameInput.value = "";
    testMarkInput.value = "";
    testModal.style.display = "flex";
  });

  saveTestBtn.addEventListener("click", () => {
    const name = testNameInput.value.trim();
    const mark = parseFloat(testMarkInput.value);

    if (!name || isNaN(mark) || mark < 0 || mark > 100) {
      alert("Please enter a valid test name and mark (0-100)");
      return;
    }

    if (editTestId) {
      const test = currentSubject.tests.find((t) => t.id === editTestId);
      if (test) {
        test.name = name;
        test.mark = mark;
      }
    } else {
      currentSubject.tests.push({
        id: Date.now(),
        name: name,
        mark: mark,
        date: Date.now(),
      });
    }

    saveData();
    testModal.style.display = "none";
    renderTests();
    renderChart();
  });

  closeTestBtn.addEventListener(
    "click",
    () => (testModal.style.display = "none")
  );

  document.addEventListener("click", (e) => {
    if (e.target === testModal) {
      testModal.style.display = "none";
    }
  });

  loadData();
});
