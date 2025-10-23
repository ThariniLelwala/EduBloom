      // Show toast notification
      function showToast(message) {
        const toast = document.getElementById("toast");
        toast.textContent = message;
        toast.classList.add("show");

        setTimeout(() => {
          toast.classList.remove("show");
        }, 3000);
      }

      // Background image options with root paths
      const bgOptions = [
        { id: "bg1", name: "Default", path: "/assets/images/bg1.jpeg" },
        { id: "bg2", name: "Nature", path: "/assets/images/bg2.jpg" },
        { id: "bg3", name: "Abstract", path: "/assets/images/bg3.jpeg" },
        { id: "bg4", name: "Minimal", path: "/assets/images/bg4.jpeg" },
        { id: "bg5", name: "Gradient", path: "/assets/images/bg5.jpg" },
      ];

      // Initialize the page
      document.addEventListener("DOMContentLoaded", function () {
        // Load saved background preference
        const savedBg = localStorage.getItem("selectedBackground") || "bg1";
        const customBg = localStorage.getItem("customBackground");

        // Create background options
        const bgOptionsContainer = document.getElementById("bg-options");

        bgOptions.forEach((bg) => {
          const option = document.createElement("div");
          option.className = `bg-option ${savedBg === bg.id ? "selected" : ""}`;
          option.dataset.id = bg.id;
          option.dataset.path = bg.path;

          option.innerHTML = `
            <img src="${bg.path}" alt="${bg.name}" 
                 onerror="this.parentNode.innerHTML='<div class=\"placeholder-img\">${bg.name}<br>(Image not found)</div>'" />
            <div class="checkmark"><i class="fas fa-check"></i></div>
          `;

          option.addEventListener("click", () => {
            selectBackground(bg.id, bg.path);
          });

          bgOptionsContainer.appendChild(option);
        });

        // Set up custom background upload (applies immediately)
        document
          .getElementById("custom-bg")
          .addEventListener("change", handleCustomUpload);

        // Apply the saved background to the settings page itself
        applySavedBackground();
      });

      // Select background function (applies immediately)
      function selectBackground(bgId, bgPath) {
        // Update UI
        document.querySelectorAll(".bg-option").forEach((opt) => {
          opt.classList.remove("selected");
        });
        document
          .querySelector(`.bg-option[data-id="${bgId}"]`)
          .classList.add("selected");

        // Save preference
        localStorage.setItem("selectedBackground", bgId);
        localStorage.setItem("backgroundImagePath", bgPath);
        localStorage.removeItem("customBackground");

        // Apply the background immediately
        applyBackground(bgPath);

        // Show notification
        showToast("Background changed successfully!");
      }

      // Handle custom background upload (applies immediately)
      function handleCustomUpload() {
        const fileInput = document.getElementById("custom-bg");
        const file = fileInput.files[0];

        if (file) {
          const reader = new FileReader();

          reader.onload = function (e) {
            const imageDataUrl = e.target.result;

            // Save to localStorage
            localStorage.setItem("selectedBackground", "custom");
            localStorage.setItem("customBackground", imageDataUrl);

            // Apply the background immediately
            applyBackground(imageDataUrl);

            // Show notification
            showToast("Custom background uploaded successfully!");
          };

          reader.readAsDataURL(file);
        }
      }

      // Apply background to the current page
      function applyBackground(path) {
        // Update the background image in the current page
        document.querySelector(
          ".bg-image"
        ).style.backgroundImage = `url(${path})`;
      }

      // Apply saved background on page load
      function applySavedBackground() {
        const bgId = localStorage.getItem("selectedBackground") || "bg1";
        let bgPath;

        if (bgId === "custom") {
          bgPath = localStorage.getItem("customBackground");
        } else {
          // Find the path for the selected preset background
          const selectedBg = bgOptions.find((bg) => bg.id === bgId);
          bgPath = selectedBg ? selectedBg.path : bgOptions[0].path;
        }

        if (bgPath) {
          document.querySelector(
            ".bg-image"
          ).style.backgroundImage = `url(${bgPath})`;
        }
      }