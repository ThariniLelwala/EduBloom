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
    document.body.setAttribute("data-diary-theme", btn.dataset.theme);
  });
});
