// Parent Dashboard Script
console.log("Script started executing");

// Load and display child's todo tasks on dashboard
let dashboardTasks = {
  todo: [],
  weekly: [],
  monthly: [],
};

let upcomingEvents = [];

let currentEditingIndex = -1;
let currentEditingType = "";

console.log("About to add DOMContentLoaded listener");
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOMContentLoaded fired!");
  loadChildTasks();
  loadUpcomingEvents();
  loadCurrentAverage();
  setupModalListeners();
});

// Also try calling it immediately in case DOM is already loaded
if (document.readyState === "loading") {
  console.log("Document still loading");
} else {
  console.log("Document already loaded, calling functions immediately");
  loadChildTasks();
  loadUpcomingEvents();
  loadCurrentAverage();
  setupModalListeners();
}

// Close edit modal
function closeEditModal() {
  document.getElementById("edit-modal").classList.remove("show");
  document.getElementById("edit-input").value = "";
}

// Close delete modal
function closeDeleteModal() {
  document.getElementById("delete-modal").classList.remove("show");
}

function setupModalListeners() {
  // Edit modal
  document
    .getElementById("edit-modal-close")
    .addEventListener("click", closeEditModal);
  document
    .getElementById("edit-cancel")
    .addEventListener("click", closeEditModal);
  document
    .getElementById("edit-save")
    .addEventListener("click", saveEditedTask);

  // Delete modal
  document
    .getElementById("delete-modal-close")
    .addEventListener("click", closeDeleteModal);
  document
    .getElementById("delete-cancel")
    .addEventListener("click", closeDeleteModal);
  document
    .getElementById("delete-confirm")
    .addEventListener("click", confirmDelete);

  // Enter key support for edit
  document.getElementById("edit-input").addEventListener("keypress", (e) => {
    if (e.key === "Enter") saveEditedTask();
  });
}

