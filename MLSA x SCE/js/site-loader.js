// Full-screen video loader shown once per browser session.
// Plays authentic high-resolution Microsoft Student Ambassadors video intro.

(function () {
  const SESSION_KEY = "mlsa_loader_shown";
  const MAX_WAIT_MS = 7000; // hard safety timeout

  const loader = document.getElementById("siteLoader");
  if (!loader) return;

  const alreadyShown = sessionStorage.getItem(SESSION_KEY) === "1";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (alreadyShown || reducedMotion) {
    loader.remove();
    return;
  }

  // Lock scrolling while loader is active
  document.documentElement.classList.add("loader-active");
  document.body.classList.add("loader-active");

  const video = document.getElementById("loaderVideo");
  const skipBtn = document.getElementById("loaderSkip");

  function hideLoader() {
    if (loader.classList.contains("is-hidden")) return;
    loader.classList.add("is-hidden");
    document.documentElement.classList.remove("loader-active");
    document.body.classList.remove("loader-active");
    document.body.classList.add("loader-complete");
    window.dispatchEvent(new CustomEvent("loaderDone"));
    sessionStorage.setItem(SESSION_KEY, "1");
    setTimeout(() => loader.remove(), 600);
  }

  if (video) {
    // Explicit iOS Safari & Android Mobile video attributes
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "true");
    video.setAttribute("webkit-playsinline", "true");
    video.setAttribute("x5-playsinline", "true");
    video.setAttribute("x5-video-player-type", "h5");

    function playVideo() {
      video.muted = true;
      video.defaultMuted = true;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // If mobile browser blocks autoplay, unlock on first user touch/pointer interaction
          const unlockPlay = () => {
            video.play().catch(() => hideLoader());
            window.removeEventListener("touchstart", unlockPlay);
            window.removeEventListener("pointerdown", unlockPlay);
            window.removeEventListener("click", unlockPlay);
          };
          window.addEventListener("touchstart", unlockPlay, { once: true, passive: true });
          window.addEventListener("pointerdown", unlockPlay, { once: true, passive: true });
          window.addEventListener("click", unlockPlay, { once: true });
        });
      }
    }

    try {
      video.load();
    } catch (e) {}

    playVideo();
    video.addEventListener("canplay", playVideo, { once: true });
    video.addEventListener("canplaythrough", playVideo, { once: true });
    video.addEventListener("loadeddata", playVideo, { once: true });
    video.addEventListener("ended", hideLoader);
    video.addEventListener("error", hideLoader);

    // Safety check: if mobile video is stuck at 0s after 2s, retry or fallback
    setTimeout(() => {
      if (video.currentTime === 0 && !video.ended) {
        playVideo();
      }
    }, 2000);
  }

  if (skipBtn) skipBtn.addEventListener("click", hideLoader);
  loader.addEventListener("click", hideLoader);

  setTimeout(hideLoader, MAX_WAIT_MS);
})();

