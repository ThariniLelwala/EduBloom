// === Simulated Analytics Data (for Study Platform) ===
const activeLearners = 128;       // number of students currently active or learning
const activeForums = 30;          // number of active forum discussions
const newRegistrations = 25;      // new users registered today
const todayLogins = 342;          // total logins today

// Assign values to top bar
document.getElementById('activeLearners').textContent = activeLearners;
document.getElementById('activeForums').textContent = activeForums;
document.getElementById('newRegistrations').textContent = newRegistrations;
document.getElementById('todayLogins').textContent = todayLogins;

// === Chart.js Charts with White Theme ===
const whiteThemeOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      labels: {
        color: '#ffffff',
        font: { size: 12, family: 'Arial, sans-serif' }
      }
    }
  },
  scales: {
    x: {
      ticks: { color: '#ffffff', font: { size: 11 } },
      grid: { color: 'rgba(255, 255, 255, 0.1)' }
    },
    y: {
      ticks: { color: '#ffffff', font: { size: 11 } },
      grid: { color: 'rgba(255, 255, 255, 0.1)' }
    }
  }
};

// === Charts (Unchanged) ===
new Chart(document.getElementById('userGrowthChart'), {
  type: 'line',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Users',
      data: [100, 200, 350, 500, 700, 900],
      borderColor: '#ffffff',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.3,
      pointBackgroundColor: '#ffffff',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6
    }]
  },
  options: whiteThemeOptions
});

new Chart(document.getElementById('dailyLoginChart'), {
  type: 'bar',
  data: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Logins',
      data: [200, 250, 220, 300, 400, 380, 420],
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      borderColor: '#ffffff',
      borderWidth: 1,
      hoverBackgroundColor: 'rgba(255, 255, 255, 1)'
    }]
  },
  options: whiteThemeOptions
});

new Chart(document.getElementById('contentUploadChart'), {
  type: 'line',
  data: {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [{
      label: 'Uploads',
      data: [10, 25, 18, 35],
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      borderColor: '#ffffff',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#ffffff',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6
    }]
  },
  options: whiteThemeOptions
});

// === Tables and Calendar (Unchanged) ===
const activeUsersTable = [
  { user: 'Alice', count: 120 },
  { user: 'Bob', count: 110 },
  { user: 'Charlie', count: 98 },
];

const busiestTimeTable = [
  { time: '9 AM - 12 PM', requests: 3200 },
  { time: '12 PM - 3 PM', requests: 4000 },
  { time: '6 PM - 9 PM', requests: 5200 },
];

function fillTable(id, data, keys) {
  const tbody = document.getElementById(id);
  tbody.innerHTML = data.map(item =>
    `<tr><td>${item[keys[0]]}</td><td>${item[keys[1]]}</td></tr>`
  ).join('');
}

fillTable('activeUserTable', activeUsersTable, ['user', 'count']);
fillTable('busiestTimeTable', busiestTimeTable, ['time', 'requests']);

// === Calendar (Unchanged) ===
function generateCalendar(year, month) {
  const calendar = document.getElementById("calendar");
  const date = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  const weekDays = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  let table = `<div class="calendar-header">
                 <button id="prevMonth">❮</button>
                 <span>${monthNames[month]} ${year}</span>
                 <button id="nextMonth">❯</button>
               </div>
               <table class="calendar-table">
                 <thead><tr>${weekDays.map(d => `<th>${d}</th>`).join("")}</tr></thead>
                 <tbody>`;
  let firstDay = date.getDay();
  let currentDay = 1;
  for (let i = 0; i < 6; i++) {
    let row = "<tr>";
    for (let j = 0; j < 7; j++) {
      if ((i === 0 && j < firstDay) || currentDay > daysInMonth) {
        row += "<td></td>";
      } else {
        const isToday = currentDay === new Date().getDate() &&
          month === new Date().getMonth() &&
          year === new Date().getFullYear();
        row += `<td class="${isToday ? "today" : ""}">${currentDay}</td>`;
        currentDay++;
      }
    }
    row += "</tr>";
    table += row;
  }
  table += "</tbody></table>";
  calendar.innerHTML = table;

  document.getElementById("prevMonth").onclick = () => {
    const newMonth = month === 0 ? 11 : month - 1;
    const newYear = month === 0 ? year - 1 : year;
    generateCalendar(newYear, newMonth);
  };
  document.getElementById("nextMonth").onclick = () => {
    const newMonth = month === 11 ? 0 : month + 1;
    const newYear = month === 11 ? year + 1 : year;
    generateCalendar(newYear, newMonth);
  };
}

generateCalendar(new Date().getFullYear(), new Date().getMonth());
