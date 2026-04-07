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
  const grade = params.get("grade");

  if (!currentSubjectId) {
    showNotification("Subject not found. Redirecting...", "error");
    setTimeout(() => {
      window.location.href = "./modulespace.html";
    }, 2000);
    return;
  }

  // Dynamic back button routing
  const backBtn = document.getElementById("back-btn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.location.href = "./modulespace.html";
    });
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
async function checkStoredGoogleDriveConnection() {
  const wasConnected = localStorage.getItem("googleDriveConnected") === "true";
  const storedToken = localStorage.getItem("googleDriveAccessToken");

  if (wasConnected && storedToken) {
    isGoogleDriveConnected = true;
    currentAccessToken = storedToken;
    updateModalDriveStatus();

    try {
      const response = await fetch(
        "https://www.googleapis.com/drive/v3/about?fields=user",
        {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        }
      );

      if (!response.ok && response.status === 401) {
        console.warn("Google Drive token expired. User must reconnect.");
        setGoogleDriveConnected(false);
      }
    } catch (error) {
      console.error("Error verifying Google Drive token:", error);
    }
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
  } else {
    localStorage.removeItem("googleDriveAccessToken");
    localStorage.setItem("googleDriveConnected", "false");
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
/**
 * Render all topics in the grid
 */
function displayTopics() {
  const container = document.getElementById("topics-container");
  if (!container) return;

  container.innerHTML = "";

  topics.forEach((topic) => {
    const card = document.createElement("div");
    card.className = "subject-card";
    
    // Create card content with dots menu
    card.innerHTML = `
      <div class="subject-dots" onclick="event.stopPropagation(); toggleTopicMenu(event, ${topic.id})">
        <i class="fas fa-ellipsis-v"></i>
      </div>
      <div class="subject-menu" id="topic-menu-${topic.id}">
        <div class="menu-item" onclick="event.stopPropagation(); openEditTopicModal(${JSON.stringify(topic).replace(/"/g, '&quot;')})">
          <i class="fas fa-edit"></i> Edit
        </div>
        <div class="menu-item delete" onclick="event.stopPropagation(); handleDeleteTopic(${topic.id})">
          <i class="fas fa-trash-alt"></i> Delete
        </div>
      </div>
      <div class="subject-header">
        <i class="fas fa-bookmark"></i>
        <span>${topic.name}</span>
      </div>
    `;
    
    card.addEventListener("click", () => openTopicMenuModal(topic));
    container.appendChild(card);
  });

  const addTopicCard = document.createElement("div");
  addTopicCard.className = "subject-card add-card";
  addTopicCard.innerHTML = `
    <div class="subject-header" style="justify-content: center; width: 100%;">
      <i class="fas fa-plus"></i>
      <span>Add Topic</span>
    </div>
  `;
  addTopicCard.addEventListener("click", openTopicModal);
  container.appendChild(addTopicCard);
}

/**
 * Toggle topic dropdown menu
 */
function toggleTopicMenu(event, topicId) {
  event.stopPropagation();
  
  // Close all other menus first
  document.querySelectorAll(".subject-menu.show").forEach(menu => {
    if (menu.id !== `topic-menu-${topicId}`) {
      menu.classList.remove("show");
    }
  });

  const menu = document.getElementById(`topic-menu-${topicId}`);
  if (menu) {
    menu.classList.toggle("show");
  }

  // Close menu when clicking outside
  const closeMenu = (e) => {
    if (menu && !menu.contains(e.target)) {
      menu.classList.remove("show");
      document.removeEventListener("click", closeMenu);
    }
  };
  document.addEventListener("click", closeMenu);
}

/**
 * Open topic modal for creating
 */
function openTopicModal() {
  const modal = document.getElementById("topic-modal");
  const title = document.getElementById("topic-modal-title");
  const nameInput = document.getElementById("topic-name");
  
  if (modal && nameInput) {
    title.textContent = "Add Topic";
    nameInput.value = "";
    delete nameInput.dataset.editId;
    modal.classList.add("show");
    modal.style.display = "flex";
  }
}

/**
 * Open topic modal for editing
 */
function openEditTopicModal(topic) {
  const modal = document.getElementById("topic-modal");
  const title = document.getElementById("topic-modal-title");
  const nameInput = document.getElementById("topic-name");
  
  if (modal && nameInput) {
    title.textContent = "Edit Topic";
    nameInput.value = topic.name;
    nameInput.dataset.editId = topic.id;
    modal.classList.add("show");
    modal.style.display = "flex";
    
    // Close the dots menu
    const menu = document.getElementById(`topic-menu-${topic.id}`);
    if (menu) menu.classList.remove("show");
  }
}

/**
 * Close topic modal
 */
function closeTopicModal() {
  const modal = document.getElementById("topic-modal");
  const nameInput = document.getElementById("topic-name");
  if (modal) {
    modal.classList.remove("show");
    modal.style.display = "none";
  }
  if (nameInput) {
    nameInput.value = "";
    delete nameInput.dataset.editId;
  }
}

/**
 * Handle save topic (Create or Update)
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

    const url = editId 
      ? `${API_BASE_URL}/subjects/${currentSubjectId}/topics/${editId}`
      : `${API_BASE_URL}/subjects/${currentSubjectId}/topics/create`;
    
    const method = editId ? "PUT" : "POST";

    const response = await fetch(url, {
      method: method,
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: topicName }),
    });

    if (!response.ok) {
      throw new Error(editId ? "Failed to update topic" : "Failed to create topic");
    }

    showNotification(editId ? "Topic updated successfully!" : "Topic created successfully!", "success");
    closeTopicModal();
    loadTopics();
  } catch (error) {
    console.error("Error saving topic:", error);
    showNotification(error.message, "error");
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
  modal.classList.remove("show");
  modal.style.display = "none";
  currentTopicId = null;

  // Clear metadata inputs
  const descInput = document.getElementById("upload-description");
  const gradeInput = document.getElementById("upload-grade");

  if (descInput) descInput.value = "";
  if (gradeInput) {
    gradeInput.value = "";
    if (window.refreshCustomSelects) window.refreshCustomSelects();
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
        <p class="file-size" style="margin-bottom: 2px;">
          ${
            file.is_public
              ? '<i class="fas fa-globe" style="margin-right: 4px;"></i>Public'
              : '<i class="fas fa-lock" style="margin-right: 4px;"></i>Private'
          }
          ${
            file.grade
              ? `<span style="margin-left: 8px; color: #a8b2d1;"><i class="fas fa-graduation-cap" style="margin-right: 4px;"></i>Grade ${file.grade}</span>`
              : ""
          }
        </p>
        ${
          file.description
            ? `<p style="font-size: 0.8em; color: #8892b0; margin-top: 2px;">${file.description}</p>`
            : ""
        }
      </div>
    `;

    const fileActions = document.createElement("div");
    fileActions.className = "file-actions";
    fileActions.innerHTML = `
      <button class="btn-icon open-btn" title="Open File">
        <i class="fas fa-external-link-alt"></i>
      </button>
      <button class="btn-icon visibility-btn" data-file-id="${
        file.id
      }" data-is-public="${file.is_public}" title="${
      file.is_public ? "Make Private" : "Make Public"
    }">
        <i class="fas fa-${file.is_public ? "lock-open" : "lock"}"></i>
      </button>
      <button class="btn-icon delete-btn" data-file-id="${file.id}" title="Delete File">
        <i class="fas fa-trash"></i>
      </button>
    `;

    const openBtn = fileActions.querySelector(".open-btn");
    const visibilityBtn = fileActions.querySelector(".visibility-btn");
    const deleteBtn = fileActions.querySelector(".delete-btn");

    if (file.file_url) {
      openBtn.onclick = () => window.open(file.file_url, "_blank");
    } else {
      openBtn.disabled = true;
      openBtn.style.opacity = "0.5";
      openBtn.title = "No URL available";
    }

    visibilityBtn.addEventListener("click", () => {
      handleToggleFileVisibility(
        file.id,
        !file.is_public,
        file.google_drive_file_id
      );
    });

    deleteBtn.addEventListener("click", () => {
      handleDeleteFile(file.id, file.google_drive_file_id);
    });

    fileItem.appendChild(fileInfo);
    fileItem.appendChild(fileActions);
    filesList.appendChild(fileItem);
  });
}

/**
 * Handle toggle file visibility
 */
async function handleToggleFileVisibility(fileId, isPublic, googleDriveFileId) {
  try {
    const authToken = getAuthToken();
    if (!authToken) {
      showNotification("User not authenticated", "error");
      return;
    }

    if (googleDriveFileId) {
      const gDriveToken = getGoogleAccessToken();
      if (!gDriveToken) {
        showNotification(
          "Please connect to Google Drive first to change visibility",
          "error"
        );
        return;
      }

      showNotification(`Updating Google Drive permissions...`, "info");

      if (isPublic) {
        const permissionRes = await fetch(
          `https://www.googleapis.com/drive/v3/files/${googleDriveFileId}/permissions`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${gDriveToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              role: "reader",
              type: "anyone",
            }),
          }
        );
        if (!permissionRes.ok) {
          throw new Error("Failed to update Google Drive permissions");
        }
      } else {
        const permListRes = await fetch(
          `https://www.googleapis.com/drive/v3/files/${googleDriveFileId}/permissions`,
          {
            headers: {
              Authorization: `Bearer ${gDriveToken}`,
            },
          }
        );

        if (permListRes.ok) {
          const permData = await permListRes.json();
          const anyonePerm = permData.permissions?.find(
            (p) => p.type === "anyone"
          );

          if (anyonePerm) {
            await fetch(
              `https://www.googleapis.com/drive/v3/files/${googleDriveFileId}/permissions/${anyonePerm.id}`,
              {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${gDriveToken}`,
                },
              }
            );
          }
        } else {
          throw new Error("Failed to fetch Google Drive permissions");
        }
      }
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
 * Move a file to Google Drive Trash
 */
async function moveFileToTrash(googleFileId) {
  if (!googleFileId) return false;
  
  const accessToken = getGoogleAccessToken();
  if (!accessToken) {
    console.warn("No Google Drive access token found. Cannot trash file.");
    return false;
  }

  try {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${googleFileId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ trashed: true }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Google Drive Trash Error:", errorData);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error trashing file on Google Drive:", error);
    return false;
  }
}

/**
 * Show trash notification
 */
function showTrashNotification(isMultiple = false) {
  const message = isMultiple 
    ? "All associated files have been moved to Google Drive trash. They will be permanently deleted after 30 days."
    : "The file has been moved to Google Drive trash. It will be permanently deleted after 30 days.";
  
  showNotification(message, "info");
}

/**
 * Handle delete file
 */
async function handleDeleteFile(fileId, googleFileId) {
  const confirmed = await showConfirmation(
    "Are you sure you want to delete this file? This action will move it to your Google Drive trash.",
    "Move to Trash"
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

    // 1. First move to Google Drive trash
    let trashed = false;
    if (googleFileId) {
      trashed = await moveFileToTrash(googleFileId);
    }

    // 2. Delete from database
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
      throw new Error("Failed to delete file record");
    }

    if (trashed) {
      showTrashNotification(false);
    } else if (googleFileId) {
      showNotification("File record deleted, but failed to move Google Drive file to trash.", "warning");
    } else {
      showNotification("File record deleted successfully.", "success");
    }
    
    await loadTopicFiles(currentTopicId);
  } catch (error) {
    console.error("Error deleting file:", error);
    showNotification("Failed to delete file", "error");
  }
}

/**
 * Handle delete topic
 */
async function handleDeleteTopic(topicId) {
  const confirmed = await showConfirmation(
    "Are you sure you want to delete this topic? All associated files will be moved to Google Drive trash.",
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

    // 1. Get all notes for this topic to trash them in GD
    const filesResponse = await fetch(
      `${API_BASE_URL}/subjects/${currentSubjectId}/topics/${topicId}/notes`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    let trashCount = 0;
    if (filesResponse.ok) {
      const data = await filesResponse.json();
      const files = data.notes || [];
      
      for (const file of files) {
        if (file.google_drive_file_id) {
          const success = await moveFileToTrash(file.google_drive_file_id);
          if (success) trashCount++;
        }
      }
    }

    // 2. Delete topic from database
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

    if (trashCount > 0) {
      showTrashNotification(true);
    } else {
      showNotification("Topic deleted successfully!", "success");
    }
    
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

    const descInput = document.getElementById("upload-description");
    const gradeInput = document.getElementById("upload-grade");
    const fileMetadataDetails = {
      description: descInput ? descInput.value.trim() : null,
      grade: gradeInput && gradeInput.value ? parseInt(gradeInput.value, 10) : null,
    };

    showUploadIndicator();

    for (const file of pdfFiles) {
      await uploadFileToDriveAndSave(file, authToken, fileMetadataDetails);
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
async function uploadFileToDriveAndSave(file, authToken, fileMetadataDetails) {
  try {
    const driveResponse = await uploadToGoogleDrive(file);

    const metadata = {
      title: file.name.replace(".pdf", ""),
      file_name: file.name,
      file_url: driveResponse.webViewLink,
      google_drive_file_id: driveResponse.id,
      description: fileMetadataDetails?.description || null,
      grade: fileMetadataDetails?.grade || null,
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
