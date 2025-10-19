/**
 * Subject Page JavaScript
 * Handles topics and file uploads for a specific subject
 */

const API_BASE_URL = "http://localhost:3000/api/student";
let currentSubjectId = null;
let currentTopicId = null;
let topics = [];

// Google Drive variables
let gapiInited = false;
let gisInited = false;
let tokenClient;
let isGoogleDriveConnected = false;
let currentAccessToken = null;

// Get authentication token from localStorage
function getAuthToken() {
  return localStorage.getItem("authToken");
}

// Get Google Drive access token
function getGoogleAccessToken() {
  return currentAccessToken;
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", function () {
  loadSubjectFromURL();
  setupEventListeners();
  loadTopics();
  waitForGoogleAPIsAndInitialize();
  checkStoredGoogleDriveConnection();
});

/**
 * Load subject ID and name from URL parameters
 */
function loadSubjectFromURL() {
  const params = new URLSearchParams(window.location.search);
  currentSubjectId = params.get("subjectId");
  const subjectName = params.get("subjectName");

  if (!currentSubjectId) {
    showNotification("Subject not found. Redirecting...", "error");
    setTimeout(() => {
      window.location.href = "./modulespace.html";
    }, 2000);
    return;
  }

  // Update page title
  document.getElementById("subject-name").textContent =
    subjectName || "Subject";
  document.title = `EduBloom - ${subjectName || "Subject"}`;
}

/**
 * Wait for Google APIs to load, then initialize
 */
function waitForGoogleAPIsAndInitialize() {
  // Check if both gapi and google are available
  if (
    typeof gapi !== "undefined" &&
    typeof google !== "undefined" &&
    google.accounts
  ) {
    initializeGoogleAPI();
  } else {
    // Retry after a short delay
    setTimeout(waitForGoogleAPIsAndInitialize, 500);
  }
}

/**
 * Initialize Google API and GIS
 */
function initializeGoogleAPI() {
  // No need to initialize gapi for REST API usage
  gapiInited = true;
  gisInited = true;
}

/**
 * Check for previously stored Google Drive connection
 */
function checkStoredGoogleDriveConnection() {
  const wasConnected = localStorage.getItem("googleDriveConnected") === "true";
  const storedToken = localStorage.getItem("googleDriveAccessToken");

  if (wasConnected && storedToken) {
    isGoogleDriveConnected = true;
    currentAccessToken = storedToken;
    updateModalDriveStatus();
  }
}

/**
 * Handle Google Drive connection
 */
function handleConnectGoogleDrive() {
  // Check if Google APIs are ready
  if (
    typeof google === "undefined" ||
    !google.accounts ||
    !google.accounts.oauth2
  ) {
    showNotification(
      "Google APIs are still loading. Please try again.",
      "error"
    );
    console.error("Google OAuth2 not ready yet");
    return;
  }

  try {
    // Create token client for OAuth 2.0 flow
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_DRIVE_CONFIG.CLIENT_ID,
      scope: GOOGLE_DRIVE_CONFIG.SCOPES.join(" "),
      callback: handleTokenResponse,
    });

    // Request access token
    tokenClient.requestAccessToken();
  } catch (error) {
    console.error("Error creating token client:", error);
    showNotification(
      "Failed to connect to Google Drive. Please try again.",
      "error"
    );
  }
}

/**
 * Handle token response from Google OAuth
 */
function handleTokenResponse(resp) {
  if (resp.error !== undefined) {
    console.error("Token request error:", resp);
    showNotification("Failed to get access token. Please try again.", "error");
    return;
  }

  currentAccessToken = resp.access_token;
  console.log("Access token obtained successfully");
  setGoogleDriveConnected(true);
  showNotification("Google Drive connected successfully!", "success");
}

/**
 * Set Google Drive connection status
 */
function setGoogleDriveConnected(connected) {
  isGoogleDriveConnected = connected;

  if (connected) {
    // Store connection status and token
    localStorage.setItem("googleDriveConnected", "true");
    if (currentAccessToken) {
      localStorage.setItem("googleDriveAccessToken", currentAccessToken);
    }
  } else {
    // Clear stored connection
    localStorage.removeItem("googleDriveConnected");
    localStorage.removeItem("googleDriveAccessToken");
    currentAccessToken = null;
  }

  updateModalDriveStatus();
}

