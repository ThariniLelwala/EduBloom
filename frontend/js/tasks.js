async function loadTasks() {
  const response = await fetch("../data/tasks.json");
  const data = await response.json();

  // Update summary cards
  document.getElementById("todo-completed").textContent = data.todo.filter(
    (t) => t.done
  ).length;
  document.getElementById("weekly-completed").textContent =
    data.weeklyGoals.filter((g) => g.done).length;
  document.getElementById("monthly-completed").textContent =
    data.monthlyGoals.filter((g) => g.done).length;

  // Populate To-Do list
  const todoList = document.getElementById("todo-list");
  todoList.innerHTML = "";
  data.todo.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item.task;
    if (item.done) li.style.textDecoration = "line-through";
    todoList.appendChild(li);
  });

  // Populate Weekly Goals
  const weeklyList = document.getElementById("weekly-list");
  weeklyList.innerHTML = "";
  data.weeklyGoals.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item.goal;
    if (item.done) li.style.textDecoration = "line-through";
    weeklyList.appendChild(li);
  });

  // Populate Monthly Goals
  const monthlyList = document.getElementById("monthly-list");
  monthlyList.innerHTML = "";
  data.monthlyGoals.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item.goal;
    if (item.done) li.style.textDecoration = "line-through";
    monthlyList.appendChild(li);
  });

  // Display date/week/month
  const now = new Date();
  document.getElementById("todo-date").textContent = now.toLocaleDateString(
    undefined,
    { year: "numeric", month: "long", day: "numeric" }
  );

  const weekNumber = Math.ceil(
    ((now - new Date(now.getFullYear(), 0, 1)) / 86400000 + now.getDay() + 1) /
      7
  );
  document.getElementById("weekly-date").textContent = "Week " + weekNumber;

  const monthName = now.toLocaleString("default", { month: "long" });
  document.getElementById("monthly-date").textContent = monthName;
}

loadTasks();
