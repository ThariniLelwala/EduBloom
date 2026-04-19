// Teacher Verification Status Management

let currentVerification = null;

// API request helper function
async function apiRequest(endpoint, method, data = null) {
  try {
    const token = localStorage.getItem("authToken");
    const options = {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(endpoint, options);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Request failed");
    }

    return result;
  } catch (error) {
    console.error("API request error:", error);
    throw error;
  }
}

// Load verification status
async function loadVerificationStatus() {
  try {
    const result = await apiRequest('/teacher/verification-status', 'GET');
    currentVerification = result.verification;
    displayVerificationStatus();
  } catch (error) {
    console.error("Error loading verification status:", error);
    displayErrorState();
  }
}

// Display verification status based on current state
function displayVerificationStatus() {
  const container = document.querySelector('.verification-status-content');
  if (!container) return;

  if (!currentVerification) {
    displaySubmissionForm(container);
    return;
  }

  switch(currentVerification.status) {
    case 'pending':
      displayPendingStatus(container);
      break;
    case 'approved':
      displayApprovedStatus(container);
      break;
    case 'rejected':
      displayRejectedStatus(container);
      break;
    default:
      displayUnknownStatus(container);
  }
}

// Display pending status
function displayPendingStatus(container) {
  container.innerHTML = `
    <div class="verification-status pending">
      <div class="status-icon">
        <i class="fas fa-clock"></i>
      </div>
      <div class="status-content">
        <h4>Under Review</h4>
        <p>Your verification is being reviewed by administrators</p>
        <div class="verification-details">
          <span><i class="fas fa-calendar"></i> Submitted: ${formatDate(currentVerification.submitted_at)}</span>
          ${currentVerification.file_name ? `<span><i class="fas fa-file-pdf"></i> ${currentVerification.file_name}</span>` : ''}
        </div>
      </div>
    </div>
  `;
}

// Display approved status
function displayApprovedStatus(container) {
  container.innerHTML = `
    <div class="verification-status approved">
      <div class="status-icon">
        <i class="fas fa-check-circle"></i>
      </div>
      <div class="status-content">
        <h4>Verified</h4>
        <p>Your teacher account has been verified</p>
        <div class="verification-details">
          <span><i class="fas fa-calendar-check"></i> Approved: ${formatDate(currentVerification.verified_at)}</span>
          ${currentVerification.file_name ? `<span><i class="fas fa-file-pdf"></i> ${currentVerification.file_name}</span>` : ''}
        </div>
      </div>
    </div>
  `;
}

// Display rejected status
function displayRejectedStatus(container) {
  const canResubmit = currentVerification.can_resubmit;
  const rejectionReason = currentVerification.rejection_reason || "No reason provided";
  
  let additionalContent = '';
  
  if (canResubmit) {
    additionalContent = `
      <button id="resubmit-verification-btn" class="btn btn-primary" style="margin-top: 12px; padding: 8px 16px; font-size: 12px;">
        <i class="fas fa-redo"></i> Resubmit Verification
      </button>
    `;
  } else {
    const daysRemaining = calculateDaysRemaining(currentVerification.resubmit_available_at);
    additionalContent = `
      <div class="cool-down-message">
        <i class="fas fa-hourglass-half"></i>
        Resubmit available in ${daysRemaining} days
      </div>
    `;
  }

  container.innerHTML = `
    <div class="verification-status rejected">
      <div class="status-icon">
        <i class="fas fa-times-circle"></i>
      </div>
      <div class="status-content">
        <h4>Verification Rejected</h4>
        <p><strong>Reason:</strong> ${rejectionReason}</p>
        <div class="verification-details">
          <span><i class="fas fa-calendar-times"></i> Rejected: ${formatDate(currentVerification.reviewed_at)}</span>
        </div>
        ${additionalContent}
      </div>
    </div>
  `;

  // Bind resubmit button if present
  if (canResubmit) {
    document.getElementById('resubmit-verification-btn').addEventListener('click', showResubmitForm);
  }
}