/**
 * Update Google Drive status in modal
 */
function updateModalDriveStatus() {
  const dragDropArea = document.getElementById("drag-drop-area");
  if (!dragDropArea) return;

  // Remove existing status div if it exists
  const existingStatusDiv = document.getElementById("modal-drive-status");
  if (existingStatusDiv) {
    existingStatusDiv.remove();
  }

  // Create new status div
  const statusDiv = document.createElement("div");
  statusDiv.id = "modal-drive-status";
  statusDiv.className = "drive-status";
  statusDiv.style.cssText =
    "margin-bottom: 10px; display: flex; align-items: center;";

  const icon = document.createElement("i");
  icon.className = "fas fa-circle";
  icon.id = "modal-drive-icon";

  const text = document.createElement("span");
  text.id = "modal-drive-text";
  text.style.marginLeft = "8px";

  const connectBtn = document.createElement("button");
  connectBtn.id = "connect-drive-modal-btn";
  connectBtn.className = "btn-secondary";
  connectBtn.style.cssText = "margin-left: 10px;";
  connectBtn.textContent = "Connect";
  connectBtn.addEventListener("click", handleConnectGoogleDrive);

  statusDiv.appendChild(icon);
  statusDiv.appendChild(text);
  statusDiv.appendChild(connectBtn);

  // Insert before drag-drop-area
  dragDropArea.parentNode.insertBefore(statusDiv, dragDropArea);

  // Update the status
  if (isGoogleDriveConnected) {
    icon.style.color = "green";
    text.textContent = "Google Drive: Connected";
    connectBtn.style.display = "none";
  } else {
    icon.style.color = "red";
    text.textContent = "Google Drive: Not Connected";
    connectBtn.style.display = "inline-block";
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  const saveTopicBtn = document.getElementById("save-topic");
  const cancelTopicBtn = document.getElementById("cancel-topic");
  const topicModal = document.getElementById("topic-modal");
  const topicModalCloseBtn = topicModal.querySelector(".close");

  const dragDropArea = document.getElementById("drag-drop-area");
  const fileInput = document.getElementById("file-input");
  const saveTopicMenuBtn = document.getElementById("close-topic-menu");
  const topicMenuModal = document.getElementById("topic-menu-modal");
  const topicMenuCloseBtn = topicMenuModal.querySelector(".close");

  // Save topic
  if (saveTopicBtn) {
    saveTopicBtn.addEventListener("click", handleSaveTopic);
  }

  // Topic modal close button
  if (topicModalCloseBtn) {
    topicModalCloseBtn.addEventListener("click", closeTopicModal);
  }

  // File drag and drop
  if (dragDropArea) {
    dragDropArea.addEventListener("dragover", handleDragOver);
    dragDropArea.addEventListener("dragleave", handleDragLeave);
    dragDropArea.addEventListener("drop", handleFileDrop);
  }

  // File input change
  if (fileInput) {
    fileInput.addEventListener("change", handleFileSelect);
  }

  // Topic menu close button
  if (topicMenuCloseBtn) {
    topicMenuCloseBtn.addEventListener("click", closeTopicMenuModal);
  }

  if (saveTopicMenuBtn) {
    saveTopicMenuBtn.addEventListener("click", closeTopicMenuModal);
  }

  // Close modals when clicking outside
  document.addEventListener("click", (e) => {
    if (e.target === topicModal) {
      closeTopicModal();
    }
    if (e.target === topicMenuModal) {
      closeTopicMenuModal();
    }
  });
}

/**
 * Load topics for current subject
 */
async function loadTopics() {
  if (!currentSubjectId) return;

  try {
    const authToken = getAuthToken();
    if (!authToken) {
      showNotification("User not authenticated", "error");
      return;
    }

    const response = await fetch(
      `${API_BASE_URL}/subjects/${currentSubjectId}/topics`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to load topics");
    }

    const data = await response.json();
    topics = data.topics || [];
    displayTopics();
  } catch (error) {
    console.error("Error loading topics:", error);
    showNotification("Failed to load topics", "error");
  }
}

/**
 * Display topics as cards
 */
function displayTopics() {
  const container = document.getElementById("topics-container");
  if (!container) return;

  container.innerHTML = "";

  topics.forEach((topic) => {
    const card = document.createElement("div");
    card.classList.add("subject-card");
    card.innerHTML = `
      <div class="subject-header">
        <i class="fas fa-book"></i>
        <span>${topic.name}</span>
      </div>
      <i class="fas fa-ellipsis-v dots"></i>
      <div class="dropdown">
        <ul>
          <li class="view-files">View Files</li>
          <li class="edit">Edit</li>
          <li class="delete">Delete</li>
        </ul>
      </div>
    `;
    container.appendChild(card);

    const dots = card.querySelector(".dots");
    const dropdown = card.querySelector(".dropdown");

    // Toggle dropdown
    dots.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdown.style.display =
        dropdown.style.display === "block" ? "none" : "block";
    });

    // View files
    dropdown.querySelector(".view-files").addEventListener("click", () => {
      openTopicMenuModal(topic);
      dropdown.style.display = "none";
    });

    // Edit topic
    dropdown.querySelector(".edit").addEventListener("click", () => {
      openEditTopicModal(topic);
      dropdown.style.display = "none";
    });

    // Delete topic
    dropdown.querySelector(".delete").addEventListener("click", () => {
      if (confirm(`Delete "${topic.name}" and all its files?`)) {
        deleteTopic(topic.id);
      }
      dropdown.style.display = "none";
    });

    // Navigate to topic (click anywhere except dropdown)
    card.addEventListener("click", (e) => {
      if (e.target.closest(".dots") || e.target.closest(".dropdown")) return;
      openTopicMenuModal(topic);
    });
  });

  // Close dropdowns when clicking outside
  document.addEventListener("click", () => {
    document
      .querySelectorAll(".dropdown")
      .forEach((dd) => (dd.style.display = "none"));
  });

  // Always add "Add Topic" card at the end
  const addCard = document.createElement("div");
  addCard.classList.add("subject-card", "add-card");
  addCard.innerHTML = `<i class="fas fa-plus"></i><span>Add Topic</span>`;
  container.appendChild(addCard);

  addCard.addEventListener("click", () => {
    openTopicModal();
  });
}

