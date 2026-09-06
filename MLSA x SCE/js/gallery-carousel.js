// Gallery Carousel controller with touch drag, auto-play, navigation arrows, and Lightbox modal.

(function () {
  document.addEventListener("DOMContentLoaded", () => {
    const track = document.getElementById("galleryTrack");
    if (!track || !window.galleryData) return;

    const prevBtn = document.getElementById("galleryPrev");
    const nextBtn = document.getElementById("galleryNext");
    const lightbox = document.getElementById("galleryLightbox");
    const lightboxImg = document.getElementById("lightboxImage");
    const lightboxTitle = document.getElementById("lightboxTitle");
    const lightboxCaption = document.getElementById("lightboxCaption");
    const lightboxCategory = document.getElementById("lightboxCategory");
    const lightboxDate = document.getElementById("lightboxDate");
    const lightboxClose = document.getElementById("lightboxClose");

    // 1. Render Gallery Cards (with duplicates for seamless infinite loop)
    renderGalleryCards();

    function renderGalleryCards() {
      track.innerHTML = "";
      const originalItems = window.galleryData;
      // Duplicate items to enable infinite forward loop
      const itemsToRender = [...originalItems, ...originalItems];

      itemsToRender.forEach((item, realIndex) => {
        const originalIndex = realIndex % originalItems.length;
        const card = document.createElement("div");
        card.className = "gallery-card-item";
        card.setAttribute("role", "button");
        card.setAttribute("tabindex", "0");
        card.setAttribute("aria-label", `View ${item.title}`);
        card.dataset.index = originalIndex;

        card.innerHTML = `
          <div class="gallery-card-inner">
            <img src="${item.image}" alt="${item.title}" loading="lazy" class="gallery-card-img">
            <div class="gallery-card-overlay">
              <span class="badge gallery-badge mb-2">${item.category}</span>
              <h3 class="gallery-card-title h6 fw-bold mb-1">${item.title}</h3>
              <p class="gallery-card-date small mb-0">${item.date}</p>
            </div>
            <button class="gallery-expand-btn" aria-label="Expand image">
              <i class="bi bi-arrows-angle-expand"></i>
            </button>
          </div>
        `;

        card.addEventListener("click", () => openLightbox(originalIndex));
        card.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openLightbox(originalIndex);
          }
        });

        track.appendChild(card);
      });
    }

    // 2. Carousel Controls & Drag/Swipe
    let isDown = false;
    let isHovered = false;
    let startX;
    let scrollLeft;
    let autoPlayTimer = null;
    let touchResumeTimer = null;

    // Scroll calculation helper
    function getScrollStep() {
      const firstCard = track.querySelector(".gallery-card-item");
      if (!firstCard) return 320;
      return firstCard.offsetWidth + 20; // card width + gap
    }

    function checkInfiniteLoopReset() {
      const singleSetWidth = track.scrollWidth / 2;
      if (!singleSetWidth) return;
      if (track.scrollLeft >= singleSetWidth - 10) {
        track.style.scrollSnapType = "none";
        track.style.scrollBehavior = "auto";
        track.scrollLeft -= singleSetWidth;
        void track.offsetHeight;
        track.style.scrollBehavior = "";
        track.style.scrollSnapType = "";
      } else if (track.scrollLeft <= 5) {
        track.style.scrollSnapType = "none";
        track.style.scrollBehavior = "auto";
        track.scrollLeft += singleSetWidth;
        void track.offsetHeight;
        track.style.scrollBehavior = "";
        track.style.scrollSnapType = "";
      }
    }

    let animFrameId = null;

    // Smooth gliding scroll helper with customizable duration (default 1200ms)
    function smoothGlidedScroll(delta, duration = 1200) {
      if (animFrameId) cancelAnimationFrame(animFrameId);
      
      const startLeft = track.scrollLeft;
      const targetLeft = startLeft + delta;
      const startTime = performance.now();

      // Temporarily disable scrollSnap during custom smooth animation
      track.style.scrollSnapType = "none";

      function step(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease-out cubic curve (slow, graceful deceleration)
        const ease = 1 - Math.pow(1 - progress, 3);
        track.scrollLeft = startLeft + (delta * ease);

        if (progress < 1) {
          animFrameId = requestAnimationFrame(step);
        } else {
          track.style.scrollSnapType = "";
          animFrameId = null;
        }
      }

      animFrameId = requestAnimationFrame(step);
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        pauseAutoPlay();
        checkInfiniteLoopReset();
        smoothGlidedScroll(-getScrollStep(), 1200);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        pauseAutoPlay();
        checkInfiniteLoopReset();
        smoothGlidedScroll(getScrollStep(), 1200);
      });
    }

    // Mouse Drag gestures
    track.addEventListener("mousedown", (e) => {
      isDown = true;
      if (animFrameId) cancelAnimationFrame(animFrameId);
      track.classList.add("is-dragging");
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
      pauseAutoPlay();
    });

    track.addEventListener("mouseleave", () => {
      isDown = false;
      isHovered = false;
      track.classList.remove("is-dragging");
    });

    track.addEventListener("mouseenter", () => {
      isHovered = true;
    });

    track.addEventListener("mouseup", () => {
      isDown = false;
      track.classList.remove("is-dragging");
    });

    track.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - track.offsetLeft;
      const walk = (x - startX) * 1.5;
      track.scrollLeft = scrollLeft - walk;
    });

    // Mobile Touch events
    track.addEventListener("touchstart", () => {
      isDown = true;
      if (animFrameId) cancelAnimationFrame(animFrameId);
      pauseAutoPlay();
    }, { passive: true });

    track.addEventListener("touchend", () => {
      isDown = false;
      if (touchResumeTimer) clearTimeout(touchResumeTimer);
      touchResumeTimer = setTimeout(startAutoPlay, 3000);
    }, { passive: true });

    track.addEventListener("touchcancel", () => {
      isDown = false;
      if (touchResumeTimer) clearTimeout(touchResumeTimer);
      touchResumeTimer = setTimeout(startAutoPlay, 3000);
    }, { passive: true });

    // Auto Play loop - 3.5s pause with slow 1.2s smooth sliding transition
    function startAutoPlay() {
      if (autoPlayTimer) clearInterval(autoPlayTimer);
      autoPlayTimer = setInterval(() => {
        if (isHovered || isDown) return;
        
        const singleSetWidth = track.scrollWidth / 2;
        if (singleSetWidth > 0 && track.scrollLeft >= singleSetWidth - 20) {
          // Instantly reset scroll to start of set without animation
          if (animFrameId) cancelAnimationFrame(animFrameId);
          track.style.scrollSnapType = "none";
          track.style.scrollBehavior = "auto";
          track.scrollLeft -= singleSetWidth;
          void track.offsetHeight;
          track.style.scrollBehavior = "";
          track.style.scrollSnapType = "";
        }

        smoothGlidedScroll(getScrollStep(), 1200);
      }, 2500);
    }

    function pauseAutoPlay() {
      if (autoPlayTimer) {
        clearInterval(autoPlayTimer);
        autoPlayTimer = null;
      }
    }

    startAutoPlay();

    // 3. Lightbox Popup Handling
    let currentIndex = 0;

    function openLightbox(index) {
      const item = window.galleryData[index];
      if (!item || !lightbox) return;
      currentIndex = index;

      lightboxImg.src = item.image;
      lightboxImg.alt = item.title;
      lightboxTitle.textContent = item.title;
      lightboxCaption.textContent = item.caption;
      lightboxCategory.textContent = item.category;
      lightboxDate.textContent = item.date;

      lightbox.classList.add("is-active");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }

    function closeLightbox() {
      if (!lightbox) return;
      lightbox.classList.remove("is-active");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }

    if (lightboxClose) {
      lightboxClose.addEventListener("click", closeLightbox);
    }

    if (lightbox) {
      lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox || e.target.classList.contains("lightbox-backdrop")) {
          closeLightbox();
        }
      });
    }

    document.addEventListener("keydown", (e) => {
      if (!lightbox || !lightbox.classList.contains("is-active")) return;

      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowRight") {
        const nextIdx = (currentIndex + 1) % window.galleryData.length;
        openLightbox(nextIdx);
      } else if (e.key === "ArrowLeft") {
        const prevIdx = (currentIndex - 1 + window.galleryData.length) % window.galleryData.length;
        openLightbox(prevIdx);
      }
    });
  });
})();
