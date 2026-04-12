// Admin Profile - Connected to Backend API

document.addEventListener("DOMContentLoaded", function () {
  loadProfileData();
  initializeBackgroundOptions();
  initializePasswordChangeModal();
  initializeLogout();
});

async function loadProfileData() {
  try {
    const user = await adminApi.getProfile();
    displayProfileData(user);
  } catch (error) {
    console.error("Failed to load profile:", error);
    const username = localStorage.getItem("username");
    if (username) {
      displayProfileData({ username, email: localStorage.getItem("email") || "Not set", role: "admin" });
    }
  }
}

function displayProfileData(user) {
  const profileInfo = document.getElementById("profile-info");
  const welcomeHeading = document.getElementById("welcome-heading");
  const welcomeMessage = document.getElementById("welcome-message");
  const fullName = `${user.firstname || ""} ${user.lastname || ""}`.trim() || user.username;

  if (welcomeHeading) welcomeHeading.textContent = `Welcome back, ${fullName}!`;
  if (welcomeMessage) welcomeMessage.textContent = "Manage your profile and appearance settings";

  profileInfo.innerHTML = `
    <div class="profile-info-grid">
      <div class="profile-item">
        <strong>Full Name</strong>
        <p>${fullName}</p>
      </div>
      <div class="profile-item">
        <strong>Username</strong>
        <p>${user.username || "Not set"}</p>
      </div>
      <div class="profile-item">
        <strong>Email</strong>
        <p>${user.email || "Not set"}</p>
      </div>
      <div class="profile-item">
        <strong>Role</strong>
        <p>Administrator</p>
      </div>
      <div class="profile-item">
        <strong>Joined Date</strong>
        <p>${user.created_at ? new Date(user.created_at).toLocaleDateString() : "Not set"}</p>
      </div>
    </div>
  `;
}

function initializeBackgroundOptions() {
  const bgOptions = document.getElementById("bg-options");
  const customBgInput = document.getElementById("custom-bg");

  const backgrounds = [
    { id: "bg1", name: "Default", url: "../../../assets/images/bg1.jpeg" },
    { id: "bg2", name: "Nature", url: "../../../assets/images/bg2.jpg" },
    { id: "bg3", name: "Abstract", url: "../../../assets/images/bg3.jpeg" },
    { id: "bg4", name: "Space", url: "../../../assets/images/bg4.jpeg" },
    { id: "bg5", name: "Ocean", url: "../../../assets/images/bg5.jpg" },
  ];

  backgrounds.forEach((bg) => {
    const option = document.createElement("div");
    option.className = "bg-option";
    option.dataset.bgId = bg.id;
    option.onclick = () => selectBackground(bg.id);
    option.innerHTML = `
      <img src="${bg.url}" alt="${bg.name}" onerror="this.innerHTML='<div class=\\'placeholder-img\\'>${bg.name}</div>'">
      <div class="checkmark"><i class="fas fa-check"></i></div>
    `;
    bgOptions.appendChild(option);
  });

  const currentBg = localStorage.getItem("selectedBackground") || "bg1";
  selectBackground(currentBg);

  if (customBgInput) {
    customBgInput.addEventListener("change", function (e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          const imageUrl = e.target.result;
          localStorage.setItem("customBackground", imageUrl);
          localStorage.setItem("selectedBackground", "custom");
          applyBackground("custom", imageUrl);
          showToast("Custom background uploaded successfully!");
        };
        reader.readAsDataURL(file);
      }
    });
  }
}

function selectBackground(bgId) {
  localStorage.setItem("selectedBackground", bgId);
  document.querySelectorAll(".bg-option").forEach((option) => option.classList.remove("selected"));
  const selectedOption = document.querySelector(`[data-bg-id="${bgId}"]`);
  if (selectedOption) selectedOption.classList.add("selected");

  if (bgId === "custom") {
    const customBg = localStorage.getItem("customBackground");
    if (customBg) applyBackground(bgId, customBg);
  } else {
    applyBackground(bgId);
  }
  showToast("Background updated successfully!");
}

function applyBackground(bgId, customUrl = null) {
  const bgImage = document.querySelector(".bg-image");
  const bgUrls = {
    bg1: "../../../assets/images/bg1.jpeg",
    bg2: "../../../assets/images/bg2.jpg",
    bg3: "../../../assets/images/bg3.jpeg",
    bg4: "../../../assets/images/bg4.jpeg",
    bg5: "../../../assets/images/bg5.jpg",
  };
  const bgUrl = bgId === "custom" && customUrl ? customUrl : bgUrls[bgId] || bgUrls.bg1;

  if (bgImage) {
    bgImage.style.backgroundImage = `url(${bgUrl})`;
    bgImage.style.backgroundSize = "cover";
    bgImage.style.backgroundPosition = "center";
    bgImage.style.backgroundRepeat = "no-repeat";
  }

  document.querySelectorAll(".welcome-image").forEach((el) => {
    el.style.backgroundImage = `url(${bgUrl})`;
    el.style.backgroundSize = "cover";
    el.style.backgroundPosition = "center";
    el.style.backgroundRepeat = "no-repeat";
  });
}

function initializePasswordChangeModal() {
  const modal = document.getElementById("changePasswordModal");
  const openBtn = document.getElementById("changePasswordBtn");
  const closeBtn = document.getElementById("closeModalBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const form = document.getElementById("changePasswordForm");

  if (openBtn) openBtn.addEventListener("click", () => modal.classList.add("show"));

  const closeModal = () => {
    modal.classList.remove("show");
    form.reset();
    clearErrors();
  };

  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const oldPassword = document.getElementById("oldPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    clearErrors();
    let isValid = true;

    if (newPassword !== confirmPassword) {
      showError("confirmPassword", "Passwords do not match");
      isValid = false;
    }
    if (newPassword.length < 8) {
      showError("newPassword", "Password must be at least 8 characters");
      isValid = false;
    }

    if (!isValid) return;

    try {
      await adminApi.changePassword(oldPassword, newPassword);
      showToast("Password changed successfully!");
      closeModal();
    } catch (error) {
      showError("oldPassword", error.message);
    }
  });
}

function initializeLogout() {
  const logoutBtn = document.getElementById("logoutButton");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to logout?")) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        localStorage.removeItem("username");
        localStorage.removeItem("userRole");
        window.location.href = "../../../login.html";
      }
    });
  }
}

function showError(inputId, message) {
  const errorElement = document.getElementById(inputId + "Error");
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.classList.add("show");
  }
}

function clearErrors() {
  document.querySelectorAll(".password-error").forEach((error) => error.classList.remove("show"));
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (toast) {
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3000);
  }
}
