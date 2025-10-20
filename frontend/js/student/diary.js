// ------------------------------
// Auto date stamp
// ------------------------------
const dateEl = document.getElementById("diary-date");
const today = new Date();
dateEl.textContent = today.toLocaleDateString(undefined, {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

// ------------------------------
// Theme selector logic (image previews)
// ------------------------------
const themeOptionsData = [
  { id: "default", path: "../../../assets/diary-themes/diary1.jpg" },
  { id: "vintage", path: "../../../assets/diary-themes/diary2.jpg" },
  { id: "dark", path: "../../../assets/diary-themes/diary3.jpg" },
  { id: "floral", path: "../../../assets/diary-themes/diary4.jpg" },
  { id: "pastel", path: "../../../assets/diary-themes/diary5.jpg" },
  { id: "none", path: "" },
];

const themeContainer = document.getElementById("theme-options");
const savedTheme = localStorage.getItem("diaryTheme") || "default";

themeOptionsData.forEach((theme) => {
  const div = document.createElement("div");
  div.className = "theme-option";
  div.dataset.theme = theme.id;
  if (theme.id === savedTheme) div.classList.add("selected");

  if (theme.path) {
    div.innerHTML = `<img src="${theme.path}" alt="${theme.id}"><div class="checkmark"><i class="fas fa-check"></i></div>`;
  } else {
    div.innerHTML = `<div style="background:#ccc; width:100%; height:100%; display:flex; align-items:center; justify-content:center;">None</div><div class="checkmark"><i class="fas fa-check"></i></div>`;
  }

  div.addEventListener("click", () => {
    document
      .querySelectorAll(".theme-option")
      .forEach((el) => el.classList.remove("selected"));
    div.classList.add("selected");
    document.body.setAttribute("data-diary-theme", theme.id);
    localStorage.setItem("diaryTheme", theme.id);
  });

  themeContainer.appendChild(div);
});

// Apply saved theme on load
document.body.setAttribute("data-diary-theme", savedTheme);

// ------------------------------
// Font selector logic (preview grid)
// ------------------------------
const fontOptions = [
  { name: "Indie Flower", value: "'Indie Flower', cursive" },
  { name: "Patrick Hand", value: "'Patrick Hand', cursive" },
  { name: "Roboto", value: "'Roboto', sans-serif" },
  { name: "Courgette", value: "'Courgette', cursive" },
  { name: "Kalam", value: "'Kalam', cursive" },
];

const fontContainer = document.getElementById("font-options");
const savedFont =
  localStorage.getItem("diaryFont") || "'Indie Flower', cursive";

fontOptions.forEach((font) => {
  const div = document.createElement("div");
  div.className = "font-option";
  div.textContent = font.name;
  div.style.fontFamily = font.value;
  if (font.value === savedFont) div.classList.add("selected");

  div.addEventListener("click", () => {
    document
      .querySelectorAll(".font-option")
      .forEach((el) => el.classList.remove("selected"));
    div.classList.add("selected");
    document.documentElement.style.setProperty("--diary-font", font.value);
    localStorage.setItem("diaryFont", font.value);
  });

  fontContainer.appendChild(div);
});

// Apply saved font on load
document.documentElement.style.setProperty("--diary-font", savedFont);

// ------------------------------
// Mood and Energy selection logic
// ------------------------------
let selectedMood = localStorage.getItem("diaryMood") || null;
let selectedEnergy = localStorage.getItem("diaryEnergy") || null;

// Mood selection
document.querySelectorAll(".mood-option").forEach((option) => {
  option.addEventListener("click", () => {
    // Remove selected class from all mood options
    document
      .querySelectorAll(".mood-option")
      .forEach((el) => el.classList.remove("selected"));
    // Add selected class to clicked option
    option.classList.add("selected");
    // Store the selected mood (but don't save to localStorage yet)
    selectedMood = option.querySelector(".label").textContent;
  });
});

// Energy selection
document.querySelectorAll(".energy-option").forEach((option) => {
  option.addEventListener("click", () => {
    // Remove selected class from all energy options
    document
      .querySelectorAll(".energy-option")
      .forEach((el) => el.classList.remove("selected"));
    // Add selected class to clicked option
    option.classList.add("selected");
    // Store the selected energy (but don't save to localStorage yet)
    selectedEnergy = option.querySelector(".label").textContent;
  });
});

// Apply saved selections on load
if (selectedMood) {
  document.querySelectorAll(".mood-option").forEach((option) => {
    if (option.querySelector(".label").textContent === selectedMood) {
      option.classList.add("selected");
    }
  });
}

if (selectedEnergy) {
  document.querySelectorAll(".energy-option").forEach((option) => {
    if (option.querySelector(".label").textContent === selectedEnergy) {
      option.classList.add("selected");
    }
  });
}

// ------------------------------
// Diary Entry Management
// ------------------------------
let isEditing = false;
let editingEntryId = null;

function saveDiaryEntry() {
  const diaryText = document.getElementById("diary-text").value.trim();
  if (!diaryText) {
    alert("Please write something in your diary before saving.");
    return;
  }

  const entry = {
    id: isEditing ? editingEntryId : Date.now(),
    date: isEditing ? getEditingEntryDate() : new Date().toISOString(),
    text: diaryText,
    theme: localStorage.getItem("diaryTheme") || "default",
    font: localStorage.getItem("diaryFont") || "'Indie Flower', cursive",
    mood: localStorage.getItem("diaryMood") || null,
    energy: localStorage.getItem("diaryEnergy") || null,
  };

  // Get existing entries
  const existingEntries = JSON.parse(
    localStorage.getItem("diaryEntries") || "[]"
  );

  if (isEditing) {
    // Update existing entry
    const index = existingEntries.findIndex((e) => e.id === editingEntryId);
    if (index !== -1) {
      existingEntries[index] = entry;
    }
  } else {
    // Add new entry
    existingEntries.unshift(entry);

    // Keep only last 50 entries to prevent localStorage bloat
    if (existingEntries.length > 50) {
      existingEntries.splice(50);
    }
  }

  // Save to localStorage
  localStorage.setItem("diaryEntries", JSON.stringify(existingEntries));

  // Clear the diary text
  document.getElementById("diary-text").value = "";

  // Clear editing state
  if (isEditing) {
    isEditing = false;
    editingEntryId = null;
    sessionStorage.removeItem("editEntry");
    document.getElementById("add-entry-btn").innerHTML =
      '<i class="fas fa-plus"></i> Add Entry';
  }

  // Show success message
  const message = isEditing
    ? "Diary entry updated successfully!"
    : "Diary entry saved successfully!";
  showSuccessMessage(message);

  // Clear the diary text for new entries
  if (!isEditing) {
    document.getElementById("diary-text").value = "";
  }
}

function getEditingEntryDate() {
  const editEntry = JSON.parse(sessionStorage.getItem("editEntry") || "{}");
  return editEntry.date || new Date().toISOString();
}

function loadEntryForEditing() {
  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get("edit");

  if (editId) {
    const editEntry = JSON.parse(sessionStorage.getItem("editEntry") || "{}");
    if (editEntry && editEntry.id == editId) {
      isEditing = true;
      editingEntryId = editEntry.id;

      // Populate the form
      document.getElementById("diary-text").value = editEntry.text;

      // Set theme
      if (editEntry.theme) {
        localStorage.setItem("diaryTheme", editEntry.theme);
        document.body.setAttribute("data-diary-theme", editEntry.theme);
        document.querySelectorAll(".theme-option").forEach((option) => {
          option.classList.remove("selected");
          if (option.dataset.theme === editEntry.theme) {
            option.classList.add("selected");
          }
        });
      }

      // Set font
      if (editEntry.font) {
        localStorage.setItem("diaryFont", editEntry.font);
        document.documentElement.style.setProperty(
          "--diary-font",
          editEntry.font
        );
        document.querySelectorAll(".font-option").forEach((option) => {
          option.classList.remove("selected");
          if (option.style.fontFamily === editEntry.font) {
            option.classList.add("selected");
          }
        });
      }

      // Set mood
      if (editEntry.mood) {
        localStorage.setItem("diaryMood", editEntry.mood);
        selectedMood = editEntry.mood;
        document.querySelectorAll(".mood-option").forEach((option) => {
          option.classList.remove("selected");
          if (option.querySelector(".label").textContent === editEntry.mood) {
            option.classList.add("selected");
          }
        });
      }

      // Set energy
      if (editEntry.energy) {
        localStorage.setItem("diaryEnergy", editEntry.energy);
        selectedEnergy = editEntry.energy;
        document.querySelectorAll(".energy-option").forEach((option) => {
          option.classList.remove("selected");
          if (option.querySelector(".label").textContent === editEntry.energy) {
            option.classList.add("selected");
          }
        });
      }

      // Update button text
      document.getElementById("add-entry-btn").innerHTML =
        '<i class="fas fa-edit"></i> Update Entry';
    }
  }
}

function showSuccessMessage(message) {
  // Remove existing message if any
  const existingMessage = document.querySelector(".success-message");
  if (existingMessage) {
    existingMessage.remove();
  }

  // Create and show success message
  const messageEl = document.createElement("div");
  messageEl.className = "success-message";
  messageEl.textContent = message;
  messageEl.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--color-primary);
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 1000;
    font-weight: 500;
  `;

  document.body.appendChild(messageEl);

  // Remove message after 3 seconds
  setTimeout(() => {
    if (messageEl.parentNode) {
      messageEl.remove();
    }
  }, 3000);
}

// View Entry Modal Functions
function hideViewEntryModal() {
  const modal = document.getElementById("view-entry-modal");
  modal.style.display = "none";
  document.body.style.overflow = "auto"; // Restore scrolling
}

function getThemeImage(theme) {
  const themeImages = {
    default: 'url("../../../assets/diary-themes/diary1.jpg")',
    vintage: 'url("../../../assets/diary-themes/diary2.jpg")',
    dark: 'url("../../../assets/diary-themes/diary3.jpg")',
    floral: 'url("../../../assets/diary-themes/diary4.jpg")',
    pastel: 'url("../../../assets/diary-themes/diary5.jpg")',
    none: "none",
  };
  return themeImages[theme] || themeImages["default"];
}

// Add event listener for the Add Entry button
document.addEventListener("DOMContentLoaded", () => {
  const addEntryBtn = document.getElementById("add-entry-btn");
  if (addEntryBtn) {
    addEntryBtn.addEventListener("click", saveDiaryEntry);
  }

  // Load entry for editing if URL parameter exists
  loadEntryForEditing();

  // Mood/Energy action buttons
  const addMoodBtn = document.getElementById("add-mood-btn");
  const removeMoodBtn = document.getElementById("remove-mood-btn");
  const addEnergyBtn = document.getElementById("add-energy-btn");
  const removeEnergyBtn = document.getElementById("remove-energy-btn");

  if (addMoodBtn) {
    addMoodBtn.addEventListener("click", () => {
      if (selectedMood) {
        localStorage.setItem("diaryMood", selectedMood);
        showSuccessMessage("Mood saved successfully!");
      } else {
        alert("Please select a mood first.");
      }
    });
  }

  if (removeMoodBtn) {
    removeMoodBtn.addEventListener("click", () => {
      selectedMood = null;
      document.querySelectorAll(".mood-option").forEach((option) => {
        option.classList.remove("selected");
      });
      localStorage.removeItem("diaryMood");
      showSuccessMessage("Mood removed.");
    });
  }

  if (addEnergyBtn) {
    addEnergyBtn.addEventListener("click", () => {
      if (selectedEnergy) {
        localStorage.setItem("diaryEnergy", selectedEnergy);
        showSuccessMessage("Energy level saved successfully!");
      } else {
        alert("Please select an energy level first.");
      }
    });
  }

  if (removeEnergyBtn) {
    removeEnergyBtn.addEventListener("click", () => {
      selectedEnergy = null;
      document.querySelectorAll(".energy-option").forEach((option) => {
        option.classList.remove("selected");
      });
      localStorage.removeItem("diaryEnergy");
      showSuccessMessage("Energy level removed.");
    });
  }
});
