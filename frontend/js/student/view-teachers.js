// View Teachers Page JavaScript

document.addEventListener("DOMContentLoaded", function () {
  initializeViewTeachers();
});

function initializeViewTeachers() {
  loadTeachers();
  initializeFilters();
  setupFilterListeners();
}

let allTeachers = [];
let currentFilters = {
  subject: "all",
  rating: "all",
};

// Sample teacher data
const sampleTeachers = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    subject: "mathematics",
    subjectDisplay: "Mathematics",
    rating: 4.5,
    reviewCount: 127,
    students: 2847,
    experience: 12,
    description: "Specializes in Advanced Calculus and Statistics",
  },
  {
    id: 2,
    name: "Prof. Michael Chen",
    subject: "science",
    subjectDisplay: "Science",
    rating: 4.7,
    reviewCount: 89,
    students: 1923,
    experience: 15,
    description: "Expert in Physics and Chemistry",
  },
  {
    id: 3,
    name: "Ms. Emily Davis",
    subject: "english",
    subjectDisplay: "English",
    rating: 4.3,
    reviewCount: 156,
    students: 3421,
    experience: 8,
    description: "Literature and Writing specialist",
  },
  {
    id: 4,
    name: "Dr. Robert Wilson",
    subject: "history",
    subjectDisplay: "History",
    rating: 4.6,
    reviewCount: 94,
    students: 2156,
    experience: 18,
    description: "World History and Social Studies",
  },
  {
    id: 5,
    name: "Prof. Lisa Anderson",
    subject: "computer-science",
    subjectDisplay: "Computer Science",
    rating: 4.8,
    reviewCount: 203,
    students: 3876,
    experience: 10,
    description: "Programming and Algorithms expert",
  },
  {
    id: 6,
    name: "Mr. David Brown",
    subject: "mathematics",
    subjectDisplay: "Mathematics",
    rating: 4.2,
    reviewCount: 78,
    students: 1654,
    experience: 6,
    description: "Algebra and Geometry specialist",
  },
  {
    id: 7,
    name: "Dr. Jennifer Lee",
    subject: "science",
    subjectDisplay: "Science",
    rating: 4.4,
    reviewCount: 112,
    students: 2234,
    experience: 11,
    description: "Biology and Environmental Science",
  },
  {
    id: 8,
    name: "Ms. Maria Rodriguez",
    subject: "english",
    subjectDisplay: "English",
    rating: 4.1,
    reviewCount: 67,
    students: 1432,
    experience: 7,
    description: "Creative Writing and Literature",
  },
  {
    id: 9,
    name: "Prof. James Taylor",
    subject: "history",
    subjectDisplay: "History",
    rating: 4.5,
    reviewCount: 134,
    students: 2987,
    experience: 14,
    description: "Ancient Civilizations and Archaeology",
  },
  {
    id: 10,
    name: "Dr. Amanda White",
    subject: "computer-science",
    subjectDisplay: "Computer Science",
    rating: 4.9,
    reviewCount: 245,
    students: 4123,
    experience: 13,
    description: "AI and Machine Learning specialist",
  },
  {
    id: 11,
    name: "Mr. Thomas Garcia",
    subject: "mathematics",
    subjectDisplay: "Mathematics",
    rating: 4.0,
    reviewCount: 45,
    students: 987,
    experience: 4,
    description: "Basic Math and Pre-Algebra",
  },
  {
    id: 12,
    name: "Prof. Rachel Martinez",
    subject: "science",
    subjectDisplay: "Science",
    rating: 4.6,
    reviewCount: 178,
    students: 3456,
    experience: 16,
    description: "Chemistry and Lab Sciences",
  },
];

function loadTeachers() {
  allTeachers = sampleTeachers;
  displayTeachers(allTeachers);
}

function displayTeachers(teachers) {
  const teachersGrid = document.getElementById("teachers-grid");
  const teachersCount = document.getElementById("teachers-count");

  teachersCount.textContent = `All Teachers (${teachers.length})`;

  teachersGrid.innerHTML = "";

  teachers.forEach((teacher) => {
    const teacherElement = createTeacherElement(teacher);
    teachersGrid.appendChild(teacherElement);
  });
}

function createTeacherElement(teacher) {
  const teacherDiv = document.createElement("div");
  teacherDiv.className = "teacher-item";
  teacherDiv.onclick = () => viewTeacherProfile(teacher.id);

  teacherDiv.innerHTML = `
    <div class="teacher-info">
      <span class="teacher-name">${teacher.name}</span>
      <span class="teacher-subject">${teacher.subjectDisplay} • ${teacher.description}</span>
    </div>
    <div class="teacher-rating">
      <i class="fas fa-star"></i>
      <span>${teacher.rating}</span>
      <span style="color: rgba(255, 255, 255, 0.6); font-size: 0.8rem; margin-left: 4px;">
        (${teacher.reviewCount})
      </span>
    </div>
  `;

  return teacherDiv;
}

function initializeFilters() {
  // Initialize custom select functionality
  initializeCustomSelect("subject-filter", "subject-options");
  initializeCustomSelect("rating-filter", "rating-options");
}

function initializeCustomSelect(displayId, optionsId) {
  const display = document.getElementById(displayId);
  const options = document.getElementById(optionsId);

  display.addEventListener("click", function () {
    // Close other dropdowns
    document.querySelectorAll(".custom-select-options.show").forEach((opt) => {
      if (opt.id !== optionsId) {
        opt.classList.remove("show");
      }
    });

    // Toggle this dropdown
    options.classList.toggle("show");
  });

  // Handle option selection
  options.addEventListener("click", function (e) {
    if (e.target.classList.contains("custom-select-option")) {
      const value = e.target.getAttribute("data-value");
      const text = e.target.textContent;

      // Update display
      display.textContent = text;

      // Update current filters
      if (displayId === "subject-filter") {
        currentFilters.subject = value;
      } else if (displayId === "rating-filter") {
        currentFilters.rating = value;
      }

      // Close dropdown
      options.classList.remove("show");

      // Apply filters
      applyFilters();
    }
  });
}

function setupFilterListeners() {
  // Close dropdowns when clicking outside
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".custom-select-wrapper")) {
      document
        .querySelectorAll(".custom-select-options.show")
        .forEach((opt) => {
          opt.classList.remove("show");
        });
    }
  });
}

function applyFilters() {
  let filteredTeachers = [...allTeachers];

  // Filter by subject
  if (currentFilters.subject !== "all") {
    filteredTeachers = filteredTeachers.filter(
      (teacher) => teacher.subject === currentFilters.subject
    );
  }

  // Filter by rating
  if (currentFilters.rating !== "all") {
    const minRating = parseFloat(currentFilters.rating);
    filteredTeachers = filteredTeachers.filter(
      (teacher) => teacher.rating >= minRating
    );
  }

  displayTeachers(filteredTeachers);
}

function viewTeacherProfile(teacherId) {
  // For now, show a notification. In a real app, this would navigate to teacher profile
  const teacher = allTeachers.find((t) => t.id === teacherId);
  showNotification(`Viewing profile for ${teacher.name}`, "info");

  // Could navigate to teacher profile page in the future
  // window.location.href = `../teacher/teacher-profile.html?id=${teacherId}`;
}

function showNotification(message, type = "info") {
  // Create a simple notification
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(74, 222, 128, 0.9);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;

  document.body.appendChild(notification);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Add notification animations
const style = document.createElement("style");
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
