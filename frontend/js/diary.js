// Auto date stamp
const dateEl = document.getElementById("diary-date");
const today = new Date();
dateEl.textContent = today.toLocaleDateString(undefined, {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

// Font selector logic
const fontSelect = document.getElementById("font-select");
fontSelect.addEventListener("change", (e) => {
  document.documentElement.style.setProperty("--diary-font", e.target.value);
});

// Theme selector logic
const themeButtons = document.querySelectorAll(".theme-options button");
themeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    // Set all buttons to secondary
    themeButtons.forEach((b) => {
      b.classList.remove("btn-primary");
      b.classList.add("btn-secondary");
    });
    // Set clicked button to primary
    btn.classList.remove("btn-secondary");
    btn.classList.add("btn-primary");
    // Set the theme
    document.body.setAttribute("data-diary-theme", btn.dataset.theme);
  });
});

// On load, set the current theme button to primary
const currentTheme =
  document.body.getAttribute("data-diary-theme") || "default";
const currentButton = document.querySelector(
  `.theme-options button[data-theme="${currentTheme}"]`
);
if (currentButton) {
  currentButton.classList.remove("btn-secondary");
  currentButton.classList.add("btn-primary");
}
