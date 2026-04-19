// parent-progress.js - Loads child's progress data for parent view

let selectedChild = null;
let children = [];

async function loadChildProgressData() {
  try {
    const userRole = localStorage.getItem("userRole");

    if (userRole !== "parent") {
      return false;
    }

    // Fetch list of children
    const token = localStorage.getItem("authToken");
    const childrenResponse = await fetch("/api/parent/children", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!childrenResponse.ok) {
      console.error("Failed to fetch children");
      return false;
    }

    const childrenData = await childrenResponse.json();
    children = childrenData.children || [];

    if (children.length === 0) {
      console.log("No children linked to this parent");
      showNoChildrenState();
      return false;
    }

    // Get previously selected child from localStorage or use first child
    const savedChildId = localStorage.getItem("selectedChildId");
    selectedChild = savedChildId 
      ? children.find(child => child.id === parseInt(savedChildId)) 
      : children[0];

    if (!selectedChild) {
      selectedChild = children[0];
    }

    // Store the selected child in localStorage
    localStorage.setItem("selectedChildId", selectedChild.id);
    localStorage.setItem("selectedChildName", selectedChild.username);
    localStorage.setItem("selectedChildType", selectedChild.student_type);

    // Update the welcome message to show child's name
    const welcomeHeading = document.querySelector(".heading");
    if (welcomeHeading) {
      welcomeHeading.textContent = `${selectedChild.username}'s Progress Journey`;
    }

    // Load real progress data
    await loadChildRealProgressData();

    return true;
  } catch (error) {
    console.error("Error loading child progress data:", error);
    return false;
  }
}

async function loadChildRealProgressData() {
  if (!selectedChild) {
    console.error("No child selected");
    return;
  }

  try {
    // Load all progress data using the API
    const progressData = await parentProgressApi.getAllProgressData(selectedChild.id);

    // Store data globally for progress.js to use
    window.childProgressData = progressData;

    // Trigger data processing in parent-progress-display.js
    if (window.processParentProgressData) {
      window.processParentProgressData(progressData);
    }

    console.log("Child progress data loaded successfully");
  } catch (error) {
    console.error("Error loading child real progress data:", error);
    // Show error message to user
    showError("Failed to load progress data. Please try again.");
  }
}

function showError(message) {
  // Create or update error message element
  let errorElement = document.getElementById("progress-error");
  if (!errorElement) {
    errorElement = document.createElement("div");
    errorElement.id = "progress-error";
    errorElement.className = "error-message";
    document.querySelector("#content").prepend(errorElement);
  }
  errorElement.textContent = message;
  errorElement.style.display = "block";
}

function hideError() {
  const errorElement = document.getElementById("progress-error");
  if (errorElement) {
    errorElement.style.display = "none";
  }
}

function showNoChildrenState() {
  // Hide the card grid and show full page empty state
  const cardGrid = document.querySelector(".card-grid");
  const mainContent = document.querySelector("#content");
  
  if (cardGrid && mainContent) {
    cardGrid.style.display = "none";
    
    // Create full page empty state
    const emptyStateHtml = `
      <div class="full-page-empty-state">
        <div class="empty-state-icon">
          <i class="fas fa-user-plus"></i>
        </div>
        <div class="empty-state-message">No children linked to your account</div>
        <div class="empty-state-subtext">Link a child to view their progress and support their learning journey</div>
        <button class="empty-state-cta" onclick="window.location.href='dashboard.html'">Link a Child</button>
      </div>
    `;
    
    // Insert empty state after hiding card grid
    mainContent.innerHTML = emptyStateHtml;
  }
}

// Initialize child selector dropdown
function initializeChildSelector() {
  if (children.length === 0) return;

  // Check if selector already exists
  let selector = document.getElementById("child-selector");
  if (selector) return;

  // Create selector container
  const selectorContainer = document.createElement("div");
  selectorContainer.className = "child-selector-container";
  selectorContainer.innerHTML = `
    <label for="child-selector">Viewing progress for:</label>
    <select id="child-selector">
      ${children.map(child => `
        <option value="${child.id}" ${child.id === selectedChild.id ? 'selected' : ''}>
          ${child.username} (${child.student_type || 'student'})
        </option>
      `).join('')}
    </select>
  `;

  // Insert selector after the welcome card
  const welcomeCard = document.querySelector(".card.welcome");
  if (welcomeCard && welcomeCard.parentNode) {
    welcomeCard.parentNode.insertBefore(selectorContainer, welcomeCard.nextSibling);
  }

  // Add change event listener
  selector = document.getElementById("child-selector");
  selector.addEventListener("change", async (e) => {
    const childId = parseInt(e.target.value);
    selectedChild = children.find(child => child.id === childId);
    
    if (selectedChild) {
      localStorage.setItem("selectedChildId", selectedChild.id);
      localStorage.setItem("selectedChildName", selectedChild.username);
      localStorage.setItem("selectedChildType", selectedChild.student_type);
      
      // Update welcome message
      const welcomeHeading = document.querySelector(".heading");
      if (welcomeHeading) {
        welcomeHeading.textContent = `${selectedChild.username}'s Progress Journey`;
      }
      
      // Reload progress data
      hideError();
      await loadChildRealProgressData();
    }
  });
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", async () => {
  await loadChildProgressData();
  initializeChildSelector();
});