// Define initCustomSelects globally
const initCustomSelects = () => {
  document.querySelectorAll("select.custom-select").forEach((select) => {
    if (select.parentElement.classList.contains("custom-select-wrapper"))
      return;

    const wrapper = document.createElement("div");
    wrapper.classList.add("custom-select-wrapper");
    select.parentNode.insertBefore(wrapper, select);
    wrapper.appendChild(select);

    select.style.display = "none";

    const display = document.createElement("div");
    display.classList.add("custom-select-display");
    display.textContent =
      select.options[select.selectedIndex]?.text || "Select...";
    wrapper.appendChild(display);

    const optionsContainer = document.createElement("div");
    optionsContainer.classList.add("custom-select-options");
    wrapper.appendChild(optionsContainer);

    Array.from(select.options).forEach((option, idx) => {
      const optionDiv = document.createElement("div");
      optionDiv.classList.add("custom-select-option");
      optionDiv.textContent = option.text;

      if (option.disabled) optionDiv.classList.add("disabled");
      if (idx === select.selectedIndex) optionDiv.classList.add("selected");

      optionDiv.addEventListener("click", () => {
        if (option.disabled) return;
        select.selectedIndex = idx;
        display.textContent = option.text;
        optionsContainer
          .querySelectorAll(".custom-select-option")
          .forEach((el) => el.classList.remove("selected"));
        optionDiv.classList.add("selected");
        optionsContainer.classList.remove("show");
        select.dispatchEvent(new Event("change"));
      });

      optionsContainer.appendChild(optionDiv);
    });

    display.addEventListener("click", () => {
      document
        .querySelectorAll(".custom-select-options.show")
        .forEach((el) => el.classList.remove("show"));

      if (!optionsContainer.dataset.appended) {
        document.body.appendChild(optionsContainer);
        optionsContainer.dataset.appended = "true";
      }

      const rect = display.getBoundingClientRect();
      optionsContainer.style.position = "absolute";
      optionsContainer.style.top = rect.bottom + window.scrollY + "px";
      optionsContainer.style.left = rect.left + window.scrollX + "px";
      optionsContainer.style.width = rect.width + "px";
      optionsContainer.classList.toggle("show");
    });

    document.addEventListener("click", (e) => {
      if (!wrapper.contains(e.target) && !optionsContainer.contains(e.target)) {
        optionsContainer.classList.remove("show");
      }
    });

    // Handle external value changes (sync UI)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes" && mutation.attributeName === "value") {
          // This doesn't always trigger for .value changes, so we also listen for 'change'
        }
      });
    });
    observer.observe(select, { attributes: true });

    select.addEventListener("sync", () => {
      const selectedOption = select.options[select.selectedIndex];
      display.textContent = selectedOption ? selectedOption.text : "Select...";
      optionsContainer.querySelectorAll(".custom-select-option").forEach((optDiv, idx) => {
        optDiv.classList.toggle("selected", idx === select.selectedIndex);
      });
    });
  });
};

// Function to manually refresh all custom selects
window.refreshCustomSelects = () => {
  document.querySelectorAll("select.custom-select").forEach(select => {
    select.dispatchEvent(new Event("sync"));
  });
};

// Make initCustomSelects globally available
window.initCustomSelects = initCustomSelects;

document.addEventListener("DOMContentLoaded", () => {
  initCustomSelects();
});
