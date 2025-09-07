document.addEventListener("DOMContentLoaded", () => {
  const monthYear = document.getElementById("monthYear");
  const calendarDays = document.getElementById("calendarDays");
  const prevBtn = document.getElementById("prevMonth");
  const nextBtn = document.getElementById("nextMonth");

  let currentDate = new Date();

  function renderCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const prevLastDate = new Date(year, month, 0).getDate();

    monthYear.textContent = date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    calendarDays.innerHTML = "";

    for (let i = firstDay; i > 0; i--) {
      const div = document.createElement("div");
      div.classList.add("calendar-date", "inactive");
      div.textContent = prevLastDate - i + 1;
      calendarDays.appendChild(div);
    }

    for (let i = 1; i <= lastDate; i++) {
      const div = document.createElement("div");
      div.classList.add("calendar-date");
      div.textContent = i;

      const today = new Date();
      if (
        i === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear()
      ) {
        div.classList.add("today");
      }

      calendarDays.appendChild(div);
    }

    const totalCells = firstDay + lastDate;
    const nextDays = 7 - (totalCells % 7);
    if (nextDays < 7) {
      for (let i = 1; i <= nextDays; i++) {
        const div = document.createElement("div");
        div.classList.add("calendar-date", "inactive");
        div.textContent = i;
        calendarDays.appendChild(div);
      }
    }
  }

  prevBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar(currentDate);
  });

  nextBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar(currentDate);
  });

  renderCalendar(currentDate);
});
