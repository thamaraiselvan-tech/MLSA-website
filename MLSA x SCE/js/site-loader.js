// Full-screen video loader shown once per browser session.
// Plays authentic high-resolution Microsoft Student Ambassadors video intro.

(function () {
  const SESSION_KEY = "mlsa_loader_shown";
  const MAX_WAIT_MS = 10000; // hard safety timeout

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
    video.muted = true;
    video.playsInline = true;

    function playVideo() {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {}); // silent catch for autoplay policies
      }
    }

    playVideo();
    video.addEventListener("canplay", playVideo, { once: true });
    video.addEventListener("ended", hideLoader);
    video.addEventListener("error", hideLoader);
  }

  if (skipBtn) skipBtn.addEventListener("click", hideLoader);
  loader.addEventListener("click", hideLoader);

  setTimeout(hideLoader, MAX_WAIT_MS);
})();
