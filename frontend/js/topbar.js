// topbar.js

// Create a function to generate the topbar HTML
async function createTopbar() {
  const topbarHTML = `
    <div id="topbar">
      <div id="sidebar-toggle-topbar">
        <i class="fas fa-bars"></i>
      </div>
      <div class="logo">
        <img src="/assets/icons/logo.svg" width="40px" alt="EduBloom Logo" />
        <span>EduBloom</span>
      </div>
      <div id="profile" onclick="toggleDropdown()">
        <i class="fas fa-circle-user"></i>
      </div>
      <div id="user-dropdown" class="dropdown-menu">
        <ul>
          <li id="dropdown-username">Loading...</li>
          <li id="dropdown-email">Loading...</li>
          <li id="dropdown-role">Loading...</li>
          <li id="dropdown-student-type" style="display: none;"></li>
          <li><a href="/dashboards/student/settings.html">Settings</a></li>
          <li><a href="#" onclick="logout()">Logout</a></li>
        </ul>
      </div>
    </div>
  `;

  // Inject the topbar HTML into the DOM
  const body = document.querySelector("body");
  const topbarContainer = document.createElement("div");
  topbarContainer.innerHTML = topbarHTML;
  body.prepend(topbarContainer); // safer than insertBefore

  // Fetch profile data
  await fetchProfileData();
}

// Fetch user profile data
async function fetchProfileData() {
  const token = localStorage.getItem("authToken");

  if (!token) {
    window.location.href = "/login.html";
    return;
  }

  try {
    const res = await fetch("/api/auth/profile", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await res.json();

    if (res.ok) {
      // Update dropdown with user info
      document.getElementById("dropdown-username").textContent =
        result.user.username;
      document.getElementById("dropdown-email").textContent = result.user.email;
      document.getElementById(
        "dropdown-role"
      ).textContent = `Role: ${result.user.role}`;

      // Store in localStorage (so other pages can use it if needed)
      localStorage.setItem("username", result.user.username);
      localStorage.setItem("email", result.user.email);
      localStorage.setItem("userRole", result.user.role);
      localStorage.setItem("userId", result.user.id);
      
      // Handle student type display
      if (result.user.student_type) {
        localStorage.setItem("studentType", result.user.student_type);
        const studentTypeEl = document.getElementById("dropdown-student-type");
        const studentTypeLabel = result.user.student_type === "university" 
          ? "University Student" 
          : "School Student";
        studentTypeEl.textContent = `Type: ${studentTypeLabel}`;
        studentTypeEl.style.display = "block";
      }
    } else {
      alert(result.error || "Error fetching profile.");
      window.location.href = "/login.html";
    }
  } catch (err) {
    console.error("Error fetching profile:", err.message);
    window.location.href = "/login.html";
  }
}

// Toggle the dropdown visibility
function toggleDropdown() {
  const dropdownMenu = document.getElementById("user-dropdown");
  dropdownMenu.classList.toggle("show");
}

// Handle logout
function logout() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("username");
  localStorage.removeItem("email");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userId");
  localStorage.removeItem("studentType");
  window.location.href = "/login.html";
}

// Run on page load
createTopbar();
