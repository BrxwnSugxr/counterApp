// ============ SIDE NAVIGATION DRAWER ============
// Shared across every page of the site. Self-contained — doesn't import
// from dom.js since not every page loads the counter's module graph.

function initNav() {
  const menuBtn = document.getElementById("menuBtn");
  const navDrawer = document.getElementById("navDrawer");
  const navOverlay = document.getElementById("navOverlay");
  const navClose = document.getElementById("navClose");

  if (!menuBtn || !navDrawer || !navOverlay) return;

  function openNav() {
    navDrawer.classList.add("open");
    navOverlay.classList.add("visible");
    menuBtn.setAttribute("aria-expanded", "true");
  }

  function closeNav() {
    navDrawer.classList.remove("open");
    navOverlay.classList.remove("visible");
    menuBtn.setAttribute("aria-expanded", "false");
  }

  menuBtn.addEventListener("click", openNav);
  if (navClose) navClose.addEventListener("click", closeNav);
  navOverlay.addEventListener("click", closeNav);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeNav();
  });
}

initNav();
