/**
 * Role and Student Type Checking Utility
 * Provides functions to check user roles and student types
 */

/**
 * Check if current user is a university student
 * @returns {boolean} True if user is a university student
 */
function isUniversityStudent() {
  const studentType = localStorage.getItem("studentType");
  const userRole = localStorage.getItem("userRole");
  return userRole === "student" && studentType === "university";
}

/**
 * Check if current user is a school student
 * @returns {boolean} True if user is a school student
 */
function isSchoolStudent() {
  const studentType = localStorage.getItem("studentType");
  const userRole = localStorage.getItem("userRole");
  return userRole === "student" && studentType === "school";
}

/**
 * Check if current user is logged in
 * @returns {boolean} True if user is logged in
 */
function isLoggedIn() {
  return localStorage.getItem("userRole") !== null;
}

/**
 * Get current user role
 * @returns {string} User role (student, teacher, parent, etc.)
 */
function getUserRole() {
  return localStorage.getItem("userRole") || null;
}

/**
 * Get current student type
 * @returns {string|null} Student type (university, school, or null)
 */
function getStudentType() {
  return localStorage.getItem("studentType") || null;
}

/**
 * Ensure student type is loaded from backend if missing
 * Fetches profile data if studentType is not in localStorage
 */
async function ensureStudentTypeLoaded() {
  if (localStorage.getItem("studentType")) {
    return;
  }

  const userRole = localStorage.getItem("userRole");
  if (userRole !== "student") {
    return;
  }

  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      return;
    }

    const response = await fetch("/api/auth/profile", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.user && data.user.student_type) {
        localStorage.setItem("studentType", data.user.student_type);
      }
    }
  } catch (error) {
    console.error("Error fetching student type:", error);
  }
}

/**
 * Restrict page access for university students only
 * Redirects to dashboard if not a university student
 */
async function requireUniversityStudent() {
  await ensureStudentTypeLoaded();

  if (!isUniversityStudent()) {
    alert("This page is only available for university students.");
    window.location.href = "dashboard.html";
    return;
  }
}

/**
 * Restrict page access for school students only
 * Redirects to dashboard if not a school student
 */
async function requireSchoolStudent() {
  await ensureStudentTypeLoaded();

  if (!isSchoolStudent()) {
    alert("This page is only available for school students.");
    window.location.href = "dashboard.html";
    return;
  }
}

/**
 * Hide element if not a university student
 * @param {string} elementId - ID of element to hide
 */
function hideForNonUniversityStudents(elementId) {
  if (!isUniversityStudent()) {
    const element = document.getElementById(elementId);
    if (element) {
      element.style.display = "none";
    }
  }
}

/**
 * Hide element if not a school student
 * @param {string} elementId - ID of element to hide
 */
function hideForNonSchoolStudents(elementId) {
  if (!isSchoolStudent()) {
    const element = document.getElementById(elementId);
    if (element) {
      element.style.display = "none";
    }
  }
}

/**
 * Show element only for university students
 * @param {string} elementId - ID of element to show
 */
function showForUniversityStudents(elementId) {
  if (isUniversityStudent()) {
    const element = document.getElementById(elementId);
    if (element) {
      element.style.display = "block";
    }
  }
}

/**
 * Show element only for school students
 * @param {string} elementId - ID of element to show
 */
function showForSchoolStudents(elementId) {
  if (isSchoolStudent()) {
    const element = document.getElementById(elementId);
    if (element) {
      element.style.display = "block";
    }
  }
}