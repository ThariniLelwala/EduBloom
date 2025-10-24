// js/student/tasks.js
let tasks = {
  todo: [],
  weekly: [],
  monthly: [],
};

let parentTasks = {
  todo: [],
  weekly: [],
  monthly: [],
};

let currentEditingIndex = -1;
let currentEditingType = "";
let currentAddingType = "";
let isEditingParentTask = false;

// Initialize on page load
document.addEventListener("DOMContentLoaded", async () => {
  await archiveExpiredGoals();
  await loadTasks();
  setDates();
  renderTasks();
  setupEventListeners();
});

// Archive expired weekly and monthly goals
async function archiveExpiredGoals() {
  try {
    const result = await studentTodoApi.archiveExpiredGoals();
    if (result.archivedCount > 0) {
      console.log(`Archived ${result.archivedCount} expired goals`);
    }
  } catch (error) {
    // Silent fail - don't interrupt user experience
    console.log("No expired goals to archive");
  }
}

// Load tasks from backend
async function loadTasks() {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      window.location.href = "/login.html";
      return;
    }

    // Load student-created todos
    const allTodos = await studentTodoApi.getTodos();
    tasks = {
      todo: allTodos.todos.filter((t) => t.type === "todo"),
      weekly: allTodos.todos.filter((t) => t.type === "weekly"),
      monthly: allTodos.todos.filter((t) => t.type === "monthly"),
    };

    // Load parent-assigned todos
    const parentTodosData = await studentTodoApi.getParentTodos();
    parentTasks = {
      todo: parentTodosData.todos.filter((t) => t.type === "todo"),
      weekly: parentTodosData.todos.filter((t) => t.type === "weekly"),
      monthly: parentTodosData.todos.filter((t) => t.type === "monthly"),
    };
  } catch (error) {
    console.error("Error loading tasks:", error);
    // Fall back to empty state
    tasks = {
      todo: [],
      weekly: [],
      monthly: [],
    };
    parentTasks = {
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

// Render specific task list with student and parent tasks
function renderTaskList(type) {
  const list = document.getElementById(`${type}-list`);
  if (!list) return;

  list.innerHTML = "";

  // Render student-created tasks
  tasks[type].forEach((task, index) => {
    const li = document.createElement("li");
    li.className = "task-item";
    li.dataset.taskId = task.id;
    li.dataset.isParent = "false";

    // Add completed class if task is marked as completed
    if (task.completed) {
      li.classList.add("completed");
    }

    // Checkbox for students to mark tasks as complete
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = task.completed;
    checkbox.addEventListener("change", async (e) => {
      await toggleTaskComplete(task.id, e.target.checked);
    });

    li.innerHTML = `
      <div class="task-content">
        <span class="task-text">${task.text}</span>
      </div>
      <div class="task-actions">
        <button class="edit-btn" onclick="editTask('${type}', ${index}, false)" title="Edit task">
          <i class="fas fa-edit"></i>
        </button>
        <button class="delete-btn" onclick="deleteTask('${type}', ${index}, false)" title="Delete task">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;

    // Insert checkbox at the beginning
    const checkboxWrapper = document.createElement("div");
    checkboxWrapper.className = "task-checkbox-wrapper";
    checkboxWrapper.appendChild(checkbox);
    li.insertBefore(checkboxWrapper, li.firstChild);

    list.appendChild(li);
  });

  // Add separator if there are both student and parent tasks
  if (tasks[type].length > 0 && parentTasks[type].length > 0) {
    const hr = document.createElement("hr");
    hr.className = "task-separator";
    hr.style.margin = "10px 0";
    hr.style.border = "none";
    hr.style.borderTop = "2px solid #ddd";
    list.appendChild(hr);
  }

  // Render parent-assigned tasks
  parentTasks[type].forEach((task, index) => {
    const li = document.createElement("li");
    li.className = "task-item parent-task";
    li.dataset.taskId = task.id;
    li.dataset.isParent = "true";

    // Add completed class if task is marked as completed
    if (task.completed) {
      li.classList.add("completed");
    }

    // Parent tasks are read-only (no edit/delete for parent-assigned tasks)
    li.innerHTML = `
      <div class="task-content">
        <span class="task-text">${task.text}</span>
        <span class="task-badge" style="background-color: white; color: #333; font-size: 0.7em; padding: 2px 8px; border-radius: 4px; margin-left: 8px; display: inline-block; font-weight: 600;">parent</span>
      </div>
    `;

    // Checkbox for students to mark tasks as complete (parent tasks can also be checked)
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = task.completed;
    checkbox.addEventListener("change", async (e) => {
      await toggleParentTaskComplete(task.id, e.target.checked);
    });

    // Insert checkbox at the beginning
    const checkboxWrapper = document.createElement("div");
    checkboxWrapper.className = "task-checkbox-wrapper";
    checkboxWrapper.appendChild(checkbox);
    li.insertBefore(checkboxWrapper, li.firstChild);

    list.appendChild(li);
  });
}

// Toggle task completion
async function toggleTaskComplete(taskId, completed) {
  try {
    await studentTodoApi.updateTodo(taskId, { completed });
    await loadTasks();
    renderTasks();
  } catch (error) {
    alert("Failed to update task: " + error.message);
  }
}

// Toggle parent-assigned task completion
async function toggleParentTaskComplete(taskId, completed) {
  try {
    // Parent todos are updated via the student parent-todos endpoint
    await studentTodoApi.updateParentTodo(taskId, { completed });
    await loadTasks();
    renderTasks();
  } catch (error) {
    alert("Failed to update task: " + error.message);
  }
}

// Update summary counts
function updateSummary() {
  const todoTotal = document.getElementById("todo-total");
  if (todoTotal) {
    todoTotal.textContent = tasks.todo.length + parentTasks.todo.length;
  }

  const weeklyTotal = document.getElementById("weekly-total");
  if (weeklyTotal) {
    weeklyTotal.textContent = tasks.weekly.length + parentTasks.weekly.length;
  }

  const monthlyTotal = document.getElementById("monthly-total");
  if (monthlyTotal) {
    monthlyTotal.textContent =
      tasks.monthly.length + parentTasks.monthly.length;
  }
}

// Set date information with time remaining
function setDates() {
  const today = new Date();
  const todayStr = today.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const todoDateEl = document.getElementById("todo-date");
  if (todoDateEl) {
    todoDateEl.textContent = `Today - ${todayStr}`;
  }

  // Calculate weekly time remaining
  const daysUntilSunday = 7 - today.getDay();
  const weeklyDateEl = document.getElementById("weekly-date");
  if (weeklyDateEl) {
    if (daysUntilSunday === 0) {
      weeklyDateEl.textContent = "Expires today";
    } else if (daysUntilSunday === 1) {
      weeklyDateEl.textContent = "Expires tomorrow";
    } else {
      weeklyDateEl.textContent = `${daysUntilSunday} days left`;
    }
  }

  // Calculate monthly time remaining
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const daysUntilEndOfMonth = lastDay.getDate() - today.getDate();
  const monthlyDateEl = document.getElementById("monthly-date");
  if (monthlyDateEl) {
    if (daysUntilEndOfMonth === 0) {
      monthlyDateEl.textContent = "Expires today";
    } else if (daysUntilEndOfMonth === 1) {
      monthlyDateEl.textContent = "Expires tomorrow";
    } else {
      monthlyDateEl.textContent = `${daysUntilEndOfMonth} days left`;
    }
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
    await studentTodoApi.createTodo(currentAddingType, text);
    await loadTasks();
    renderTasks();
    closeAddModal();
  } catch (error) {
    alert("Failed to save task: " + error.message);
  }
}

// Edit task
function editTask(type, index, isParent = false) {
  if (isParent) {
    alert("You cannot edit parent-assigned tasks");
    return;
  }

  isEditingParentTask = isParent;
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
  isEditingParentTask = false;
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
    await studentTodoApi.updateTodo(task.id, { text });
    await loadTasks();
    renderTasks();
    closeEditModal();
  } catch (error) {
    alert("Failed to update task: " + error.message);
  }
}

// Delete task
function deleteTask(type, index, isParent = false) {
  if (isParent) {
    alert("You cannot delete parent-assigned tasks");
    return;
  }

  isEditingParentTask = isParent;
  currentEditingType = type;
  currentEditingIndex = index;
  document.getElementById("delete-modal").classList.add("show");
}

// Close delete modal
function closeDeleteModal() {
  document.getElementById("delete-modal").classList.remove("show");
  isEditingParentTask = false;
}

// Confirm delete
async function confirmDelete() {
  try {
    const task = tasks[currentEditingType][currentEditingIndex];
    await studentTodoApi.deleteTodo(task.id);
    await loadTasks();
    renderTasks();
    closeDeleteModal();
  } catch (error) {
    alert("Failed to delete task: " + error.message);
  }
}
