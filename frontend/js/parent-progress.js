// parent-progress.js - Loads child's progress data for parent view

async function loadChildProgressData() {
  try {
    const userRole = localStorage.getItem("userRole");

    if (userRole !== "parent") {
      // Regular student/user - use normal progress.js loading
      console.log("Non-parent user detected, using standard progress loading");
      return false;
    }

    console.log("Parent mode: Loading child progress data");

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
    const children = childrenData.children;

    if (children.length === 0) {
      console.log("No children linked to this parent");
      return false;
    }

    // For now, use the first child (in future, allow selection)
    const selectedChild = children[0];
    console.log("Using child data from:", selectedChild.username);

    // Store the selected child ID in sessionStorage for reference
    sessionStorage.setItem("selectedChildId", selectedChild.id);
    sessionStorage.setItem("selectedChildName", selectedChild.username);

    // Since we don't have backend endpoints for diary/tasks/GPA yet,
    // we'll use the localStorage data (which will be the same session's data)
    // In production, this would fetch from backend APIs specific to the child

    // Update the welcome message to show child's name
    const welcomeHeading = document.querySelector(".heading");
    if (welcomeHeading) {
      welcomeHeading.textContent = `${selectedChild.username}'s Progress Journey`;
    }

    return true;
  } catch (error) {
    console.error("Error loading child progress data:", error);
    return false;
  }
}

// Call this before initializing progress
document.addEventListener("DOMContentLoaded", async () => {
  const isParentMode = await loadChildProgressData();
  // Regular progress.js will initialize after this
});
