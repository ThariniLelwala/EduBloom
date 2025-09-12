// Background Manager - To be included on all pages
document.addEventListener("DOMContentLoaded", function () {
  // Apply saved background on page load
  applySavedBackground();
});

function applySavedBackground() {
  const bgId = localStorage.getItem("selectedBackground") || "bg1";
  let bgPath;

  if (bgId === "custom") {
    bgPath = localStorage.getItem("customBackground");
  } else {
    // Default background options with root paths
    const bgOptions = [
      { id: "bg1", path: "/assets/images/bg1.jpeg" },
      { id: "bg2", path: "/assets/images/bg2.jpg" },
      { id: "bg3", path: "/assets/images/bg3.jpeg" },
      { id: "bg4", path: "/assets/images/bg4.jpeg" },
      { id: "bg5", path: "/assets/images/bg5.jpg" },
    ];

    // Find the path for the selected preset background
    const selectedBg = bgOptions.find((bg) => bg.id === bgId);
    bgPath = selectedBg ? selectedBg.path : bgOptions[0].path;
  }

  if (bgPath) {
    // Update the main background
    const bgElement = document.querySelector(".bg-image");
    if (bgElement) {
      bgElement.style.backgroundImage = `url(${bgPath})`;
    }

    // Update welcome image if it exists
    const welcomeImages = document.querySelectorAll(".welcome-image");
    if (welcomeImages.length > 0) {
      welcomeImages.forEach((el) => {
        el.style.backgroundImage = `url(${bgPath})`;
      });
    }
  }
}
