// Full-screen video loader shown once per browser session. Multiple safety
// nets so a slow, failed, or blocked video can never trap a visitor behind
// a stuck screen.

(function () {
  const SESSION_KEY = "mlsa_loader_shown";
  const MAX_WAIT_MS = 10000; // hard safety timeout regardless of what the video does

  const loader = document.getElementById("siteLoader");
  if (!loader) return;

  const alreadyShown = sessionStorage.getItem(SESSION_KEY) === "1";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (alreadyShown || reducedMotion) {
    loader.remove();
    return;
  }

  // Prevent background scrolling while loader is active
  document.documentElement.classList.add("loader-active");
  document.body.classList.add("loader-active");

  const video = document.getElementById("loaderVideo");
  const skipBtn = document.getElementById("loaderSkip");

  function hideLoader() {
    if (loader.classList.contains("is-hidden")) return; // avoid double-firing from multiple triggers
    loader.classList.add("is-hidden");
    document.documentElement.classList.remove("loader-active");
    document.body.classList.remove("loader-active");
    document.body.classList.add("loader-complete");
    window.dispatchEvent(new CustomEvent("loaderDone"));
    sessionStorage.setItem(SESSION_KEY, "1");
    setTimeout(() => loader.remove(), 600); // give the fade-out transition time to finish
  }

  video.addEventListener("ended", hideLoader);
  video.addEventListener("error", hideLoader); // video fails to load/decode
  skipBtn.addEventListener("click", hideLoader);
  loader.addEventListener("click", hideLoader);

  setTimeout(hideLoader, MAX_WAIT_MS); // absolute last-resort safety net
})();
