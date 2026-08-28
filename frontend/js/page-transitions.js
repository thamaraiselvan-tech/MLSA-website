// Smooth page transitions for internal link navigation.
// Intercepts link clicks to display a subtle full-screen fade transition
// before navigating, giving the site an integrated app-like feel.

(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // Create transition overlay element if missing
  let overlay = document.getElementById("pageTransitionOverlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "pageTransitionOverlay";
    overlay.className = "page-transition-overlay";
    document.body.appendChild(overlay);
  }

  // Intercept internal link clicks
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (!link) return;

    const href = link.getAttribute("href");
    if (!href) return;

    // Skip anchors (#), javascript:, external links, target="_blank", or modifier key clicks
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

    // Don't transition if navigating to the exact same page & search query
    try {
      const targetUrl = new URL(href, window.location.href);
      if (targetUrl.pathname === window.location.pathname && targetUrl.search === window.location.search) {
        return;
      }
    } catch (err) {
      return;
    }

    e.preventDefault();
    overlay.classList.add("is-active");

    setTimeout(() => {
      window.location.href = href;
    }, 300);
  });

  // Handle bfcache (browser back/forward button restores state cleanly)
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) {
      overlay.classList.remove("is-active");
    }
  });
})();
