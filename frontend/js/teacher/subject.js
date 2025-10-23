/**
 * Teacher Subject Page JavaScript
 * Handles topics and file uploads for a specific subject
 */

const API_BASE_URL = "http://localhost:3000/api/teacher";
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
  if (
    typeof google === "undefined" ||
    !google.accounts ||
    !google.accounts.oauth2
  ) {
    showNotification(
      "Google APIs are still loading. Please try again.",
      "error"
    );
    return;
  }

  try {
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_DRIVE_CONFIG.CLIENT_ID,
      scope: GOOGLE_DRIVE_CONFIG.SCOPES.join(" "),
      callback: handleTokenResponse,
    });

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
  setGoogleDriveConnected(true);
  showNotification("Google Drive connected successfully!", "success");
}

/**
 * Set Google Drive connected status
 */
function setGoogleDriveConnected(connected) {
  isGoogleDriveConnected = connected;
  localStorage.setItem("googleDriveConnected", connected);
  if (connected && currentAccessToken) {
    localStorage.setItem("googleDriveAccessToken", currentAccessToken);
  }
  updateModalDriveStatus();
}

/**
 * Update Google Drive status in modal
 */
function updateModalDriveStatus() {
  const dragDropArea = document.getElementById("drag-drop-area");
  if (!dragDropArea) return;

  const existingStatusDiv = document.getElementById("modal-drive-status");
  if (existingStatusDiv) {
    existingStatusDiv.remove();
  }

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

  dragDropArea.parentNode.insertBefore(statusDiv, dragDropArea);

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
  const topicModal = document.getElementById("topic-modal");
  const topicModalCloseBtn = topicModal
    ? topicModal.querySelector(".modal-close")
    : null;

  const dragDropArea = document.getElementById("drag-drop-area");
  const fileInput = document.getElementById("file-input");
  const closeTopicMenuBtn = document.getElementById("close-topic-menu");
  const topicMenuModal = document.getElementById("topic-menu-modal");
  const topicMenuCloseBtn = topicMenuModal
    ? topicMenuModal.querySelector(".modal-close")
    : null;

  if (saveTopicBtn) {
    saveTopicBtn.addEventListener("click", handleSaveTopic);
  }

  if (topicModalCloseBtn) {
    topicModalCloseBtn.addEventListener("click", closeTopicModal);
  }

  if (dragDropArea) {
    dragDropArea.addEventListener("dragover", handleDragOver);
    dragDropArea.addEventListener("dragleave", handleDragLeave);
    dragDropArea.addEventListener("drop", handleFileDrop);
  }

  if (fileInput) {
    fileInput.addEventListener("change", handleFileSelect);
  }

  if (topicMenuCloseBtn) {
    topicMenuCloseBtn.addEventListener("click", closeTopicMenuModal);
  }

  if (closeTopicMenuBtn) {
    closeTopicMenuBtn.addEventListener("click", closeTopicMenuModal);
  }

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
 * Load topics for this subject
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
      `${API_BASE_URL}/subjects/${currentSubjectId}`,
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
    topics = data.subject.topics || [];
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
        <i class="fas fa-bookmark"></i>
        <span>${topic.name}</span>
      </div>
    `;
    card.addEventListener("click", () => openTopicMenuModal(topic));
    container.appendChild(card);
  });

  const addTopicCard = document.createElement("div");
  addTopicCard.classList.add("subject-card", "add-card");
  addTopicCard.innerHTML = '<i class="fas fa-plus"></i><span>Add Topic</span>';
  addTopicCard.addEventListener("click", openTopicModal);
  container.appendChild(addTopicCard);
}

/**
 * Open topic modal
 */
function openTopicModal() {
  const modal = document.getElementById("topic-modal");
  const input = document.getElementById("topic-name");
  if (modal && input) {
    input.value = "";
    modal.classList.add("show");
    modal.style.display = "flex";
  }
}

/**
 * Close topic modal
 */
function closeTopicModal() {
  const modal = document.getElementById("topic-modal");
  if (modal) {
    modal.classList.remove("show");
    modal.style.display = "none";
  }
}

/**
 * Handle save topic
 */
async function handleSaveTopic() {
  const input = document.getElementById("topic-name");
  const topicName = input.value.trim();

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
    closeTopicModal();
    loadTopics();
  } catch (error) {
    console.error("Error creating topic:", error);
    showNotification("Failed to create topic", "error");
  }
}

/**
 * Open topic menu modal to view files
 */
function openTopicMenuModal(topic) {
  currentTopicId = topic.id;
  const modal = document.getElementById("topic-menu-modal");
  const titleSpan = document.getElementById("topic-menu-name");

  if (modal && titleSpan) {
    titleSpan.textContent = topic.name;
    modal.classList.add("show");
    modal.style.display = "flex";
    loadTopicFiles(topic.id);
    updateModalDriveStatus();
  }
}

/**
 * Close topic menu modal
 */
function closeTopicMenuModal() {
  const modal = document.getElementById("topic-menu-modal");
  if (modal) {
    modal.classList.remove("show");
    modal.style.display = "none";
  }
}

/**
 * Load files for a topic
 */
async function loadTopicFiles(topicId) {
  try {
    const authToken = getAuthToken();
    if (!authToken) {
      showNotification("User not authenticated", "error");
      return;
    }

    const response = await fetch(
      `${API_BASE_URL}/subjects/${currentSubjectId}/topics/${topicId}/notes`,
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
    displayTopicFiles(data.notes || []);
  } catch (error) {
    console.error("Error loading files:", error);
    showNotification("Failed to load files", "error");
  }
}

/**
 * Display topic files
 */
function displayTopicFiles(files) {
  const filesList = document.getElementById("topic-files-list");
  if (!filesList) return;

  filesList.innerHTML = "";

  if (files.length === 0) {
    filesList.innerHTML =
      '<p style="text-align: center; padding: 20px; color: #999;">No files yet</p>';
    return;
  }

  files.forEach((file) => {
    const fileItem = document.createElement("div");
    fileItem.className = "file-item";
    fileItem.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px;
      margin: 8px 0;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: background 0.2s ease;
    `;

    const fileInfo = document.createElement("div");
    fileInfo.className = "file-info";
    fileInfo.innerHTML = `
      <i class="fas fa-file-pdf"></i>
      <div>
        <p class="file-name">${file.title || file.file_name}</p>
        <p class="file-size">
          ${
            file.is_public
              ? '<i class="fas fa-globe" style="margin-right: 4px;"></i>Public'
              : '<i class="fas fa-lock" style="margin-right: 4px;"></i>Private'
          }
        </p>
      </div>
    `;

    const fileActions = document.createElement("div");
    fileActions.className = "file-actions";
    fileActions.innerHTML = `
      <button class="btn-icon visibility-btn" data-file-id="${
        file.id
      }" data-is-public="${file.is_public}">
        <i class="fas fa-${file.is_public ? "lock-open" : "lock"}"></i>
      </button>
      <button class="btn-icon delete-btn" data-file-id="${file.id}">
        <i class="fas fa-trash"></i>
      </button>
    `;

    const visibilityBtn = fileActions.querySelector(".visibility-btn");
    const deleteBtn = fileActions.querySelector(".delete-btn");

    visibilityBtn.addEventListener("click", () => {
      handleToggleFileVisibility(file.id, !file.is_public);
    });

    deleteBtn.addEventListener("click", () => {
      handleDeleteFile(file.id);
    });

    fileItem.appendChild(fileInfo);
    fileItem.appendChild(fileActions);
    filesList.appendChild(fileItem);
  });
}

