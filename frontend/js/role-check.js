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

  // Log for debugging
  console.log(
    "Checking university student - studentType:",
    studentType,
    "userRole:",
    userRole
  );

  return userRole === "student" && studentType === "university";
}

/**
 * Check if current user is a school student
 * @returns {boolean} True if user is a school student
 */
function isSchoolStudent() {
  const studentType = localStorage.getItem("studentType");
  const userRole = localStorage.getItem("userRole");

  // Log for debugging
  console.log(
    "Checking school student - studentType:",
    studentType,
    "userRole:",
    userRole
  );

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
  // If student type is already loaded, don't fetch again
  if (localStorage.getItem("studentType")) {
    console.log(
      "Student type already in localStorage:",
      localStorage.getItem("studentType")
    );
    return;
  }

  // If user is not a student, no need to load student type
  const userRole = localStorage.getItem("userRole");
  if (userRole !== "student") {
    console.log("User is not a student, skipping student type fetch");
    return;
  }

  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.log("No auth token found");
      return;
    }

    console.log("Fetching student profile to get student type...");
    const response = await fetch("/api/auth/profile", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Profile response:", data);

      if (data.user && data.user.student_type) {
        localStorage.setItem("studentType", data.user.student_type);
        console.log(
          "Student type loaded from backend:",
          data.user.student_type
        );
      }
    } else {
      console.log("Failed to fetch profile:", response.status);
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
  console.log("=== Checking University Student Access ===");
  console.log("studentType:", localStorage.getItem("studentType"));
  console.log("userRole:", localStorage.getItem("userRole"));

  // Ensure student type is loaded from backend if missing
  await ensureStudentTypeLoaded();

  console.log("isUniversityStudent():", isUniversityStudent());

  if (!isUniversityStudent()) {
    console.log("Access denied - not a university student");
    alert("This page is only available for university students.");
    window.location.href = "dashboard.html";
    return;
  }
  console.log("Access granted - is a university student");
}

/**
 * Restrict page access for school students only
 * Redirects to dashboard if not a school student
 */
async function requireSchoolStudent() {
  console.log("=== Checking School Student Access ===");
  console.log("studentType:", localStorage.getItem("studentType"));
  console.log("userRole:", localStorage.getItem("userRole"));

  // Ensure student type is loaded from backend if missing
  await ensureStudentTypeLoaded();

  console.log("isSchoolStudent():", isSchoolStudent());

  if (!isSchoolStudent()) {
    console.log("Access denied - not a school student");
    alert("This page is only available for school students.");
    window.location.href = "dashboard.html";
    return;
  }
  console.log("Access granted - is a school student");
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
