// 3D tilt effect for cards - the card subtly rotates in 3D space following
// the mouse position. No library, no WebGL - just CSS transforms driven by
// mouse coordinates. Skipped on touch devices (no mouse to track) and when
// the visitor has requested reduced motion.

(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (window.matchMedia("(hover: none)").matches) return; // touch devices

  const MAX_TILT_DEGREES = 6;

  function attachTilt(card) {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -MAX_TILT_DEGREES;
      const rotateY = ((x - centerX) / centerX) * MAX_TILT_DEGREES;
      card.style.transform = `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  }

  document.querySelectorAll(".tilt-card").forEach(attachTilt);
})();

// Navbar shadow deepens slightly once the page has been scrolled -
// present on every page, purely cosmetic.
(function () {
  const nav = document.querySelector(".navbar-mlsa");
  if (!nav) return;

  function onScroll() {
    nav.classList.toggle("navbar-scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();