// Display submission form
function displaySubmissionForm(container) {
  container.innerHTML = `
    <div class="verification-submission">
      <h4>Submit Teacher Verification</h4>
      <p>Upload your appointment letter or teaching certificate to verify your teacher account</p>
      
      <form id="verification-form">
        <div class="form-group">
          <label for="verification-file" style="color: rgba(255, 255, 255, 0.8); font-size: 12px; display: block; margin-bottom: 6px;">Appointment Letter (PDF, max 2MB)</label>
          <input 
            type="file" 
            id="verification-file" 
            accept=".pdf,application/pdf"
            required
            style="width: 100%; padding: 8px; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; background: rgba(255, 255, 255, 0.05); color: var(--color-white); font-size: 13px;"
          />
          <small style="display: block; margin-top: 4px; font-size: 11px; color: rgba(255, 255, 255, 0.5);">Only PDF files are allowed, maximum size 2MB</small>
        </div>
        
        <div class="form-group" style="margin-top: 12px;">
          <label for="verification-message" style="color: rgba(255, 255, 255, 0.8); font-size: 12px; display: block; margin-bottom: 6px;">Message (optional)</label>
          <textarea 
            id="verification-message" 
            placeholder="Any additional information about your verification..."
            rows="3"
            style="width: 100%; padding: 8px; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 6px; background: rgba(255, 255, 255, 0.05); color: var(--color-white); font-size: 13px; resize: vertical; min-height: 60px;"
          ></textarea>
        </div>
        
        <button type="submit" class="btn btn-primary" style="margin-top: 12px;">
          <i class="fas fa-upload"></i> Submit Verification
        </button>
      </form>
    </div>
  `;

  // Bind form submission
  document.getElementById('verification-form').addEventListener('submit', handleVerificationSubmit);
}

// Display error state
function displayErrorState() {
  const container = document.querySelector('.verification-status-content');
  if (!container) return;

  container.innerHTML = `
    <div class="verification-status error">
      <div class="status-icon">
        <i class="fas fa-exclamation-triangle"></i>
      </div>
      <div class="status-content">
        <h4>Error Loading Status</h4>
        <p>Failed to load verification status. Please try refreshing.</p>
        <button id="retry-load-btn" class="btn btn-secondary" style="margin-top: 12px; padding: 8px 16px; font-size: 12px;">
          <i class="fas fa-sync-alt"></i> Retry
        </button>
      </div>
    </div>
  `;

  document.getElementById('retry-load-btn').addEventListener('click', loadVerificationStatus);
}

// Display unknown status
function displayUnknownStatus(container) {
  container.innerHTML = `
    <div class="verification-status unknown">
      <div class="status-icon">
        <i class="fas fa-question-circle"></i>
      </div>
      <div class="status-content">
        <h4>Unknown Status</h4>
        <p>Your verification status could not be determined</p>
      </div>
    </div>
  `;
}

// Show resubmit form
function showResubmitForm() {
  const container = document.querySelector('.verification-status-content');
  displaySubmissionForm(container);
}

// Handle verification submission
async function handleVerificationSubmit(e) {
  e.preventDefault();

  const fileInput = document.getElementById('verification-file');
  const messageInput = document.getElementById('verification-message');
  const file = fileInput.files[0];
  const message = messageInput.value.trim();

  // Validate file
  const validation = validateFile(file);
  if (!validation.valid) {
    showToast(validation.error, 'error');
    return;
  }

  try {
    // Convert file to base64
    const base64File = await fileToBase64(file);

    // Submit verification
    const result = await apiRequest('/teacher/request-verification', 'POST', {
      verificationMessage: message,
      appointmentLetter: {
        data: base64File,
        filename: file.name
      }
    });

    showToast('Verification submitted successfully!', 'success');
    loadVerificationStatus();
  } catch (error) {
    console.error('Error submitting verification:', error);
    showToast('Failed to submit verification: ' + error.message, 'error');
  }
}

// Validate file
function validateFile(file) {
  if (!file) {
    return { valid: false, error: 'Please select a file' };
  }

  // File size validation
  if (file.size > 2 * 1024 * 1024) {
    return { valid: false, error: 'File size exceeds 2MB limit' };
  }

  // File type validation
  if (file.type !== 'application/pdf') {
    return { valid: false, error: 'Only PDF files are allowed' };
  }

  return { valid: true };
}

// Convert file to base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Calculate days remaining
function calculateDaysRemaining(resubmitDate) {
  if (!resubmitDate) return 0;
  
  const now = new Date();
  const resubmitDateTime = new Date(resubmitDate);
  const diffTime = resubmitDateTime - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
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
function showToast(message, type = 'info') {
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
  loadVerificationStatus();
  
  // Add refresh button functionality
  const refreshBtn = document.getElementById('refresh-verification-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', loadVerificationStatus);
  }
});
