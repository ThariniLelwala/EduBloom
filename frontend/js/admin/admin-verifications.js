// Teacher Verifications - Connected to Backend API

let verifications = [];

document.addEventListener("DOMContentLoaded", () => {
  loadVerifications();
});

async function loadVerifications() {
  try {
    verifications = await adminApi.getPendingVerifications();
  } catch (error) {
    console.error("Error loading verifications:", error);
    verifications = [];
  }
  renderVerifications();
  updateCount();
}

function renderVerifications() {
  const tbody = document.getElementById("verifications-table-body");
  if (!tbody) return;
  
  tbody.innerHTML = "";
  
  if (verifications.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="admin-empty-state">No pending verifications</td></tr>';
    return;
  }

  verifications.forEach(v => {
    const name = `${v.firstname || ""} ${v.lastname || ""}`.trim() || v.username;
    const date = v.submitted_at ? new Date(v.submitted_at).toLocaleDateString() : "N/A";
    
    tbody.innerHTML += `
      <tr>
        <td class="text-white">${name}</td>
        <td class="text-muted">${v.email}</td>
        <td class="text-muted">${date}</td>
        <td>
          <a href="#" class="file-link" data-verification-id="${v.id}">
            <i class="fas fa-file-pdf"></i> ${v.file_name || "Document"}
          </a>
        </td>
        <td class="text-muted" title="${v.message || ""}">${(v.message || "").substring(0, 40)}${(v.message || "").length > 40 ? "..." : ""}</td>
        <td style="text-align: center;">
          <button class="approve-verification-btn admin-table-action" data-verification-id="${v.id}" title="Approve">
            <i class="fas fa-check"></i>
          </button>
          <button class="reject-verification-btn admin-table-action" data-verification-id="${v.id}" title="Reject">
            <i class="fas fa-times"></i>
          </button>
          <button class="view-details-btn admin-table-action" data-verification-id="${v.id}" title="View Details">
            <i class="fas fa-eye"></i>
          </button>
        </td>
      </tr>
    `;
  });

  bindEvents();
}

function bindEvents() {
  document.addEventListener("click", e => {
    if (e.target.closest(".approve-verification-btn")) {
      const id = parseInt(e.target.closest(".approve-verification-btn").dataset.verificationId);
      approveVerification(id);
    }
    if (e.target.closest(".reject-verification-btn")) {
      const id = parseInt(e.target.closest(".reject-verification-btn").dataset.verificationId);
      rejectVerification(id);
    }
    if (e.target.closest(".view-details-btn")) {
      const id = parseInt(e.target.closest(".view-details-btn").dataset.verificationId);
      viewVerificationDetails(id);
    }
    if (e.target.closest(".file-link")) {
      e.preventDefault();
      const id = parseInt(e.target.closest(".file-link").dataset.verificationId);
      viewVerificationFile(id);
    }
  });
}

async function approveVerification(id) {
  const v = verifications.find(x => x.id === id);
  const name = v ? `${v.firstname || ""} ${v.lastname || ""}`.trim() || v.username : "User";
  
  if (!confirm(`Approve verification for ${name}?`)) return;
  
  try {
    await adminApi.approveVerification(id);
    verifications = verifications.filter(x => x.id !== id);
    renderVerifications();
    updateCount();
    showNotification(`${name} has been verified!`);
  } catch (error) {
    alert(error.message);
  }
}

async function rejectVerification(id) {
  const v = verifications.find(x => x.id === id);
  const name = v ? `${v.firstname || ""} ${v.lastname || ""}`.trim() || v.username : "User";
  
  const reason = prompt("Please provide a reason for rejection:", "Document quality issues");
  if (reason === null) return;
  
  try {
    await adminApi.rejectVerification(id, reason);
    verifications = verifications.filter(x => x.id !== id);
    renderVerifications();
    updateCount();
    showNotification(`Verification rejected for ${name}`);
  } catch (error) {
    alert(error.message);
  }
}

function viewVerificationDetails(id) {
  const v = verifications.find(x => x.id === id);
  if (!v) return;
  
  const name = `${v.firstname || ""} ${v.lastname || ""}`.trim() || v.username;
  const date = v.submitted_at ? new Date(v.submitted_at).toLocaleString() : "N/A";
  
  alert(`Teacher: ${name}\nEmail: ${v.email}\nSubmitted: ${date}\nDocument: ${v.file_name || "N/A"}\nMessage: ${v.message || "None"}\nStatus: ${v.status}`);
}

function viewVerificationFile(id) {
  const v = verifications.find(x => x.id === id);
  if (!v) return;
  alert(`Opening document: ${v.file_name || "Document"}\n\nNote: File viewer would open here.`);
}

function updateCount() {
  const countElement = document.getElementById("pending-verifications-count");
  if (countElement) countElement.textContent = verifications.length;
}

function showNotification(message) {
  const toast = document.getElementById("toast");
  if (toast) {
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3000);
  } else {
    alert(message);
  }
}
