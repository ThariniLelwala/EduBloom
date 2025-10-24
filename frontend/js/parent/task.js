// js/parent/task.js
let tasks = {
  todo: [],
  weekly: [],
  monthly: [],
};

let currentEditingIndex = -1;
let currentEditingType = "";
let currentAddingType = "";
let currentStudentId = null;

// Initialize on page load
document.addEventListener("DOMContentLoaded", async () => {
  await loadStudents();
  await archiveExpiredGoals();
  await loadTasks();
  setDates();
  renderTasks();
  setupEventListeners();
});

// Archive expired weekly and monthly goals
async function archiveExpiredGoals() {
  try {
    const result = await todoApi.archiveExpiredGoals();
    if (result.archivedCount > 0) {
      console.log(`Archived ${result.archivedCount} expired goals`);
    }
  } catch (error) {
    // Silent fail - don't interrupt user experience
    console.log("No expired goals to archive");
  }
}

// Load students for parent
async function loadStudents() {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      window.location.href = "/login.html";
      return;
    }

    const students = await todoApi.getStudents();
    if (students && students.length > 0) {
      // Use first student by default
      currentStudentId = students[0].id;
    }
  } catch (error) {
    console.error("Error loading students:", error);
  }
}

// Load tasks from backend for current student
async function loadTasks() {
  try {
    if (!currentStudentId) {
      console.log("No student selected");
      tasks = {
        todo: [],
        weekly: [],
        monthly: [],
      };
      return;
    }

    const allTodos = await todoApi.getTodos(currentStudentId);
    tasks = {
      todo: allTodos.filter((t) => t.type === "todo"),
      weekly: allTodos.filter((t) => t.type === "weekly"),
      monthly: allTodos.filter((t) => t.type === "monthly"),
    };
  } catch (error) {
    console.error("Error loading tasks:", error);
    // Fall back to empty state
    tasks = {
      todo: [],
      weekly: [],
      monthly: [],
    };
  }
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

    // Add completed class if task is marked as completed by student
    if (task.completed) {
      li.classList.add("completed");
    }

    // Show completion status indicator
    const completedIndicator = task.completed
      ? '<span class="completion-indicator" title="Completed by student"><i class="fas fa-check-circle"></i></span>'
      : '<span class="completion-indicator pending" title="Not yet completed"><i class="fas fa-circle"></i></span>';

    li.innerHTML = `
      <div class="task-content">
        ${completedIndicator}
        <span class="task-text">${task.text}</span>
      </div>
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

// Set date information with time remaining
function setDates() {
  const today = new Date();
  const todayStr = today.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  document.getElementById("todo-date").textContent = `Today - ${todayStr}`;

  // Calculate weekly time remaining
  const daysUntilSunday = 7 - today.getDay();
  if (daysUntilSunday === 0) {
    document.getElementById("weekly-date").textContent = "Expires today";
  } else if (daysUntilSunday === 1) {
    document.getElementById("weekly-date").textContent = "Expires tomorrow";
  } else {
    document.getElementById(
      "weekly-date"
    ).textContent = `${daysUntilSunday} days left`;
  }

  // Calculate monthly time remaining
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const daysUntilEndOfMonth = lastDay.getDate() - today.getDate();
  if (daysUntilEndOfMonth === 0) {
    document.getElementById("monthly-date").textContent = "Expires today";
  } else if (daysUntilEndOfMonth === 1) {
    document.getElementById("monthly-date").textContent = "Expires tomorrow";
  } else {
    document.getElementById(
      "monthly-date"
    ).textContent = `${daysUntilEndOfMonth} days left`;
  }
}

// Setup event listeners
function setupEventListeners() {
  // Add buttons - use data-type attribute from HTML
  document.querySelectorAll(".add-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      // Get type from data-type attribute
      const type = e.target.getAttribute("data-type") || "todo";
      openAddModal(type);
    });
  });

  // Modal buttons
  document.getElementById("modal-save").addEventListener("click", saveTask);
  document
    .getElementById("modal-cancel")
    .addEventListener("click", closeAddModal);
  document
    .getElementById("modal-close")
    .addEventListener("click", closeAddModal);

  document
    .getElementById("edit-save")
    .addEventListener("click", saveEditedTask);
  document
    .getElementById("edit-cancel")
    .addEventListener("click", closeEditModal);
  document
    .getElementById("edit-modal-close")
    .addEventListener("click", closeEditModal);

  document
    .getElementById("delete-confirm")
    .addEventListener("click", confirmDelete);
  document
    .getElementById("delete-cancel")
    .addEventListener("click", closeDeleteModal);
  document
    .getElementById("delete-modal-close")
    .addEventListener("click", closeDeleteModal);

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
  if (!currentStudentId) {
    alert("No student linked. Please link a student first.");
    return;
  }

  const modal = document.getElementById("task-modal");
  const title = document.getElementById("modal-title");
  const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);

  currentAddingType = type;
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
async function saveTask() {
  const input = document.getElementById("task-input");
  const text = input.value.trim();

  if (!text) {
    alert("Please enter a task");
    return;
  }

  try {
    if (!currentStudentId) {
      alert("No student selected");
      return;
    }

    await todoApi.createTodo(currentStudentId, currentAddingType, text);
    await loadTasks();
    renderTasks();
    closeAddModal();
  } catch (error) {
    alert("Failed to save task: " + error.message);
  }
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
async function saveEditedTask() {
  const input = document.getElementById("edit-input");
  const text = input.value.trim();

  if (!text) {
    alert("Please enter a task");
    return;
  }

  try {
    const task = tasks[currentEditingType][currentEditingIndex];
    await todoApi.updateTodo(task.id, { text });
    await loadTasks();
    renderTasks();
    closeEditModal();
  } catch (error) {
    alert("Failed to update task: " + error.message);
  }
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
async function confirmDelete() {
  try {
    const task = tasks[currentEditingType][currentEditingIndex];
    await todoApi.deleteTodo(task.id);
    await loadTasks();
    renderTasks();
    closeDeleteModal();
  } catch (error) {
    alert("Failed to delete task: " + error.message);
  }
}
