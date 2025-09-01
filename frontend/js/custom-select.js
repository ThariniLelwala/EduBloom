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

      // Create display box
      const display = document.createElement("div");
      display.classList.add("custom-select-display");
      display.textContent =
        select.options[select.selectedIndex]?.text || "Select...";
      wrapper.appendChild(display);

      // Create options container
      const optionsContainer = document.createElement("div");
      optionsContainer.classList.add("custom-select-options");
      optionsContainer.style.position = "absolute"; // will attach to body
      optionsContainer.style.display = "none"; // start hidden
      optionsContainer.style.zIndex = "9999";
      document.body.appendChild(optionsContainer); // append outside

      // Build options
      Array.from(select.options).forEach((option, idx) => {
        const optionDiv = document.createElement("div");
        optionDiv.classList.add("custom-select-option");
        optionDiv.textContent = option.text;
        if (option.disabled) optionDiv.style.opacity = "0.5";

        if (idx === select.selectedIndex) {
          optionDiv.classList.add("selected");
        }

        optionDiv.addEventListener("click", () => {
          if (option.disabled) return;

          select.selectedIndex = idx;
          select.dispatchEvent(new Event("change"));

          display.textContent = option.text;

          optionsContainer
            .querySelectorAll(".custom-select-option")
            .forEach((el) => el.classList.remove("selected"));
          optionDiv.classList.add("selected");

          optionsContainer.classList.remove("show");
          optionsContainer.style.display = "none";
        });

        optionsContainer.appendChild(optionDiv);
      });

      // Show/hide logic
      display.addEventListener("click", () => {
        // Close other open dropdowns
        document
          .querySelectorAll(".custom-select-options.show")
          .forEach((open) => {
            if (open !== optionsContainer) {
              open.classList.remove("show");
              open.style.display = "none";
            }
          });

        const rect = display.getBoundingClientRect();

        optionsContainer.style.top = `${rect.bottom + window.scrollY}px`;
        optionsContainer.style.left = `${rect.left + window.scrollX}px`;
        optionsContainer.style.width = `${rect.width}px`;
        optionsContainer.style.display = "block";

        optionsContainer.classList.toggle("show");

        // Toggle visibility
        if (!optionsContainer.classList.contains("show")) {
          optionsContainer.style.display = "none";
        }
      });

      // Close on outside click
      document.addEventListener("click", (e) => {
        if (
          !wrapper.contains(e.target) &&
          !optionsContainer.contains(e.target)
        ) {
          optionsContainer.classList.remove("show");
          optionsContainer.style.display = "none";
        }
      });

      // Reposition on window resize or scroll
      window.addEventListener("scroll", () => {
        if (optionsContainer.classList.contains("show")) {
          const rect = display.getBoundingClientRect();
          optionsContainer.style.top = `${rect.bottom + window.scrollY}px`;
          optionsContainer.style.left = `${rect.left + window.scrollX}px`;
        }
      });

      window.addEventListener("resize", () => {
        if (optionsContainer.classList.contains("show")) {
          const rect = display.getBoundingClientRect();
          optionsContainer.style.top = `${rect.bottom + window.scrollY}px`;
          optionsContainer.style.left = `${rect.left + window.scrollX}px`;
          optionsContainer.style.width = `${rect.width}px`;
        }
      });
    });
  };

  initCustomSelects();
});
