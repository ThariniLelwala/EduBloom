// js/teacher/notes.js
// Teacher Notes Management System
// Manages subjects with nested notes and Google Drive integration

class TeacherNotesManager {
  constructor() {
    this.authToken = localStorage.getItem("authToken");
    this.subjects = [];
    this.selectedSubject = null;
    this.currentNoteId = null;
    this.googleDriveConnected = false;
    this.gapiLoaded = false;
    this.gisLoaded = false;
    this.googleDriveRetries = 0;
    this.maxGoogleDriveRetries = 5;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadSubjects();
    this.initGoogleDrive();
  }

  setupEventListeners() {
    // Subject modal
    document.getElementById("createSubjectBtn")?.addEventListener("click", () => {
      this.openCreateSubjectModal();
    });

    document.getElementById("submitSubjectBtn")?.addEventListener("click", () => {
      this.handleCreateSubject();
    });

    // Note modal
    document.getElementById("createNoteBtn")?.addEventListener("click", () => {
      if (!this.selectedSubject) {
        alert("Please select a subject first");
        return;
      }
      this.openCreateNoteModal();
    });

    document.getElementById("submitNoteBtn")?.addEventListener("click", () => {
      this.handleCreateNote();
    });

    // File upload options (in files modal)
    document.getElementById("uploadLocalFilesBtn")?.addEventListener("click", () => {
      document.getElementById("noteFilesInput").click();
    });

    document.getElementById("uploadGoogleDriveBtn")?.addEventListener("click", () => {
      this.handleConnectAndUploadGoogleDrive();
    });

    // File input change handler
    const fileInput = document.getElementById("noteFilesInput");
    if (fileInput) {
      fileInput.addEventListener("change", (e) => this.handleLocalFileUpload(e));
    }

    // Close modals
    document.querySelectorAll(".modal-close").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.target.closest(".modal-content").closest(".modal").style.display = "none";
      });
    });
  }

  // Subject Management
  async loadSubjects() {
    try {
      if (!this.authToken) {
        console.error("❌ No auth token found. User must be logged in as teacher first.");
        console.log("authToken from localStorage:", localStorage.getItem("authToken"));
        console.log("userRole from localStorage:", localStorage.getItem("userRole"));
        return;
      }

      console.log("🔄 Loading subjects with token:", this.authToken.substring(0, 20) + "...");
      
      const response = await fetch("/api/teacher/subjects", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.authToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error("Failed to load subjects:", response.status, response.statusText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      this.subjects = data.subjects || [];
      console.log("✅ Loaded", this.subjects.length, "subjects");
      this.displaySubjects();
    } catch (error) {
      console.error("Error loading subjects:", error);
    }
  }

  displaySubjects() {
    const container = document.getElementById("subjectsContainer");
    if (!container) return;

    if (this.subjects.length === 0) {
      container.innerHTML =
        '<div class="empty-state">No subjects yet. Create one to get started!</div>';
      return;
    }

    container.innerHTML = this.subjects
      .map(
        (subject) => `
      <div class="subject-card" data-subject-id="${subject.id}">
        <div class="subject-header">
          <h3 class="subject-title">${subject.name}</h3>
          <div class="subject-actions">
            <button class="icon-btn edit-subject-btn" title="Edit" data-id="${subject.id}">
              ✎
            </button>
            <button class="icon-btn delete-subject-btn" title="Delete" data-id="${subject.id}">
              🗑
            </button>
          </div>
        </div>
        <p class="subject-description">${subject.description || "No description"}</p>
        <div class="subject-meta">
          <span class="note-count">Notes: <span id="note-count-${subject.id}">0</span></span>
          <span class="last-updated">Updated: ${new Date(subject.updated_at).toLocaleDateString()}</span>
        </div>
        <button class="view-notes-btn" data-id="${subject.id}">View Notes →</button>
      </div>
    `
      )
      .join("");

    // Add event listeners
    container.querySelectorAll(".view-notes-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const subjectId = e.target.dataset.id;
        this.selectSubject(parseInt(subjectId));
      });
    });

    container.querySelectorAll(".delete-subject-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.handleDeleteSubject(parseInt(e.target.dataset.id));
      });
    });

    container.querySelectorAll(".edit-subject-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.handleEditSubject(parseInt(e.target.dataset.id));
      });
    });

    // Load note counts
    this.subjects.forEach((subject) => {
      this.loadNoteCount(subject.id);
    });
  }

  async loadNoteCount(subjectId) {
    try {
      const response = await fetch(`/api/teacher/subjects/${subjectId}/notes`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.authToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        const countSpan = document.getElementById(`note-count-${subjectId}`);
        if (countSpan) {
          countSpan.textContent = data.notes ? data.notes.length : 0;
        }
      }
    } catch (error) {
      console.error("Error loading note count:", error);
    }
  }

  async selectSubject(subjectId) {
    const subject = this.subjects.find((s) => s.id === subjectId);
    if (!subject) return;

    this.selectedSubject = subject;

    // Hide subjects view, show notes view
    const subjectsView = document.getElementById("subjectsView");
    const notesView = document.getElementById("notesView");

    if (subjectsView) subjectsView.style.display = "none";
    if (notesView) notesView.style.display = "block";

    // Update header
    const notesTitle = document.getElementById("notesViewTitle");
    if (notesTitle) {
      notesTitle.textContent = `${subject.name} - Notes`;
    }

    // Load notes for this subject
    await this.loadNotes();
  }

  // Notes Management
  async loadNotes() {
    if (!this.selectedSubject) return;

    try {
      const response = await fetch(
        `/api/teacher/subjects/${this.selectedSubject.id}/notes`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        console.error("Failed to load notes:", response.status);
        return;
      }

      const data = await response.json();
      const notes = data.notes || [];
      this.displayNotes(notes);
    } catch (error) {
      console.error("Error loading notes:", error);
    }
  }

  displayNotes(notes) {
    const container = document.getElementById("notesContainer");
    if (!container) return;

    if (notes.length === 0) {
      container.innerHTML =
        '<div class="empty-state">No notes yet. Create one to get started!</div>';
      return;
    }

    container.innerHTML = notes
      .map(
        (note) => `
      <div class="note-card" data-note-id="${note.id}">
        <div class="note-header">
          <h4 class="note-title">${note.title}</h4>
          <div class="note-actions">
            <span class="visibility-badge visibility-${note.visibility}">${note.visibility}</span>
            <button class="icon-btn edit-note-btn" title="Edit" data-id="${note.id}">
              ✎
            </button>
            <button class="icon-btn delete-note-btn" title="Delete" data-id="${note.id}">
              🗑
            </button>
          </div>
        </div>
        ${note.description ? `<p class="note-description">${note.description}</p>` : ""}
        <div class="note-meta">
          <span class="created-date">${new Date(note.created_at).toLocaleDateString()}</span>
        </div>
        <button class="view-files-btn" data-id="${note.id}">View Files →</button>
      </div>
    `
      )
      .join("");

    // Add event listeners
    container.querySelectorAll(".delete-note-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.handleDeleteNote(parseInt(e.target.dataset.id));
      });
    });

    container.querySelectorAll(".view-files-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.loadNoteFiles(parseInt(e.target.dataset.id));
      });
    });
  }

  async handleCreateSubject() {
    const name = document.getElementById("subjectName")?.value;
    const description = document.getElementById("subjectDescription")?.value;

    if (!name) {
      alert("Please enter a subject name");
      return;
    }

    try {
      const response = await fetch("/api/teacher/subjects/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, description }),
      });

      if (!response.ok) {
        alert("Failed to create subject");
        return;
      }

      // Close modal and reload
      document.getElementById("createSubjectModal").style.display = "none";
      this.loadSubjects();

      // Clear form
      document.getElementById("subjectName").value = "";
      document.getElementById("subjectDescription").value = "";
    } catch (error) {
      console.error("Error creating subject:", error);
      alert("Error creating subject");
    }
  }

  async handleCreateNote() {
    if (!this.selectedSubject) return;

    const title = document.getElementById("noteTitle")?.value;
    const description = document.getElementById("noteDescription")?.value;
    const visibility = document.getElementById("noteVisibility")?.value || "private";

    if (!title) {
      alert("Please enter a note title");
      return;
    }

    try {
      const response = await fetch(
        `/api/teacher/subjects/${this.selectedSubject.id}/notes/create`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title, description, visibility }),
        }
      );

      if (!response.ok) {
        alert("Failed to create note");
        return;
      }

      // Close modal and reload
      document.getElementById("createNoteModal").style.display = "none";
      this.loadNotes();

      // Clear form
      document.getElementById("noteTitle").value = "";
      document.getElementById("noteDescription").value = "";
      document.getElementById("noteVisibility").value = "private";
    } catch (error) {
      console.error("Error creating note:", error);
      alert("Error creating note");
    }
  }

  async handleDeleteSubject(subjectId) {
    if (!confirm("Are you sure you want to delete this subject and all its notes?")) {
      return;
    }

    try {
      const response = await fetch(`/api/teacher/subjects/${subjectId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${this.authToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        alert("Failed to delete subject");
        return;
      }

      this.loadSubjects();
    } catch (error) {
      console.error("Error deleting subject:", error);
      alert("Error deleting subject");
    }
  }

  async handleDeleteNote(noteId) {
    if (!this.selectedSubject) return;
    if (!confirm("Are you sure you want to delete this note?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/teacher/subjects/${this.selectedSubject.id}/notes/${noteId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${this.authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        alert("Failed to delete note");
        return;
      }

      this.loadNotes();
    } catch (error) {
      console.error("Error deleting note:", error);
      alert("Error deleting note");
    }
  }

  // Google Drive Integration
  initGoogleDrive() {
    // Wait for googleDrive.config.js to be loaded (with retry limit)
    if (typeof window.GOOGLE_DRIVE_CONFIG === "undefined") {
      this.googleDriveRetries++;
      if (this.googleDriveRetries >= this.maxGoogleDriveRetries) {
        console.warn("Google Drive config failed to load after retries. Google Drive features will be disabled.");
        return;
      }
      console.debug(`Google Drive config not yet loaded. Retrying... (${this.googleDriveRetries}/${this.maxGoogleDriveRetries})`);
      setTimeout(() => this.initGoogleDrive(), 500);
      return;
    }

    const config = this.getGoogleDriveConfig();
    if (!config.clientId) {
      console.warn("Google Drive CLIENT_ID not configured. Google Drive features will be disabled.");
      return;
    }

    console.log("Google Drive config loaded successfully");
    // Load Google API
    this.loadGoogleAPIs();
  }

  getGoogleDriveConfig() {
    // Get from window.GOOGLE_DRIVE_CONFIG (loaded from googleDrive.config.js)
    const config = window.GOOGLE_DRIVE_CONFIG || {};
    
    return {
      clientId: config.CLIENT_ID || "",
      apiKey: config.API_KEY || "",
      discoveryDocs: config.DISCOVERY_DOCS || [
        "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
      ],
      scopes: config.SCOPES || [
        "https://www.googleapis.com/auth/drive.file",
      ],
    };
  }

  loadGoogleAPIs() {
    const config = this.getGoogleDriveConfig();

    // Load GAPI
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/client.js";
    script.onload = () => {
      gapi.load("client", () => {
        gapi.client
          .init({
            apiKey: config.apiKey,
            clientId: config.clientId,
            discoveryDocs: config.discoveryDocs,
            scope: config.scopes.join(" "),
          })
          .then(() => {
            this.gapiLoaded = true;
            console.log("GAPI loaded");
          })
          .catch((error) => {
            console.error("Error loading GAPI:", error);
          });
      });
    };
    document.body.appendChild(script);

    // Load GIS
    const gisScript = document.createElement("script");
    gisScript.src = "https://accounts.google.com/gsi/client";
    gisScript.onload = () => {
      this.gisLoaded = true;
      console.log("GIS loaded");
    };
    document.body.appendChild(gisScript);
  }

  async handleConnectGoogleDrive() {
    if (!this.gapiLoaded) {
      alert("Google Drive is still loading. Please wait...");
      return;
    }

    try {
      const user = gapi.auth2.getAuthInstance().currentUser.get();
      if (user.isSignedIn()) {
        this.googleDriveConnected = true;
        document.getElementById("connectGoogleDriveBtn").textContent = "✓ Connected";
        document.getElementById("connectGoogleDriveBtn").disabled = true;
      } else {
        await gapi.auth2.getAuthInstance().signIn();
        this.googleDriveConnected = true;
        document.getElementById("connectGoogleDriveBtn").textContent = "✓ Connected";
        document.getElementById("connectGoogleDriveBtn").disabled = true;
      }
    } catch (error) {
      console.error("Error connecting to Google Drive:", error);
      alert("Failed to connect to Google Drive");
    }
  }

  async handleFileUpload(event) {
    const files = event.target.files;
    if (!files || files.length === 0 || !this.selectedSubject) return;

    for (let file of files) {
      await this.uploadFileToDrive(file);
    }
  }

  async uploadFileToDrive(file) {
    if (!this.googleDriveConnected || !this.gapiLoaded) {
      alert("Please connect to Google Drive first");
      return;
    }

    try {
      const metadata = {
        name: file.name,
        mimeType: file.type,
      };

      const form = new FormData();
      form.append(
        "metadata",
        new Blob([JSON.stringify(metadata)], { type: "application/json" })
      );
      form.append("file", file);

      const response = await gapi.client.drive.files.create({
        resource: metadata,
        media: {
          mimeType: file.type,
          body: file,
        },
        fields: "id",
        uploadType: "multipart",
      });

      console.log("File uploaded:", response.result.id);

      // Make file public
      await gapi.client.drive.permissions.create({
        fileId: response.result.id,
        resource: {
          kind: "drive#permission",
          role: "reader",
          type: "anyone",
        },
      });

      // Get share link
      const fileInfo = await gapi.client.drive.files.get({
        fileId: response.result.id,
        fields: "webViewLink",
      });

      console.log("File shared link:", fileInfo.result.webViewLink);
    } catch (error) {
      console.error("Error uploading file to Google Drive:", error);
      alert("Error uploading file");
    }
  }

  async loadNoteFiles(noteId) {
    if (!this.selectedSubject) return;

    try {
      const response = await fetch(
        `/api/teacher/subjects/${this.selectedSubject.id}/notes/${noteId}/files`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        console.error("Failed to load files:", response.status);
        return;
      }

      const data = await response.json();
      const files = data.files || [];
      this.displayNoteFiles(noteId, files);
    } catch (error) {
      console.error("Error loading note files:", error);
    }
  }

  displayNoteFiles(noteId, files) {
    const modal = document.getElementById("filesModal");
    const container = document.getElementById("filesContainer");

    if (!container) return;

    // Store current note ID for file upload operations
    this.currentNoteId = noteId;

    // Files list section
    let filesHtml = "";
    if (files.length === 0) {
      filesHtml = "<p>No files uploaded for this note yet.</p>";
    } else {
      filesHtml = "<h4>Uploaded Files</h4>";
      filesHtml += files
        .map(
          (file) => `
        <div class="file-item">
          <a href="${file.file_url}" target="_blank" class="file-link">
            📄 ${file.file_name}
          </a>
          <button class="delete-file-btn" data-file-id="${file.id}" data-note-id="${noteId}">
            Delete
          </button>
        </div>
      `
        )
        .join("");
    }

    container.innerHTML = filesHtml;

    // Add delete listeners
    container.querySelectorAll(".delete-file-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.handleDeleteFile(
          parseInt(e.target.dataset.noteId),
          parseInt(e.target.dataset.fileId)
        );
      });
    });

    if (modal) modal.style.display = "block";
  }

  async handleDeleteFile(noteId, fileId) {
    if (!this.selectedSubject) return;
    if (!confirm("Delete this file?")) return;

    try {
      const response = await fetch(
        `/api/teacher/subjects/${this.selectedSubject.id}/notes/${noteId}/files/${fileId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${this.authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        alert("Failed to delete file");
        return;
      }

      this.loadNoteFiles(noteId);
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("Error deleting file");
    }
  }

  // File Upload Handlers
  async handleLocalFileUpload(event) {
    if (!this.selectedSubject || !this.currentNoteId) {
      alert("Error: No note selected");
      return;
    }

    const files = event.target.files;
    if (files.length === 0) return;

    // Upload each file
    for (let file of files) {
      await this.uploadFileToBackend(file);
    }

    // Reload files list
    this.loadNoteFiles(this.currentNoteId);

    // Reset file input
    event.target.value = "";
  }

  async uploadFileToBackend(file) {
    if (!this.selectedSubject || !this.currentNoteId) return;

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `/api/teacher/subjects/${this.selectedSubject.id}/notes/${this.currentNoteId}/files/create`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.authToken}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        console.error(`Failed to upload file: ${file.name}`);
        return;
      }

      console.log(`✅ File uploaded: ${file.name}`);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  }

  handleConnectAndUploadGoogleDrive() {
    if (!this.currentNoteId) {
      alert("Error: No note selected");
      return;
    }

    const config = this.getGoogleDriveConfig();
    if (!config.clientId) {
      alert("⚠️ Google Drive is not configured. Please configure it first in settings.");
      return;
    }

    if (this.googleDriveConnected) {
      alert("✅ Google Drive is already connected!");
      return;
    }

    // Trigger Google Drive upload flow
    this.initiateGoogleDriveUpload();
  }

  initiateGoogleDriveUpload() {
    alert("🔄 Initializing Google Drive upload...\n\nThis feature will allow you to upload files directly to Google Drive.");
    // Implementation depends on Google Drive API setup
    // For now, this is a placeholder for Google Drive integration
  }

  // UI Helper Methods
  openCreateSubjectModal() {
    const modal = document.getElementById("createSubjectModal");
    if (modal) modal.style.display = "block";
  }

  openCreateNoteModal() {
    const modal = document.getElementById("createNoteModal");
    if (modal) modal.style.display = "block";
  }

  handleEditSubject(subjectId) {
    alert("Edit feature coming soon");
  }

  backToSubjects() {
    const subjectsView = document.getElementById("subjectsView");
    const notesView = document.getElementById("notesView");

    if (subjectsView) subjectsView.style.display = "block";
    if (notesView) notesView.style.display = "none";

    this.selectedSubject = null;
  }
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    window.notesManager = new TeacherNotesManager();
  });
} else {
  window.notesManager = new TeacherNotesManager();
}
