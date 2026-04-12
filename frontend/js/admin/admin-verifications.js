// Teacher Verifications - Connected to Backend API

let verifications = [];
let currentVerificationId = null;

document.addEventListener("DOMContentLoaded", () => {
  loadVerifications();
  initModalHandlers();
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

function initModalHandlers() {
  const modal = document.getElementById("verification-details-modal");
  const closeBtn = document.getElementById("close-verification-btn");
  const closeIcon = document.getElementById("close-verification-modal");
  const approveBtn = document.getElementById("approve-verif-btn");
  const rejectBtn = document.getElementById("reject-verif-btn");

  if (closeBtn) {
    closeBtn.addEventListener("click", closeVerificationModal);
  }

  if (closeIcon) {
    closeIcon.addEventListener("click", closeVerificationModal);
  }

  if (modal) {
    modal.addEventListener("click", e => {
      if (e.target === modal) {
        closeVerificationModal();
      }
    });
  }

  if (approveBtn) {
    approveBtn.addEventListener("click", () => {
      if (currentVerificationId) {
        approveVerification(currentVerificationId);
      }
    });
  }

  if (rejectBtn) {
    rejectBtn.addEventListener("click", () => {
      if (currentVerificationId) {
        rejectVerification(currentVerificationId);
      }
    });
  }
}

function openVerificationModal() {
  const modal = document.getElementById("verification-details-modal");
  if (modal) {
    modal.style.display = "flex";
  }
}

function closeVerificationModal() {
  const modal = document.getElementById("verification-details-modal");
  if (modal) {
    modal.style.display = "none";
  }
  currentVerificationId = null;
}

function viewVerificationDetails(id) {
  const v = verifications.find(x => Number(x.id) === Number(id));
  if (!v) return;
  
  currentVerificationId = Number(v.id);
  const name = `${v.firstname || ""} ${v.lastname || ""}`.trim() || v.username;
  const date = v.submitted_at ? new Date(v.submitted_at).toLocaleString() : "N/A";
  
  document.getElementById("verif-teacher-name").textContent = name;
  document.getElementById("verif-email").textContent = v.email || "N/A";
  document.getElementById("verif-submitted-date").textContent = date;
  document.getElementById("verif-document-name").textContent = v.file_name || "Document";
  document.getElementById("verif-message").textContent = v.message || "No message provided";
  
  const docLink = document.getElementById("verif-document-link");
  if (v.file_name) {
    docLink.style.display = "inline-flex";
    docLink.onclick = (e) => {
      e.preventDefault();
      downloadVerificationFile(v.id, v.file_name);
    };
  } else {
    docLink.style.display = "none";
  }
  
  openVerificationModal();
}

async function downloadVerificationFile(id, fileName) {
  try {
    const token = localStorage.getItem("authToken");
    const response = await fetch(`/api/admin/verifications/${id}/download`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error("Failed to download file");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName || "document";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    showToast("Failed to download document", "error");
  }
}

function viewVerificationFile(id) {
  const v = verifications.find(x => Number(x.id) === Number(id));
  if (v) {
    downloadVerificationFile(v.id, v.file_name);
  }
}

async function approveVerification(id) {
  const v = verifications.find(x => Number(x.id) === Number(id));
  const name = v ? `${v.firstname || ""} ${v.lastname || ""}`.trim() || v.username : "User";
  
  try {
    await adminApi.approveVerification(id);
    verifications = verifications.filter(x => Number(x.id) !== Number(id));
    closeVerificationModal();
    renderVerifications();
    updateCount();
    showToast(`${name} has been verified!`, "success");
  } catch (error) {
    showToast(error.message, "error");
  }
}

async function rejectVerification(id) {
  const v = verifications.find(x => Number(x.id) === Number(id));
  const name = v ? `${v.firstname || ""} ${v.lastname || ""}`.trim() || v.username : "User";
  
  const reason = prompt("Please provide a reason for rejection:", "Document quality issues");
  if (reason === null) return;
  
  try {
    await adminApi.rejectVerification(id, reason);
    verifications = verifications.filter(x => Number(x.id) !== Number(id));
    closeVerificationModal();
    renderVerifications();
    updateCount();
    showToast(`Verification rejected for ${name}`, "success");
  } catch (error) {
    showToast(error.message, "error");
  }
}

function updateCount() {
  const countElement = document.getElementById("pending-verifications-count");
  if (countElement) countElement.textContent = verifications.length;
}

function showToast(message, type = "success") {
  let toast = document.getElementById("verification-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "verification-toast";
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      padding: 16px 24px;
      background: rgba(34, 197, 94, 0.95);
      color: white;
      border-radius: 8px;
      font-size: 14px;
      z-index: 10000;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(34, 197, 94, 0.4);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      transition: opacity 0.3s ease;
    `;
    document.body.appendChild(toast);
  }
  
  toast.textContent = message;
  toast.style.display = "block";
  toast.style.opacity = "1";
  
  if (type === "error") {
    toast.style.background = "rgba(239, 68, 68, 0.95)";
    toast.style.borderColor = "rgba(239, 68, 68, 0.4)";
  } else if (type === "success") {
    toast.style.background = "rgba(34, 197, 94, 0.95)";
    toast.style.borderColor = "rgba(34, 197, 94, 0.4)";
  }

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => {
      toast.style.display = "none";
    }, 300);
  }, 3000);
}
