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