/**
 * Open create topic modal
 */
function openTopicModal() {
  const modal = document.getElementById("topic-modal");
  const input = document.getElementById("topic-name");
  const title = document.getElementById("topic-modal-title");

  title.textContent = "Add Topic";
  input.value = "";
  delete input.dataset.editId;

  modal.classList.add("show");
  modal.style.display = "flex";
}

/**
 * Open edit topic modal
 */
function openEditTopicModal(topic) {
  const modal = document.getElementById("topic-modal");
  const input = document.getElementById("topic-name");
  const title = document.getElementById("topic-modal-title");

  title.textContent = "Edit Topic";
  input.value = topic.name;
  input.dataset.editId = topic.id;

  modal.classList.add("show");
  modal.style.display = "flex";
}

/**
 * Close topic modal
 */
function closeTopicModal() {
  const modal = document.getElementById("topic-modal");
  const input = document.getElementById("topic-name");

  modal.classList.remove("show");
  modal.style.display = "none";

  input.value = "";
  delete input.dataset.editId;
}

/**
 * Save topic (create or edit)
 */
async function handleSaveTopic() {
  const input = document.getElementById("topic-name");
  const topicName = input.value.trim();
  const editId = input.dataset.editId;

  if (!topicName) {
    showNotification("Please enter a topic name", "error");
    return;
  }

  try {
    const authToken = getAuthToken();
    if (!authToken) {
      showNotification("User not authenticated", "error");
      return;
    }

    if (editId) {
      // Edit topic
      const response = await fetch(
        `${API_BASE_URL}/subjects/${currentSubjectId}/topics/${editId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: topicName }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update topic");
      }

      showNotification("Topic updated successfully!", "success");
    } else {
      // Create topic
      const response = await fetch(
        `${API_BASE_URL}/subjects/${currentSubjectId}/topics/create`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: topicName }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create topic");
      }

      showNotification("Topic created successfully!", "success");
    }

    closeTopicModal();
    loadTopics();
  } catch (error) {
    console.error("Error saving topic:", error);
    showNotification(error.message || "Failed to save topic", "error");
  }
}

/**
 * Delete topic
 */
async function deleteTopic(topicId) {
  try {
    const authToken = getAuthToken();
    if (!authToken) {
      showNotification("User not authenticated", "error");
      return;
    }

    const response = await fetch(
      `${API_BASE_URL}/subjects/${currentSubjectId}/topics/${topicId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete topic");
    }

    showNotification("Topic deleted successfully!", "success");
    loadTopics();
  } catch (error) {
    console.error("Error deleting topic:", error);
    showNotification("Failed to delete topic", "error");
  }
}

/**
 * Open topic menu modal to view files
 */
async function openTopicMenuModal(topic) {
  currentTopicId = topic.id;

  const modal = document.getElementById("topic-menu-modal");
  const titleSpan = document.getElementById("topic-menu-name");
  const filesList = document.getElementById("topic-files-list");

  titleSpan.textContent = topic.name;

  // Update Google Drive status
  updateModalDriveStatus();

  try {
    const authToken = getAuthToken();
    if (!authToken) {
      showNotification("User not authenticated", "error");
      return;
    }

    const response = await fetch(
      `${API_BASE_URL}/subjects/${currentSubjectId}/topics/${topic.id}/notes`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to load files");
    }

    const data = await response.json();
    const files = data.notes || [];

    if (files.length === 0) {
      filesList.innerHTML =
        '<p style="text-align: center; padding: 20px; color: #999;">No files yet</p>';
    } else {
      filesList.innerHTML = files
        .map(
          (file) => `
        <div class="file-item">
          <div class="file-info">
            <i class="fas fa-file-pdf"></i>
            <div>
              <p class="file-name">${file.title || file.file_name}</p>
              <p class="file-size">PDF Document</p>
            </div>
          </div>
          <div class="file-actions">
            <button class="btn-icon" onclick="downloadFile('${
              file.file_url
            }', '${file.file_name}')">
              <i class="fas fa-download"></i>
            </button>
            <button class="btn-icon delete" onclick="deleteFile(${file.id})">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      `
        )
        .join("");
    }
  } catch (error) {
    console.error("Error loading files:", error);
    filesList.innerHTML = '<p style="color: red;">Failed to load files</p>';
  }

  modal.classList.add("show");
  modal.style.display = "flex";
}

/**
 * Close topic menu modal
 */
function closeTopicMenuModal() {
  const modal = document.getElementById("topic-menu-modal");
  modal.classList.remove("show");
  modal.style.display = "none";
  currentTopicId = null;
}

/**
 * Handle drag over
 */
function handleDragOver(e) {
  e.preventDefault();
  e.stopPropagation();
  document.getElementById("drag-drop-area").classList.add("dragover");
}

/**
 * Handle drag leave
 */
function handleDragLeave(e) {
  e.preventDefault();
  e.stopPropagation();
  document.getElementById("drag-drop-area").classList.remove("dragover");
}

/**
 * Handle file drop
 */
function handleFileDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  document.getElementById("drag-drop-area").classList.remove("dragover");

  const files = e.dataTransfer.files;
  handleFiles(files);
}

/**
 * Handle file select
 */
function handleFileSelect(e) {
  const files = e.target.files;
  handleFiles(files);
}

/**
 * Handle file upload
 */
async function handleFiles(files) {
  if (!currentSubjectId) {
    showNotification("Subject not found", "error");
    return;
  }

  if (!currentTopicId) {
    showNotification("Please select a topic first", "error");
    return;
  }

  // Check Google Drive connection
  if (!isGoogleDriveConnected || !currentAccessToken) {
    showNotification("Please connect to Google Drive first", "error");
    return;
  }

  const filesList = Array.from(files);

  if (filesList.length === 0) {
    showNotification("No files selected", "error");
    return;
  }

  // Filter PDF files only
  const pdfFiles = filesList.filter((file) => file.type === "application/pdf");

  if (pdfFiles.length !== filesList.length) {
    showNotification("Only PDF files are supported", "error");
  }

  if (pdfFiles.length === 0) return;

  try {
    const authToken = getAuthToken();
    if (!authToken) {
      showNotification("User not authenticated", "error");
      return;
    }

    // Show upload indicator
    showUploadIndicator();

    // Upload each file
    for (const file of pdfFiles) {
      await uploadFileToDriveAndSave(file, authToken);
    }

    showNotification(
      `${pdfFiles.length} file(s) uploaded successfully!`,
      "success"
    );

    // Reload the topic to show new files
    const topic = topics.find((t) => t.id === currentTopicId);
    if (topic) {
      openTopicMenuModal(topic);
    }
  } catch (error) {
    console.error("Error uploading files:", error);
    showNotification("Failed to upload files", "error");
  } finally {
    // Hide upload indicator
    hideUploadIndicator();
  }
}

/**
 * Upload file to Google Drive and save metadata to backend
 */
async function uploadFileToDriveAndSave(file, authToken) {
  try {
    // First, upload to Google Drive
    const driveResponse = await uploadToGoogleDrive(file);

    // Then save metadata to backend
    const metadata = {
      title: file.name.replace(".pdf", ""),
      file_name: file.name,
      file_url: driveResponse.webViewLink,
      google_drive_file_id: driveResponse.id,
    };

    const response = await fetch(
      `${API_BASE_URL}/subjects/${currentSubjectId}/topics/${currentTopicId}/notes/create`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(metadata),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to save file metadata`);
    }

    return response.json();
  } catch (error) {
    console.error("Error in upload process:", error);
    throw error;
  }
}

/**
 * Upload file to Google Drive using REST API
 */
async function uploadToGoogleDrive(file) {
  const accessToken = getGoogleAccessToken();
  if (!accessToken) {
    throw new Error("No Google Drive access token");
  }

  // Create metadata for the file
  const metadata = {
    name: file.name,
    mimeType: file.type,
  };

  // Create FormData for multipart upload
  const formData = new FormData();
  formData.append(
    "metadata",
    new Blob([JSON.stringify(metadata)], { type: "application/json" })
  );
  formData.append("file", file);

  const response = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();

    // Check if token is expired or invalid
    if (response.status === 401 || error.error.code === 401) {
      // Token expired, disconnect and prompt user to reconnect
      setGoogleDriveConnected(false);
      throw new Error(
        "Google Drive access token expired. Please reconnect to Google Drive."
      );
    }

    throw new Error(`Google Drive upload failed: ${error.error.message}`);
  }

  const result = await response.json();

  // Make the file publicly viewable
  await setFilePublic(result.id, accessToken);

  // Get the web view link
  result.webViewLink = `https://drive.google.com/file/d/${result.id}/view`;

  return result;
}

/**
 * Make Google Drive file publicly viewable
 */
async function setFilePublic(fileId, accessToken) {
  const permission = {
    type: "anyone",
    role: "reader",
  };

  await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(permission),
    }
  );
}

/**
 * Download file
 */
function downloadFile(url, fileName) {
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName || "download.pdf";
  link.click();
}

/**
 * Delete file (note)
 */
async function deleteFile(fileId) {
  if (!confirm("Delete this file?")) return;

  try {
    const authToken = getAuthToken();
    if (!authToken) {
      showNotification("User not authenticated", "error");
      return;
    }

    const response = await fetch(
      `${API_BASE_URL}/subjects/${currentSubjectId}/topics/${currentTopicId}/notes/${fileId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete file");
    }

    showNotification("File deleted successfully!", "success");
    // Reload topic menu
    const topicId = topics.find((t) => t.id === currentTopicId)?.id;
    if (topicId) {
      const topic = topics.find((t) => t.id === topicId);
      if (topic) openTopicMenuModal(topic);
    }
  } catch (error) {
    console.error("Error deleting file:", error);
    showNotification("Failed to delete file", "error");
  }
}

/**
 * Show notification
 */
function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  let bgColor = "#2196F3";
  if (type === "success") {
    bgColor = "#4CAF50";
  } else if (type === "error") {
    bgColor = "#f44336";
  }

  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    background-color: ${bgColor};
    color: white;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    z-index: 10000;
    font-size: 14px;
    animation: slideIn 0.3s ease-in-out;
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

/**
 * Show upload loading indicator
 */
function showUploadIndicator() {
  const indicator = document.getElementById("upload-indicator");
  const dragDropArea = document.getElementById("drag-drop-area");

  if (indicator && dragDropArea) {
    // Make drag-drop-area position relative for absolute positioning of indicator
    dragDropArea.style.position = "relative";
    indicator.style.display = "flex";
  }
}

/**
 * Hide upload loading indicator
 */
function hideUploadIndicator() {
  const indicator = document.getElementById("upload-indicator");
  const dragDropArea = document.getElementById("drag-drop-area");

  if (indicator && dragDropArea) {
    indicator.style.display = "none";
    dragDropArea.style.position = "";
  }
}