function loadChildTasks() {
  const savedTasks = localStorage.getItem("parentTasks");
  console.log("Saved tasks from localStorage:", savedTasks);

  if (savedTasks) {
    dashboardTasks = JSON.parse(savedTasks);
  } else {
    // Default sample tasks with some marked as completed
    dashboardTasks = {
      todo: [
        { id: 1, text: "Complete Mathematics homework", completed: true },
        { id: 2, text: "Read Chapter 5 of History", completed: false },
      ],
      weekly: [
        { id: 3, text: "Finish Science project", completed: true },
        {
          id: 4,
          text: "Practice piano for 30 minutes daily",
          completed: false,
        },
      ],
      monthly: [
        { id: 5, text: "Complete all assignments", completed: false },
        { id: 6, text: "Improve grades in Math", completed: false },
      ],
    };
    console.log("Using default tasks", dashboardTasks);
    localStorage.setItem("parentTasks", JSON.stringify(dashboardTasks));
  }
  console.log("Dashboard tasks:", dashboardTasks);

  // Display all todo tasks on dashboard with edit/delete buttons
  const tasksList = document.getElementById("child-tasks-list");
  console.log("Task list element:", tasksList);
  tasksList.innerHTML = "";

  const todoTasks = dashboardTasks.todo;
  console.log("Todo tasks:", todoTasks);

  if (todoTasks.length === 0) {
    console.log("No tasks found");
    tasksList.innerHTML =
      "<li style='color: rgba(255, 255, 255, 0.6); text-align: center; padding: 20px;'>No tasks assigned yet</li>";
    return;
  }

  todoTasks.forEach((task, index) => {
    const li = document.createElement("li");
    li.className = "task-item";

    // Add completed class if task is marked as completed
    if (task.completed) {
      li.classList.add("completed");
    }

    li.innerHTML = `
      <span class="task-text">${task.text}</span>
      <div class="task-actions">
        <button class="edit-btn" onclick="editTaskFromDashboard('todo', ${index})" title="Edit task">
          <i class="fas fa-edit"></i>
        </button>
        <button class="delete-btn" onclick="deleteTaskFromDashboard('todo', ${index})" title="Delete task">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
    tasksList.appendChild(li);
  });
}

function editTaskFromDashboard(type, index) {
  currentEditingType = type;
  currentEditingIndex = index;
  const modal = document.getElementById("edit-modal");
  const input = document.getElementById("edit-input");

  input.value = dashboardTasks[type][index].text;
  input.focus();
  modal.classList.add("show");
}

function deleteTaskFromDashboard(type, index) {
  currentEditingType = type;
  currentEditingIndex = index;
  document.getElementById("delete-modal").classList.add("show");
}

function saveEditedTask() {
  const input = document.getElementById("edit-input");
  const text = input.value.trim();

  if (!text) {
    alert("Please enter a task.");
    return;
  }

  dashboardTasks[currentEditingType][currentEditingIndex].text = text;
  localStorage.setItem("parentTasks", JSON.stringify(dashboardTasks));
  loadChildTasks();
  closeEditModal();
}

function confirmDelete() {
  dashboardTasks[currentEditingType].splice(currentEditingIndex, 1);
  localStorage.setItem("parentTasks", JSON.stringify(dashboardTasks));
  loadChildTasks();
  closeDeleteModal();
}

function loadUpcomingEvents() {
  const savedEvents = localStorage.getItem("upcomingEvents");
  if (savedEvents) {
    upcomingEvents = JSON.parse(savedEvents);
  } else {
    // Default sample events
    upcomingEvents = [
      {
        id: 1,
        title: "Mathematics Final Exam",
        detail: "Chapters 8-12",
        date: "2025-06-15",
        type: "exam",
      },
      {
        id: 2,
        title: "Science Project Due",
        detail: "Physics experiment report",
        date: "2025-06-20",
        type: "assignment",
      },
    ];
    localStorage.setItem("upcomingEvents", JSON.stringify(upcomingEvents));
  }

  // Display events
  const eventsList = document.getElementById("assignments-list");
  eventsList.innerHTML = "";

  const today = new Date();
  const upcoming = upcomingEvents
    .filter((event) => new Date(event.date) >= today)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3); // Show only next 3 events

  if (upcoming.length === 0) {
    eventsList.innerHTML =
      "<li style='color: rgba(255, 255, 255, 0.6); text-align: center; padding: 20px;'>No upcoming events</li>";
    return;
  }

  upcoming.forEach((event) => {
    const li = document.createElement("li");
    li.className = "event-item";

    const dateObj = new Date(event.date);
    const formattedDate = dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    li.innerHTML = `
      <div class="event-info">
        <span class="event-title">${event.title}</span>
        <span class="event-detail">${event.detail}</span>
      </div>
      <div class="event-date">
        <i class="fas fa-calendar"></i>
        <span>${formattedDate}</span>
      </div>
    `;
    eventsList.appendChild(li);
  });
}

function addEvent() {
  const title = prompt("Enter event title:");
  if (!title) return;

  const detail = prompt("Enter event details:");
  if (!detail) return;

  const date = prompt("Enter event date (YYYY-MM-DD):");
  if (!date) return;

  const newEvent = {
    id: Date.now(),
    title: title,
    detail: detail,
    date: date,
    type: "event",
  };

  upcomingEvents.push(newEvent);
  localStorage.setItem("upcomingEvents", JSON.stringify(upcomingEvents));
  loadUpcomingEvents();
}

function loadCurrentAverage() {
  // Get child type from localStorage (school or university)
  const childType = localStorage.getItem("childType") || "school";

  let currentAverage = "--";
  let averageType = "Loading...";
  let trend = "Stable";
  let trendClass = "";

  if (childType === "university") {
    // For university students, show GPA
    const savedGPA =
      localStorage.getItem("currentGPA") ||
      localStorage.getItem("avg-gpa-display") ||
      "3.7";
    currentAverage = parseFloat(savedGPA).toFixed(1);
    averageType = "Current GPA";

    // Determine trend
    const previousGPA = localStorage.getItem("previousGPA") || savedGPA;
    if (parseFloat(savedGPA) > parseFloat(previousGPA)) {
      trend = "Improving";
      trendClass = "increase";
    } else if (parseFloat(savedGPA) < parseFloat(previousGPA)) {
      trend = "Declining";
      trendClass = "decrease";
    }
  } else {
    // For school students, show average score
    const savedScore =
      localStorage.getItem("currentScore") ||
      localStorage.getItem("latest-avg-score") ||
      "85";
    currentAverage = savedScore + "%";
    averageType = "Latest Average";

    // Determine trend
    const previousScore = localStorage.getItem("previousScore") || savedScore;
    if (parseFloat(savedScore) > parseFloat(previousScore)) {
      trend = "Improving";
      trendClass = "increase";
    } else if (parseFloat(savedScore) < parseFloat(previousScore)) {
      trend = "Declining";
      trendClass = "decrease";
    }
  }

  // Update the UI
  document.getElementById("current-average").textContent = currentAverage;
  document.getElementById("average-type").textContent = averageType;

  const trendElement = document.getElementById("average-trend");
  trendElement.innerHTML = `<i class="fas fa-arrow-${
    trend === "Improving" ? "up" : trend === "Declining" ? "down" : "right"
  }"></i> ${trend}`;
  trendElement.className = `comparison-value ${trendClass}`;
}
