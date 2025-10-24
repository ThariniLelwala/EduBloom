// Teacher Verifications Management

let allVerifications = [];
let filteredVerifications = [];

// Initialize verifications data
function initializeVerificationsData() {
  allVerifications = [
    {
      id: 1,
      userId: 2,
      teacherName: "Sarah Smith",
      email: "sarah.smith@email.com",
      status: "pending",
      submittedAt: "2025-10-23",
      fileName: "appointment_letter.pdf",
      message: "Here is my appointment letter from the school.",
    },
    {
      id: 2,
      userId: 5,
      teacherName: "Alex Davis",
      email: "alex.davis@email.com",
      status: "pending",
      submittedAt: "2025-10-22",
      fileName: "teacher_certificate.pdf",
      message: "Attaching my teaching certificate and ID.",
    },
    {
      id: 3,
      userId: 8,
      teacherName: "Lisa Anderson",
      email: "lisa.a@email.com",
      status: "pending",
      submittedAt: "2025-10-21",
      fileName: "school_id_badge.jpg",
      message: "My school identification badge.",
    },
  ];
  filteredVerifications = [...allVerifications];
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
      <td class="text-white">${verification.teacherName}</td>
      <td class="text-muted">${verification.email}</td>
      <td class="text-muted">${verification.submittedAt}</td>
      <td>
        <a href="#" class="file-link" title="View document" data-verification-id="${verification.id}">
          <i class="fas fa-file-pdf"></i> ${verification.fileName}
        </a>
      </td>
      <td class="text-muted" title="${verification.message}">
        ${verification.message.substring(0, 40)}...
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

    // View file
    if (e.target.closest(".file-link")) {
      e.preventDefault();
      const verificationId = parseInt(
        e.target.closest(".file-link").dataset.verificationId
      );
      viewVerificationFile(verificationId);
    }
  });
}

// Approve verification
function approveVerification(verificationId) {
  const verification = allVerifications.find((v) => v.id === verificationId);
  if (!verification) return;

  if (
    confirm(
      `Approve verification for ${verification.teacherName}? This will mark them as verified.`
    )
  ) {
    // Update backend (placeholder)
    console.log(`Approving verification ${verificationId}`);

    // Remove from pending list
    allVerifications = allVerifications.filter((v) => v.id !== verificationId);
    filterVerifications();
    loadPendingVerificationsCount();

    showNotification(`${verification.teacherName} has been verified!`);
  }
}

// Reject verification
function rejectVerification(verificationId) {
  const verification = allVerifications.find((v) => v.id === verificationId);
  if (!verification) return;

  const reason = prompt(
    "Please provide a reason for rejection:",
    "Document quality issues"
  );
  if (reason === null) return;

  // Update backend (placeholder)
  console.log(`Rejecting verification ${verificationId} with reason: ${reason}`);

  // Remove from pending list
  allVerifications = allVerifications.filter((v) => v.id !== verificationId);
  filterVerifications();
  loadPendingVerificationsCount();

  showNotification(`Verification rejected for ${verification.teacherName}.`);
}

// View verification details
function viewVerificationDetails(verificationId) {
  const verification = allVerifications.find((v) => v.id === verificationId);
  if (!verification) return;

  const detailsText = `
Teacher Name: ${verification.teacherName}
Email: ${verification.email}
Submitted: ${verification.submittedAt}
Document: ${verification.fileName}
Message: ${verification.message}
Status: ${verification.status}
  `;

  alert(detailsText);
}

// View verification file (placeholder)
function viewVerificationFile(verificationId) {
  const verification = allVerifications.find((v) => v.id === verificationId);
  if (!verification) return;

  alert(
    `Opening document: ${verification.fileName}\n\nNote: In a real implementation, this would open the document viewer.`
  );
}

// Filter verifications
function filterVerifications() {
  // Can be extended with search and filter functionality
  filteredVerifications = [...allVerifications];
  renderVerificationsTable();
}

// Show notification
function showNotification(message) {
  // Use existing toast or notification system if available
  const toast = document.getElementById("toast");
  if (toast) {
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  } else {
    alert(message);
  }
}

// Initialize verifications on page load
document.addEventListener("DOMContentLoaded", () => {
  initializeVerificationsData();
  loadPendingVerificationsCount();
  renderVerificationsTable();
});
