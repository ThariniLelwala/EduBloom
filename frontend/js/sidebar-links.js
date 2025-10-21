document.addEventListener("DOMContentLoaded", () => {
  const links = {
    "dashboard-link": "dashboard.html",
    "forum-link": "forum.html",
    "post-link": "post.html",
    "upload-link": "upload.html",
    "calendar-link": "calendar.html",
    "messages-link": "messages.html",
    "settings-link": "settings.html"
  };

  Object.keys(links).forEach(id => {
    const li = document.getElementById(id);
    if (li) {
      li.style.cursor = "pointer";
      li.addEventListener("click", () => {
        window.location.href = links[id];
      });
    }
  });
});
