// Teacher Verifications Management
let allVerifications = [];
let filteredVerifications = [];
let currentVerificationId = null;

async function loadVerifications() {
  try {
    allVerifications = await adminApi.getPendingVerifications();
    filteredVerifications = [...allVerifications];
    renderVerificationsTable();
  } catch (error) {
    showToast("Failed to load verifications", "error");
    renderVerificationsTable();
  }
}

function renderVerificationsTable() {
  const tbody = document.getElementById("verifications-table-body");
  if (!tbody) return;

  tbody.innerHTML = "";
  const countEl = document.getElementById("pending-verifications-count");
  if (countEl) countEl.textContent = filteredVerifications.length;

  if (filteredVerifications.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted" style="padding:40px;">No pending verifications</td></tr>';
    return;
  }

  filteredVerifications.forEach((v) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="text-white">${v.username}</td>
      <td class="text-muted">${v.email}</td>
      <td class="text-muted">${formatDate(v.submitted_at)}</td>
      <td class="text-muted">${v.message ? (v.message.substring(0,30) + (v.message.length>30?'...':'')) : '-'}</td>
      <td class="text-center">
        <button class="btn btn-primary" onclick="openVerificationModal(${v.id})">
          <i class="fas fa-eye"></i> Review
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function openVerificationModal(verificationId) {
  currentVerificationId = verificationId;
  try {
    const v = await adminApi.getVerificationDetails(verificationId);
    const modal = document.getElementById("verification-modal");
    const body = document.querySelector(".verification-modal-content");
    if (!modal || !body) return;

    body.innerHTML = `
      <div class="modal-body" style="text-align: left;">
        <div style="background:rgba(255,255,255,0.05);padding:16px;border-radius:8px;margin-bottom:16px;">
          <div style="margin-bottom:10px"><strong style="color:var(--color-text-muted)">Teacher:</strong> <span style="color:var(--color-white)">${v.username}</span></div>
          <div style="margin-bottom:10px"><strong style="color:var(--color-text-muted)">Email:</strong> <span style="color:var(--color-white)">${v.email}</span></div>
          <div style="margin-bottom:10px"><strong style="color:var(--color-text-muted)">Submitted:</strong> <span style="color:var(--color-white)">${formatDate(v.submitted_at)}</span></div>
          <div style="margin-bottom:10px"><strong style="color:var(--color-text-muted)">Document:</strong> <span style="color:var(--color-white)">${v.file_name || 'verification.pdf'}</span></div>
          <div><strong style="color:var(--color-text-muted)">Message:</strong> <span style="color:var(--color-white)">${v.message || '-'}</span></div>
        </div>
        <button class="btn btn-primary" onclick="downloadVerificationFile(${v.id})">
          <i class="fas fa-download"></i> Download Document
        </button>
        <div class="modal-actions">
          <button class="btn btn-success" onclick="approveVerification(${v.id})">
            <i class="fas fa-check"></i> Approve
          </button>
          <button class="btn btn-danger" onclick="rejectVerification(${v.id})">
            <i class="fas fa-times"></i> Reject
          </button>
        </div>
      </div>
    `;
    modal.classList.add("show");
  } catch (error) {
    showToast("Failed to load details", "error");
  }
}

function closeVerificationModal() {
  const modal = document.getElementById("verification-modal");
  if (modal) modal.classList.remove("show");
  currentVerificationId = null;
}

async function approveVerification(verificationId) {
  const v = allVerifications.find(x => x.id === verificationId);
  if (!v) return;
  if (confirm(`Approve verification for ${v.username}?`)) {
    try {
      await adminApi.approveVerification(verificationId);
      showToast(`${v.username} has been verified!`, "success");
      closeVerificationModal();
      loadVerifications();
    } catch (error) {
      showToast("Failed: " + error.message, "error");
    }
  }
}

async function rejectVerification(verificationId) {
  const v = allVerifications.find(x => x.id === verificationId);
  if (!v) return;
  const reason = prompt("Reason for rejection:");
  if (!reason) return;
  try {
    await adminApi.rejectVerification(verificationId, reason);
    showToast(`Rejected ${v.username}`, "success");
    closeVerificationModal();
    loadVerifications();
  } catch (error) {
    showToast("Failed: " + error.message, "error");
  }
}

async function downloadVerificationFile(verificationId) {
  try {
    const token = localStorage.getItem("authToken");
    const response = await fetch(`/api/admin/download-verification/${verificationId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!response.ok) throw new Error('Download failed');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `verification_${verificationId}.pdf`;
    a.click();
    setTimeout(() => window.URL.revokeObjectURL(url), 100);
  } catch (error) {
    showToast("Failed: " + error.message, "error");
  }
}

function formatDate(ds) {
  return new Date(ds).toLocaleDateString("en-US", {year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"});
}

function showToast(msg, type="info") {
  const t = document.getElementById("toast");
  if (t) { 
    t.textContent = msg; 
    t.className = `toast toast-${type}`;
    t.style.cssText = 'position:fixed;top:20px;right:20px;padding:12px 24px;background:#333;color:#fff;border-radius:8px;z-index:9999;';
    if (type === 'success') t.style.background = '#28a745';
    if (type === 'error') t.style.background = '#dc3545';
    t.style.display = 'block';
    setTimeout(() => t.style.display = 'none', 3000);
  } else {
    alert(msg);
  }
}

// Close modal on clicking outside or close button
document.addEventListener("click", function(e) {
  const m = document.getElementById("verification-modal");
  if (m && m.classList.contains("show")) {
    if (e.target === m) closeVerificationModal();
    if (e.target.closest(".modal-close")) closeVerificationModal();
  }
});

// Init
document.addEventListener("DOMContentLoaded", function() {
  loadVerifications();
  const rb = document.getElementById("refresh-verifications-btn");
  if (rb) rb.onclick = loadVerifications;
});