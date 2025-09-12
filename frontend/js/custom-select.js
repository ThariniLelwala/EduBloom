document.addEventListener("DOMContentLoaded", () => {
  const initCustomSelects = () => {
    document.querySelectorAll("select.custom-select").forEach((select) => {
      if (select.parentElement.classList.contains("custom-select-wrapper"))
        return;

      // Create wrapper
      const wrapper = document.createElement("div");
      wrapper.classList.add("custom-select-wrapper");
      select.parentNode.insertBefore(wrapper, select);
      wrapper.appendChild(select);

      // Hide native select
      select.style.display = "none";

      // Create display box
      const display = document.createElement("div");
      display.classList.add("custom-select-display");
      display.textContent =
        select.options[select.selectedIndex]?.text || "Select...";
      wrapper.appendChild(display);

      // Create options container
      const optionsContainer = document.createElement("div");
      optionsContainer.classList.add("custom-select-options");
      optionsContainer.style.display = "none"; // hidden by default
      wrapper.appendChild(optionsContainer);

      // Build options
      Array.from(select.options).forEach((option, idx) => {
        const optionDiv = document.createElement("div");
        optionDiv.classList.add("custom-select-option");
        optionDiv.textContent = option.text;

        if (option.disabled) optionDiv.classList.add("disabled");
        if (idx === select.selectedIndex) optionDiv.classList.add("selected");

        optionDiv.addEventListener("click", () => {
          if (option.disabled) return;

          select.selectedIndex = idx;
          select.dispatchEvent(new Event("change"));

          display.textContent = option.text;

          optionsContainer
            .querySelectorAll(".custom-select-option")
            .forEach((el) => el.classList.remove("selected"));
          optionDiv.classList.add("selected");

          optionsContainer.style.display = "none";
        });

        optionsContainer.appendChild(optionDiv);
      });

      // Toggle dropdown
      display.addEventListener("click", () => {
        const isOpen = optionsContainer.style.display === "block";
        document
          .querySelectorAll(".custom-select-options")
          .forEach((el) => (el.style.display = "none"));
        optionsContainer.style.display = isOpen ? "none" : "block";
      });

      // Close on outside click
      document.addEventListener("click", (e) => {
        if (!wrapper.contains(e.target)) {
          optionsContainer.style.display = "none";
        }
      });
    });
  };

  initCustomSelects();
});
