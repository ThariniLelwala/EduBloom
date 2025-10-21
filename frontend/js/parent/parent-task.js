// Parent Task Management Script
let tasks = {
  todo: [],
  weekly: [],
  monthly: [],
};

let currentEditingIndex = -1;
let currentEditingType = "";
let currentAddingType = "";

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  loadTasks();
  setDates();
  renderTasks();
  setupEventListeners();
});

// Load tasks from localStorage
function loadTasks() {
  const savedTasks = localStorage.getItem("parentTasks");
  if (savedTasks) {
    tasks = JSON.parse(savedTasks);
  } else {
    // Default sample tasks
    tasks = {
      todo: [
        {
          id: 1,
          text: "Complete Mathematics homework",
          completed: false,
        },
        { id: 2, text: "Read Chapter 5 of History", completed: false },
      ],
      weekly: [
        { id: 3, text: "Finish Science project", completed: false },
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
    saveTasks();
  }
}

// Save tasks to localStorage
function saveTasks() {
  localStorage.setItem("parentTasks", JSON.stringify(tasks));
}

// Render all tasks
function renderTasks() {
  renderTaskList("todo");
  renderTaskList("weekly");
  renderTaskList("monthly");
  updateSummary();
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

  // Update count
  const total = document.getElementById(`${type}-total`);
  if (total) {
    total.textContent = tasks[type].length;
  }
}

// Update summary counts
function updateSummary() {
  document.getElementById("todo-total").textContent = tasks.todo.length;
  document.getElementById("weekly-total").textContent = tasks.weekly.length;
  document.getElementById("monthly-total").textContent = tasks.monthly.length;
}

// Set date information
function setDates() {
  const today = new Date();
  const todayStr = today.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  document.getElementById("todo-date").textContent = `Today - ${todayStr}`;
  document.getElementById("weekly-date").textContent = "This week";
  document.getElementById("monthly-date").textContent = "This month";
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
    alert("Please enter a task/goal.");
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
    alert("Please enter a task/goal.");
    return;
  }

  tasks[currentEditingType][currentEditingIndex].text = text;
  saveTasks();
  renderTasks();
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
  closeDeleteModal();
}
