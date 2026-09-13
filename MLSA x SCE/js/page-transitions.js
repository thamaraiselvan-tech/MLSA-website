/**
 * MLSA × SCE - Upgraded Page Transition Controller
 */
(function () {
  'use strict';

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // Create transition overlay element if missing
  let overlay = document.getElementById("pageTransitionOverlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "pageTransitionOverlay";
    overlay.className = "page-transition-overlay";
    document.body.appendChild(overlay);
  }

  // Entrance animation on load
  document.addEventListener("DOMContentLoaded", () => {
    if (overlay) overlay.classList.remove("is-exiting");
    document.body.style.opacity = "1";
  });

  // Intercept internal link clicks
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (!link) return;

    const href = link.getAttribute("href");
    if (!href) return;

    if (
      href.startsWith("#") ||
      href.startsWith("javascript:") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      href.startsWith("http://") ||
      href.startsWith("https://") ||
      link.target === "_blank" ||
      e.ctrlKey || e.metaKey || e.shiftKey
    ) {
      return;
    }

    try {
      const targetUrl = new URL(href, window.location.href);
      if (targetUrl.pathname === window.location.pathname && targetUrl.search === window.location.search) {
        return;
      }
    } catch (err) {
      return;
    }

    e.preventDefault();

    // Dismiss offcanvas mobile nav if open
    const offcanvasEl = document.getElementById("navMenu");
    if (offcanvasEl && typeof bootstrap !== "undefined" && bootstrap.Offcanvas) {
      const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
      if (bsOffcanvas) bsOffcanvas.hide();
    }

    overlay.classList.add("is-exiting");

    setTimeout(() => {
      window.location.href = href;
    }, 280);
  });

  // Handle back/forward cache
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) {
      overlay.classList.remove("is-exiting");
    }
  });
})();