/**
 * Handle toggle file visibility
 */
async function handleToggleFileVisibility(fileId, isPublic) {
  try {
    const authToken = getAuthToken();
    if (!authToken) {
      showNotification("User not authenticated", "error");
      return;
    }

    const response = await fetch(`${API_BASE_URL}/notes/${fileId}/visibility`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ is_public: isPublic }),
    });

    if (!response.ok) {
      throw new Error("Failed to update file visibility");
    }

    showNotification(
      `File is now ${isPublic ? "public" : "private"}!`,
      "success"
    );
    await loadTopicFiles(currentTopicId);
  } catch (error) {
    console.error("Error updating file visibility:", error);
    showNotification("Failed to update file visibility", "error");
  }
}

/**
 * Handle delete file
 */
async function handleDeleteFile(fileId) {
  const confirmed = await showConfirmation(
    "Are you sure you want to delete this file?",
    "Delete File"
  );
  if (!confirmed) {
    return;
  }

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
    await loadTopicFiles(currentTopicId);
  } catch (error) {
    console.error("Error deleting file:", error);
    showNotification("Failed to delete file", "error");
  }
}

/**
 * Handle delete topic
 */
async function handleDeleteTopic() {
  const confirmed = await showConfirmation(
    "Are you sure you want to delete this topic and all its files?",
    "Delete Topic"
  );
  if (!confirmed) {
    return;
  }

  try {
    const authToken = getAuthToken();
    if (!authToken) {
      showNotification("User not authenticated", "error");
      return;
    }

    const response = await fetch(
      `${API_BASE_URL}/subjects/${currentSubjectId}/topics/${currentTopicId}`,
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
    closeTopicMenuModal();
    loadTopics();
  } catch (error) {
    console.error("Error deleting topic:", error);
    showNotification("Failed to delete topic", "error");
  }
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

  if (!isGoogleDriveConnected || !currentAccessToken) {
    showNotification("Please connect to Google Drive first", "error");
    return;
  }

  const filesList = Array.from(files);

  if (filesList.length === 0) {
    showNotification("No files selected", "error");
    return;
  }

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

    showUploadIndicator();

    for (const file of pdfFiles) {
      await uploadFileToDriveAndSave(file, authToken);
    }

    showNotification(
      `${pdfFiles.length} file(s) uploaded successfully!`,
      "success"
    );

    const topic = topics.find((t) => t.id === currentTopicId);
    if (topic) {
      openTopicMenuModal(topic);
    }
  } catch (error) {
    console.error("Error uploading files:", error);
    showNotification("Failed to upload files", "error");
  } finally {
    hideUploadIndicator();
  }
}

