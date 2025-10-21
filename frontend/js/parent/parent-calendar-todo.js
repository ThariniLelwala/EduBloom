// Parent Calendar Todo Management Script
let tasks = {
  todo: [],
};

let importantDays = [];
let currentEditingIndex = -1;
let currentEditingType = "";
let currentAddingType = "";

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  loadTasks();
  loadImportantDays();
  setDates();
  renderTasks();
  renderImportantDays();
  setupEventListeners();
});

// Load tasks from localStorage
function loadTasks() {
  const savedTasks = localStorage.getItem("parentTasks");
  if (savedTasks) {
    const parsed = JSON.parse(savedTasks);
    tasks.todo = parsed.todo || [];
  } else {
    // Default sample tasks
    tasks.todo = [
      {
        id: 1,
        text: "Complete Mathematics homework",
        completed: false,
      },
      { id: 2, text: "Read Chapter 5 of History", completed: false },
    ];
    saveTasks();
  }
}

// Load important days
function loadImportantDays() {
  const saved = localStorage.getItem("importantDays");
  if (saved) {
    importantDays = JSON.parse(saved);
  } else {
    // Default important days
    importantDays = [
      {
        id: 1,
        title: "Summer Break",
        detail: "School holidays begin",
        date: "2025-07-01",
        type: "holiday",
        icon: "calendar",
      },
      {
        id: 2,
        title: "Final Exams",
        detail: "Mathematics & Science",
        date: "2025-06-15",
        type: "exam",
        icon: "graduation-cap",
      },
      {
        id: 3,
        title: "Parent-Teacher Meeting",
        detail: "Discuss progress",
        date: "2025-06-25",
        type: "event",
        icon: "users",
      },
    ];
    localStorage.setItem("importantDays", JSON.stringify(importantDays));
  }
}

// Save tasks to localStorage
function saveTasks() {
  localStorage.setItem("parentTasks", JSON.stringify(tasks));
}

// Render all tasks
function renderTasks() {
  renderTaskList("todo");
}

