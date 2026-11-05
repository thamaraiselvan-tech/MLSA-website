/**
 * MLSA × SCE - Universal Chapter Preloader Controller
 * Handles dynamic status text, ambient glow, and smooth exit transitions.
 */
(function () {
  'use strict';

  const phrases = [
    "Initializing Chapter Portal…",
    "Connecting to Microsoft Learn…",
    "Loading Workshops & Events…",
    "Empowering Saranathan Builders…"
  ];

  let phraseIndex = 0;
  let phraseTimer = null;

  function initStatusTicker() {
    const statusEl = document.getElementById("preloaderStatusText");
    if (!statusEl) return;

    phraseTimer = setInterval(() => {
      phraseIndex = (phraseIndex + 1) % phrases.length;
      statusEl.style.opacity = "0";
      setTimeout(() => {
        statusEl.textContent = phrases[phraseIndex];
        statusEl.style.opacity = "1";
      }, 180);
    }, 850);
  }

  function dismissPreloader() {
    const preloader = document.getElementById("pageLoadScreen");
    if (!preloader || preloader.classList.contains("is-hidden")) return;

    if (phraseTimer) {
      clearInterval(phraseTimer);
      phraseTimer = null;
    }

    preloader.classList.add("is-hidden");
    window.dispatchEvent(new CustomEvent("preloaderDismissed"));

    setTimeout(() => {
      try {
        preloader.remove();
      } catch (e) {}
    }, 550);
  }

  // Start status ticker immediately
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initStatusTicker);
  } else {
    initStatusTicker();
  }

  // Dismiss on window load with slight delay for smooth visual feel
  window.addEventListener("load", () => {
    setTimeout(dismissPreloader, 320);
  });

  // Safety maximum fallback: never block user for more than 3.5 seconds
  setTimeout(dismissPreloader, 3500);

  // Expose global helper
  window.dismissChapterPreloader = dismissPreloader;
})();