/**
 * Upload file to Google Drive and save metadata
 */
async function uploadFileToDriveAndSave(file, authToken) {
  try {
    const driveResponse = await uploadToGoogleDrive(file);

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
      throw new Error("Failed to save file metadata");
    }

    return response.json();
  } catch (error) {
    console.error("Error in upload process:", error);
    throw error;
  }
}

/**
 * Upload file to Google Drive
 */
async function uploadToGoogleDrive(file) {
  const accessToken = getGoogleAccessToken();
  if (!accessToken) {
    throw new Error("No Google Drive access token");
  }

  const metadata = {
    name: file.name,
    mimeType: "application/pdf",
  };

  const form = new FormData();
  form.append(
    "metadata",
    new Blob([JSON.stringify(metadata)], { type: "application/json" })
  );
  form.append("file", file);

  const response = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: form,
    }
  );

  if (!response.ok) {
    throw new Error("Failed to upload to Google Drive");
  }

  return response.json();
}

/**
 * Show upload indicator
 */
function showUploadIndicator() {
  const indicator = document.getElementById("upload-indicator");
  if (indicator) {
    indicator.style.display = "flex";
    indicator.style.flexDirection = "column";
    indicator.style.alignItems = "center";
    indicator.style.justifyContent = "center";
  }
}

/**
 * Hide upload indicator
 */
function hideUploadIndicator() {
  const indicator = document.getElementById("upload-indicator");
  if (indicator) {
    indicator.style.display = "none";
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