// Render specific task list
function renderTaskList(type) {
  const list = document.getElementById(`${type}-list`);
  list.innerHTML = "";

  tasks[type].forEach((task, index) => {
    const li = document.createElement("li");
    li.className = "task-item";

    // Add completed class if task is marked as completed
    if (task.completed) {
      li.classList.add("completed");
    }

    // Parent version - no checkbox, just text with edit/delete buttons
    li.innerHTML = `
      <span class="task-text">${task.text}</span>
      <div class="task-actions">
        <button class="edit-btn" onclick="editTask('${type}', ${index})" title="Edit task">
          <i class="fas fa-edit"></i>
        </button>
        <button class="delete-btn" onclick="deleteTask('${type}', ${index})" title="Delete task">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
    list.appendChild(li);
  });
}

// Render important days
function renderImportantDays() {
  const container = document.querySelector(".important-days-container");
  if (!container) return;

  container.innerHTML = "";

  // Sort by date and show upcoming ones
  const today = new Date();
  const upcomingDays = importantDays
    .filter((day) => new Date(day.date) >= today)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3); // Show only next 3 important days

  if (upcomingDays.length === 0) {
    container.innerHTML =
      '<p style="color: rgba(255, 255, 255, 0.6); text-align: center; padding: 20px;">No upcoming important days</p>';
    return;
  }

  upcomingDays.forEach((day) => {
    const dayElement = document.createElement("div");
    dayElement.className = `important-day-item ${day.type}`;

    const dateObj = new Date(day.date);
    const formattedDate = dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    dayElement.innerHTML = `
      <div class="day-info">
        <span class="day-title">${day.title}</span>
        <span class="day-detail">${day.detail}</span>
      </div>
      <div class="day-date">
        <i class="fas fa-${day.icon}"></i>
        <span>${formattedDate}</span>
      </div>
    `;

    container.appendChild(dayElement);
  });
}

// Set date information
function setDates() {
  const today = new Date();
  const todayStr = today.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  document.getElementById("todo-date").textContent = `Today - ${todayStr}`;
}

// Setup event listeners
function setupEventListeners() {
  // Add buttons
  document.querySelectorAll(".add-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      currentAddingType = e.target.closest(".add-btn").dataset.type;
      openAddModal(currentAddingType);
    });
  });

  // Modal buttons
  document
    .getElementById("modal-close")
    .addEventListener("click", closeAddModal);
  document
    .getElementById("modal-cancel")
    .addEventListener("click", closeAddModal);
  document.getElementById("modal-save").addEventListener("click", saveTask);

  document
    .getElementById("edit-modal-close")
    .addEventListener("click", closeEditModal);
  document
    .getElementById("edit-cancel")
    .addEventListener("click", closeEditModal);
  document
    .getElementById("edit-save")
    .addEventListener("click", saveEditedTask);

  document
    .getElementById("delete-modal-close")
    .addEventListener("click", closeDeleteModal);
  document
    .getElementById("delete-cancel")
    .addEventListener("click", closeDeleteModal);
  document
    .getElementById("delete-confirm")
    .addEventListener("click", confirmDelete);

  // Enter key support
  document.getElementById("task-input").addEventListener("keypress", (e) => {
    if (e.key === "Enter") saveTask();
  });

  document.getElementById("edit-input").addEventListener("keypress", (e) => {
    if (e.key === "Enter") saveEditedTask();
  });
}

// Open add modal
function openAddModal(type) {
  const modal = document.getElementById("task-modal");
  const title = document.getElementById("modal-title");
  const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);

  title.textContent = `Add ${typeLabel}`;
  document.getElementById("task-input").value = "";
  document.getElementById("task-input").focus();
  modal.classList.add("show");
}

// Close add modal
function closeAddModal() {
  document.getElementById("task-modal").classList.remove("show");
  document.getElementById("task-input").value = "";
}

// Save new task
function saveTask() {
  const input = document.getElementById("task-input");
  const text = input.value.trim();

  if (!text) {
    alert("Please enter a task.");
    return;
  }

  const newTask = {
    id: Date.now(),
    text: text,
    completed: false,
  };

  tasks[currentAddingType].push(newTask);
  saveTasks();
  renderTasks();
  renderImportantDays();
  closeAddModal();
}

// Edit task
function editTask(type, index) {
  currentEditingType = type;
  currentEditingIndex = index;
  const modal = document.getElementById("edit-modal");
  const input = document.getElementById("edit-input");

  input.value = tasks[type][index].text;
  input.focus();
  modal.classList.add("show");
}

// Close edit modal
function closeEditModal() {
  document.getElementById("edit-modal").classList.remove("show");
  document.getElementById("edit-input").value = "";
}

// Save edited task
function saveEditedTask() {
  const input = document.getElementById("edit-input");
  const text = input.value.trim();

  if (!text) {
    alert("Please enter a task.");
    return;
  }

  tasks[currentEditingType][currentEditingIndex].text = text;
  saveTasks();
  renderTasks();
  renderImportantDays();
  closeEditModal();
}

// Delete task
function deleteTask(type, index) {
  currentEditingType = type;
  currentEditingIndex = index;
  document.getElementById("delete-modal").classList.add("show");
}

// Close delete modal
function closeDeleteModal() {
  document.getElementById("delete-modal").classList.remove("show");
}

// Confirm delete
function confirmDelete() {
  tasks[currentEditingType].splice(currentEditingIndex, 1);
  saveTasks();
  renderTasks();
  renderImportantDays();
  closeDeleteModal();
}

// Add important day function
function addImportantDay() {
  const title = prompt("Enter important day title:");
  if (!title) return;

  const detail = prompt("Enter details:");
  if (!detail) return;

  const date = prompt("Enter date (YYYY-MM-DD):");
  if (!date) return;

  const type = prompt("Enter type (holiday, exam, event):");
  if (!type || !["holiday", "exam", "event"].includes(type)) {
    alert("Please enter a valid type: holiday, exam, or event");
    return;
  }

  const icon =
    type === "holiday"
      ? "calendar"
      : type === "exam"
      ? "graduation-cap"
      : "users";

  const newDay = {
    id: Date.now(),
    title: title,
    detail: detail,
    date: date,
    type: type,
    icon: icon,
  };

  importantDays.push(newDay);
  localStorage.setItem("importantDays", JSON.stringify(importantDays));
  renderImportantDays();
}
