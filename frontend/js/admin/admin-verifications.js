// Teacher Verifications Management - Connected to Backend

let allVerifications = [];
let filteredVerifications = [];

// Load verifications from API
async function loadVerifications() {
  try {
    allVerifications = await adminApi.getPendingVerifications();
    filteredVerifications = [...allVerifications];
    renderVerificationsTable();
    loadPendingVerificationsCount();
  } catch (error) {
    console.error("Error loading verifications:", error);
    showToast("Failed to load verifications", "error");
    renderVerificationsTable();
  }
}

// Load pending verifications count
function loadPendingVerificationsCount() {
  const countElement = document.getElementById("pending-verifications-count");
  if (countElement) {
    countElement.textContent = allVerifications.length;
  }
}

// Render verifications table
function renderVerificationsTable() {
  const tbody = document.getElementById("verifications-table-body");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (filteredVerifications.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="admin-empty-state">
          No pending verifications
        </td>
      </tr>
    `;
    return;
  }

  filteredVerifications.forEach((verification) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td class="text-white">${verification.username}</td>
      <td class="text-muted">${verification.email}</td>
      <td class="text-muted">${formatDate(verification.submitted_at)}</td>
      <td>
        <a href="#" class="file-link" title="Download document" data-verification-id="${verification.id}">
          <i class="fas fa-file-pdf"></i> ${verification.file_name || 'verification.pdf'}
        </a>
      </td>
      <td class="text-muted" title="${verification.message}">
        ${verification.message ? verification.message.substring(0, 40) + '...' : 'No message'}
      </td>
      <td style="text-align: center;">
        <button class="approve-verification-btn admin-table-action" data-verification-id="${verification.id}" title="Approve">
          <i class="fas fa-check"></i>
        </button>
        <button class="reject-verification-btn admin-table-action" data-verification-id="${verification.id}" title="Reject">
          <i class="fas fa-times"></i>
        </button>
        <button class="view-details-btn admin-table-action" data-verification-id="${verification.id}" title="View Details">
          <i class="fas fa-eye"></i>
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });

  bindVerificationEvents();
}

// Bind verification action events
function bindVerificationEvents() {
  document.addEventListener("click", (e) => {
    // Approve verification
    if (e.target.closest(".approve-verification-btn")) {
      const verificationId = parseInt(
        e.target.closest(".approve-verification-btn").dataset.verificationId
      );
      approveVerification(verificationId);
    }

    // Reject verification
    if (e.target.closest(".reject-verification-btn")) {
      const verificationId = parseInt(
        e.target.closest(".reject-verification-btn").dataset.verificationId
      );
      rejectVerification(verificationId);
    }

    // View details
    if (e.target.closest(".view-details-btn")) {
      const verificationId = parseInt(
        e.target.closest(".view-details-btn").dataset.verificationId
      );
      viewVerificationDetails(verificationId);
    }

    // Download file
    if (e.target.closest(".file-link")) {
      e.preventDefault();
      const verificationId = parseInt(
        e.target.closest(".file-link").dataset.verificationId
      );
      downloadVerificationFile(verificationId);
    }
  });
}

// Approve verification
async function approveVerification(verificationId) {
  const verification = allVerifications.find((v) => v.id === verificationId);
  if (!verification) return;

  if (
    confirm(
      `Approve verification for ${verification.username}? This will mark them as verified.`
    )
  ) {
    try {
      await adminApi.approveVerification(verificationId);
      showToast(`${verification.username} has been verified!`, "success");
      loadVerifications();
    } catch (error) {
      showToast("Failed to approve verification: " + error.message, "error");
    }
  }
}

// Reject verification
async function rejectVerification(verificationId) {
  const verification = allVerifications.find((v) => v.id === verificationId);
  if (!verification) return;

  const reason = prompt(
    "Please provide a reason for rejection:",
    "Document quality issues"
  );
  if (reason === null) return;

  try {
    await adminApi.rejectVerification(verificationId, reason);
    showToast(`Verification rejected for ${verification.username}`, "success");
    loadVerifications();
  } catch (error) {
    showToast("Failed to reject verification: " + error.message, "error");
  }
}

// View verification details
async function viewVerificationDetails(verificationId) {
  try {
    const verification = await adminApi.getVerificationDetails(verificationId);
    
    const detailsText = `
Teacher Name: ${verification.username}
Email: ${verification.email}
Submitted: ${formatDate(verification.submitted_at)}
Document: ${verification.file_name || 'verification.pdf'}
Message: ${verification.message || 'No message'}
Status: ${verification.status}
Has File: ${verification.has_file ? 'Yes' : 'No'}
    `;

    alert(detailsText);
  } catch (error) {
    showToast("Failed to load verification details", "error");
  }
}

// Download verification file
async function downloadVerificationFile(verificationId) {
  try {
    await adminApi.downloadVerificationFile(verificationId);
    showToast("File downloaded successfully", "success");
  } catch (error) {
    showToast("Failed to download file: " + error.message, "error");
  }
}

// Format date helper
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

// Show toast notification
function showToast(message, type = "info") {
  const toast = document.getElementById("toast");
  if (toast) {
    toast.textContent = message;
    toast.className = `toast toast-${type}`;
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  }
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  loadVerifications();
  
  // Add refresh button functionality
  const refreshBtn = document.getElementById("refresh-verifications-btn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      loadVerifications();
    });
  }
});
