// View Teachers Page JavaScript

document.addEventListener("DOMContentLoaded", function () {
  checkAuth();
  initializeViewTeachers();
});

function checkAuth() {
  const token = localStorage.getItem("authToken");
  if (!token) {
    window.location.href = "../../login.html";
    return false;
  }
  return true;
}

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

async function loadTeachers() {
  const teachersGrid = document.getElementById("teachers-grid");
  teachersGrid.innerHTML = '<p style="text-align: center; padding: 40px; color: rgba(255,255,255,0.6);">Loading teachers...</p>';

  try {
    const token = localStorage.getItem("authToken");
    const response = await fetch("/api/public/teachers", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch teachers");
    
    const data = await response.json();
    const rawTeachers = Array.isArray(data) ? data : [];
    
    allTeachers = rawTeachers.map(teacher => ({
      id: teacher.teacher_id,
      teacher_id: teacher.teacher_id,
      name: teacher.teacher_name,
      teacher_name: teacher.teacher_name,
      verified: teacher.verified || false,
      subject: teacher.subjects && teacher.subjects.length > 0 
        ? teacher.subjects[0].subject_name.toLowerCase().replace(/\s+/g, "-") 
        : "general",
      subjectDisplay: teacher.subjects && teacher.subjects.length > 0 
        ? teacher.subjects.map(s => s.subject_name).join(", ") 
        : "General",
      subjects: teacher.subjects || [],
      rating: teacher.rating || 4.0,
      reviewCount: teacher.reviewCount || 0,
      students: teacher.students || 0,
      description: teacher.description || null,
      qualifications: teacher.qualifications || {},
      experienceYears: teacher.qualifications?.experience_years || 0,
      certifications: teacher.qualifications?.certifications || [],
      degrees: teacher.qualifications?.degree || [],
      subjects_taught: teacher.qualifications?.subjects_taught || [],
      schools_taught: teacher.qualifications?.schools_taught || [],
      linkedin: teacher.qualifications?.linkedin || null
    }));

    populateSubjectFilters();
    displayTeachers(allTeachers);
  } catch (error) {
    console.error("Error loading teachers:", error);
    teachersGrid.innerHTML = '<p style="text-align: center; padding: 40px; color: rgba(255,255,255,0.6);">Failed to load teachers. Please try again later.</p>';
  }
}

function getSampleTeachers() {
  return [
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
}

function displayTeachers(teachers) {
  const teachersGrid = document.getElementById("teachers-grid");
  const teachersCount = document.getElementById("teachers-count");

  teachersCount.textContent = `All Teachers (${teachers.length})`;

  if (teachers.length === 0) {
    teachersGrid.innerHTML = '<p style="text-align: center; padding: 40px; color: rgba(255,255,255,0.6);">No teachers found.</p>';
    return;
  }

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

  const verifiedBadge = teacher.verified 
    ? `<span class="verified-badge"><i class="fas fa-check-circle"></i> Verified</span>` 
    : "";

  const hasProfile = teacher.description || teacher.certifications.length > 0 || 
                     teacher.degrees.length > 0 || teacher.experienceYears > 0;

  let qualificationsHtml = "";
  if (hasProfile) {
    const qualifiers = [];
    if (teacher.degrees.length > 0) {
      qualifiers.push(`<span class="qualification-tag"><i class="fas fa-graduation-cap"></i> ${escapeHtml(truncate(teacher.degrees[0], 25))}</span>`);
    }
    if (teacher.experienceYears > 0) {
      qualifiers.push(`<span class="qualification-tag"><i class="fas fa-calendar-alt"></i> ${teacher.experienceYears} years exp</span>`);
    }
    if (teacher.certifications.length > 0) {
      qualifiers.push(`<span class="qualification-tag"><i class="fas fa-certificate"></i> ${escapeHtml(truncate(teacher.certifications[0], 25))}</span>`);
    }

    qualificationsHtml = `
      <div class="teacher-card-expanded">
        <div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-bottom: 4px;">
          ${verifiedBadge}
        </div>
        <div class="teacher-qualifications">
          ${qualifiers.join("")}
          ${teacher.certifications.length > 1 ? `<span class="qualification-tag" style="color: rgba(255,255,255,0.6);">+${teacher.certifications.length - 1} more</span>` : ""}
        </div>
      </div>
    `;
  } else {
    qualificationsHtml = `
      <div class="teacher-card-expanded">
        ${verifiedBadge}
        <div style="font-size: 0.85em; color: rgba(255,255,255,0.5); margin-top: 4px;">
          Profile not set up yet
        </div>
      </div>
    `;
  }

  teacherDiv.innerHTML = `
    <div class="teacher-info">
      <span class="teacher-name">${teacher.name}${teacher.verified ? ' <i class="fas fa-check-circle" style="color: #2ed573; font-size: 0.8em;"></i>' : ''}</span>
      <span class="teacher-subject">${teacher.subjectDisplay}</span>
      ${hasProfile && teacher.description ? `<span class="teacher-description" style="font-size: 0.85em; color: rgba(255,255,255,0.7);">${escapeHtml(truncate(teacher.description, 120))}</span>` : ""}
    </div>
    <div class="teacher-rating">
      <i class="fas fa-star"></i>
      <span>${teacher.rating.toFixed(1)}</span>
      <span style="color: rgba(255, 255, 255, 0.6); font-size: 0.8rem; margin-left: 4px;">
        (${teacher.reviewCount})
      </span>
      ${teacher.students > 0 ? `<span style="color: rgba(255, 255, 255, 0.6); font-size: 0.75rem; margin-left: 8px;"><i class="fas fa-users"></i> ${teacher.students}</span>` : ""}
    </div>
    ${qualificationsHtml}
  `;

  return teacherDiv;
}

function truncate(str, maxLength) {
  if (!str) return "";
  return str.length > maxLength ? str.substring(0, maxLength) + "..." : str;
}

function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function initializeFilters() {
  initializeCustomSelect("subject-filter", "subject-options");
  initializeCustomSelect("rating-filter", "rating-options");
  populateSubjectFilters();
}

function populateSubjectFilters() {
  const subjectOptions = document.getElementById("subject-options");
  const subjects = new Set();
  
  allTeachers.forEach(teacher => {
    if (teacher.subjects) {
      teacher.subjects.forEach(subject => {
        const subjectKey = subject.subject_name.toLowerCase().replace(/\s+/g, "-");
        const subjectName = subject.subject_name;
        subjects.add({ key: subjectKey, name: subjectName });
      });
    }
  });

  // Sort subjects alphabetically
  const sortedSubjects = Array.from(subjects).sort((a, b) => a.name.localeCompare(b.name));

  sortedSubjects.forEach(subject => {
    const option = document.createElement("div");
    option.className = "custom-select-option";
    option.setAttribute("data-value", subject.key);
    option.textContent = subject.name;
    subjectOptions.appendChild(option);
  });
}

function initializeCustomSelect(displayId, optionsId) {
  const display = document.getElementById(displayId);
  const options = document.getElementById(optionsId);

  display.addEventListener("click", function () {
    document.querySelectorAll(".custom-select-options.show").forEach((opt) => {
      if (opt.id !== optionsId) {
        opt.classList.remove("show");
      }
    });
    options.classList.toggle("show");
  });

  options.addEventListener("click", function (e) {
    if (e.target.classList.contains("custom-select-option")) {
      const value = e.target.getAttribute("data-value");
      const text = e.target.textContent;

      display.textContent = text;

      if (displayId === "subject-filter") {
        currentFilters.subject = value;
      } else if (displayId === "rating-filter") {
        currentFilters.rating = value;
      }

      options.classList.remove("show");
      applyFilters();
    }
  });
}

function setupFilterListeners() {
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

  if (currentFilters.subject !== "all") {
    filteredTeachers = filteredTeachers.filter(
      (teacher) => teacher.subject === currentFilters.subject
    );
  }

  if (currentFilters.rating !== "all") {
    const minRating = parseFloat(currentFilters.rating);
    filteredTeachers = filteredTeachers.filter(
      (teacher) => teacher.rating >= minRating
    );
  }

  displayTeachers(filteredTeachers);
}

function viewTeacherProfile(teacherId) {
  const teacher = allTeachers.find((t) => t.id == teacherId);
  if (teacher) {
    showNotification(`Viewing profile for ${teacher.name}`, "info");
  }
}

function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === "error" ? "rgba(239, 68, 68, 0.9)" : "rgba(74, 222, 128, 0.9)"};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-weight: 500;
    z-index: 1000;
    animation: slideIn 0.3s ease;
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

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
